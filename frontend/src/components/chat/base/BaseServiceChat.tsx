// src/components/chat/BaseServiceChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  insights?: {
    summary?: string;
    key_points?: string[];
    [key: string]: any; // For service-specific insights
  };
  timestamp?: Date;
}

interface BaseServiceChatProps {
  serviceType: string;
  documentId?: string;
  onDocumentUpload: (file: File) => Promise<any>;
  title: string;
  icon: React.ReactNode;
}

const BaseServiceChat: React.FC<BaseServiceChatProps> = ({
  serviceType,
  documentId,
  onDocumentUpload,
  title,
  icon
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || !documentId) return;
    
    setLoading(true);
    const userMessage: ChatMessage = {
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          service_type: serviceType,
          context: { document_id: documentId },
          chat_history: messages.slice(-5).map(msg => ({
            content: msg.content,
            role: msg.role
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        content: data.answer,
        role: 'assistant',
        insights: data.insights,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        content: error instanceof Error ? error.message : 'An error occurred',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onDocumentUpload) return;

    try {
      setLoading(true);
      await onDocumentUpload(file);
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderInsights = (insights: any) => {
    // Customize this based on service type
    return (
      <div className="mt-2 p-2 bg-gray-50 rounded-lg text-sm">
        {insights.summary && (
          <div className="mb-2">
            <p className="font-medium">Summary:</p>
            <p>{insights.summary}</p>
          </div>
        )}
        {insights.key_points && insights.key_points.length > 0 && (
          <div>
            <p className="font-medium">Key Points:</p>
            <ul className="list-disc pl-4">
              {insights.key_points.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary/10 text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.insights && renderInsights(msg.insights)}
                  {msg.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex space-x-2 p-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about your ${serviceType} document...`}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading || !documentId}
            />
            <Button 
              onClick={handleSend}
              disabled={loading || !input.trim() || !documentId}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.txt"
      />
    </Card>
  );
};

export default BaseServiceChat;