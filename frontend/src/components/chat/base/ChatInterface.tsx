// src/components/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  additionalInfo?: any;
}

interface ChatInterfaceProps {
  title: string;
  initialMessage?: string;
  onSendMessage: (message: string) => Promise<any>;
  placeholder?: string;
  rightSidebar?: React.ReactNode;
}

const ChatInterface = ({
  title,
  initialMessage,
  onSendMessage,
  placeholder = "Type your message...",
  rightSidebar
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessage) {
      setMessages([{
        content: initialMessage,
        role: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      content: input.trim(),
      role: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await onSendMessage(userMessage.content);
      setMessages(prev => [...prev, {
        content: response.answer,
        role: 'assistant',
        timestamp: new Date(),
        additionalInfo: response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        content: 'Sorry, something went wrong. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
      <Card className="md:col-span-2 h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-4rem)]">
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
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
                placeholder={placeholder}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              />
              <Button onClick={handleSend} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {rightSidebar && (
        <div className="col-span-1">{rightSidebar}</div>
      )}
    </div>
  );
};

export default ChatInterface;