import json
from typing import List, Dict, Any

class PromptBuilder:
    def __init__(self):
        self.base_system_prompt = """You are ARVUS, a Personal Local AI Operating System.
Your main purpose is to assist the user by reasoning, using tools, executing code, and automating workflows.
You must think step-by-step and provide clear, structured responses.

Available Tools:
{tools_schema}

When you need to use a tool, output a JSON block wrapped in ```json with the following structure:
{{
    "tool": "<tool_name>",
    "parameters": {{
        "param1": "value1",
        "param2": "value2"
    }}
}}

If you do not need to use a tool, respond normally with text.
"""
        self.available_tools = []

    def register_tool(self, name: str, description: str, parameters: Dict[str, Any]):
        self.available_tools.append({
            "name": name,
            "description": description,
            "parameters": parameters
        })

    def build_system_prompt(self) -> str:
        tools_schema = json.dumps(self.available_tools, indent=2)
        return self.base_system_prompt.format(tools_schema=tools_schema)

    def format_messages(self, system_prompt: str, context: List[Dict[str, str]], current_input: str) -> List[Dict[str, str]]:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(context)
        messages.append({"role": "user", "content": current_input})
        return messages
