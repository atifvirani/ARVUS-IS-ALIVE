import httpx
from chromadb.api.types import Documents, EmbeddingFunction, Embeddings
import logging

logger = logging.getLogger(__name__)

class OllamaEmbeddingFunction(EmbeddingFunction):
    """
    Custom embedding function wrapper for ChromaDB that directs traffic to
    local Ollama, preventing remote downloads to AWS/Amazon.
    """
    def __init__(self, base_url: str = "http://localhost:11434", model_name: str = "default"):
        self.base_url = base_url
        self.model_name = None # Will dynamically discover first valid tag
        self.api_url = f"{self.base_url}/api/embeddings"
        self.tags_url = f"{self.base_url}/api/tags"

    def _get_best_model(self, client: httpx.Client) -> str:
        try:
            # Query Ollama for actually installed tags instead of guessing
            resp = client.get(self.tags_url)
            models = resp.json().get("models", [])
            if models:
                return models[0]["name"]
        except Exception:
            pass
        return "phi3:latest" # Last resort fallback if offline

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        with httpx.Client(timeout=60.0) as client:
            # Auto-discover model tag on first use
            if not self.model_name:
                self.model_name = self._get_best_model(client)
                logger.info(f"OllamaEmbedding automatically using model: {self.model_name}")

            for doc in input:
                try:
                    payload = {
                        "model": self.model_name,
                        "prompt": doc
                    }
                    response = client.post(self.api_url, json=payload)
                    response.raise_for_status()
                    embed = response.json().get("embedding", [])
                    embeddings.append(embed)
                except Exception as e:
                    logger.error(f"Ollama embedding failed for a document: {e}")
                    # Fallback to dummy zero vector of expected size if needed
                    # But ideally this shouldn't fail. Let's append empty for now to avoid size mismatch.
                    embeddings.append([0.0] * 1024) # dummy backup len for safety
        return embeddings
