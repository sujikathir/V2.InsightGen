import React, { useState, useRef } from 'react';
import { Scale, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatInterface from '../base/ChatInterface';
import { uploadLegalDocument, analyzeLegalDocument, sendLegalChatMessage } from '@/services/api/legal';
import { ChatMessage } from '@/types/chat';

interface LegalChatProps {
  className?: string;
}

const LegalChat: React.FC<LegalChatProps> = ({ className }) => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (!file) return;

    setUploadStatus('uploading');
    setFileName(file.name);
    setErrorMessage('');

    try {
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      const uploadResult = await uploadLegalDocument(file);
      console.log('Upload result:', uploadResult);
      
      setDocumentId(uploadResult.id);
      setUploadStatus('success');

      try {
        const analysisResult = await analyzeLegalDocument(uploadResult.id);
        console.log('Analysis result:', analysisResult);
      } catch (analysisError) {
        console.warn('Analysis error:', analysisError);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload document');
      setDocumentId(null);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!documentId) {
      throw new Error('No document uploaded');
    }
    
    try {
      console.log('Sending message:', message, 'for document:', documentId);
      const response = await sendLegalChatMessage(
        message, 
        documentId,
        chatHistory
      );
      
      // Update chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response.answer }
      ]);
      
      return response;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  };

  const getUploadStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading document...';
      case 'success':
        return `Analyzing: ${fileName}`;
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return '';
    }
  };

  const initialMessage = documentId 
    ? "I've analyzed your document. What would you like to know about it?"
    : `Please upload a legal document to get started. I can help analyze:
- Contracts and agreements
- Legal terms and conditions
- Compliance documents
Once you upload a document, I'll analyze it and answer your questions.`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Legal Document Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  console.log('File selected:', file);
                  if (!file) return;

                  setUploadStatus('uploading');
                  setFileName(file.name);
                  
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadResult = await uploadLegalDocument(file);
                    console.log('Upload result:', uploadResult);
                    
                    setDocumentId(uploadResult.id);
                    setUploadStatus('success');
                  } catch (error) {
                    console.error('Upload error:', error);
                    setUploadStatus('error');
                  }
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log("Upload button clicked");
                  fileInputRef.current?.click();
                }}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadStatus !== 'idle' && (
            <Alert className="mb-4">
              <AlertDescription>
                {getUploadStatusMessage()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <ChatInterface
        title="Legal Assistant"
        onSendMessage={handleSendMessage}
        initialMessage={initialMessage}
        placeholder="Ask about your legal document..."
        className={className}
        rightSidebar={
          documentId ? (
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Currently analyzing: {fileName}
                </p>
              </CardContent>
            </Card>
          ) : null
        }
      />
    </div>
  );
};

export default LegalChat;