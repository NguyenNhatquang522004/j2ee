"""
Flask AI Server - Kiểm tra độ tươi thực phẩm
Model: YOLOv8 freshness-fruits-and-vegetables từ Roboflow Universe
Endpoint: POST /api/predict-freshness

Classes từ model (fresh/stale):
  fresh-apple, stale-apple, fresh-banana, stale-banana,
  fresh-bitter-gourd, stale-bitter-gourd, fresh-capsicum, stale-capsicum,
  fresh-orange, stale-orange, fresh-tomato, stale-tomato, ...

Response JSON:
  {
    "label":       "FRESH" | "ROTTEN",
    "freshness":   "FRESH" | "ROTTEN",
    "confidence":  0.87,
    "isFresh":     true,
    "message":     "Sản phẩm còn tươi...",
    "description": "...",
    "suggestion":  "..."
  }
"""

import os
import io
import logging
from pathlib import Path

from flask import Flask, request, jsonify
from PIL import Image
from dotenv import load_dotenv

# Load .env at the beginning to set PORT and other vars
load_dotenv()

# ── Cấu hình ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent

# ── Cấu hình Roboflow ────────────────────────────────────────────────────────
from roboflow import Roboflow
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_WORKSPACE = "college-74jj5"
ROBOFLOW_PROJECT = "freshness-fruits-and-vegetables"
ROBOFLOW_VERSION = 7

# ── Load model (Hosted) ───────────────────────────────────────────────────────
model = None

def load_model():
    global model
    try:
        if not ROBOFLOW_API_KEY:
            logger.error("ROBOFLOW_API_KEY missing in .env")
            return

        rf = Roboflow(api_key=ROBOFLOW_API_KEY)
        project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
        model = project.version(ROBOFLOW_VERSION).model
        logger.info("Đã kết nối Hosted AI Model (Roboflow Universe: %s/%s/v%d)", ROBOFLOW_WORKSPACE, ROBOFLOW_PROJECT, ROBOFLOW_VERSION)
    except Exception as exc:
        logger.error("Lỗi kết nối AI model: %s", exc)


# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload


def _label_to_freshness(class_name: str) -> str:
    """Chuyển class name sang FRESH hoặc ROTTEN."""
    name_lower = class_name.lower()
    # Các từ khóa cho FRESH
    if any(k in name_lower for k in ["fresh", "good", "new", "tươi"]):
        return "FRESH"
    # Các từ khóa cho ROTTEN
    if any(k in name_lower for k in ["stale", "rotten", "bad", "hư", "hỏng", "old"]):
        return "SPOILED"
    return "UNKNOWN"

def _build_response(freshness: str, confidence: float, detected_class: str) -> dict:
    """Tạo object response chuẩn cho frontend và backend Java."""
    if freshness == "FRESH":
        return {
            "freshness": "FRESH",
            "confidence": confidence,
            "detectedClass": detected_class,
            "label": "Tươi sạch",
            "isFresh": True,
            "message": "Sản phẩm còn rất tươi và an toàn để sử dụng.",
            "description": f"AI nhận diện đây là '{detected_class}' với độ tươi cao.",
            "suggestion": "Có thể sử dụng ngay hoặc bảo quản trong tủ lạnh để giữ độ tươi lâu hơn."
        }
    elif freshness == "SPOILED":
        return {
            "freshness": "SPOILED",
            "confidence": confidence,
            "detectedClass": detected_class,
            "label": "Hư hỏng / Không tươi",
            "isFresh": False,
            "message": "Sản phẩm có dấu hiệu hư hỏng hoặc không còn tươi.",
            "description": f"AI nhận diện '{detected_class}' có dấu hiệu biến đổi màu sắc hoặc kết cấu.",
            "suggestion": "Không nên sử dụng sản phẩm này để đảm bảo sức khỏe."
        }
    else:
        return {
            "freshness": "UNKNOWN",
            "confidence": confidence,
            "detectedClass": detected_class,
            "label": "Không xác định",
            "isFresh": False,
            "message": "AI không thể xác định chính xác độ tươi của sản phẩm.",
            "description": "Ảnh có thể bị mờ, thiếu sáng hoặc sản phẩm không nằm trong danh mục nhận diện.",
            "suggestion": "Hãy thử chụp ảnh rõ nét hơn, đủ ánh sáng và đặt sản phẩm ở chính giữa khung hình."
        }
    
@app.route("/api/predict-freshness", methods=["POST"])
def predict_freshness():
    if "image" not in request.files:
        logger.warning("Request missing 'image' file.")
        return jsonify({"error": "Thiếu file ảnh (part name must be 'image')."}), 400

    file = request.files["image"]
    if file.filename == "":
        logger.warning("Received empty filename.")
        return jsonify({"error": "File ảnh rỗng."}), 400

    if not ROBOFLOW_API_KEY:
        logger.error("Roboflow API Key missing.")
        return jsonify({"error": "AI model chưa sẵn sàng (API key missing)."}), 503

    global model
    try:
        # Sử dụng BytesIO để tránh ghi file nếu có thể, nhưng Roboflow SDK thường cần path.
        # Ta dùng temp file với tên duy nhất (hoặc đơn giản là ghi đè nếu volume thấp)
        temp_path = os.path.join(os.getcwd(), "temp_inference.jpg")
        file.save(temp_path)

        # Kiểm tra file có phải là nội dung ảnh hợp lệ không (để tránh lỗi Pillow sau này)
        try:
            with Image.open(temp_path) as img:
                img.verify()
        except Exception as e:
            logger.error("Invalid image content: %s", e)
            if os.path.exists(temp_path): os.remove(temp_path)
            return jsonify({"error": "Tệp tin không phải là ảnh hợp lệ."}), 400

        # Khởi tạo model nếu cần
        if model is None:
            logger.info("Initializing Roboflow connection on-demand...")
            rf = Roboflow(api_key=ROBOFLOW_API_KEY)
            project = rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
            model = project.version(ROBOFLOW_VERSION).model
        
        # Thực hiện dự đoán
        prediction = model.predict(temp_path).json()
        logger.info("Prediction successful for image.")
        
        if os.path.exists(temp_path):
            os.remove(temp_path)

        predictions = prediction.get("predictions", [])
        if not predictions:
            logger.info("No predictions found in image.")
            return jsonify(_build_response("UNKNOWN", 0.0, "no_detection")), 200

        # Lấy dự đoán có độ tin cậy cao nhất
        best_pred = max(predictions, key=lambda x: x["confidence"])
        best_class = best_pred["class"]
        best_conf = best_pred["confidence"]

        # Nếu độ tin cậy quá thấp (< 40%)
        if best_conf < 0.40:
            logger.info("Confidence too low: %.2f", best_conf)
            return jsonify(_build_response("UNKNOWN", best_conf, best_class)), 200
        
        freshness = _label_to_freshness(best_class)
        logger.info("Detected class: %s (confidence: %.2f)", best_class, best_conf)

        return jsonify(_build_response(freshness, best_conf, best_class)), 200

    except Exception as exc:
        logger.error("AI Prediction error: %s", exc, exc_info=True)
        return jsonify({"error": f"Lỗi xử lý AI: {str(exc)}"}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "mode": "hosted",
        "version": ROBOFLOW_VERSION
    })


if __name__ == "__main__":
    load_model()
    port = int(os.environ.get("PORT", 5000))
    logger.info("AI Freshness Server khởi động tại http://localhost:%d", port)
    logger.info("Endpoint: POST http://localhost:%d/api/predict-freshness", port)
    app.run(host="0.0.0.0", port=port, debug=False)
