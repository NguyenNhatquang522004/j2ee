import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def find_working_weights():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    
    for v in project.versions():
        v_num = v.id.split('/')[-1]
        print(f"Checking Version {v_num}...")
        try:
            # Check if model exists and try to see supported formats
            model = v.model
            print(f"  Model found for version {v_num}. Attempting download...")
            # We just need to find one that doesn't 404
            model.download("pt", location=f"./test_v{v_num}")
            print(f"  SUCCESS! Version {v_num} has weights.")
            return v_num
        except Exception as e:
            print(f"  Version {v_num} failed: {e}")
    return None

if __name__ == "__main__":
    find_working_weights()
