# 🚀 ARVUS Startup & Operations Guide

This guide covers standard operational procedures to run ARVUS, monitor system metrics, and enable autonomous browser-driven research.

---

## 📦 Prerequisites checklist

1.  **Ollama**: Ensure Ollama is running locally.
    -   Recommended model pull: `ollama pull qwen2.5:latest` (or `qwen3.5`).
    -   Verify: Visit `http://localhost:11434` in your browser.
2.  **Node.js**: Installed (for React Frontend dependencies).
3.  **Python 3.10+**: Setup in the project virtual environment.

---

## 🔧 Initial Setup (One-time)
Run these inside the project root `C:\Users\LENOVO\Desktop\arvus` if not already complete.

```powershell
# 1. Python Environment setup
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\playwright.exe install chromium

# 2. Frontend Node install
cd frontend
npm install
```

---

## 🚦 Running the Engine (Daily Usage)

To get ARVUS completely online, spin up the Backend first, then the Frontend.

### Step 1: Start the Python Backend
Open a new shell window:
```powershell
cd C:\Users\LENOVO\Desktop\arvus\backend
..\venv\Scripts\uvicorn.exe main:app --reload --port 8000
```
*Backend provides WebSocket brain logic, tool registry, and Prometheus metrics.*

### Step 2: Start the React Frontend
Open a second shell window:
```powershell
cd C:\Users\LENOVO\Desktop\arvus\frontend
npm run dev
```
*Click the link emitted by the CLI (usually `http://localhost:5173`) to access the UI dashboard.*

---

## 🛰️ Tools & Capabilities Breakdown

### 🕵️ Web Browser Tool (Playwright)
ARVUS now natively searches and scrapes with actual headful/headless chrome access.
- **Usage**: Tell ARVUS "Search the latest AI news" or "Navigate to google.com and tell me the page title".
- **Auto-Recovery**: If missing libraries are ever reported, rerun `.\venv\Scripts\playwright install chromium`.

### 🧠 Semantic Local Memory (ChromaDB)
- Automatically remembers past prompt intent without leaving your system.
- Custom integration prevents internet communication for security. Vectorizes data via local Ollama instance.

### 🐚 OS Terminal Executor
- Can inspect directory trees, start node scripts, and install software directly through the chat prompt. Note: Be explicit with paths.

---
