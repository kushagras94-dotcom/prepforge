from langchain_core.tools import tool
from app.config import db

@tool
def get_past_weak_areas(user_id: str) -> str:
    """Fetch topics the candidate previously struggled with in past mock interviews. Use this to decide whether to probe a known weak area again."""
    scorecards = db["scorecards"].find({"user": user_id}).sort("createdAt", -1).limit(3)
    weak_areas = []
    for sc in scorecards:
        weak_areas.extend(sc.get("areasToImprove", []))
    if not weak_areas:
        return "No past interview history found for this candidate."
    return "Previously identified weak areas: " + ", ".join(set(weak_areas))