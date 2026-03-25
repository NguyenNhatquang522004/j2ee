"""
Script tải model YOLOv8 về local từ Roboflow Universe.

Model: freshness fruits and vegetables
Source: https://universe.roboflow.com/college-74jj5/freshness-fruits-and-vegetables
Classes: fresh-apple, fresh-banana, fresh-bitter-gourd, fresh-capsicum, fresh-orange,
         fresh-tomato, stale-apple, stale-banana, stale-bitter-gourd, stale-capsicum,
         stale-orange, stale-tomato (và nhiều class fresh/stale khác)

CÁCH SỬ DỤNG:
1. Đăng ký tài khoản miễn phí tại https://app.roboflow.com
2. Vào https://app.roboflow.com/settings/api để lấy API key
3. Chạy: python download_model.py --api-key <YOUR_ROBOFLOW_API_KEY>
   Hoặc đặt ROBOFLOW_API_KEY trong file .env
"""

import os
import sys
import argparse
from pathlib import Path

def download_model(api_key: str):
    try:
        from roboflow import Roboflow
    except ImportError:
        print("[ERROR] Package 'roboflow' chưa được cài. Chạy: pip install roboflow")
        sys.exit(1)

    models_dir = Path(__file__).parent / "models"
    models_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("Đang kết nối Roboflow Universe...")
    print("Model: freshness-fruits-and-vegetables (college-74jj5)")
    print("=" * 60)

    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")

    # Tải version mới nhất (version 7 - pre-trained YOLOv8)
    model = project.version(7).download("yolov8", location=str(models_dir / "freshness_model"))

    # Tìm file weights .pt đã tải
    pt_files = list((models_dir / "freshness_model").glob("**/*.pt"))
    if not pt_files:
        # Với YOLOv8 format, weights nằm trong thư mục runs hoặc weights
        print("[WARN] Không tìm thấy file .pt trong thư mục mặc định, kiểm tra lại...")

    print("\n[SUCCESS] Tải model thành công!")
    print(f"Thư mục model: {models_dir / 'freshness_model'}")
    print("\nBây giờ có thể chạy: python app.py")


def main():
    parser = argparse.ArgumentParser(description="Tải YOLOv8 freshness detection model từ Roboflow")
    parser.add_argument("--api-key", type=str, help="Roboflow API key")
    args = parser.parse_args()

    api_key = args.api_key

    # Thử đọc từ .env nếu không có --api-key
    if not api_key:
        env_file = Path(__file__).parent / ".env"
        if env_file.exists():
            from dotenv import load_dotenv
            load_dotenv(env_file)
            api_key = os.getenv("ROBOFLOW_API_KEY")

    if not api_key:
        print("[ERROR] Vui lòng cung cấp Roboflow API key:")
        print("  python download_model.py --api-key <YOUR_KEY>")
        print("  Hoặc đặt ROBOFLOW_API_KEY=<YOUR_KEY> trong file .env")
        sys.exit(1)

    download_model(api_key)


if __name__ == "__main__":
    main()
