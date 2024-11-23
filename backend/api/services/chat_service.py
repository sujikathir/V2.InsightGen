# backend/api/services/chat_service.py
from typing import List, Dict, Any
import logging
from core.rag.retriever import RAGRetriever
from core.llm.llama_client import LlamaClient
import os
from dotenv import load_dotenv
from datetime import datetime

logger = logging.getLogger(__name__)
load_dotenv()

class ChatService:
    def __init__(self):
        self.retriever = RAGRetriever()
        self.llm_client = LlamaClient()

    async def process_chat(
        self,
        query: str,
        document_content: str = "",
        chat_history: List[Dict[str, str]] = None,
        mode: str = "general"
    ) -> Dict[str, Any]:
        """
        Process a chat message with RAG and LLM
        """
        try:
            if chat_history is None:
                chat_history = []

            if mode == "document_chat" and document_content:
                # First, store document in vector store if not already done
                document_id = "temp_id"  # You might want to pass this as a parameter
                await self.retriever.process_document(document_id, document_content)
                
                # Get relevant chunks for the query
                relevant_chunks = await self.retriever.get_relevant_chunks(query)
                
                # Create context-aware prompt
                context = "\n\n".join([chunk["content"] for chunk in relevant_chunks])
                system_prompt = """You are a helpful legal assistant. Use the provided document 
                context to answer questions accurately. If you cannot find relevant information 
                in the context, say so."""
                
                prompt = f"""Context from document:
                {context}
                
                Question: {query}
                
                Answer based on the context above:"""
            else:
                system_prompt = """You are a helpful legal assistant. Provide clear, 
                accurate responses to questions about legal matters."""
                prompt = query

            # Get response from LLM
            response = await self.llm_client.get_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7
            )

            return {
                "answer": response,
                "mode": mode,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error processing chat: {e}")
            raise