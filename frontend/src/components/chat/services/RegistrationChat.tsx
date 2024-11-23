// src/components/services/RegistrationChat.tsx
import React from 'react';
import { Building2 } from 'lucide-react';
import BaseServiceChat from '../base/BaseServiceChat';

const RegistrationChat: React.FC<{ documentId?: string }> = ({ documentId }) => {
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
      serviceType="registration"
      documentId={documentId}
      onDocumentUpload={handleDocumentUpload}
      title="Registration Assistant"
      icon={<Building2 className="w-5 h-5" />}
    />
  );
};

export default RegistrationChat;