import os
from roboflow import Roboflow
from dotenv import load_dotenv

def test_model_sdk(workspace, project, version, api_key, image_path):
    print(f"Testing Model: {workspace}/{project}/{version}")
    try:
        rf = Roboflow(api_key=api_key)
        # Handle cases with and without workspace
        if workspace:
            proj = rf.workspace(workspace).project(project)
        else:
            proj = rf.project(project)
            
        model = proj.version(version).model
        prediction = model.predict(image_path).json()
        
        preds = prediction.get("predictions", [])
        print(f"  Status: SUCCESS, Predictions: {len(preds)}")
        for p in preds:
            print(f"    - {p['class']} ({p['confidence']:.2f})")
    except Exception as e:
        print(f"  Status: ERROR, {e}")

if __name__ == "__main__":
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    image_path = "temp_inference.jpg"
    
    models = [
        ("college-74jj5", "freshness-fruits-and-vegetables", 1),
        ("roboflow-j7v6v", "freshness-fruits-vegetables", 1),
        ("fruit-freshness-detection-clyp7", "freshness-detection-ycqre", 2),
        (None, "freshness-fruits", 1),
    ]
    
    if os.path.exists(image_path):
        for ws, proj, ver in models:
            test_model_sdk(ws, proj, ver, api_key, image_path)
    else:
        print("No test image found at temp_inference.jpg")
