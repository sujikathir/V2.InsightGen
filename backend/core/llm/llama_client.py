import logging
from typing import List, Dict, Any
from groq import AsyncGroq
import os
from dotenv import load_dotenv
import json

logger = logging.getLogger(__name__)
load_dotenv()

class LlamaClient:
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        self.client = AsyncGroq(api_key=api_key)
        self.model = "llama3-70b-8192"
        
        self.model_map = {
            "sql": "llama3-70b-8192",
            "chat": "llama3-70b-8192",
            "document_analysis": "llama3-70b-8192",
            # Add more service-specific models if needed
            # "vision": "llama-3.2-90b-vision-preview",
            # "tool": "llama3-groq-70b-8192-tool-use-preview"
        }
        
    async def get_completion(
        self,
        prompt: str,
        system_prompt: str = "",
        temperature: float = 0.7,
        max_tokens: int = 256,
        top_p: float = 0.9,
        timeout: float = 10.0
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

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                timeout=timeout
            )
            
            if not response.choices:
                raise ValueError("No response received from LLM")
                
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error getting LLM response: {e}")
            raise

    async def generate_sql(
        self,
        question: str,
        schema: dict,
        temperature: float = 0.1
    ) -> str:
        """Specific method for SQL generation with appropriate parameters"""
        try:
            # Format schema for better prompt understanding
            schema_str = self._format_schema_for_prompt(schema)
            
            prompt = f"""Given the following database schema:
{schema_str}

Generate a SQL SELECT query to answer this question: {question}

IMPORTANT RULES:
1. Return ONLY the SQL query without any explanations or additional text
2. Start with SELECT
3. Use proper table aliases (e.g., 'table_name AS t')
4. Include appropriate JOINs based on the foreign key relationships shown
5. Use only tables and columns that exist in the schema above
6. Add LIMIT 100 if the query might return many rows
7. End with a semicolon
8. Use proper SQL formatting and indentation"""

            messages = [
                {
                    "role": "system",
                    "content": "You are a SQL expert. Generate only SQL queries without any explanation. Never include markdown formatting in your response."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=512,  # Increased for complex queries
                top_p=0.9,
                timeout=10.0
            )
            
            sql = response.choices[0].message.content.strip()
            
            # Clean up the response
            sql = self._clean_sql_response(sql)
            
            return sql
            
        except Exception as e:
            logger.error(f"Error generating SQL: {e}")
            raise

    def _format_schema_for_prompt(self, schema: dict) -> str:
        """Format schema in a clear, readable way for the LLM"""
        formatted = []
        for table_name, table_info in schema.items():
            formatted.append(f"Table: {table_name}")
            formatted.append("Columns:")
            for col_name, col_info in table_info['columns'].items():
                col_desc = f"  - {col_name} ({col_info['type']})"
                if col_info.get('primary_key'):
                    col_desc += " [PRIMARY KEY]"
                if col_info.get('foreign_keys'):
                    col_desc += f" [FOREIGN KEY -> {col_info['foreign_keys'][0]}]"
                formatted.append(col_desc)
            formatted.append("")  # Empty line between tables
        
        return "\n".join(formatted)

    def _clean_sql_response(self, sql: str) -> str:
        """Clean up the SQL response from the LLM"""
        # Remove any markdown formatting if present
        if '```sql' in sql:
            sql = sql.split('```sql')[1].split('```')[0]
        elif '```' in sql:
            sql = sql.split('```')[1]
            
        sql = sql.strip()
        
        # Ensure it starts with SELECT
        if not sql.lower().startswith('select'):
            raise ValueError("Generated SQL must start with SELECT")
            
        # Add LIMIT if not present
        if 'limit' not in sql.lower():
            sql = f"{sql.rstrip(';')}\nLIMIT 100;"
            
        return sql

    async def analyze_document(
        self,
        query: str,
        context: str,
        document_type: str = "unknown",
        temperature: float = 0.3
    ) -> str:
        """Analyze document with appropriate prompting"""
        try:
            system_prompts = {
                "lease_agreement": """You are a precise lease agreement analyzer. Focus on:
1. Identifying key parties, terms, and conditions
2. Extracting important dates and deadlines
3. Highlighting financial obligations
4. Noting special conditions or requirements""",
                
                "legal_filing": """You are a precise legal document analyzer. Focus on:
1. Case details and parties involved
2. Legal claims and arguments
3. Relief sought or demands
4. Relevant dates and deadlines""",
                
                "unknown": """You are a precise document analyzer. Your task is to:
1. Carefully analyze the provided document context
2. Answer questions based ONLY on the information present
3. If information isn't in the document, clearly state that
4. Use specific quotes or references to support your answers"""
            }
            
            system_prompt = system_prompts.get(document_type, system_prompts["unknown"])
            
            prompt = f"""Document Context:
{context}

Question: {query}

Instructions:
1. Base your response only on the provided document context
2. Be specific and cite relevant parts of the document
3. If information is not in the document, say so clearly
4. Format your response with clear sections and bullet points"""

            return await self.get_completion(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=512,
                model=self.model_map["document_analysis"]
            )

        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            raise