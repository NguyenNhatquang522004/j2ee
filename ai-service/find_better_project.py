import os
from roboflow import Roboflow
from dotenv import load_dotenv
from pathlib import Path

def find_better_project():
    env_file = Path(__file__).parent / ".env"
    load_dotenv(env_file)
    api_key = os.getenv("ROBOFLOW_API_KEY")
    
    rf = Roboflow(api_key=api_key)
    # Search for "fruit freshness" projects
    # We'll try some known ones
    projects = [
        ("fruit-freshness-v6l8p", "fruit-freshness"),
        ("scd-jly3h", "freshness-detection"),
        ("fruit-freshness-detection-yv0jt", "freshness-fruits-and-vegetables")
    ]
    
    for workspace, project_id in projects:
        try:
            print(f"Checking {workspace}/{project_id}...")
            project = rf.workspace(workspace).project(project_id)
            for v in project.versions():
                v_num = v.id.split('/')[-1]
                try:
                    # Test if pt model exists
                    v.model.download("pt", location="./test_alt")
                    print(f"  FOUND WORKING MODEL: Workspace={workspace}, Project={project_id}, Version={v_num}")
                    return (workspace, project_id, v_num)
                except:
                    continue
        except:
            continue
    return None

if __name__ == "__main__":
    result = find_better_project()
    if result:
        print(f"RESULT:{result[0]}|{result[1]}|{result[2]}")
