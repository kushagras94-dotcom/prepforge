import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from pymongo import MongoClient
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["prepforge"]
collection = db["resumechunks"]

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector_store = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embeddings,
    index_name="resume_vector_index",
    text_key="chunkText",
    embedding_key="embedding",
)

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

def chunk_resume(resume):
    chunks = []
    index = 0
    if resume.get("skills"):
        chunks.append(Document(page_content=f"Skills: {', '.join(resume['skills'])}",
            metadata={"section": "skills", "chunkIndex": index, "resumeId": resume["resumeId"], "user": resume["user"]}))
        index += 1
    for entry in resume.get("experience", []):
        chunks.append(Document(page_content=entry,
            metadata={"section": "experience", "chunkIndex": index, "resumeId": resume["resumeId"], "user": resume["user"]}))
        index += 1
    for entry in resume.get("projects", []):
        chunks.append(Document(page_content=entry,
            metadata={"section": "project", "chunkIndex": index, "resumeId": resume["resumeId"], "user": resume["user"]}))
        index += 1
    if resume.get("summary"):
        chunks.append(Document(page_content=resume["summary"],
            metadata={"section": "summary", "chunkIndex": index, "resumeId": resume["resumeId"], "user": resume["user"]}))
        index += 1
    return chunks

class IngestRequest(BaseModel):
    resumeId: str
    user: str
    skills: list[str] = []
    experience: list[str] = []
    projects: list[str] = []
    summary: str = ""

@app.post("/ingest")
def ingest(req: IngestRequest):
    resume = req.dict()
    documents = chunk_resume(resume)
    collection.delete_many({"resumeId": resume["resumeId"]})
    if documents:
        vector_store.add_documents(documents)
    return {"chunksInserted": len(documents)}

class RetrieveRequest(BaseModel):
    resumeId: str
    query: str
    k: int = 3

@app.post("/retrieve")
def retrieve(req: RetrieveRequest):
    results = vector_store.similarity_search(
        req.query, k=req.k, pre_filter={"resumeId": {"$eq": req.resumeId}}
    )
    return {"chunks": [r.page_content for r in results]}