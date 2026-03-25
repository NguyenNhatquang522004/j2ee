import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def debug_model():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    version = project.version(1)
    
    print(f"Project: {project.name}, Version: {version.id}")
    model = version.model
    print(f"Model object: {model}")
    
    # Try common formats and see which one doesn't 404
    # Common formats for YOLOv8 on Roboflow are "yolov8" or "yolov8-weights"
    formats = ["yolov8", "yolov8-weights", "pt", "onnx", "coreml"]
    for f in formats:
        try:
            print(f"Testing format: {f}")
            model.download(f, location="./test_download")
            print(f"Success with format: {f}")
            break
        except Exception as e:
            print(f"Failed format {f}: {e}")

if __name__ == "__main__":
    debug_model()
