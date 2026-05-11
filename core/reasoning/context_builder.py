from typing import List, Dict, Any
from memory.sqlite_manager import SQLiteManager
from memory.chroma_manager import ChromaManager
import logging

logger = logging.getLogger(__name__)

class ContextBuilder:
    def __init__(self, sqlite_manager: SQLiteManager, chroma_manager: ChromaManager):
        self.sqlite = sqlite_manager
        self.chroma = chroma_manager

    def build_context(self, session_id: str, current_input: str) -> List[Dict[str, str]]:
        context_messages = []
        
        # 1. Fetch relevant long-term semantic memory based on the current input
        semantic_results = self.chroma.search_memory(current_input, n_results=3)
        if semantic_results:
            semantic_context = "Relevant past information:\n"
            for res in semantic_results:
                semantic_context += f"- {res['content']}\n"
            
            # Inject semantic memory as a system hint
            context_messages.append({"role": "system", "content": semantic_context})

        # 2. Fetch short-term conversation history
        history = self.sqlite.get_history(session_id, limit=20)
        context_messages.extend(history)
        
        return context_messages
