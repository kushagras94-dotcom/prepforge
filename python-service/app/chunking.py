from langchain_core.documents import Document

def chunk_resume(resume: dict) -> list[Document]:
    chunks = []
    index = 0

    if resume.get("skills"):
        chunks.append(Document(
            page_content=f"Skills: {', '.join(resume['skills'])}",
            metadata={"section": "skills", "chunkIndex": index, "resumeId": resume["resumeId"], "user": resume["user"]}
        ))
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