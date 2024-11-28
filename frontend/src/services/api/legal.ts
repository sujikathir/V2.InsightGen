import api from '@/config/api';
import { ChatMessage } from '@/types/chat';

interface ChatResponse {
  answer: string;
  insights: Record<string, any>;
  sources: string[];
  metadata: Record<string, any>;
}

// Add a variable to store the current document name
let currentDocumentName: string | null = null;

export const sendLegalChatMessage = async (
  message: string, 
  documentId: string,
  chatHistory: any[] = []
): Promise<{ answer: string }> => {
  try {
    const response = await api.post('/api/v1/legal/chat', {
      message,
      document_id: documentId,
      chat_history: chatHistory,
      connection_id: 'temp-' + Date.now(),
      service_type: 'legal',
      context: { document_id: documentId }
    });

    if (!response.data || !response.data.answer) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error: any) {
    console.error('Legal chat error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const uploadLegalDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  console.log('Uploading file:', file.name, 'Size:', file.size);
  
  // Store the file name
  currentDocumentName = file.name;

  const response = await fetch('http://localhost:8000/api/v1/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload document');
  }

  return response.json();
};

export const analyzeLegalDocument = async (documentId: string) => {
  const response = await fetch(`http://localhost:8000/api/v1/documents/${documentId}/analyze`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to analyze document');
  }

  return response.json();
};