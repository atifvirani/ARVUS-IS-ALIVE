import json
import logging
from typing import List, Dict, Any, Callable
from core.llm.ollama_client import OllamaClient
from core.llm.prompt_builder import PromptBuilder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentLoop:
    def __init__(self, ollama_url: str = "http://localhost:11434", context_builder: Any = None):
        self.llm_client = OllamaClient(base_url=ollama_url)
        self.prompt_builder = PromptBuilder()
        self.tool_registry: Dict[str, Callable] = {}
        self.context_builder = context_builder
        self.short_term_memory: List[Dict[str, str]] = []  # Transient turn memory

    def register_tool(self, name: str, description: str, parameters: Dict[str, Any], handler: Callable):
        self.prompt_builder.register_tool(name, description, parameters)
        self.tool_registry[name] = handler
        logger.info(f"Registered tool: {name}")

    async def run_step(self, user_input: str, session_id: str = "default") -> str:
        logger.info(f"Received input: {user_input}")
        
        # 1. Retrieve full context dynamically if context builder exists
        history = []
        if self.context_builder:
            history = self.context_builder.build_context(session_id, user_input)
        else:
            history = self.short_term_memory # fallback
            
        system_prompt = self.prompt_builder.build_system_prompt()
        messages = self.prompt_builder.format_messages(system_prompt, history, user_input)
        
        # Step 1 & 2: Understand & Plan (handled by LLM response)
        logger.info("Calling LLM...")
        try:
            response = await self.llm_client.chat(messages=messages)
            llm_reply = response.get("message", {}).get("content", "")
            
            # Step 3 & 4: Tool Selection & Execution
            tool_calls = self._parse_tool_calls(llm_reply)
            if tool_calls:
                for call in tool_calls:
                    tool_name = call.get("tool")
                    if tool_name in self.tool_registry:
                        logger.info(f"Executing tool: {tool_name}")
                        try:
                            # Execute tool
                            params = call.get("parameters", {})
                            result = await self.tool_registry[tool_name](params)
                            # Append tool execution to context builder temporarily for future follow-ups (optional)
                            llm_reply += f"\n\n[Observation: {result}]"
                        except Exception as e:
                            logger.error(f"Error executing tool {tool_name}: {e}")
                    else:
                        logger.warning(f"Tool {tool_name} not registered.")
                        
            # 2. Save to persistent memory backends synchronously/async after execution
            if self.context_builder:
                # Save conversation history to SQLite
                self.context_builder.sqlite.add_message(session_id, "user", user_input)
                self.context_builder.sqlite.add_message(session_id, "assistant", llm_reply)
                
                # Optionally index meaningful events to Chroma semantic vector store
                import uuid
                self.context_builder.chroma.add_memory(
                    document_id=str(uuid.uuid4()),
                    content=f"User said: {user_input}. Assistant responded: {llm_reply}"
                )
            
            # Keep backup short term transient memory
            self.short_term_memory.append({"role": "user", "content": user_input})
            self.short_term_memory.append({"role": "assistant", "content": llm_reply})
            
            return llm_reply
            
        except Exception as e:
            logger.error(f"LLM communication error: {e}")
            return f"An error occurred: {str(e)}"

    def _parse_tool_calls(self, text: str) -> List[Dict[str, Any]]:
        # Extremely basic parser for JSON blocks wrapped in ```json
        tool_calls = []
        try:
            if "```json" in text:
                parts = text.split("```json")
                for part in parts[1:]:
                    json_str = part.split("```")[0].strip()
                    tool_call = json.loads(json_str)
                    if "tool" in tool_call:
                        tool_calls.append(tool_call)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse tool call JSON: {e}")
        return tool_calls
