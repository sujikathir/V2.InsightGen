# backend/api/utils/llm_utils.py
from typing import List, Dict
from groq import AsyncGroq
import os
import logging

logger = logging.getLogger(__name__)
groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def get_llm_response(messages: List[Dict[str, str]]) -> str:
    try:
        response = await groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            temperature=0.7,
            max_tokens=4096
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in LLM response: {e}")
        raise