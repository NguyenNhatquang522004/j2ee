import os
import requests
from dotenv import load_dotenv

def test_simple():
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    # Using a known public alias
    project_id = "freshness-fruits-vegetables"
    version = 1
    
    url = f"https://detect.roboflow.com/{project_id}/{version}"
    params = {"api_key": api_key}
    
    print(f"Testing simplest URL: {url}...")
    try:
        with open("temp_inference.jpg", "rb") as f:
            response = requests.post(url, params=params, files={"file": f})
        print(f"  Status: {response.status_code}")
        print(f"  Body: {response.text}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    if os.path.exists("temp_inference.jpg"):
        test_simple()
    else:
        print("temp_inference.jpg not found.")
