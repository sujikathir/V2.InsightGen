# backend/core/rag/retriever.py
from typing import List, Dict, Any
from langchain_community.vectorstores import Chroma
from langchain_core.embeddings import Embeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from groq import AsyncGroq
import numpy as np
import os
from dotenv import load_dotenv
import logging
import asyncio
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)

logger = logging.getLogger(__name__)
load_dotenv()

class GroqEmbeddings(Embeddings):
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.2-1b-preview"
        self._last_request_time = 0
        self.min_request_interval = 0.5

    async def _wait_for_rate_limit(self):
        current_time = asyncio.get_event_loop().time()
        time_since_last = current_time - self._last_request_time
        if time_since_last < self.min_request_interval:
            await asyncio.sleep(self.min_request_interval - time_since_last)
        self._last_request_time = asyncio.get_event_loop().time()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type(Exception)
    )
    async def _get_embedding(self, text: str) -> List[float]:
        try:
            await self._wait_for_rate_limit()
            
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": text}],
                temperature=0.0,
                max_tokens=128,
                timeout=5.0
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            raise

    def _text_to_vector(self, text: str, vector_size: int = 384) -> List[float]:
        """Convert text to a fixed-size vector using a simple hashing approach"""
        # This is a simplified embedding approach
        hash_values = [hash(text + str(i)) for i in range(vector_size)]
        # Normalize the values
        normalized = np.array(hash_values, dtype=float)
        normalized = normalized / np.linalg.norm(normalized)
        return normalized.tolist()

    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts."""
        embeddings = []
        for text in texts:
            embedding = await self._get_embedding(text)
            embeddings.append(embedding)
        return embeddings

    async def embed_query(self, text: str) -> List[float]:
        """Embed a query text."""
        return await self._get_embedding(text)

class RAGRetriever:
    def __init__(self):
        self.embeddings = GroqEmbeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self.vector_store = None

    async def process_document(self, document_id: str, content: str) -> None:
        """Process and store document content in vector store"""
        try:
            chunks = self.text_splitter.split_text(content)
            texts_with_metadata = [
                {"content": chunk, "document_id": document_id, "chunk_id": i}
                for i, chunk in enumerate(chunks)
            ]
            
            # Initialize or update vector store
            embeddings = await self.embeddings.embed_documents([t["content"] for t in texts_with_metadata])
            self.vector_store = Chroma.from_embeddings(
                embeddings=embeddings,
                texts=[t["content"] for t in texts_with_metadata],
                metadatas=texts_with_metadata
            )
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

    async def get_relevant_chunks(self, query: str, k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve relevant document chunks for a query"""
        try:
            if not self.vector_store:
                return []
            
            query_embedding = await self.embeddings.embed_query(query)
            results = self.vector_store.similarity_search_by_vector(query_embedding, k=k)
            return [
                {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in results
            ]
            
        except Exception as e:
            logger.error(f"Error retrieving chunks: {e}")
            raise