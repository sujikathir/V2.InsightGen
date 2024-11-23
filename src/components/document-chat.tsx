import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentChatProps {
  serviceType: 'finance' | 'legal' | 'marketing';
}

export const DocumentChat: React.FC<DocumentChatProps> = ({ serviceType }) => {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('service_type', serviceType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setFile(file);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: `Document uploaded successfully. How can I help you analyze ${file.name}?`
      }]);
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    
    try {
      const response = await fetch('/api/documents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputMessage,
          service_type: serviceType,
          document_id: file?.name // You'll need proper document ID handling
        }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { type: 'bot', content: data.answer }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        {!file ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
            <label className="cursor-pointer">
              <Input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Upload document to begin</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            Analyzing: {file.name}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about the document..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}; 