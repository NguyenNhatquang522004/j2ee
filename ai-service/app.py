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

# ── Cấu hình ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).parent
MODEL_DIR = BASE_DIR / "models" / "freshness_model"

# Tìm file weights (.pt) trong thư mục model đã tải
def _find_weights() -> Path | None:
    for pattern in ["**/*.pt", "**/*.onnx"]:
        candidates = sorted(MODEL_DIR.glob(pattern))
        if candidates:
            return candidates[0]
    return None

# ── Load model ───────────────────────────────────────────────────────────────
model = None

def load_model():
    global model
    weights_path = _find_weights()
    if weights_path is None:
        logger.warning(
            "Không tìm thấy file weights trong '%s'. "
            "Hãy chạy: python download_model.py --api-key <YOUR_KEY>",
            MODEL_DIR,
        )
        return

    try:
        from ultralytics import YOLO
        model = YOLO(str(weights_path))
        logger.info("Đã load model từ: %s", weights_path)
    except Exception as exc:
        logger.error("Lỗi load model: %s", exc)


# ── Flask app ─────────────────────────────────────────────────────────────────
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB max upload


def _label_to_freshness(class_name: str) -> str:
    """Chuyển class name (fresh-apple, stale-banana…) sang FRESH hoặc ROTTEN."""
    name_lower = class_name.lower()
    if name_lower.startswith("fresh") or "fresh" in name_lower:
        return "FRESH"
    if name_lower.startswith("stale") or name_lower.startswith("rotten") or "rotten" in name_lower:
        return "ROTTEN"
    # Fallback: dùng keyword matching
    fresh_keywords = ["good", "new", "ok", "unripe", "ripe"]
    rotten_keywords = ["bad", "spoiled", "decayed", "old", "damaged"]
    for kw in fresh_keywords:
        if kw in name_lower:
            return "FRESH"
    for kw in rotten_keywords:
        if kw in name_lower:
            return "ROTTEN"
    return "UNKNOWN"


def _build_response(freshness: str, confidence: float, detected_class: str) -> dict:
    is_fresh = freshness == "FRESH"
    return {
        "label": freshness,
        "freshness": freshness,
        "confidence": round(confidence, 4),
        "isFresh": is_fresh,
        "detectedClass": detected_class,
        "message": (
            "Sản phẩm còn tươi và an toàn để sử dụng."
            if is_fresh
            else "Sản phẩm có dấu hiệu không còn tươi. Không nên sử dụng."
        ),
        "description": (
            "Thực phẩm có màu sắc và kết cấu bình thường, không có dấu hiệu hư hỏng."
            if is_fresh
            else "Thực phẩm có dấu hiệu biến đổi màu sắc, bề mặt hoặc kết cấu bất thường."
        ),
        "suggestion": (
            "Có thể sử dụng bình thường. Nên bảo quản trong ngăn mát tủ lạnh để giữ độ tươi lâu hơn."
            if is_fresh
            else "Không nên sử dụng thực phẩm này. Vui lòng kiểm tra lại hoặc liên hệ cửa hàng để được hỗ trợ."
        ),
    }


@app.route("/api/predict-freshness", methods=["POST"])
def predict_freshness():
    # Validate input
    if "image" not in request.files:
        return jsonify({"error": "Thiếu file ảnh. Gửi field 'image' dạng multipart/form-data."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "File ảnh rỗng."}), 400

    allowed_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_exts:
        return jsonify({"error": f"Định dạng không hỗ trợ: {ext}"}), 400

    # Kiểm tra model đã load chưa
    if model is None:
        return jsonify({
            "error": "Model chưa được tải. Chạy: python download_model.py --api-key <KEY>"
        }), 503

    try:
        # Đọc ảnh từ request
        image_bytes = file.read()
        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Chạy inference
        results = model.predict(pil_image, conf=0.25, verbose=False)

        if not results or len(results) == 0:
            return jsonify(_build_response("UNKNOWN", 0.0, "unknown")), 200

        detections = results[0].boxes
        if detections is None or len(detections) == 0:
            # Không phát hiện object nào — trả về UNKNOWN
            logger.info("Không phát hiện object nào trong ảnh.")
            return jsonify({
                **_build_response("UNKNOWN", 0.0, "no_detection"),
                "message": "Không nhận diện được thực phẩm trong ảnh. Vui lòng chụp rõ hơn.",
                "description": "Hệ thống không phát hiện được đối tượng thực phẩm.",
                "suggestion": "Hãy chụp ảnh gần hơn, đủ sáng và tập trung vào thực phẩm cần kiểm tra.",
            }), 200

        # Lấy detection có confidence cao nhất
        class_names = model.names  # dict: {0: 'fresh-apple', 1: 'stale-apple', ...}
        best_idx = detections.conf.argmax().item()
        best_conf = float(detections.conf[best_idx].item())
        best_class_id = int(detections.cls[best_idx].item())
        best_class_name = class_names.get(best_class_id, "unknown")

        freshness = _label_to_freshness(best_class_name)
        logger.info(
            "Detected: class='%s' freshness='%s' confidence=%.2f",
            best_class_name, freshness, best_conf,
        )

        return jsonify(_build_response(freshness, best_conf, best_class_name)), 200

    except Exception as exc:
        logger.error("Lỗi inference: %s", exc, exc_info=True)
        return jsonify({"error": f"Lỗi xử lý ảnh: {str(exc)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": str(_find_weights()) if _find_weights() else None,
    })


if __name__ == "__main__":
    load_model()
    port = int(os.environ.get("PORT", 5000))
    logger.info("AI Freshness Server khởi động tại http://localhost:%d", port)
    logger.info("Endpoint: POST http://localhost:%d/api/predict-freshness", port)
    app.run(host="0.0.0.0", port=port, debug=False)
