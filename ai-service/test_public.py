import os
from roboflow import Roboflow
from dotenv import load_dotenv

def test_public():
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    rf = Roboflow(api_key=api_key)
    print("Testing public access to 'fruit-freshness-u7lsq'...")
    try:
        # Try to access without workspace first
        project = rf.project("freshness-fruits-vegetables")
        version = project.version(1)
        print(f"  Success! Model loaded.")
    except Exception as e:
        print(f"  Failed: {e}")

if __name__ == "__main__":
    test_public()
