import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def check_model_formats():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    version = project.version(1)
    
    print(f"Project: {project.name}, Version: {version.id}")
    if hasattr(version, 'model'):
        print(f"Model: {version.model}")
        # Try to see what formats are available or just try downloading common ones
        try:
            # This might fail but it often gives the list of supported formats in the error
            version.model.download("invalid_format")
        except Exception as e:
            print(f"Error (contains formats?): {e}")

if __name__ == "__main__":
    check_model_formats()
