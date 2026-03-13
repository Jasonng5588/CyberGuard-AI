# CyberGuard AI — Cyberbullying Detection & Support Chatbot

AI-powered cyberbullying detection and empathetic support chatbot for Gen Z. Supports real-time detection, multilingual chat (English/Chinese/Malay), and full analytics dashboard.

---

## 📦 Local Setup Guide (from ZIP)

### ✅ System Requirements

Install the following **before** starting:

| Tool | Minimum Version | Download |
|------|-----------------|----------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18 LTS+ | https://nodejs.org/ |
| Ollama | Latest | https://ollama.com/download |

> ⚠️ **IMPORTANT:** During Python installation, check **"Add python.exe to PATH"** before clicking Install.

---

## Step 1 — Extract the ZIP

1. Right-click `cyberbullying-ai-system.zip` → **Extract All...**
2. Choose a destination (e.g. Desktop) → click **Extract**
3. Open the extracted folder `cyberbullying-ai-system`

> ⚠️ Do NOT run files from inside the ZIP — extract first.

---

## Step 2 — Download the AI Model (Ollama)

This app uses **Ollama** to run the AI chatbot locally (100% offline, no API key needed).

Open **Command Prompt** (search "cmd" in Start Menu) and run:

```
ollama run phi3:mini
```

Wait for the model to download (5–15 minutes). When you see `>>>`, press **Ctrl+C** to exit.

> ✅ You only need to do this once. Ollama runs automatically in the background after this.

---

## Step 3 — Start the Backend (FastAPI)

1. In the `cyberbullying-ai-system` folder, **double-click `start_backend.bat`**
2. A terminal window opens and installs all Python dependencies automatically
3. **First run takes 3–5 minutes**
4. Wait for this message:
   ```
   INFO:     Application startup complete.
   ```
5. ✅ **Leave this window open** — it must stay running

Backend API is now running at: `http://localhost:8000`

---

## Step 4 — Start the Frontend (Next.js)

1. In the same folder, **double-click `start_frontend.bat`**
2. A second terminal opens and installs all Node.js packages
3. **First run takes 2–4 minutes**
4. Wait for:
   ```
   ✓ Ready in Xms
   ```
5. ✅ **Leave this window open** — it must stay running

Frontend is now running at: `http://localhost:3000`

---

## Step 5 — Open the App

Go to **Google Chrome** (recommended) and open:

```
http://localhost:3000
```

### Pages

| Page | URL |
|------|-----|
| Home | `http://localhost:3000` |
| AI Chat | `http://localhost:3000/chat` |
| Learn | `http://localhost:3000/learn` |
| Support Hub | `http://localhost:3000/support` |
| Dashboard | `http://localhost:3000/dashboard` |
| Admin Panel | `http://localhost:3000/admin` |

---

## Step 6 — Create an Account

1. Click **Sign Up** on the homepage
2. Register with an email and password
3. You're in! Your chat history is saved and will be restored every time you log in.

---

## 🤖 How the AI Works

The app has two AI services running locally:

| Service | What It Does | Engine |
|---------|-------------|--------|
| Detection | Classifies messages as SAFE / OFFENSIVE / CYBERBULLYING | Keyword model + Ollama phi3:mini |
| Chatbot | Generates empathetic support responses | Ollama phi3:mini |

- **Ollama** is the primary engine for localhost. It uses your local machine's CPU/GPU — no internet needed.
- **Language matching:** The chatbot automatically replies in the same language the user types in (English, Chinese, Malay, etc.)
- **Chat history** is stored in a local SQLite database and fully restored on every login.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| `python is not recognized` | Reinstall Python and tick **"Add python.exe to PATH"** |
| `npm is not recognized` | Reinstall Node.js and restart your computer |
| "Cannot connect to backend" | Make sure `start_backend.bat` is running and shows `Application startup complete` |
| AI chat never replies / spins forever | Make sure you ran `ollama run phi3:mini` in Step 2 |
| Chat history missing after login | Ensure backend is running so `syncUser` can look up your account |
| Backend window closes instantly | Your Python is too old — install Python 3.10+ |
| Port 3000 or 8000 already in use | Restart your computer or close any other local servers |

---

## 📁 Project Structure

```
cyberbullying-ai-system/
├── backend/                   # FastAPI Python backend
│   ├── main.py                # App entry point
│   ├── config.py              # Environment config
│   ├── routes/                # REST API endpoints (chat, detect, users, etc.)
│   ├── services/              # AI detection + chatbot engine
│   │   ├── detection_service.py  # Cyberbullying classifier
│   │   └── chatbot_service.py    # Empathetic response generator
│   ├── database/              # SQLAlchemy models & SQLite connection
│   └── requirements.txt       # Python dependencies
├── frontend/                  # Next.js 14 React frontend
│   ├── app/                   # Pages (chat, dashboard, admin, learn, support)
│   ├── components/            # Reusable UI components (AuthGuard, Navbar, etc.)
│   └── lib/                   # API client & Supabase helpers
├── start_backend.bat          # One-click backend launcher (Windows)
└── start_frontend.bat         # One-click frontend launcher (Windows)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Vanilla CSS |
| Backend | Python 3.11, FastAPI, Uvicorn |
| Database | SQLite (local), SQLAlchemy ORM |
| AI Engine | Ollama (phi3:mini), NLTK, scikit-learn |
| Auth | Supabase (email/password) |
| Local Inference | Ollama — runs 100% offline |
