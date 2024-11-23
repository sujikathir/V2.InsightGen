# backend/core/llm/llama_client.py 

import logging
from typing import List, Dict, Any
from llama_cpp import Llama

logger = logging.getLogger(__name__)

class LlamaClient:
    def __init__(self):
        self.model = Llama(
            model_path="path/to/your/llama/model.gguf",
            n_ctx=32768,  # Adjust context window as needed
            n_threads=4   # Adjust based on your CPU
        )

    async def get_completion(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7
    ) -> str:
        try:
            messages = []
            if system_prompt:
                messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            messages.append({
                "role": "user",
                "content": prompt
            })

            response = self.model.create_chat_completion(
                messages=messages,
                temperature=temperature,
                max_tokens=2000
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error getting LLM response: {e}")
            raise