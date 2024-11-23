// API service functions for legal-related operations
const API_BASE_URL = 'http://localhost:8000/api/v1';

export const uploadLegalDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('Upload response status:', response.status);
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Server response not in JSON format: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Upload failed');
    }

    return data;
  } catch (error) {
    console.error('Upload error details:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('An unknown error occurred during upload');
    }
  }
};

export const analyzeLegalDocument = async (documentId: string) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Analysis failed');
  }

  return response.json();
};

export const sendLegalChatMessage = async (message: string, documentId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: message,
        document_id: documentId,
        chat_history: []
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Chat error response:', errorData);
      throw new Error(errorData.detail || 'Chat failed');
    }

    const data = await response.json();
    return {
      content: data.answer,
      role: 'assistant',
      metadata: {
        documentId: data.metadata.document_id,
        timestamp: data.metadata.timestamp
      }
    };
  } catch (error) {
    console.error('Chat error details:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process chat message');
  }
};