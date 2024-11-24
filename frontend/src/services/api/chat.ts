// src/services/api/chat.ts

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const chatApi = {
 sendMessage: async (message: string, serviceType: string, context: any = {}) => {
   const response = await fetch(`${API_BASE_URL}/chat`, {
     method: 'POST', 
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       message,
       service_type: serviceType,
       context
     })
   });
   return response.json();
 }
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}