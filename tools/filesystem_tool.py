import os
import logging
from typing import Dict, Any
from core.security.permission_manager import PermissionManager

logger = logging.getLogger(__name__)

class FileSystemTool:
    def __init__(self, permission_manager: PermissionManager):
        self.permission_manager = permission_manager

    @property
    def schema(self) -> Dict[str, Any]:
        return {
            "name": "filesystem",
            "description": "Read, write, or list files and directories.",
            "parameters": {
                "action": "One of: 'read', 'write', 'list'",
                "path": "The absolute or relative path to the file/directory",
                "content": "The content to write (only required for 'write' action)"
            }
        }

    async def execute(self, params: Dict[str, Any]) -> str:
        action = params.get("action")
        path = params.get("path")
        
        if not action or not path:
            return "Error: Both 'action' and 'path' are required."
            
        try:
            if action == "read":
                if not os.path.exists(path):
                    return f"Error: File not found at {path}"
                with open(path, "r", encoding="utf-8") as f:
                    return f.read()
                    
            elif action == "write":
                if not self.permission_manager.is_file_write_allowed(path):
                    return f"Error: Write to {path} blocked by permissions."
                content = params.get("content", "")
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
                
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                return f"Successfully wrote to {path}"
                
            elif action == "list":
                if not os.path.exists(path):
                    return f"Error: Directory not found at {path}"
                files = os.listdir(path)
                return f"Contents of {path}:\n" + "\n".join(files)
                
            else:
                return f"Error: Unknown action '{action}'"
                
        except Exception as e:
            return f"Error executing filesystem operation: {str(e)}"
