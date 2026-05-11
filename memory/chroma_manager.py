import chromadb
from chromadb.config import Settings
from memory.ollama_embedding import OllamaEmbeddingFunction
import logging
import time
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ChromaManager:
    def __init__(self, db_path: str = "./chroma_db", ollama_base: str = "http://localhost:11434"):
        self.db_path = db_path
        self.client = chromadb.PersistentClient(path=self.db_path)
        
        # Switch to fully local embeddings via Ollama (blocks Amazon/AWS downloads)
        self.embedding_fn = OllamaEmbeddingFunction(base_url=ollama_base)
        
        # Collection for semantic memory with explicit embedding function
        self.collection = self.client.get_or_create_collection(
            name="arvus_semantic_memory",
            embedding_function=self.embedding_fn
        )

    def add_memory(self, document_id: str, content: str, metadata: Dict[str, Any] = None):
        """Adds a document to the vector database."""
        try:
            final_metadata = metadata.copy() if metadata else {}
            final_metadata["created_at"] = time.time()
            
            self.collection.add(
                documents=[content],
                metadatas=[final_metadata],
                ids=[document_id]
            )
            logger.info(f"Added memory: {document_id}")
        except Exception as e:
            logger.error(f"Error adding memory to Chroma: {e}")

    def search_memory(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """Searches for similar documents in the vector database."""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            # Format results
            formatted_results = []
            if results and 'documents' in results and results['documents']:
                for i in range(len(results['documents'][0])):
                    formatted_results.append({
                        "id": results['ids'][0][i],
                        "content": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i] if 'metadatas' in results and results['metadatas'] else {}
                    })
            return formatted_results
        except Exception as e:
            logger.error(f"Error searching Chroma memory: {e}")
            return []
