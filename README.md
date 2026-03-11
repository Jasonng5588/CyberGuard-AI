# CyberGuard AI — Cyberbullying Detection & Support Chatbot

AI-powered cyberbullying detection and empathetic chatbot designed to support Gen Z victims on social media.

---

## 📦 Getting Started (Local Setup from ZIP)

### System Requirements

Before you begin, install the following on your computer:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10 or newer | https://www.python.org/downloads/ |
| Node.js | 18 LTS or newer | https://nodejs.org/ |
| Ollama | Latest | https://ollama.com/download |

> ⚠️ **During Python installation**, make sure to check **"Add python.exe to PATH"** at the bottom of the installer window before clicking Install.

---

## Step 1 — Extract the ZIP File

1. Right-click `cyberbullying-ai-system.zip`
2. Click **Extract All...**
3. Choose a destination (e.g., your Desktop) and click **Extract**
4. Open the newly extracted folder: `cyberbullying-ai-system`

> ⚠️ Do NOT run files while they are still inside the ZIP archive.

---

## Step 2 — Download the AI Model

Open a **Command Prompt** on your computer (search "cmd" in the Start Menu) and run:

```
ollama run phi3:mini
```

Wait for the model to finish downloading (may take 5–15 minutes depending on your internet speed). When you see `>>>`, press `Ctrl+C` to exit. You only need to do this once.

---

## Step 3 — Start the Backend (FastAPI)

1. Inside the `cyberbullying-ai-system` folder, find **`start_backend.bat`**
2. Double-click it
3. A black terminal window opens and begins installing all Python libraries automatically
4. **First-time setup may take 3–5 minutes**
5. Wait until you see:
   ```
   Application startup complete.
   ```
6. ✅ **Keep this window open and running in the background**

The backend API will now be running at `http://localhost:8000`

---

## Step 4 — Start the Frontend (Next.js)

1. Inside the same `cyberbullying-ai-system` folder, find **`start_frontend.bat`**
2. Double-click it
3. A second black terminal window opens and begins installing all Node.js packages
4. **First-time setup may take 2–4 minutes**
5. Wait until you see:
   ```
   ✓ Ready in Xms
   ```
6. ✅ **Keep this window open and running in the background**

The website will now be running at `http://localhost:3000`

---

## Step 5 — Open the Application

Open **Google Chrome** (or any modern browser) and navigate to:

```
http://localhost:3000
```

### Available Pages

| Page | URL |
|------|-----|
| Home / Landing Page | `http://localhost:3000` |
| AI Chat Interface | `http://localhost:3000/chat` |
| Analytics Dashboard | `http://localhost:3000/dashboard` |
| Super Admin Panel | `http://localhost:3000/admin` |

---

## Step 6 — Create an Account

1. On the homepage, click **"Get Started"** or **"Sign Up"**
2. Register with your email and a password
3. You will be redirected to the Chat page where you can test the AI detection

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `python is not recognized` | Reinstall Python and tick **"Add python.exe to PATH"** |
| `npm is not recognized` | Reinstall Node.js and restart your computer |
| Website shows **"Cannot connect to backend"** | Make sure `start_backend.bat` is open and shows `Application startup complete` |
| AI response never loads / spins forever | You skipped **Step 2**. Open Command Prompt and run `ollama run phi3:mini` |
| Backend window closes immediately | Your Python version is too old. Download Python 3.10+ |
| Port 3000 or 8000 already in use | Close other programmes using those ports, or restart your computer |

---

## Project Structure

```
cyberbullying-ai-system/
├── backend/               # FastAPI Python backend
│   ├── main.py            # App entry point
│   ├── routes/            # API endpoints
│   ├── services/          # AI detection + chatbot logic
│   ├── database/          # SQLAlchemy models & connection
│   └── requirements.txt   # Python dependencies
├── frontend/              # Next.js React frontend
│   ├── app/               # Pages (chat, dashboard, admin, etc.)
│   ├── components/        # Reusable UI components
│   └── lib/               # API client & Supabase helpers
├── start_backend.bat      # One-click backend launcher
└── start_frontend.bat     # One-click frontend launcher
```

---

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Vanilla CSS
- **Backend:** Python 3.11, FastAPI, Uvicorn
- **Database:** SQLite (local), SQLAlchemy ORM
- **AI Engine:** Ollama (phi3:mini), NLTK, Scikit-learn
- **Auth:** Supabase
