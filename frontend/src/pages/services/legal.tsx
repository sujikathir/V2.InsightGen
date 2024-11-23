// src/pages/services/legal.tsx
import React from 'react';
import { Scale } from 'lucide-react';
import LegalChat from '@/components/chat/services/LegalChat';

const LegalService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Scale className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Legal Assistant</h1>
        </div>
        
        <div className="bg-white rounded-lg p-4 mb-8">
          <p className="text-gray-600">
            Upload your legal documents for AI-powered analysis and guidance. 
            Get insights on contracts, agreements, and other legal documents.
          </p>
        </div>

        <LegalChat />
      </div>
    </div>
  );
};

export default LegalService;