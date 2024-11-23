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

logger = logging.getLogger(__name__)
load_dotenv()

class GroqEmbeddings(Embeddings):
    def __init__(self):
        self.client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama2-70b-4096"

    async def _get_embedding(self, text: str) -> List[float]:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Generate an embedding vector for the following text:"},
                    {"role": "user", "content": text}
                ],
                temperature=0.0
            )
            # Convert the response to a fixed-size vector
            # This is a simplified approach - you might want to implement a more sophisticated embedding strategy
            text_response = response.choices[0].message.content
            # Create a simple hash-based embedding (for demonstration)
            embedding = self._text_to_vector(text_response)
            return embedding
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