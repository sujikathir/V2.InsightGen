// src/components/services/FinanceChat.tsx
import React from 'react';
import { DollarSign } from 'lucide-react';
import BaseServiceChat from '../base/BaseServiceChat';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const FinanceChat: React.FC<{ documentId?: string }> = ({ documentId }) => {
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
      serviceType="finance"
      documentId={documentId}
      onDocumentUpload={handleDocumentUpload}
      title="Financial Assistant"
      icon={<DollarSign />}
    />
  );
};

export default FinanceChat;