import os
from roboflow import Roboflow
from dotenv import load_dotenv

def list_stuff():
    load_dotenv()
    api_key = os.getenv("ROBOFLOW_API_KEY")
    rf = Roboflow(api_key=api_key)
    print("Workspaces:")
    try:
        # Roboflow SDK doesn't have a direct list_workspaces, but we can try to get the default one
        ws = rf.workspace()
        print(f"  - {ws.name} ({ws.url})")
        print("  Projects in this workspace:")
        for project in ws.projects():
            print(f"    - {project}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_stuff()
