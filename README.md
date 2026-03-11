# CyberGuard AI 🛡️
## AI-Powered Cyberbullying Detection and Support Chatbot

> **Final Year Project (FYP) — 2026**  
> **Student:** Kenishaa A/P Mukesh | Management and Science University  
> Built with Next.js, FastAPI, SQLite, Supabase Auth, and HuggingFace NLP.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Guide](#setup-guide)
   - [Step 1: Clone / Download the Project](#step-1-clone--download-the-project)
   - [Step 2: Set Up the Backend (Python)](#step-2-set-up-the-backend-python)
   - [Step 3: Set Up the Frontend (Node.js)](#step-3-set-up-the-frontend-nodejs)
   - [Step 4: Run the Application](#step-4-run-the-application)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [API Endpoints](#api-endpoints)
7. [Technologies Used](#technologies-used)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

```
┌─────────────────────────┐
│   Frontend (Next.js)    │  ← http://localhost:3000
│   Supabase Auth (Login) │
└────────────┬────────────┘
             │ REST API calls
             ▼
┌─────────────────────────┐
│   Backend (FastAPI)     │  ← http://localhost:8000
│   AI Detection Engine   │
│   Chatbot Service       │
└────────────┬────────────┘
             │ SQLAlchemy ORM
             ▼
┌─────────────────────────┐
│   SQLite Database       │  ← backend/cyberguard.db
│   (auto-created)        │
└─────────────────────────┘
```

**Authentication** is handled by [Supabase](https://supabase.com) (already configured — no setup needed).

---

## Prerequisites

Make sure you have these installed **before** starting:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| **Python** | 3.10+ | [python.org](https://python.org) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Included with Node.js |
| **Git** (optional) | Any | [git-scm.com](https://git-scm.com) |

> ⚠️ **No PostgreSQL needed.** The database is SQLite and is created automatically on first run.

---

## Setup Guide

### Step 1: Clone / Download the Project

**Option A — Git:**
```bash
git clone <repo-url>
cd cyberbullying-ai-system
```

**Option B — ZIP Download:**  
Extract the ZIP file, then open a terminal in the `cyberbullying-ai-system` folder.

---

### Step 2: Set Up the Backend (Python)

Open a terminal in the **project root** (`cyberbullying-ai-system/`):

```bash
# 1. Create a Python virtual environment
python -m venv venv

# 2. Activate the virtual environment
#    Windows:
venv\Scripts\activate
#    Mac / Linux:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r backend/requirements.txt
```

> 💡 You will see `(venv)` at the start of your terminal prompt when the venv is active.

**The backend requires no `.env` file** — it uses SQLite out of the box.  
If you want to customise settings (optional), create `backend/.env`:

```env
# backend/.env (optional)
DETECTION_MODEL=martin-ha/toxic-comment-model
FRONTEND_URL=http://localhost:3000
```

---

### Step 3: Set Up the Frontend (Node.js)

Open a **second terminal** in the `frontend/` folder:

```bash
cd frontend

# Install Node dependencies
npm install
```

The frontend environment file is already included at `frontend/.env.local` with the Supabase credentials pre-configured. **No changes needed.**

---

### Step 4: Run the Application

You need **two terminals running simultaneously**:

**Terminal 1 — Backend** (from project root `cyberbullying-ai-system/`):
```bash
# Make sure your venv is activated first!
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux

python -m uvicorn backend.main:app --reload --port 8000
```
✅ Backend ready at: **http://localhost:8000**  
📖 API Docs (Swagger): **http://localhost:8000/docs**

---

**Terminal 2 — Frontend** (from `cyberbullying-ai-system/frontend/`):
```bash
npm run dev
```
✅ Frontend ready at: **http://localhost:3000**

---

> ⚠️ **Important:** Always start the **backend first**, then the frontend.  
> Both terminals must stay open while using the app.

---

## First-Time Use

1. Open **http://localhost:3000** in your browser
2. Click **Sign Up** to create an account
3. Confirm your email (check your inbox)
4. Log in and start using the chatbot

**Test accounts** (if already set up):
| Email | Password | Role |
|-------|----------|------|
| *(register your own)* | — | User |
| `admin@cyberguard.ai` | `admin123` | Admin |

---

## Project Structure

```
cyberbullying-ai-system/
│
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # App entry point
│   ├── config.py               # Settings & env loading
│   ├── requirements.txt        # Python dependencies  ← install these
│   ├── cyberguard.db           # SQLite database (auto-created on first run)
│   │
│   ├── database/
│   │   ├── connection.py       # SQLAlchemy engine + WAL mode
│   │   └── models.py           # ORM models (User, ChatLog, etc.)
│   │
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response schemas
│   │
│   ├── routes/
│   │   ├── chat.py             # POST /api/chat
│   │   ├── detection.py        # POST /api/detect
│   │   ├── analytics.py        # GET  /api/analytics
│   │   ├── logs.py             # GET  /api/logs
│   │   └── users.py            # POST /api/users/sync
│   │
│   └── services/
│       ├── detection_service.py  # Hybrid AI detection engine
│       └── chatbot_service.py    # Empathetic chatbot responses
│
├── frontend/                   # Next.js 14 frontend
│   ├── .env.local              # Supabase keys (pre-configured)
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── chat/page.tsx       # Chat & detection interface
│   │   ├── dashboard/page.tsx  # Personal analytics dashboard
│   │   └── admin/page.tsx      # Admin panel
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AuthGuard.tsx
│   │   ├── DetectionBadge.tsx
│   │   └── StatsCard.tsx
│   │
│   └── lib/
│       ├── api.ts              # Backend API client
│       └── supabase.ts         # Supabase auth client
│
└── ai_engine/
    ├── detection_model.py      # Standalone detection script
    └── chatbot_engine.py       # Standalone chatbot script
```

---

## Features

### 👤 User Features
- **AI Chat & Detection** — Submit messages and receive instant cyberbullying analysis
- **Detection Labels** — `SAFE` / `OFFENSIVE` / `CYBERBULLYING` with confidence scores
- **Chat History** — View all past conversations (like ChatGPT sidebar)
- **Personal Dashboard** — Charts showing your own message analytics
- **Support Responses** — Empathetic chatbot replies with actionable advice
- **Multilingual Detection** — English, Malay, Chinese, Tamil, Arabic and more

### 🛡️ Admin Features
- **Global Analytics** — System-wide detection statistics
- **User Management** — View all registered users and chat sessions
- **Detection Logs** — Browse and filter all flagged messages
- **Session Viewer** — View any user's full chat history

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/detect` | Analyze text for cyberbullying |
| `POST` | `/api/chat` | Chat with support bot |
| `GET` | `/api/analytics` | Dashboard analytics (optional `?user_id=N`) |
| `GET` | `/api/logs` | Paginated conversation logs |
| `POST` | `/api/users/sync` | Register/sync user from Supabase |
| `GET` | `/api/users/by-email` | Look up a user by email |
| `GET` | `/api/docs` | Swagger interactive API docs |

### Quick API Test

```bash
# Test detection
curl -X POST http://localhost:8000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "you are so stupid nobody likes you"}'

# Test chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "someone is bullying me online", "user_id": 1}'
```

---

## Technologies Used

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, TailwindCSS, shadcn/ui |
| **Charts** | Recharts |
| **Authentication** | Supabase Auth |
| **Backend** | Python 3.10+, FastAPI, Uvicorn |
| **Database** | SQLite (auto-managed via SQLAlchemy ORM) |
| **AI / NLP** | HuggingFace Transformers (DistilBERT), NLTK, scikit-learn |
| **AI Model** | `martin-ha/toxic-comment-model` (downloads on first use) |
| **Optional LLM** | OpenAI GPT (set `USE_OPENAI_CHATBOT=True` in `backend/.env`) |

---

## Troubleshooting

### ❌ `ModuleNotFoundError: No module named 'backend'`
You ran uvicorn from the wrong folder. Always run from the **project root**:
```bash
# ✅ Correct (from cyberbullying-ai-system/)
python -m uvicorn backend.main:app --reload --port 8000

# ❌ Wrong (from inside backend/)
uvicorn main:app --reload
```

### ❌ `npm error: Could not read package.json`
You ran npm from the wrong folder. Navigate to the `frontend` subfolder:
```bash
cd cyberbullying-ai-system/frontend
npm run dev
```

### ❌ Frontend shows "Cannot connect to backend"
- Make sure the Python backend is running on port 8000
- Check that `NEXT_PUBLIC_API_URL=http://localhost:8000` is in `frontend/.env.local`
- Try restarting the backend

### ❌ Dashboard shows blank / keeps loading
- Make sure **only one** backend terminal is running (multiple instances cause SQLite locking)
- Restart the backend with a fresh terminal
- Log out and log back in to refresh your session

### ❌ AI model download slow on first run
The HuggingFace model (`martin-ha/toxic-comment-model`) downloads ~250MB on first use. After that, it's cached locally and starts instantly.  
If you don't want this, the system still works using the built-in keyword detection engine (no download needed).

### ❌ `pip install` fails
Make sure your virtual environment is activated before installing:
```bash
venv\Scripts\activate    # Windows
source venv/bin/activate # Mac/Linux
pip install -r backend/requirements.txt
```

---

## Academic Information

| Field | Details |
|-------|---------|
| **Project Title** | AI-Powered Cyberbullying Detection and Support Chatbot for Social Media Users |
| **Student** | Kenishaa A/P Mukesh (012024020151) |
| **Institution** | Management and Science University |
| **Programme** | Bachelor in Computer Science |
| **Year** | 2026 |

---

*Built with ❤️ for the safety of social media users. CyberGuard AI — protecting everyone online.*
