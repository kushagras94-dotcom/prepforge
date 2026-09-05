from langchain_core.messages import HumanMessage, ToolMessage
from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY
from app.tools.resume_tool import get_resume_context
from app.tools.scorecard_tool import get_past_weak_areas

from langchain_core.messages import SystemMessage

TOOLS = [get_resume_context, get_past_weak_areas]
TOOL_MAP = {t.name: t for t in TOOLS}

llm = ChatGroq(model="openai/gpt-oss-120b", api_key=GROQ_API_KEY)
llm_with_tools = llm.bind_tools(TOOLS)

def run_agent(prompt: str) -> str:
    messages = [HumanMessage(content=prompt)]
    response = llm_with_tools.invoke(messages)
    print(response.tool_calls)
    messages.append(response)

    if response.tool_calls:
        for call in response.tool_calls:
            tool_fn = TOOL_MAP[call["name"]]
            result = tool_fn.invoke(call["args"])
            messages.append(ToolMessage(content=str(result), tool_call_id=call["id"]))
        final_response = llm_with_tools.invoke(messages)
        return final_response.content

    return response.content


OPENING_INSTRUCTION = (
    "You are an experienced technical interviewer starting a mock interview for a {role} position{company_clause}. "
    "Difficulty: {difficulty}.\n"
    "You have tools available to look up the candidate's resume background and their past weak areas from previous interviews. "
    "Use them if they would help you craft a more targeted opening question.\n"
    "Respond with ONLY the opening question, nothing else."
)

def generate_opening_question(role, company, difficulty, resume_id, user_id):
    company_clause = f" at {company}" if company else ""
    system_text = OPENING_INSTRUCTION.format(role=role, company_clause=company_clause, difficulty=difficulty)
    user_text = f"Candidate resumeId: {resume_id}. Candidate userId: {user_id}. Ask your opening question."
    messages = [SystemMessage(content=system_text), HumanMessage(content=user_text)]

    response = llm_with_tools.invoke(messages)
    messages.append(response)

    if response.tool_calls:
        for call in response.tool_calls:
            tool_fn = TOOL_MAP[call["name"]]
            result = tool_fn.invoke(call["args"])
            messages.append(ToolMessage(content=str(result), tool_call_id=call["id"]))
        final_response = llm_with_tools.invoke(messages)
        return final_response.content

    return response.content