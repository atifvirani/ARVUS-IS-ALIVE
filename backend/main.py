import os
import sys
import json
import time
import uvicorn
import logging
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# MANDATORY WINDOWS ASYNCIO OVERRIDE FOR PLAYWRIGHT
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# Ensure we can import from the root project directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.orchestration.agent_loop import AgentLoop
from core.security.permission_manager import PermissionManager, PermissionLevel
from tools.terminal_tool import TerminalTool
from tools.filesystem_tool import FileSystemTool
from tools.browser_tool import BrowserTool
from tools.system_control_tool import SystemControlTool
from memory.sqlite_manager import SQLiteManager
from memory.chroma_manager import ChromaManager
from core.reasoning.context_builder import ContextBuilder
from prometheus_fastapi_instrumentator import Instrumentator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Track server start time for uptime calculation
SERVER_START_TIME = time.time()

app = FastAPI(title="ARVUS Backend", version="0.2.0")

# Auto-instrument Prometheus metrics
Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize global memory persistence
sqlite_mgr = SQLiteManager()
chroma_mgr = ChromaManager()
ctx_builder = ContextBuilder(sqlite_mgr, chroma_mgr)

# Initialize global core systems
permission_manager = PermissionManager(PermissionLevel.HIGH)  # Set to HIGH for easy demonstration initially
agent = AgentLoop(ollama_url="http://localhost:11434", context_builder=ctx_builder)

# Initialize Tools
terminal_tool = TerminalTool(permission_manager)
fs_tool = FileSystemTool(permission_manager)
browser_tool = BrowserTool()
sys_tool = SystemControlTool(permission_manager)

# Register Tools with Agent Loop
agent.register_tool(
    name=terminal_tool.schema["name"],
    description=terminal_tool.schema["description"],
    parameters=terminal_tool.schema["parameters"],
    handler=terminal_tool.execute
)

agent.register_tool(
    name=fs_tool.schema["name"],
    description=fs_tool.schema["description"],
    parameters=fs_tool.schema["parameters"],
    handler=fs_tool.execute
)

agent.register_tool(
    name=browser_tool.schema["name"],
    description=browser_tool.schema["description"],
    parameters=browser_tool.schema["parameters"],
    handler=browser_tool.execute
)

agent.register_tool(
    name=sys_tool.schema["name"],
    description=sys_tool.schema["description"],
    parameters=sys_tool.schema["parameters"],
    handler=sys_tool.execute
)

logger.info("ARVUS Core Initialized. Tools Registered: terminal, filesystem, browser, system_control.")

@app.get("/")
async def root():
    return {"status": "running", "agent": "ARVUS", "version": "0.2.0"}

# ── System Status API ──

@app.get("/api/status")
async def get_system_status():
    """Returns system vitals and service connection statuses."""
    status = {
        "cpu": 0,
        "ram": 0,
        "disk": 0,
        "uptime": "0:00:00",
        "ollamaStatus": "unknown",
        "ollamaModel": "",
        "dbStatus": "unknown",
        "browserStatus": "unknown",
    }
    
    # System vitals via psutil (optional)
    try:
        import psutil
        status["cpu"] = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        status["ram"] = mem.percent
        disk = psutil.disk_usage('/')
        status["disk"] = round(disk.percent, 1)
    except ImportError:
        # psutil not installed — provide zero values
        pass
    except Exception as e:
        logger.warning(f"Failed to get system vitals: {e}")

    # Uptime
    elapsed = int(time.time() - SERVER_START_TIME)
    hours, remainder = divmod(elapsed, 3600)
    minutes, seconds = divmod(remainder, 60)
    status["uptime"] = f"{hours}:{minutes:02d}:{seconds:02d}"

    # Ollama status check
    try:
        import httpx
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            if resp.status_code == 200:
                status["ollamaStatus"] = "online"
                models = resp.json().get("models", [])
                if models:
                    status["ollamaModel"] = models[0].get("name", "unknown")
    except Exception:
        status["ollamaStatus"] = "offline"

    # DB status
    try:
        # If SQLite manager exists and works, DB is online
        sqlite_mgr.get_history("health_check", limit=1)
        status["dbStatus"] = "online"
    except Exception:
        status["dbStatus"] = "offline"

    # Browser status
    from tools.browser_tool import PLAYWRIGHT_AVAILABLE
    status["browserStatus"] = "available" if PLAYWRIGHT_AVAILABLE else "unavailable"

    return JSONResponse(content=status)


@app.get("/api/memory/stats")
async def get_memory_stats():
    """Returns memory statistics."""
    stats = {
        "totalConversations": 0,
        "semanticMemories": 0,
    }
    
    try:
        import sqlite3
        with sqlite3.connect(sqlite_mgr.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM conversation_history")
            stats["totalConversations"] = cursor.fetchone()[0]
    except Exception:
        pass

    try:
        stats["semanticMemories"] = chroma_mgr.collection.count()
    except Exception:
        pass

    return JSONResponse(content=stats)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_message(self, websocket: WebSocket, message: dict):
        await websocket.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            user_message = payload.get("content", "")
            
            if not user_message:
                continue
                
            logger.info(f"Running Agent for input: {user_message}")
            
            # Execute the core Agent step!
            response = await agent.run_step(user_message)
            
            # Send back result
            await manager.send_message(websocket, {
                "type": "response", 
                "role": "assistant",
                "content": response
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        manager.disconnect(websocket)

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup browser resources on shutdown."""
    await browser_tool.cleanup()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
