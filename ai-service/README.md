# AI Freshness Detection Service

Flask server chạy local, dùng **YOLOv8** để kiểm tra độ tươi thực phẩm.

## Model sử dụng

| Thông tin | Chi tiết |
|-----------|---------|
| **Nguồn** | [Roboflow Universe – freshness-fruits-and-vegetables](https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables) |
| **Kiến trúc** | YOLOv8 (Ultralytics) |
| **Dataset** | 9.283 ảnh rau củ quả fresh/stale |
| **Classes** | fresh-apple, stale-apple, fresh-banana, stale-banana, fresh-tomato, stale-tomato, fresh-orange, stale-orange, fresh-capsicum, stale-capsicum, fresh-bitter-gourd, stale-bitter-gourd... |
| **Endpoint** | `POST /api/predict-freshness` |

## Cài đặt

### Bước 1: Tạo môi trường Python

```bash
cd ai-service

# Tạo virtual environment
python -m venv venv

# Kích hoạt (Windows)
venv\Scripts\activate

# Cài dependencies
pip install -r requirements.txt
```

### Bước 2: Lấy Roboflow API key (miễn phí)

1. Đăng ký tại [https://app.roboflow.com](https://app.roboflow.com)
2. Vào **Settings → API** → copy **Private API Key**
3. Tạo file `.env` từ mẫu:
   ```bash
   copy .env.example .env
   ```
4. Mở `.env`, thay `your_roboflow_api_key_here` bằng key thật

### Bước 3: Tải model về local

```bash
python download_model.py --api-key <YOUR_ROBOFLOW_API_KEY>
```

Model sẽ được tải vào thư mục `models/freshness_model/`.

### Bước 4: Chạy server

```bash
python app.py
```

Server chạy tại: `http://localhost:5000`

---

## API Reference

### `POST /api/predict-freshness`

**Request:** `multipart/form-data`

| Field | Type | Mô tả |
|-------|------|--------|
| `image` | File | Ảnh JPG/PNG/WEBP của thực phẩm cần kiểm tra |

**Response thành công:**
```json
{
  "label": "FRESH",
  "freshness": "FRESH",
  "confidence": 0.876,
  "isFresh": true,
  "detectedClass": "fresh-apple",
  "message": "Sản phẩm còn tươi và an toàn để sử dụng.",
  "description": "Thực phẩm có màu sắc và kết cấu bình thường, không có dấu hiệu hư hỏng.",
  "suggestion": "Có thể sử dụng bình thường. Nên bảo quản trong ngăn mát tủ lạnh."
}
```

**Response khi rotten:**
```json
{
  "label": "ROTTEN",
  "freshness": "ROTTEN",
  "confidence": 0.921,
  "isFresh": false,
  "detectedClass": "stale-tomato",
  "message": "Sản phẩm có dấu hiệu không còn tươi. Không nên sử dụng.",
  "description": "Thực phẩm có dấu hiệu biến đổi màu sắc, bề mặt hoặc kết cấu bất thường.",
  "suggestion": "Không nên sử dụng thực phẩm này. Vui lòng kiểm tra lại hoặc liên hệ cửa hàng."
}
```

### `GET /health`

Kiểm tra trạng thái server và model:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_path": "models/freshness_model/..."
}
```

---

## Test bằng cURL

```bash
curl -X POST http://localhost:5000/api/predict-freshness \
  -F "image=@/path/to/tomato.jpg"
```

---

## Cấu trúc thư mục

```
ai-service/
├── app.py               ← Flask server chính
├── download_model.py    ← Script tải model từ Roboflow
├── requirements.txt     ← Python dependencies
├── .env.example         ← Mẫu file cấu hình
├── .env                 ← File cấu hình thực (gitignore)
└── models/
    └── freshness_model/ ← Thư mục chứa weights YOLOv8 (.pt)
```

## Tích hợp với Spring Boot

Trong `demo/src/main/resources/application.properties`:
```properties
app.ai.api.url=http://localhost:5000/api/predict-freshness
```
