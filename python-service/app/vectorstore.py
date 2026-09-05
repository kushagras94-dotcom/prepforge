from langchain_mongodb import MongoDBAtlasVectorSearch
from app.config import collection, embeddings

vector_store = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embeddings,
    index_name="resume_vector_index",
    text_key="chunkText",
    embedding_key="embedding",
)