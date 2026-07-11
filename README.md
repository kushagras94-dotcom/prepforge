# PrepForge 🎯

An AI-powered mock interview platform that conducts realistic, multi-turn technical interviews and generates detailed performance scorecards — built to help candidates prepare for real campus placements and technical interviews.

**Live demo:** [prepforge-ashen.vercel.app](https://prepforge-ashen.vercel.app)

## Overview

PrepForge simulates a real interviewer: it asks an opening question based on your target role, listens to your answer, and dynamically generates a relevant follow-up — just like a human interviewer would. Once the interview ends, it evaluates the full transcript across four performance dimensions and returns structured, actionable feedback.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios — deployed on Vercel
- **Backend:** Node.js, Express — deployed on Render
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Cache / Rate Limiting:** Redis (Upstash)
- **Auth:** JWT (JSON Web Tokens) + bcrypt for password hashing
- **AI Engine:** Groq API (`llama-3.3-70b-versatile`)

## Features

- ✅ User authentication (signup/login) with hashed passwords and JWT-based sessions
- ✅ Multi-turn AI interview engine — the AI reads the full conversation history and generates contextual follow-up questions based on the candidate's previous answers
- ✅ Three-collection MongoDB schema separating users, interview transcripts, and scorecards for independent, efficient querying
- ✅ Post-interview AI scoring system evaluating transcripts across four dimensions: Communication, Technical Accuracy, Problem Solving, Confidence
- ✅ Structured feedback generation — strengths, areas to improve, and an overall summary per interview
- ✅ Orchestrator/agent architecture — AI logic split into a `questionAgent` and `scoringAgent`, coordinated by an `interviewOrchestrator`, instead of one monolithic AI service
- ✅ Redis-based Token Bucket rate limiter protecting AI-calling routes from abuse and burst traffic
- ✅ Exponential backoff retry on AI calls for resilience against transient provider failures
- ✅ Fully deployed, live, end-to-end tested product

## Features In Progress

- ⏳ Company-specific interview modes (Google, Amazon, Microsoft, etc.)
- ⏳ Interview difficulty levels
- ⏳ Resume analyzer with AI-powered parsing
- ⏳ Interview history page
- ⏳ Downloadable PDF scorecards
- ⏳ Analytics dashboard (score trends, strengths/weaknesses over time)
- ⏳ AI-generated personalized learning roadmap

## Architecture Highlights

Rather than a single function handling all AI calls, PrepForge uses an **orchestrator/agent pattern**:

```
interviewOrchestrator
        │
   ┌────┴────┐
questionAgent  scoringAgent
        │
    aiClient (Groq)
```

This keeps each agent focused on a single responsibility (asking questions vs. scoring transcripts), makes the system easier to extend (new agents can be added without touching existing ones), and mirrors patterns used in production AI systems.

The backend also implements a **Token Bucket rate limiter** built from scratch using Redis — each user has a token bucket that refills over time, allowing short bursts of activity while enforcing a sustainable average request rate. This protects both the app and the underlying AI provider from abuse.

## Project Structure

```
prepforge/
├── client/                        # React frontend (Vite + Tailwind)
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js   # Axios instance with auto JWT header injection
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state (login/logout/user)
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Interview.jsx      # Live Q&A interview flow
│       │   └── Scorecard.jsx      # Post-interview results display
│       └── App.jsx                # Route definitions
│
├── server/                        # Express backend
│   └── src/
│       ├── config/
│       │   ├── db.js              # MongoDB connection
│       │   └── redisClient.js     # Redis connection
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── interviewController.js
│       │   └── scorecardController.js
│       │
│       ├── middleware/
│       │   ├── auth.js            # JWT verification
│       │   └── rateLimiter.js     # Token Bucket rate limiter
│       │
│       ├── models/
│       │   ├── User.js
│       │   ├── Transcript.js
│       │   └── Scorecard.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── interviewRoutes.js
│       │   └── scorecardRoutes.js
│       │
│       ├── agents/
│       │   ├── questionAgent.js   # Generates contextual interview questions
│       │   └── scoringAgent.js    # Evaluates transcripts, produces scorecards
│       │
│       ├── orchestrator/
│       │   └── interviewOrchestrator.js  # Routes requests to the right agent
│       │
│       └── services/
│           └── aiClient.js        # Low-level Groq API wrapper with retry logic
│
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |

### Interview
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Start a new interview session |
| POST | `/api/interview/:id/answer` | Submit an answer, receive the next question |
| POST | `/api/interview/:id/end` | End the interview and trigger AI scoring |

### Scorecard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scorecard/:transcriptId` | Retrieve the scorecard for a completed interview |

*All routes except signup/login require a `Bearer <token>` in the Authorization header.*

## Local Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/prepforge.git

# Backend
cd prepforge/server
npm install
# Add a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_random_secret
# JWT_EXPIRES_IN=7d
# GROQ_API_KEY=your_groq_api_key
# REDIS_URL=your_redis_connection_string
npm run dev

# Frontend (in a new terminal)
cd ../client
npm install
npm run dev
```

## Roadmap

- [x] Backend: auth, AI interview engine, scoring system
- [x] Redis rate limiter with custom Token Bucket implementation
- [x] Orchestrator/agent architecture refactor
- [x] React frontend: auth, interview flow, scorecard display
- [x] Full deployment (Vercel + Render)
- [ ] Company-specific and difficulty-based interviews
- [ ] Resume analyzer
- [ ] Interview history and analytics dashboard
- [ ] Downloadable PDF reports
- [ ] AI-generated learning roadmap

---

*Built by Kushagra Sharma as a portfolio project for campus placement preparation.*