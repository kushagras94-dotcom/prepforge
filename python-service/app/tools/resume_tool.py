from langchain_core.tools import tool
from app.vectorstore import vector_store

@tool
def get_resume_context(resume_id: str, topic: str) -> str:
    """Fetch relevant resume details for a candidate on a specific topic (e.g. a skill, project, or technology). Use this when you need to ask a question grounded in the candidate's actual background."""
    results = vector_store.similarity_search(
        topic, k=2, pre_filter={"resumeId": {"$eq": resume_id}}
    )
    if not results:
        return "No relevant resume information found."
    return "\n".join(r.page_content for r in results)