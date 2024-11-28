// File Path: frontend/src/components/DatabaseChat.tsx


import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Database, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: Date;
  queryResults?: {
    sql?: string;
    data?: any[];
    insights?: {
      [key: string]: {
        finding: string;
        importance: string;
      }
    };
    visualizations?: any[];
    followupQuestions?: string[];
    recommendations?: Array<{ suggestion: string; rationale: string }>;
    summary?: {
      overview: string;
      key_points?: string[];
    };
  };
}

interface DatabaseChatProps {
  connectionId: string;
  onDisconnect: () => void;
}

const DatabaseChat: React.FC<DatabaseChatProps> = ({ connectionId, onDisconnect }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage: ChatMessage = {
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // First, fetch the schema
      const schemaResponse = await fetch(`http://localhost:8000/api/v1/database/reflect/${connectionId}`);
      if (!schemaResponse.ok) {
        throw new Error('Failed to fetch database schema');
      }
      const schemaData = await schemaResponse.json();

      // Then make the chat request with the schema
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: userMessage.content,
          connection_id: connectionId,
          history: messages.slice(-5).map(msg => ({
            content: msg.content,
            role: msg.role
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        content: data.answer,
        role: 'assistant',
        timestamp: new Date(),
        queryResults: {
          sql: data.sql_query,
          data: data.results,
          followupQuestions: data.followup_questions
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
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

  const renderVisualization = (vizConfig: any, data: any[]) => {
    const vizType = vizConfig.type.toLowerCase();
    
    const commonProps = {
      width: 500,
      height: 300,
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (vizType) {
      case 'bar':
        return (
          <ResponsiveContainer height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={vizConfig.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={vizConfig.columns[1]} fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={vizConfig.columns[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={vizConfig.columns[1]} stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      // Add other chart types as needed
      default:
        return null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
      {/* Chat Section */}
      <Card className="md:col-span-2 h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Database Chat</span>
            </div>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="animate-spin h-5 w-5" />}
              <Button variant="outline" size="sm" onClick={onDisconnect}>
              // Continuing DatabaseChat.tsx
              <X className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {/* Message Content */}
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Query Results */}
                  {msg.queryResults && (
                    <div className="mt-2 space-y-4">
                      {/* SQL Query */}
                      {msg.queryResults.sql && (
                        <div className="bg-gray-800 text-white p-2 rounded text-sm font-mono">
                          <div className="text-xs text-gray-400 mb-1">Generated SQL:</div>
                          {msg.queryResults.sql}
                        </div>
                      )}

                      {/* Results Table */}
                      {msg.queryResults.data && msg.queryResults.data.length > 0 && (
                        <div className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                          <div className="text-sm font-medium text-gray-600 mb-2">Query Results:</div>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(msg.queryResults.data[0]).map((key) => (
                                  <th key={key} className="px-2 py-1 text-xs text-gray-500">{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {msg.queryResults.data.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((value: any, j) => (
                                    <td key={j} className="px-2 py-1 text-sm">{value?.toString()}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Summary Section */}
                      {msg.queryResults.summary && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="text-sm font-medium text-gray-600 mb-1">Summary:</div>
                          <p className="text-sm text-gray-700 mb-2">{msg.queryResults.summary.overview}</p>
                          {msg.queryResults.summary.key_points && msg.queryResults.summary.key_points.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {msg.queryResults.summary.key_points.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {/* Insights Section */}
                      {msg.queryResults.insights && Object.keys(msg.queryResults.insights).length > 0 && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="text-sm font-medium text-gray-600 mb-1">Key Insights:</div>
                          {Object.entries(msg.queryResults.insights).map(([key, insight]) => (
                            <div key={key} className="mb-2">
                              <p className="text-sm font-medium text-gray-700">{insight.finding}</p>
                              <p className="text-xs text-gray-500">{insight.importance}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Recommendations Section */}
                      {msg.queryResults.recommendations && msg.queryResults.recommendations.length > 0 && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="text-sm font-medium text-gray-600 mb-1">Recommendations:</div>
                          {msg.queryResults.recommendations.map((rec, i) => (
                            <div key={i} className="mb-2">
                              <p className="text-sm font-medium text-gray-700">{rec.suggestion}</p>
                              <p className="text-xs text-gray-500">{rec.rationale}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Visualizations */}
                      {msg.queryResults.visualizations && msg.queryResults.visualizations.length > 0 && (
                        <div className="bg-white p-2 rounded border border-gray-200">
                          <div className="text-sm font-medium text-gray-600 mb-1">Visualization:</div>
                          {renderVisualization(
                            msg.queryResults.visualizations[selectedVisualization || 0],
                            msg.queryResults.data || []
                          )}
                          {msg.queryResults.visualizations.length > 1 && (
                            <div className="flex gap-2 mt-2">
                              {msg.queryResults.visualizations.map((viz: any, i: number) => (
                                <Button
                                  key={i}
                                  variant={selectedVisualization === i ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedVisualization(i)}
                                >
                                  {viz.type}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  {msg.timestamp && (
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex space-x-2 p-4 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask about your data..."
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`p-2 rounded-md ${
                loading || !input.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Suggestions Panel */}
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle>Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length > 0 && messages[messages.length - 1]?.queryResults?.followupQuestions && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-600">Follow-up Questions:</h4>
              {messages[messages.length - 1]?.queryResults?.followupQuestions?.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);
};

export default DatabaseChat;