from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from app.vectorstore import vector_store
from app.config import GROQ_API_KEY

PROMPT = ChatPromptTemplate.from_template(
    "You are helping an interviewer understand a candidate's background.\n"
    "Resume context:\n{context}\n\n"
    "Question: {question}\n\n"
    "In 2-3 sentences, summarize the most relevant resume details for this question."
)

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)

def format_docs(docs):
    return "\n\n".join(d.page_content for d in docs)

def build_chain(resume_id: str, k: int = 3):
    retriever = vector_store.as_retriever(
        search_kwargs={"k": k, "pre_filter": {"resumeId": {"$eq": resume_id}}}
    )
    return (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | PROMPT
        | llm
        | StrOutputParser()
    )