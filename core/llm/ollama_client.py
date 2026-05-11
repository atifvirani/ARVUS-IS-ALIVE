import httpx
import json
from typing import List, Dict, Any, AsyncGenerator

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.api_generate = f"{self.base_url}/api/generate"
        self.api_chat = f"{self.base_url}/api/chat"
        self.api_embeddings = f"{self.base_url}/api/embeddings"

    async def generate(self, prompt: str, model: str = "qwen3.5:latest", stream: bool = False, **kwargs) -> Any:
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            **kwargs
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            if stream:
                return self._stream_response(client, self.api_generate, payload)
            else:
                response = await client.post(self.api_generate, json=payload)
                response.raise_for_status()
                return response.json()

    async def chat(self, messages: List[Dict[str, str]], model: str = "qwen3.5:latest", stream: bool = False, **kwargs) -> Any:
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            **kwargs
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            if stream:
                return self._stream_response(client, self.api_chat, payload)
            else:
                response = await client.post(self.api_chat, json=payload)
                response.raise_for_status()
                return response.json()

    async def embeddings(self, prompt: str, model: str = "qwen3.5:latest") -> Any:
        payload = {
            "model": model,
            "prompt": prompt
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(self.api_embeddings, json=payload)
            response.raise_for_status()
            return response.json().get("embedding", [])

    async def _stream_response(self, client: httpx.AsyncClient, url: str, payload: dict) -> AsyncGenerator[Dict[str, Any], None]:
        async with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for chunk in response.aiter_lines():
                if chunk:
                    try:
                        yield json.loads(chunk)
                    except json.JSONDecodeError:
                        pass
