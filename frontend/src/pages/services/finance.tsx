/* src/pages/services/finance.tsx */
import React, { useState } from 'react';
import { LineChart, DollarSign, PieChart, Calculator, TrendingUp, WalletCards, Receipt, BadgeDollarSign, Building2, FileText, AlertCircle, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const FinanceService = () => {
  const [selectedTool, setSelectedTool] = useState('chat');
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Welcome to your financial advisor! I can help you with:"
        + "\n• Business financial planning"
        + "\n• Tax guidance and planning"
        + "\n• ROI calculations"
        + "\n• Cash flow analysis"
        + "\n• Investment strategies"
        + "\nWhat would you like to discuss?",
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Financial Calculator States
  const [calculatorType, setCalculatorType] = useState('roi');
  const [calculatorInputs, setCalculatorInputs] = useState({
    investment: '',
    revenue: '',
    expenses: '',
    period: '12',
    taxRate: '25',
    initialInvestment: '',
    monthlyInvestment: '',
    interestRate: '',
    loanAmount: '',
    loanTerm: '',
    employeeCount: '',
    monthlyRevenue: ''
  });

  // Sample data for charts
  const revenueData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
  ];

  const expenseData = [
    { name: 'Operations', value: 400 },
    { name: 'Marketing', value: 300 },
    { name: 'Payroll', value: 300 },
    { name: 'Tools', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleCalculation = () => {
    // Implement calculation logic based on calculatorType
    switch (calculatorType) {
      case 'roi':
        const investment = parseFloat(calculatorInputs.investment);
        const revenue = parseFloat(calculatorInputs.revenue);
        const expenses = parseFloat(calculatorInputs.expenses);
        const roi = ((revenue - expenses - investment) / investment) * 100;
        return { result: roi.toFixed(2) + '%', label: 'Return on Investment' };
      // Add other calculator types...
      default:
        return { result: '0%', label: 'Result' };
    }
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, 
      { type: 'user', content: inputMessage },
      { type: 'bot', content: "I'll help you analyze this financial aspect..." }
    ]);
    setInputMessage('');
  };

  const renderCalculator = () => {
    switch (calculatorType) {
      case 'roi':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Investment ($)</label>
                <Input
                  type="number"
                  value={calculatorInputs.investment}
                  onChange={(e) => setCalculatorInputs({...calculatorInputs, investment: e.target.value})}
                  placeholder="e.g., 10000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Revenue ($)</label>
                <Input
                  type="number"
                  value={calculatorInputs.revenue}
                  onChange={(e) => setCalculatorInputs({...calculatorInputs, revenue: e.target.value})}
                  placeholder="e.g., 15000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Expenses ($)</label>
                <Input
                  type="number"
                  value={calculatorInputs.expenses}
                  onChange={(e) => setCalculatorInputs({...calculatorInputs, expenses: e.target.value})}
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period (months)</label>
                <Input
                  type="number"
                  value={calculatorInputs.period}
                  onChange={(e) => setCalculatorInputs({...calculatorInputs, period: e.target.value})}
                  placeholder="e.g., 12"
                />
              </div>
            </div>
            <Button className="w-full" onClick={() => console.log('Calculating ROI...')}>
              Calculate ROI
            </Button>
          </div>
        );

      case 'tax':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Annual Revenue ($)</label>
                <Input
                  type="number"
                  placeholder="Enter annual revenue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={calculatorInputs.taxRate}
                  onChange={(e) => setCalculatorInputs({...calculatorInputs, taxRate: e.target.value})}
                  placeholder="e.g., 25"
                />
              </div>
              {/* Add more tax-related inputs */}
            </div>
            <Button className="w-full">Calculate Tax Estimate</Button>
          </div>
        );

      // Add more calculator types...
    }
  };

  return (
    <div className ="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center space-x-3 mb-8">
          <DollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Financial Advisory</h1>
        </div>

        <div className="flex">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs defaultValue="dashboard" className="flex-col  !items-start">
            
              <TabsList >
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="chat">AI Advisor</TabsTrigger>
                <TabsTrigger value="calculators">Financial Tools</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
                          

              <TabsContent value="dashboard" className="">
                <div className="flex flex-col">
                  {/* Revenue Trend - Make it full width */}
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[500px] p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart 
                          data={revenueData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }}/>
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Create a grid for the smaller cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Expense Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Expense Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={expenseData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {expenseData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Financial Health Score */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Health Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
                            <span className="text-3xl font-bold text-green-600">85</span>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-sm text-gray-600">Your business is financially healthy</p>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="chat">
                <Card className="h-[600px] flex flex-col">
                  <CardContent className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`rounded-lg p-4 max-w-[80%] ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary'
                          }`}>
                            <p className="whitespace-pre-line">{message.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about finances, taxes, ROI..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      />
                      <Button onClick={handleSend}>Send</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="calculators">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Calculators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Select value={calculatorType} onValueChange={setCalculatorType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select calculator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="roi">ROI Calculator</SelectItem>
                            <SelectItem value="tax">Tax Calculator</SelectItem>
                            <SelectItem value="loan">Loan Calculator</SelectItem>
                            <SelectItem value="payroll">Payroll Calculator</SelectItem>
                          </SelectContent>
                        </Select>
                        {renderCalculator()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Calculator results will be displayed here */}
                        <div className="text-center p-6">
                          <p className="text-2xl font-bold text-primary">
                            {handleCalculation().result}
                          </p>
                          <p className="text-sm text-gray-600">
                            {handleCalculation().label}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Reports</CardTitle>
                      <CardDescription>
                        Generate and download financial reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button variant="outline" className="h-24">
                            <div className="text-center">
                              <FileText className="w-6 h-6 mx-auto mb-2" />
                              <span>Income Statement</span>
                            </div>
                          </Button>
                          <Button variant="outline" className="h-24">
                            <div className="text-center">
                              <Receipt className="w-6 h-6 mx-auto mb-2" />
                              <span>Balance Sheet</span>
                            </div>
                          </Button>
                          <Button variant="outline" className="h-24">
                            <div className="text-center">
                              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                              <span>Cash Flow</span>
                            </div>
                          </Button>
                          <Button variant="outline" className="h-24">
                            <div className="text-center">
                              <PieChart className="w-6 h-6 mx-auto mb-2" />
                              <span>Tax Report</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                      <Alert className="mt-6">
                        <AlertCircle className="w-4 h-4" />
                        <AlertDescription>
                          Reports are generated in PDF format and include detailed analysis and recommendations.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Custom Report Builder</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Report Type</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select report type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="financial">Financial Analysis</SelectItem>
                                <SelectItem value="tax">Tax Summary</SelectItem>
                                <SelectItem value="forecast">Financial Forecast</SelectItem>
                                <SelectItem value="budget">Budget Analysis</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Time Period</label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time period" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button className="w-full">Generate Custom Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          
          
        </div>
      </div>
    </div>
  );
};

export default FinanceService;