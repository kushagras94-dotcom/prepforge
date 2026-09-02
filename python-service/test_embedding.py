from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

vector = embeddings.embed_query("Built a MERN interview platform with a multi-turn AI engine")

print("dimensions:", len(vector))
print("first 5 values:", vector[:5])

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=os.getenv("GROQ_API_KEY"))
response = llm.invoke("Say hello in one sentence.")
print(response.content)