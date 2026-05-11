import subprocess
import logging
from typing import Dict, Any
from core.security.permission_manager import PermissionManager, PermissionLevel

logger = logging.getLogger(__name__)

class TerminalTool:
    def __init__(self, permission_manager: PermissionManager):
        self.permission_manager = permission_manager
        
    @property
    def schema(self) -> Dict[str, Any]:
        return {
            "name": "terminal",
            "description": "Execute shell commands on the local machine.",
            "parameters": {
                "command": "The exact shell command to run."
            }
        }

    async def execute(self, params: Dict[str, Any]) -> str:
        command = params.get("command", "")
        if not command:
            return "Error: No command provided."
            
        if not self.permission_manager.is_command_allowed(command):
            return f"Error: Command '{command}' blocked by PermissionManager."
            
        try:
            logger.info(f"Executing command: {command}")
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True, 
                timeout=60
            )
            
            output = result.stdout
            if result.stderr:
                output += f"\nSTDERR: {result.stderr}"
                
            return output if output else "Command executed successfully with no output."
        except subprocess.TimeoutExpired:
            return "Error: Command timed out after 60 seconds."
        except Exception as e:
            return f"Error executing command: {str(e)}"
