import React, { useState, useRef } from 'react';
import { Scale, Upload, Loader2, FileText, AlertCircle, CheckCircle2, FileQuestion } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ChatInterface from '@/components/chat/base/ChatInterface';  // Adjust this import path based on your structure
import { uploadLegalDocument, analyzeLegalDocument, sendLegalChatMessage } from '@/services/api/legal';
import { ChatMessage } from '@/types/chat';
import { motion, AnimatePresence } from 'framer-motion';

interface LegalChatProps {
  className?: string;
}

const LegalChat: React.FC<LegalChatProps> = ({ className }) => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setFileName(file.name);
    setErrorMessage('');

    try {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error('Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.');
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const uploadResult = await uploadLegalDocument(file);
      if (!uploadResult?.id) {
        throw new Error('Upload failed: No document ID received');
      }

      setDocumentId(uploadResult.id);
      setUploadStatus('success');

      // Start analysis
      const analysisResult = await analyzeLegalDocument(uploadResult.id);
      console.log('Analysis result:', analysisResult);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload document');
      setDocumentId(null);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
        if (!documentId) {
            setError('No document selected');
            return;
        }

        // Add user message immediately
        setChatHistory(prev => [...prev, {
            role: 'user',
            content: message
        }]);

        const response = await sendLegalChatMessage(
            message,
            documentId,
            chatHistory
        );

        if (response && response.answer) {
            // Add assistant response
            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: response.answer
            }]);
        } else {
            throw new Error('Invalid response format');
        }

    } catch (error) {
        console.error('Chat error:', error);
        setError('Failed to get response from server');
        // Optionally add an error message to chat
        setChatHistory(prev => [...prev, {
            role: 'error',
            content: 'Sorry, there was an error processing your message.'
        }]);
    }
  };

  const getUploadStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `Uploading ${fileName}...`;
      case 'success':
        return `Successfully uploaded: ${fileName}`;
      case 'error':
        return errorMessage || 'Upload failed. Please try again.';
      default:
        return '';
    }
  };

  const getUploadStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return '';
    }
  };

  const handleUploadClick = () => {
    if (uploadStatus === 'uploading') return;
    fileInputRef.current?.click();
  };

  const initialMessage = documentId 
    ? "I've analyzed your document. What would you like to know about it?"
    : `Please upload a legal document to get started. I can help analyze:
• Contracts and agreements
• Legal terms and conditions
• Compliance documents
• Policy documents and regulations
• Legal correspondence`;

  return (
    <div className="w-full space-y-6">
      <Card className="w-full border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Legal Document Analysis
            </CardTitle>
            <Button 
              variant="outline"
              onClick={handleUploadClick}
              disabled={uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />
          
          {uploadStatus !== 'idle' && (
            <Alert className={`mb-4 ${getUploadStatusColor()}`}>
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default LegalChat;