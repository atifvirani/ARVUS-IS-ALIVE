import os
import subprocess
import logging
import platform
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SystemControlTool:
    """
    Tool to interact with the operating system directly, 
    enabling launching of native applications like Calculator, Notepad, VS Code, etc.
    """

    def __init__(self, permission_manager=None):
        self.permission_manager = permission_manager

    @property
    def schema(self) -> Dict[str, Any]:
        return {
            "name": "system_control",
            "description": "Control the local operating system. Launch native applications like Calculator, Notepad, Visual Studio Code, terminal windows, or open specific directories in Explorer.",
            "parameters": {
                "action": "Must be 'launch_app' or 'open_path'",
                "target": "The application name to launch (e.g., 'calc', 'notepad', 'code') or the folder path to open."
            }
        }

    async def execute(self, params: Dict[str, Any]) -> str:
        action = params.get("action", "")
        target = params.get("target", "")

        if not action or not target:
            return "Error: 'action' and 'target' parameters are required."

        try:
            if action == "launch_app":
                return await self._launch_app(target)
            elif action == "open_path":
                return await self._open_path(target)
            else:
                return f"Error: Unsupported action '{action}'."
        except Exception as e:
            logger.error(f"SystemControl error: {e}", exc_info=True)
            return f"Execution error: {str(e)}"

    async def _launch_app(self, app_name: str) -> str:
        app_name = app_name.lower().strip()
        
        # Common map for human names to Windows executables
        command_map = {
            "calculator": "calc.exe",
            "calc": "calc.exe",
            "notepad": "notepad.exe",
            "vs code": "code",
            "vscode": "code",
            "code": "code",
            "chrome": "chrome",
            "edge": "msedge",
            "taskmgr": "taskmgr",
            "task manager": "taskmgr",
            "explorer": "explorer",
            "powershell": "powershell",
            "cmd": "cmd"
        }

        cmd_to_run = command_map.get(app_name, app_name)
        
        try:
            # Use Popen to decouple the child process so it remains open even if backend shuts down
            if platform.system() == "Windows":
                # Use shell=True and start keyword to prevent blocking
                subprocess.Popen(f"start {cmd_to_run}", shell=True)
            else:
                # Mac/Linux fallback
                opener = "open" if platform.system() == "Darwin" else "xdg-open"
                subprocess.Popen([opener, cmd_to_run])
            
            return f"Successfully triggered activation signal for '{app_name}' native process."
        except Exception as e:
            return f"Failed to launch application '{app_name}'. Error: {str(e)}"

    async def _open_path(self, path: str) -> str:
        normalized_path = os.path.abspath(path)
        
        if not os.path.exists(normalized_path):
            return f"Error: The path '{normalized_path}' does not exist."
            
        try:
            if platform.system() == "Windows":
                os.startfile(normalized_path)
            elif platform.system() == "Darwin":
                subprocess.Popen(["open", normalized_path])
            else:
                subprocess.Popen(["xdg-open", normalized_path])
                
            return f"Successfully opened the visual directory frame for path: {normalized_path}"
        except Exception as e:
            return f"Failed to open path visually. Error: {str(e)}"
