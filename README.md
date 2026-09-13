# PrepForge — AI-Powered Mock Interview Platform

PrepForge is a full-stack mock interview platform that conducts adaptive, resume-aware technical interviews, evaluates answers with a multi-agent scoring pipeline, and speaks questions aloud in a natural voice.

**Live demo:** [prepforge-ashen.vercel.app](https://prepforge-ashen.vercel.app)

---

## Table of Contents

- [What it does](#what-it-does)
- [High-level architecture](#high-level-architecture)
- [Full directory structure](#full-directory-structure)
- [Architecture, branch by branch](#architecture-branch-by-branch)
- [Request walkthrough: starting an interview](#request-walkthrough-starting-an-interview)
- [Tech stack](#tech-stack)
- [Running locally](#running-locally)
- [Deployment status](#deployment-status)

---

## What it does

- Runs a multi-turn, context-aware mock interview that adapts follow-up questions based on your actual answers
- Tracks structured conversation memory (topics covered, weak areas, strong areas) across the interview
- Automatically raises or lowers question difficulty mid-interview based on how you're actually performing
- Retrieves relevant resume context via semantic search (RAG) instead of dumping your whole resume into every prompt
- Uses a tool-calling agent that decides for itself when it needs to look up your resume or past interview history, rather than always being fed everything upfront
- Scores your interview with four specialized evaluators (technical accuracy, communication, problem-solving, confidence) instead of one generic pass
- Accepts spoken answers, transcribes them, and scores delivery (pace, filler words, pauses) alongside content
- Speaks interview questions aloud in a natural Indian-accented voice, with a mute toggle and voice selection
- Generates a downloadable PDF scorecard and tracks progress across interviews on a dashboard

---

## High-level architecture

The backend is deliberately split into two services by **workload type**, not written end to end in one language:

```
┌─────────────────┐         ┌──────────────────────┐         ┌───────────────────────┐
│                  │  HTTPS  │                       │  HTTP   │                       │
│   client/        │────────▶│   server/             │────────▶│   python-service/     │
│   React + Vite   │◀────────│   Node + Express      │◀────────│   FastAPI + LangChain │
│                  │         │                       │         │                       │
└─────────────────┘         └──────────┬────────────┘         └──────────┬────────────┘
                                        │                                  │
                              ┌─────────┴─────────┐              ┌────────┴────────┐
                              │  MongoDB Atlas     │              │  MongoDB Atlas  │
                              │  Redis (Upstash)   │◀────────────▶│  Vector Search  │
                              │  Groq (LLM+Whisper)│              │  Groq (LLM)     │
                              │  Sarvam (TTS)       │              │                 │
                              └─────────────────────┘              └─────────────────┘
```

- **`client/`** is the interview UI — talks only to `server/`, never directly to `python-service/`.
- **`server/`** owns the application layer: auth, session/transcript state, rate limiting, scoring aggregation, speech-to-text and text-to-speech. It's the only thing the frontend ever calls.
- **`python-service/`** owns the GenAI-heavy pipeline: resume chunking, embeddings, vector retrieval, and a tool-calling agent. `server/` calls it over HTTP as an internal dependency — the frontend never knows it exists.
- Both services read/write the **same MongoDB Atlas cluster**, but through different drivers (Mongoose in Node, PyMongo/LangChain in Python) — this is why the resume-chunk schema had to be kept simple and consistent across both.
- **If `python-service/` is unreachable, `server/` catches the failure and falls back to a simpler full-text resume prompt rather than failing the interview outright.** This fallback is exercised in production right now, since `python-service/` is currently local-only — see [Deployment status](#deployment-status).

This split mirrors how real applied-AI systems are usually structured in industry: the ML/retrieval workload sits in its own service, independent of the main API, so either half can be developed, scaled, or replaced without touching the other.

---

## Full directory structure

```
prepforge/
├── client/                          React (Vite) frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js     Pre-configured axios client (base URL, auth header)
│   │   ├── context/
│   │   │   └── AuthContext.jsx      Global auth state (current user, login/logout)
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx        Landing page after login + analytics charts
│   │   │   ├── Resume.jsx           Resume upload/analyze UI
│   │   │   ├── Interview.jsx        The interview itself — voice, mute, chat, timer
│   │   │   ├── Scorecard.jsx        Post-interview results + PDF export
│   │   │   └── History.jsx          List of past interviews
│   │   ├── App.jsx                  Route definitions
│   │   └── main.jsx                 React entry point
│   └── vercel.json                  Rewrite rules so React Router works on refresh
│
├── server/                          Node + Express backend
│   └── src/
│       ├── agents/
│       │   ├── questionAgent.js     Builds the interview-question prompt, calls Groq
│       │   ├── scoringAgent.js      Aggregator: runs all 4 evaluators, merges results
│       │   └── evaluators/
│       │       ├── evaluatorUtils.js          Shared "call Groq, parse JSON" helper
│       │       ├── technicalEvaluator.js      Judges technical accuracy only
│       │       ├── communicationEvaluator.js  Judges clarity/structure only
│       │       ├── problemSolvingEvaluator.js Judges approach/reasoning only
│       │       └── confidenceEvaluator.js     Judges composure/decisiveness only
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── interviewController.js   Orchestrates start/answer/end interview flow
│       │   ├── resumeController.js      Handles upload, extraction, triggers Python /ingest
│       │   ├── scorecardController.js
│       │   └── ttsController.js         Calls Sarvam AI, streams audio back to client
│       ├── orchestrator/
│       │   └── interviewOrchestrator.js  Thin pass-through so controllers never call agents directly
│       ├── models/                       Mongoose schemas
│       │   ├── User.js
│       │   ├── Resume.js
│       │   ├── Transcript.js             Interview messages + memory + difficulty state
│       │   └── Scorecard.js
│       ├── middleware/
│       │   ├── auth.js                   JWT verification
│       │   ├── rateLimiter.js            Custom Redis token-bucket limiter
│       │   ├── upload.js                 Multer config for resume PDFs
│       │   └── audioUpload.js            Multer config for voice-answer audio
│       ├── services/
│       │   ├── aiClient.js               Wraps Groq chat + Whisper calls with retry/backoff
│       │   └── memoryAgent.js            Extracts topics/weak-areas/performance after each answer
│       ├── utils/
│       │   ├── speechMetrics.js          Computes WPM, filler words, pauses from Whisper output
│       │   └── adaptiveDifficulty.js     Bumps difficulty up/down based on performance streaks
│       ├── routes/                       One file per resource, mounted in server.js
│       └── config/
│           ├── db.js                     Mongoose connection
│           └── redisClient.js            Upstash REST Redis client
│   └── server.js                         App entry point — mounts all routes
│
├── python-service/                  FastAPI + LangChain microservice
│   ├── app/
│   │   ├── config.py                 Env vars, Mongo client, embedding model (loaded once)
│   │   ├── models.py                 Pydantic request/response schemas
│   │   ├── chunking.py               Splits a resume into Document objects by section
│   │   ├── vectorstore.py            MongoDBAtlasVectorSearch setup
│   │   ├── chains/
│   │   │   ├── retrieval_chain.py    LCEL chain: retriever → prompt → Groq → parser
│   │   │   └── agent_chain.py        Tool-calling agent (binds tools to a Groq model)
│   │   ├── tools/
│   │   │   ├── resume_tool.py        Callable tool: fetch resume chunks on a topic
│   │   │   └── scorecard_tool.py     Callable tool: fetch past weak areas
│   │   └── routers/
│   │       ├── ingest.py             POST /ingest — chunk + embed + store a resume
│   │       ├── retrieve.py           POST /retrieve — run the retrieval chain
│   │       └── agent.py              POST /agent/start-question — tool-calling opener
│   └── main.py                       FastAPI app, includes all routers
│
└── README.md
```

---

## Architecture, branch by branch

### `client/` — the interface

A single-page React app. It never talks to `python-service/` or the databases directly — every request goes through `server/`'s REST API via `axiosInstance.js`. `Interview.jsx` is the most complex page: it manages the chat transcript, MediaRecorder for voice answers, and audio playback for the AI's spoken questions (fetched as an audio blob from `server/`'s `/tts/speak` endpoint, not the browser's built-in speech synthesis).

### `server/agents/` — prompt construction and LLM orchestration

This is where every LLM call that isn't retrieval-related lives. `questionAgent.js` builds the system prompt for the *next* interview question — folding in difficulty, resume context, and conversation memory. `scoringAgent.js` doesn't call the LLM directly for scoring; it fans out to four evaluator files in parallel (`Promise.all`), each of which is told to judge *one* dimension and explicitly ignore the others, then a fifth synthesis call merges their output into one coherent `overallFeedback` string. This replaced an earlier single-prompt-scores-everything approach, which tended to produce shallower, averaged feedback.

### `server/controllers/` + `orchestrator/` — request handling

Controllers are the only files that touch `req`/`res`. `interviewController.js` is the busiest one — it decides whether to call the Python service for RAG-based resume context or the tool-calling agent for the opening question, updates conversation memory after every answer, and runs the adaptive-difficulty check. `interviewOrchestrator.js` exists purely so controllers never import agent files directly — a thin indirection layer that made it easy to swap `questionAgent`'s internals without touching the controller.

### `server/services/` + `utils/` — supporting logic with no HTTP awareness

`aiClient.js` is the single place that actually calls Groq — every agent goes through it, which is what made a Groq model retirement a one-file fix instead of a scattered one. `memoryAgent.js` runs a lightweight extraction call after every answer to tag it as struggled/solid/excelled and update running topic lists; `adaptiveDifficulty.js` then reads that output to decide whether to bump the interview's difficulty level.

### `python-service/app/` — the GenAI pipeline

This mirrors LangChain's own idioms rather than being a thin wrapper: `chunking.py` builds `Document` objects along the resume's existing structured fields (skills, each experience entry, each project) instead of splitting text at arbitrary character counts, so a chunk is never cut off mid-thought. `vectorstore.py` configures `MongoDBAtlasVectorSearch` once, reused by both the plain retrieval chain and the tool-calling agent. `chains/retrieval_chain.py` composes an actual LCEL chain (`retriever | prompt | llm | parser`) that *synthesizes* a 2–3 sentence answer from retrieved chunks, rather than just returning raw chunk text for Node to concatenate. `chains/agent_chain.py` goes a step further: instead of always running retrieval, it gives the LLM two callable tools and lets the model decide for itself whether it needs resume context or past-performance data before answering — genuine function/tool calling, not pre-fetched context.

### Why two services share one database

Both `server/` and `python-service/` read and write MongoDB Atlas directly, using different drivers. This was a deliberate tradeoff: it avoids adding a third service just to broker data between them, at the cost of both codebases needing to agree on field names for shared collections (notably `resumechunks`) — a discipline that mattered in practice when the RAG pipeline was rewritten mid-project.

---

## Request walkthrough: starting an interview

1. User clicks **Start Interview** in `Interview.jsx` → `POST /api/interview/start` to `server/`.
2. `interviewController.js` checks `useResume`. If checked, it calls `python-service`'s `/retrieve` endpoint with the resume's ID and a query built from the target role/company.
3. `python-service`'s retrieval chain embeds the query, runs a MongoDB Atlas Vector Search filtered to that resume, retrieves the top-k chunks, and synthesizes a short context summary via Groq — returned to Node as plain text.
4. If a resume exists, `server/` instead calls `python-service`'s `/agent/start-question` endpoint, which runs the tool-calling agent to generate a resume-grounded opening question directly.
5. **If either Python call fails or the service is unreachable, `server/` catches it and falls back to a full-text resume dump, so the interview never actually breaks.** This is the exact path currently active in production (see below).
6. The question is saved to a new `Transcript` document and spoken aloud via `server/`'s `/tts/speak` endpoint (Sarvam AI), which the frontend plays back.
7. Each subsequent answer triggers `memoryAgent.js` (tags performance, updates topic/weak/strong lists), `adaptiveDifficulty.js` (possibly shifts difficulty), and `questionAgent.js` (generates the next question using the now-updated memory and difficulty).

---

## Tech stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, Recharts, jsPDF

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Redis (Upstash REST client), JWT + bcrypt

**AI/GenAI:** Groq API (LLM inference), Groq Whisper (speech-to-text), Sarvam AI (Indian-accent text-to-speech), Python, LangChain, `langchain-mongodb`, `langchain-groq`, `langchain-huggingface`, `sentence-transformers` (local embeddings, no external API cost), MongoDB Atlas Vector Search

**Infra:** Vercel (frontend), Render (Node backend)

---

## Running locally

Three services need to run together.

**1. Server** (`server/`)
```bash
npm install
npm run dev
```
Requires a `.env` with `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GROQ_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SARVAM_API_KEY`.

**2. Python service** (`python-service/`)
```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Requires a `.env` with `MONGO_URI`, `GROQ_API_KEY`.

**3. Client** (`client/`)
```bash
npm install
npm run dev
```
Requires a `.env.local` with `VITE_API_URL=http://localhost:5000/api`.

---

## Deployment status

**Live and working in production:** `client/` (Vercel) and `server/` (Render) — authentication, the full multi-turn interview engine, adaptive difficulty, conversation memory, multi-agent scoring, voice (speech-to-text and text-to-speech), and the analytics dashboard all run live with no dependency on `python-service/`.

**Not yet deployed:** `python-service/`, currently local-only during development. In production right now, `server/`'s fallback path is what's actually active — interviews still work end to end, but resume context comes from a simpler full-text method rather than the RAG/tool-calling pipeline. This is a deliberate, tested fallback, not a bug: the app degrades gracefully instead of breaking when this dependency is unavailable.

Hosting a Python service with `sentence-transformers` + `torch` + LangChain for free turned out to be a genuinely harder problem than hosting the Node backend — most "free" ML hosting either requires a paid plan for anything beyond static content, or is a time-limited trial rather than a permanent free tier. Deployment for this piece is a planned next step, most likely on Google Cloud Run's always-free tier (no expiry, real Docker support, sufficient memory headroom), which requires billing verification but stays within its free quota for this project's traffic level.
---

*Built by Kushagra Sharma as a portfolio project for campus placement preparation.*