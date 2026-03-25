import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def get_class_names():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    version = project.version(1)
    
    print(f"Classes: {version.classes}")

if __name__ == "__main__":
    get_class_names()
