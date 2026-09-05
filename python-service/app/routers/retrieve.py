from fastapi import APIRouter
from app.models import RetrieveRequest
from app.chains.retrieval_chain import build_chain

router = APIRouter()

@router.post("/retrieve")
def retrieve(req: RetrieveRequest):
    chain = build_chain(req.resumeId, req.k)
    context = chain.invoke(req.query)
    return {"context": context}