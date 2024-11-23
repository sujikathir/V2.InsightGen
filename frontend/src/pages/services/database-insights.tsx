// src/pages/services/database-insights.tsx
import React, { useState } from 'react';
import DatabaseConnectionModal from '@/components/database-chat/DatabaseConnectionModal';
import  DatabaseChat from '@/components/database-chat/DatabaseChat';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const DatabaseInsightsService = () => {
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const handleConnect = (data: { connection_id: string }) => {
    setConnectionId(data.connection_id);
  };

  return (
    <div className="h-full p-6">
      {!connectionId ? (
        <DatabaseConnectionModal
          onConnect={handleConnect}
          onCancel={() => {}} // Handle cancel if needed
        />
      ) : (
        <DatabaseChat
          connectionId={connectionId}
          onDisconnect={() => setConnectionId(null)}
        />
      )}
    </div>
  );
};

export default DatabaseInsightsService;