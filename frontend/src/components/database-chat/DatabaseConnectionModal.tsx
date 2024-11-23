// File Path: frontend/src/components/database-chat/DatabaseConnectionModal.tsx

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface DatabaseConnectionProps {
  onConnect: (connectionInfo: any) => void;
  onCancel: () => void;
}

const DatabaseConnectionModal: React.FC<DatabaseConnectionProps> = ({
  onConnect,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    type: 'postgresql',
    host: 'localhost',
    port: '5432',
    database: 'ecommerce',
    username: 'postgres',
    password: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Connecting with:', formData); // Debug log

      const response = await fetch('/api/v1/database/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to connect');
      }

      onConnect(data);
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Connect to Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Database Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              disabled
            >
              <option value="postgresql">PostgreSQL</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Host</label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleChange}
                className="w-full rounded-md border p-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Port</label>
              <input
                type="text"
                name="port"
                value={formData.port}
                onChange={handleChange}
                className="w-full rounded-md border p-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Database Name</label>
            <input
              type="text"
              name="database"
              value={formData.database}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DatabaseConnectionModal;