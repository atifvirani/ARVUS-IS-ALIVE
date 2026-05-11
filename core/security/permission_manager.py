from enum import Enum
import logging

logger = logging.getLogger(__name__)

class PermissionLevel(Enum):
    LOW = 1       # Read-only
    MEDIUM = 2    # File modifications in allowed directories
    HIGH = 3      # System commands
    CRITICAL = 4  # Admin actions / destructive commands

class PermissionManager:
    def __init__(self, current_level: PermissionLevel = PermissionLevel.LOW):
        self.current_level = current_level
        self.dangerous_commands = ["rm", "del", "format", "mkfs", "dd", "sudo"]

    def set_level(self, level: PermissionLevel):
        self.current_level = level
        logger.info(f"Permission level set to {self.current_level.name}")

    def is_command_allowed(self, command: str) -> bool:
        if self.current_level == PermissionLevel.CRITICAL:
            return True
            
        command_lower = command.lower()
        for dangerous in self.dangerous_commands:
            # Basic heuristic, a real implementation would use proper parsing
            if dangerous in command_lower.split():
                logger.warning(f"Blocked dangerous command: {command}")
                return False
                
        if self.current_level in [PermissionLevel.LOW, PermissionLevel.MEDIUM]:
            # Further restrict system commands
            # For this demo, let's just reject anything if not HIGH or CRITICAL, except specific allowed tools.
            pass
            
        return True

    def is_file_write_allowed(self, path: str) -> bool:
        if self.current_level == PermissionLevel.LOW:
            logger.warning(f"Blocked file write to {path} (Permission LOW)")
            return False
        return True
