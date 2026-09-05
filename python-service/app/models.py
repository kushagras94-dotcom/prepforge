from pydantic import BaseModel

class IngestRequest(BaseModel):
    resumeId: str
    user: str
    skills: list[str] = []
    experience: list[str] = []
    projects: list[str] = []
    summary: str = ""

class RetrieveRequest(BaseModel):
    resumeId: str
    query: str
    k: int = 3