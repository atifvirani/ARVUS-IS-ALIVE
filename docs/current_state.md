# ARVUS Current State Documentation
*Status Update: May 11, 2026*

This document serves as the current official record of implemented systems, technologies, and the current runtime workflow of **ARVUS (Personal Local AI Operating System)**.

---

## 🚀 System Status: ACTIVE FOUNDATION
The foundational agentic core is fully implemented, wired to the local LLM brain, verified securely executing system tools, managing long-term memory storage, and driving a live, modern React interface.

### 🛠️ Completed Architecture Components

#### 1. Core Orchestration Layer (`core/`)
- **Agent Loop Orchestrator (`agent_loop.py`):** The central reasoning engine driving the logic cycles: *Receive Input ➔ Fetch Context ➔ Query LLM ➔ Parse Tool JSON ➔ Execute Action ➔ Combine Observations ➔ Reflect.*
- **Prompt Builder (`prompt_builder.py`):** Dynamically formats advanced system prompt directives and renders active tool JSON schemas to strictly guide LLM output.
- **Local LLM Client (`ollama_client.py`):** Native high-performance HTTPX wrapper interacting with the local Ollama instance, defaulting intelligently to the user's detected `qwen3.5:latest` model.

#### 2. Persistent Memory Systems (`memory/`)
- **Semantic Long-Term Memory (`chroma_manager.py`):** Full integration with `ChromaDB` vector storage. Automatically slices conversational concepts and indexes memories for future relevance-search embeddings.
- **Short-Term Transactional History (`sqlite_manager.py`):** Maintains precise timestamped sequential logs of every prompt/response pair using embedded `SQLite`.
- **Intelligent Context Fabric (`context_builder.py`):** On every query, dynamically weaves conversational history together with related semantic concepts from long-term storage and injects them into the LLM's active awareness context window.

#### 3. Security & Tools Core (`tools/` & `security/`)
- **Sandboxed Permission Arbiter (`permission_manager.py`):** Implements rigorous restriction tiers (`LOW` to `CRITICAL`). Actively blocks destructive commands like `rm` or unauthorized deletion heuristics without elevated configuration.
- **Terminal Tool (`terminal_tool.py`):** Safely binds native `subprocess` shells to LLM execution, piping system input/output into AI awareness logs.
- **File System Tool (`filesystem_tool.py`):** Grants strict controlled I/O permissions allowing ARVUS to browse directories, manipulate documents, and build persistent software files on your OS.

#### 4. Server Runtime (`backend/`)
- **FastAPI Host Server (`main.py`):** Secure async worker layer exposing real-time WebSockets allowing low-latency streaming duplex pipelines with local Uvicorn loopback.

#### 5. User Interaction Layer (`frontend/`)
- **Modern React SPA:** Hand-built modern dashboard utilizing `Vite`, `React 19`, and `Zustand` patterns.
- **Tailwind v4 UI:** Rich dark-mode aesthetics with custom cyber-themed glassmorphism accents.
- **Transparent Observation Terminals:** Live dynamic inline parser splitting standard AI conversational text from raw system/tool observations, rendering tool executions inside vivid monospace terminal blocks.

---

## 📂 Implemented Project Structure
```text
arvus/
├── backend/
│   └── main.py              # FastAPI Entrypoint & Initialization
├── core/
│   ├── llm/
│   │   ├── ollama_client.py # Local LLM REST wrapper
│   │   └── prompt_builder.py# Context & Schema compiler
│   ├── orchestration/
│   │   └── agent_loop.py    # Central logical brain cycle
│   ├── reasoning/
│   │   └── context_builder.py# Injects DB memories into context
│   └── security/
│       └── permission_manager.py # Sandboxing & Security Guard
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main Chat Dashboard & Socket Client
│   │   └── index.css        # Tailwind v4 Stylesheets
│   ├── postcss.config.js    # Tailwind v4 Build Config
│   └── package.json         # Node Environment
├── memory/
│   ├── chroma_manager.py    # Vector Storage Driver
│   └── sqlite_manager.py    # History DB Driver
└── tools/
    ├── terminal_tool.py     # Native shell tool binding
    └── filesystem_tool.py   # Native OS storage tool binding
```

---

## ⚙️ Current Technology Matrix
| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Local LLM** | Ollama (`qwen3.5:latest`) | The core local reasoning engine. |
| **Backend Framework** | FastAPI & Uvicorn | High-speed concurrent web API execution. |
| **Vector DB** | ChromaDB | Handles persistent semantic memory retrieval. |
| **Relational DB** | SQLite | Handles chronological conversational backups. |
| **Frontend Engine** | React (Vite + ES6+) | Drives the user experience. |
| **Styling Layer** | Tailwind CSS v4 | Rapid rich aesthetic composition. |
| **Security Layer** | Custom Python Sandboxing | Blocks `rm/del` style destructive heuristics. |

---

## 🔮 Upcoming Roadmap Objectives
1. **Phase 5: Voice Synthesis & Recognition** (Offline Faster-Whisper and Coqui TTS implementation).
2. **Phase 6: Autonomous Web Intelligence** (Integration with headless Playwright browser driving).
3. **Multi-Agent Handlers:** Sub-agents specializing strictly in code-debug loops vs basic assistance.
