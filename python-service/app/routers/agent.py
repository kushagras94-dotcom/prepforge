from fastapi import APIRouter
from pydantic import BaseModel
from app.chains.agent_chain import run_agent

from app.models import OpeningQuestionRequest
from app.chains.agent_chain import generate_opening_question


router = APIRouter()

class AgentRequest(BaseModel):
    prompt: str

@router.post("/agent/ask")
def ask_agent(req: AgentRequest):
    result = run_agent(req.prompt)
    return {"response": result}

@router.post("/agent/start-question")
def start_question(req: OpeningQuestionRequest):
    question = generate_opening_question(req.role, req.company, req.difficulty, req.resumeId, req.userId)
    return {"question": question}