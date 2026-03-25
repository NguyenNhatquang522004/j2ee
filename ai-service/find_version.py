import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def find_trained_version():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    if not api_key:
        print("Error: ROBOFLOW_API_KEY not found in .env")
        return

    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    
    print(f"Project: {project.name}")
    print("Versions:")
    for v in project.versions():
        # Check if version has a trained model
        has_model = getattr(v, 'model_format', None) is not None or v.id.split('/')[-1].isdigit()
        print(f"  Version {v.id.split('/')[-1]}: {v.name} (Model: {has_model})")

if __name__ == "__main__":
    find_trained_version()
