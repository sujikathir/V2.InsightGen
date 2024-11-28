// src/services/database.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

export const databaseService = {
  connect: async (connectionInfo: any) => {
    const response = await fetch(`${API_BASE_URL}/database/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(connectionInfo),
    });
    if (!response.ok) {
      throw new Error('Failed to connect to database');
    }
    return response.json();
  },

  chat: async (message: string, connectionId: string, history: ChatMessage[] = []) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        connection_id: connectionId,
        history
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Chat request failed');
    }
    
    return response.json();
  },

  disconnect: async (connectionId: string) => {
    const response = await fetch(`${API_BASE_URL}/database/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ connection_id: connectionId }),
    });
    if (!response.ok) {
      throw new Error('Failed to disconnect');
    }
    return response.json();
  }
};