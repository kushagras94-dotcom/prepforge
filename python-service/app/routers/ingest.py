from fastapi import APIRouter
from app.models import IngestRequest
from app.chunking import chunk_resume
from app.vectorstore import vector_store
from app.config import collection

router = APIRouter()

@router.post("/ingest")
def ingest(req: IngestRequest):
    resume = req.dict()
    documents = chunk_resume(resume)
    collection.delete_many({"resumeId": resume["resumeId"]})
    if documents:
        vector_store.add_documents(documents)
    return {"chunksInserted": len(documents)}