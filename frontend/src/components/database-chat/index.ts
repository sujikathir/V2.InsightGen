// src/components/database-chat/index.ts
export { default as DatabaseChat } from './DatabaseChat';
export { default as DatabaseConnectionModal } from './DatabaseConnectionModal';
export { default as DatabaseConnectionsManager } from './DatabaseConnectionsManager';

export const databaseService = {
    async executeQuery(query: string): Promise<any> {
      try {
        const response = await fetch('/api/v1/database/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });
        
        return await response.json();
      } catch (error) {
        console.error('Database query error:', error);
        throw error;
      }
    },
  
    async getTableInfo(): Promise<any> {
      try {
        const response = await fetch('/api/v1/database/tables', {
          method: 'GET',
        });
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching table info:', error);
        throw error;
      }
    }
  };