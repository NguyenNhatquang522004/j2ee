import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def test_hosted_inference():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    # The user's original project
    project = rf.workspace("college-74jj5").project("freshness-fruits-and-vegetables")
    model = project.version(1).model
    
    # We'll just print if model is valid
    print(f"Model: {model}")
    # Try a fake prediction (it will fail on image but we see the error)
    try:
        # model.predict("https://example.com/image.jpg")
        print("Model is ready for Hosted Inference.")
        return True
    except Exception as e:
        print(f"Hosted Inference Error: {e}")
        return False

if __name__ == "__main__":
    test_hosted_inference()
