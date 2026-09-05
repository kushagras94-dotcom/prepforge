from fastapi import FastAPI
from app.routers import ingest, retrieve

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(ingest.router)
app.include_router(retrieve.router)