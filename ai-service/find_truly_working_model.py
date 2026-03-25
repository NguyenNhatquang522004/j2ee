import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def find_truly_working_model():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    
    # These are very popular and usually work
    candidates = [
        ("sih-fruits", "fruits-freshness-detection"),
        ("fruits-p8iif", "fruit-freshness-hcl7p"),
        ("fruit-freshness-ykhy1", "fruit-freshness-detection")
    ]
    
    for ws, proj in candidates:
        try:
            print(f"Testing {ws}/{proj}...")
            project = rf.workspace(ws).project(proj)
            for v in project.versions():
                v_id = v.id.split('/')[-1]
                print(f"  Checking Version {v_id}...")
                try:
                    # Try a very lightweight format first to check if model exists
                    v.model.download("yolov8", location="./temp_check")
                    print(f"  !!! SUCCESS !!! Found model: {ws}/{proj}/{v_id}")
                    return (ws, proj, v_id)
                except Exception as e:
                    print(f"    Failed: {e}")
        except Exception as e:
            print(f"  Project {ws}/{proj} not found or inaccessible: {e}")
            
    return None

if __name__ == "__main__":
    res = find_truly_working_model()
    if res:
        print(f"RESULT:{res[0]}|{res[1]}|{res[2]}")
    else:
        print("RESULT:NONE")
