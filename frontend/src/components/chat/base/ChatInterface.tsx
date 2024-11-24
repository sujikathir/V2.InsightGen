// src/components/chat/ChatInterface.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

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
  className?: string;
}

const ChatInterface = ({
  title,
  initialMessage,
  onSendMessage,
  placeholder = "Type your message...",
  rightSidebar,
  className
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
      console.error('Error sending message:', error);
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
      <Card className="md:col-span-2 h-full flex flex-col border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Scale className="w-5 h-5 text-pink-600" />
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-auto p-4 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50">
          {messages.length === 0 && initialMessage && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5 text-gray-600">
              {initialMessage}
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-gray-900'
                }`}
              >
                <ReactMarkdown 
                  className="whitespace-pre-line prose prose-sm max-w-none prose-headings:font-bold prose-strong:font-bold"
                >
                  {msg.content}
                </ReactMarkdown>
                {msg.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        <div className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="focus-within:ring-pink-500"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <Button 
              onClick={handleSend} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
      
      {rightSidebar && (
        <div className="col-span-1">{rightSidebar}</div>
      )}
    </div>
  );
};

export default ChatInterface;