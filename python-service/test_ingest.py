import os
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch

import time

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["prepforge"]
collection = db["resumechunks"]

def chunk_resume(resume):
    chunks = []
    index = 0

    if resume.get("skills"):
        chunks.append(Document(
            page_content=f"Skills: {', '.join(resume['skills'])}",
            metadata={"section": "skills", "chunkIndex": index, "resumeId": str(resume["_id"]), "user": str(resume["user"])}
        ))
        index += 1

    for entry in resume.get("experience", []):
        chunks.append(Document(
            page_content=entry,
            metadata={"section": "experience", "chunkIndex": index, "resumeId": str(resume["_id"]), "user": str(resume["user"])}
        ))
        index += 1

    for entry in resume.get("projects", []):
        chunks.append(Document(
            page_content=entry,
            metadata={"section": "project", "chunkIndex": index, "resumeId": str(resume["_id"]), "user": str(resume["user"])}
        ))
        index += 1

    if resume.get("summary"):
        chunks.append(Document(
            page_content=resume["summary"],
            metadata={"section": "summary", "chunkIndex": index, "resumeId": str(resume["_id"]), "user": str(resume["user"])}
        ))
        index += 1

    return chunks

def main():
    resume = db["resumes"].find_one()
    if not resume:
        print("No resume found in the resumes collection.")
        return

    documents = chunk_resume(resume)
    print(f"Built {len(documents)} chunks from resume.")

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embeddings,
        index_name="resume_vector_index",
        text_key="chunkText",
        embedding_key="embedding",
    )

    collection.delete_many({"resumeId": str(resume["_id"])})
    print("Cleared old chunks for this resume.")

    vector_store.add_documents(documents)
    print("Chunks embedded and stored in Atlas.")

    time.sleep(15)

    results = vector_store.similarity_search("Tell me about your Python projects", k=2)
    print("Number of results:", len(results))
    for r in results:
        print(r.page_content)
        print("---")

    all_chunks = collection.find({})
    for c in all_chunks:
        print(c['section'], '-', c['chunkText'][:60])

if __name__ == "__main__":
    main()