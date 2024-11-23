// File Path: frontend/src/components/database-chat/DatabaseConnectionsManager.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Trash2, RefreshCw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Connection {
  id: string;
  name: string;
  type: string;
  host: string;
  database: string;
  lastUsed: Date;
}

interface DatabaseConnectionsManagerProps {
  onSelectConnection: (connectionId: string) => void;
  onNewConnection: () => void;
}

const DatabaseConnectionsManager: React.FC<DatabaseConnectionsManagerProps> = ({
  onSelectConnection,
  onNewConnection,
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConnection, setDeleteConnection] = useState<string | null>(null);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/database/connections');
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/v1/database/connections/${connectionId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchConnections();
      }
    } catch (error) {
      console.error('Failed to delete connection:', error);
    }
    setDeleteConnection(null);
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Saved Connections
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchConnections}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button onClick={onNewConnection}>New Connection</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No saved connections
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <button
                    className="flex-1 text-left"
                    onClick={() => onSelectConnection(conn.id)}
                  >
                    <div className="font-medium">{conn.name}</div>
                    <div className="text-sm text-gray-500">
                      {conn.type} • {conn.host} • {conn.database}
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConnection(conn.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteConnection} onOpenChange={() => setDeleteConnection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteConnection && handleDelete(deleteConnection)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DatabaseConnectionsManager;