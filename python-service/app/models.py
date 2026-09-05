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

class OpeningQuestionRequest(BaseModel):
    role: str
    company: str = ""
    difficulty: str = "Medium"
    resumeId: str
    userId: str