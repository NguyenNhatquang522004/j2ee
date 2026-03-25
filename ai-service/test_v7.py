import os
from roboflow import Roboflow
from dotenv import load_dotenv

def test_v7():
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    rf = Roboflow(api_key=api_key)
    # Using the IDs found in data.yaml
    workspace = "college-74jj5"
    project = "freshness-fruits-and-vegetables"
    version = 7
    
    print(f"Testing Model: {workspace}/{project}/{version}")
    try:
        proj = rf.workspace(workspace).project(project)
        model = proj.version(version).model
        prediction = model.predict("temp_inference.jpg").json()
        
        preds = prediction.get("predictions", [])
        print(f"  Status: SUCCESS, Predictions: {len(preds)}")
        for p in preds:
            print(f"    - {p['class']} ({p['confidence']:.2f})")
    except Exception as e:
        print(f"  Status: ERROR, {e}")

if __name__ == "__main__":
    if os.path.exists("temp_inference.jpg"):
        test_v7()
    else:
        print("temp_inference.jpg not found.")
