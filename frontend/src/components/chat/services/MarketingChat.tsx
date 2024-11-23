// src/components/services/MarketingChat.tsx
import React from 'react';
import { TrendingUp } from 'lucide-react';
import BaseServiceChat from '../base/BaseServiceChat';

const MarketingChat: React.FC<{ documentId?: string }> = ({ documentId }) => {
  const handleDocumentUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    return data.id;
  };

  return (
    <BaseServiceChat
      serviceType="marketing"
      documentId={documentId}
      onDocumentUpload={handleDocumentUpload}
      title="Marketing Assistant"
      icon={<TrendingUp className="w-5 h-5" />}
    />
  );
};

export default MarketingChat;