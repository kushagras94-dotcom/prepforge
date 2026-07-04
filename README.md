# PrepForge 🎯

An AI-powered mock interview platform that conducts realistic, multi-turn technical interviews and generates detailed performance scorecards — built to help candidates prepare for real campus placements and technical interviews.

## Overview

PrepForge simulates a real interviewer: it asks an opening question based on your target role, listens to your answer, and dynamically generates a relevant follow-up — just like a human interviewer would. Once the interview ends, it evaluates the full transcript across four performance dimensions and returns structured, actionable feedback.

## Tech Stack

- **Frontend:** React (Vite) — *in progress*
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** JWT (JSON Web Tokens) + bcrypt for password hashing
- **AI Engine:** Google Gemini API (`gemini-2.5-flash`)
- **Deployment (planned):** Vercel (frontend) + Render (backend)

## Features Implemented So Far

- ✅ User authentication (signup/login) with hashed passwords and JWT-based sessions
- ✅ Multi-turn AI interview engine — the AI reads the full conversation history and generates contextual follow-up questions based on the candidate's previous answers
- ✅ Three-collection MongoDB schema separating users, interview transcripts, and scorecards for independent, efficient querying
- ✅ Post-interview AI scoring system evaluating transcripts across four dimensions:
  - Communication
  - Technical Accuracy
  - Problem Solving
  - Confidence
- ✅ Structured feedback generation — strengths, areas to improve, and an overall summary per interview

## Features In Progress

- ⏳ React frontend (interview UI, dashboard, scorecard visualization)
- ⏳ Voice-based interview mode (Web Speech API) with text fallback
- ⏳ Deployment to Vercel + Render

## Project Structure

```
prepforge/
├── client/                        # React frontend (Vite) — scaffolded, in progress
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection setup
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js        # Signup / login logic
│   │   │   ├── interviewController.js   # Start / answer / end interview
│   │   │   └── scorecardController.js   # Fetch scorecards
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification middleware
│   │   │
│   │   ├── models/
│   │   │   ├── User.js            # User profile schema
│   │   │   ├── Transcript.js      # Interview conversation schema
│   │   │   └── Scorecard.js       # AI-generated evaluation schema
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   └── scorecardRoutes.js
│   │   │
│   │   └── services/
│   │       └── aiService.js       # All Gemini API calls (questions + scoring)
│   │
│   ├── .env                       # Environment variables (not committed)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                  # App entry point
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
cd prepforge/server

# Install dependencies
npm install

# Add a .env file with:
# PORT=5000
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_random_secret
# JWT_EXPIRES_IN=7d
# GEMINI_API_KEY=your_gemini_api_key

# Run the server
npm run dev
```

## Roadmap

- [ ] Build React frontend (auth pages, interview interface, dashboard)
- [ ] Integrate voice input/output
- [ ] Deploy backend to Render, frontend to Vercel
- [ ] Add demo GIF/video to this README

---

*Built by Kushagra Sharma as a portfolio project.*