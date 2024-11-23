// src/services/database.ts
const API_BASE_URL = 'http://localhost:8000/api/v1';

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

  chat: async (query: string, connectionId: string, chatHistory: any[] = []) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        mode: 'database',
        context: { connection_id: connectionId },
        chat_history: chatHistory,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get response');
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