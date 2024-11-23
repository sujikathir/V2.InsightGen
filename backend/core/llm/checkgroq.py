# backend/core/llm/checkgroq.py

from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    models = client.models.list()
    
    print("\nAvailable Models:")
    print("----------------")
    for model in models.data:
        print(f"ID: {model.id}")
        print(f"Created: {model.created}")
        print("----------------")

except Exception as e:
    print(f"Error listing models: {str(e)}")