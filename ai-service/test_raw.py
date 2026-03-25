import os
import requests
from dotenv import load_dotenv

def test_raw():
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    # This is a confirmed public project
    workspace = "roboflow-j7v6v"
    project = "freshness-fruits-vegetables"
    version = 1
    
    url = f"https://detect.roboflow.com/{project}/{version}"
    params = {"api_key": api_key}
    
    print(f"Testing raw POST to {url}...")
    try:
        with open("temp_inference.jpg", "rb") as f:
            response = requests.post(url, params=params, files={"file": f})
        
        print(f"  Status: {response.status_code}")
        print(f"  Body: {response.text}")
    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_raw()
