/* src/pages/services/registration.tsx*/
import React, { useState } from 'react';
import { Building2, ArrowRight, ArrowLeft, Check, DollarSign, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatInterface from '@/components/chat/base/ChatInterface';

// Add TypeScript interfaces
interface CalculatedCosts {
  registrationFee: number;
  annualFees: number;
  serviceFees: number;
  total: number;
}

interface FormData {
  businessType: string;
  state: string;
  businessName: string;
  partners: any[];
  estimatedRevenue: string;
  employeeCount: string;
}

const RegistrationService: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    businessType: '',
    state: '',
    businessName: '',
    partners: [],
    estimatedRevenue: '',
    employeeCount: '',
  });

  const [calculatedCosts, setCalculatedCosts] = useState<CalculatedCosts | null>(null);

  const steps = [
    { number: 1, title: "Business Type" },
    { number: 2, title: "Location" },
    { number: 3, title: "Basic Info" },
    { number: 4, title: "Review" }
  ];

  const businessTypes = [
    { value: 'llc', label: 'Limited Liability Company (LLC)' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'soleProprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' }
  ];

  const states = [
    { value: 'ca', label: 'California' },
    { value: 'ny', label: 'New York' },
    { value: 'tx', label: 'Texas' },
    { value: 'fl', label: 'Florida' }
    // Add more states as needed
  ];

  const calculateCosts = () => {
    // Mock cost calculation based on business type and state
    const baseCosts = {
      llc: { ca: 800, ny: 600, tx: 300, fl: 400 },
      corporation: { ca: 1000, ny: 800, tx: 500, fl: 600 },
      soleProprietorship: { ca: 100, ny: 100, tx: 50, fl: 75 },
      partnership: { ca: 400, ny: 300, tx: 200, fl: 250 }
    };

    const baseCost = baseCosts[formData.businessType]?.[formData.state] || 500;
    const annualFees = Math.floor(baseCost * 0.2);
    const serviceFees = Math.floor(baseCost * 0.1);

    return {
      registrationFee: baseCost,
      annualFees,
      serviceFees,
      total: baseCost + annualFees + serviceFees
    };
  };

  const handleNext = () => {
    if (step === 3) {
      const costs = calculateCosts();
      setCalculatedCosts(costs);
    }
    setStep(curr => Math.min(curr + 1, 4));
  };

  const handleBack = () => {
    setStep(curr => Math.max(curr - 1, 1));
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle>Select Your Business Type</CardTitle>
              <CardDescription>
                Choose the business structure that best suits your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {businessTypes.map((type) => (
                <div
                  key={type.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.businessType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setFormData({ ...formData, businessType: type.value })}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{type.label}</h3>
                      <p className="text-sm text-gray-500">
                        {getBusinessTypeDescription(type.value)}
                      </p>
                    </div>
                    {formData.businessType === type.value && (
                      <Check className="text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle>Where Will You Operate?</CardTitle>
              <CardDescription>
                Select the primary state where your business will be registered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {formData.state && (
                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Key Requirements for {getStateName(formData.state)}:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {getStateRequirements(formData.state).map((req, index) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Provide basic details about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Business Name</label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Enter your business name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Annual Revenue</label>
                <Input
                  type="number"
                  value={formData.estimatedRevenue}
                  onChange={(e) => setFormData({ ...formData, estimatedRevenue: e.target.value })}
                  placeholder="Enter estimated revenue"
                  startIcon={<DollarSign className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Employees</label>
                <Input
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                  placeholder="Enter employee count"
                />
              </div>
            </CardContent>
          </div>
        );

        case 4:
          return (
            <div className="space-y-6">
              <CardHeader>
                <CardTitle>Review & Costs</CardTitle>
                <CardDescription>
                  Review your information and estimated costs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Business Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-gray-500">Business Type</p>
                      <p className="font-medium">{getBusinessTypeLabel(formData.businessType)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">State</p>
                      <p className="font-medium">{getStateName(formData.state)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">Business Name</p>
                      <p className="font-medium">{formData.businessName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">Estimated Revenue</p>
                      <p className="font-medium">${formData.estimatedRevenue}</p>
                    </div>
                  </div>
                </div>
        
                {calculatedCosts && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Estimated Costs</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Registration Fee</span>
                        <span className="font-medium">${calculatedCosts.registrationFee}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Annual Fees</span>
                        <span className="font-medium">${calculatedCosts.annualFees}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Service Fees</span>
                        <span className="font-medium">${calculatedCosts.serviceFees}</span>
                      </div>
                      <div className="h-px bg-gray-200 my-2" />
                      <div className="flex justify-between items-center font-medium">
                        <span>Total</span>
                        <span className="text-primary">${calculatedCosts.total}</span>
                      </div>
                    </div>
                  </div>
                )}
        
                <Alert>
                  <BookOpen className="w-4 h-4" />
                  <AlertDescription>
                    Your next steps will include filing paperwork with the state, obtaining necessary permits,
                    and setting up your business structure. Our chat assistant can help guide you through these steps.
                  </AlertDescription>
                </Alert>
        
                {/* Add the chat interface here */}
                <div className="mt-8 h-[400px]">
                  <ChatInterface
                    title="Registration Assistant"
                    onSendMessage={async (message) => {
                      try {
                        const response = await fetch('/api/registration-chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            query: message,
                            context: {
                              businessType: formData.businessType,
                              state: formData.state,
                              businessName: formData.businessName,
                              estimatedRevenue: formData.estimatedRevenue,
                              employeeCount: formData.employeeCount,
                              calculatedCosts
                            }
                          })
                        });
                        
                        const data = await response.json();
                        return data;
                      } catch (error) {
                        console.error('Chat error:', error);
                        throw error;
                      }
                    }}
                    initialMessage={`Great! Based on your information:
        - You're planning to start a ${getBusinessTypeLabel(formData.businessType)} named "${formData.businessName}"
        - Located in ${getStateName(formData.state)}
        - Estimated annual revenue: $${formData.estimatedRevenue}
        - Estimated registration costs: $${calculatedCosts?.total}
        
        I can help you with:
        1. Specific registration steps for ${getStateName(formData.state)}
        2. Required permits and licenses
        3. Tax registration process
        4. Timeline for each step
        5. Additional compliance requirements
        
        What would you like to know more about?`}
                    placeholder="Ask about next steps..."
                  />
                </div>
              </CardContent>
            </div>
          );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Business Registration</h1>
        </div>

        <div className="mb-8">
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {steps.map((s) => (
              <div 
                key={s.number}
                className={`text-sm ${step >= s.number ? 'text-primary' : 'text-gray-400'}`}
              >
                {s.title}
              </div>
            ))}
          </div>
        </div>

        <Card>
          {renderStepContent()}
          
          <div className="p-6 border-t bg-gray-50/50">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid(step, formData)}
              >
                {step === 4 ? 'Start Registration' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const getBusinessTypeDescription = (type: string): string => {
  const descriptions: Record<string, string> = {
    llc: 'Combines liability protection with tax flexibility',
    corporation: 'Formal structure with strong liability protection',
    soleProprietorship: 'Simplest structure for single-owner businesses',
    partnership: 'Shared ownership between two or more people'
  };
  return descriptions[type] || '';
};

const getBusinessTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    llc: 'Limited Liability Company (LLC)',
    corporation: 'Corporation',
    soleProprietorship: 'Sole Proprietorship',
    partnership: 'Partnership'
  };
  return labels[type] || type;
};

const getStateName = (stateCode: string): string => {
  const states: Record<string, string> = {
    ca: 'California',
    ny: 'New York',
    tx: 'Texas',
    fl: 'Florida'
  };
  return states[stateCode] || stateCode;
};

const getStateRequirements = (state: string): string[] => {
  const requirements: Record<string, string[]> = {
    ca: [
      'File Articles of Organization with Secretary of State',
      'Obtain EIN from IRS',
      'Register for state tax accounts',
      'File Statement of Information within 90 days'
    ],
    ny: [
      'File Articles of Organization with Department of State',
      'Publish notice in two newspapers',
      'File Certificate of Publication',
      'Register for state tax accounts'
    ],
    tx: [
      'File Certificate of Formation with Secretary of State',
      'Apply for EIN',
      'Register for state tax permits',
      'File franchise tax reports annually'
    ],
    fl: [
      'File Articles of Organization with Division of Corporations',
      'Obtain EIN from IRS',
      'Register for state tax accounts',
      'File annual report'
    ]
  };
  return requirements[state] || [];
};

const isStepValid = (step: number, formData: FormData): boolean => {
  switch (step) {
    case 1:
      return !!formData.businessType;
    case 2:
      return !!formData.state;
    case 3:
      return !!formData.businessName && !!formData.estimatedRevenue;
    case 4:
      return true;
    default:
      return false;
  }
};

export default RegistrationService;