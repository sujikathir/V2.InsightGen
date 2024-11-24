/* src/pages/services/marketing.tsx */
import React, { useState } from 'react';
import { 
  Megaphone, 
  Target, 
  Users, 
  TrendingUp, 
  Calendar, 
  Image, 
  Globe,
  BarChart,
  MessageCircle,
  PieChart,
  FileText,
  Plus,
  Search,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Pie,
  PieChart as RechartsPieChart
} from 'recharts';
import { Badge } from "@/components/ui/badge";

const MarketingService = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Sample data for charts
  const campaignData = [
    { name: 'Email', current: 65, previous: 45 },
    { name: 'Social', current: 45, previous: 35 },
    { name: 'Search', current: 35, previous: 25 },
    { name: 'Display', current: 25, previous: 15 },
  ];

  const engagementData = [
    { name: 'Mon', value: 1000 },
    { name: 'Tue', value: 1200 },
    { name: 'Wed', value: 900 },
    { name: 'Thu', value: 1500 },
    { name: 'Fri', value: 1300 },
    { name: 'Sat', value: 1100 },
    { name: 'Sun', value: 1400 },
  ];

  const campaigns = [
    {
      id: 1,
      name: 'Summer Sale Campaign',
      status: 'active',
      progress: 65,
      budget: 5000,
      spent: 3250,
      reach: '45K',
      engagement: '2.3K',
      conversion: '3.2%'
    },
    {
      id: 2,
      name: 'Product Launch',
      status: 'planned',
      progress: 0,
      budget: 10000,
      spent: 0,
      reach: '0',
      engagement: '0',
      conversion: '0%'
    },
    // Add more campaigns...
  ];

  const contentCalendar = [
    {
      date: '2024-03-20',
      platform: 'Instagram',
      type: 'Post',
      status: 'scheduled',
      content: 'Product showcase with summer theme'
    },
    {
      date: '2024-03-21',
      platform: 'Facebook',
      type: 'Ad',
      status: 'draft',
      content: 'Special offer announcement'
    },
    // Add more content items...
  ];

  // Add Campaign interface
  interface Campaign {
    id: number;
    name: string;
    status: string;
    progress: number;
    budget: number;
    spent: number;
    reach: string;
    engagement: string;
    conversion: string;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Megaphone className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Marketing Hub</h1>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-8">
            <Tabs defaultValue="dashboard" className="flex-col !items-start">
              <TabsList>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="content">Content Calendar</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <div className="flex flex-col">
                  {/* Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Megaphone className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-2xl font-bold">3</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">2 ending this week</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-2xl font-bold">45.2K</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">↑ 12% from last month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-2xl font-bold">4.8%</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">↑ 0.5% from last month</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Campaign Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={campaignData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="current" fill="#8884d8" name="Current" />
                            <Bar dataKey="previous" fill="#82ca9d" name="Previous" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Engagement Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={engagementData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="campaigns">
                <div className="space-y-6">
                  {/* Campaign Controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Search campaigns..."
                        className="w-64"
                      />
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Campaign
                    </Button>
                  </div>

                  {/* Campaign List */}
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4">
                              <h3 className="font-medium">{campaign.name}</h3>
                              <p className="text-sm text-gray-500">
                                Budget: ${campaign.budget}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm space-y-1">
                                <p className="text-gray-500">Status</p>
                                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                  {campaign.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm space-y-1">
                                <p className="text-gray-500">Progress</p>
                                <Progress value={campaign.progress} className="h-2" />
                              </div>
                            </div>
                            <div className="col-span-2">
                              <div className="text-sm space-y-1">
                                <p className="text-gray-500">Reach</p>
                                <p>{campaign.reach}</p>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => setSelectedCampaign(campaign)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Content Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="post">Posts</SelectItem>
                          <SelectItem value="story">Stories</SelectItem>
                          <SelectItem value="ad">Ads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Content
                    </Button>
                  </div>

                  {/* Content Calendar */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {contentCalendar.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                {item.platform === 'Instagram' ? (
                                  <Image className="w-5 h-5 text-primary" />
                                ) : (
                                  <Globe className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{item.content}</h4>
                                <p className="text-sm text-gray-500">
                                  {item.platform} • {item.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {new Date(item.date).toLocaleDateString()}
                              </span>
                              <Badge variant={item.status === 'scheduled' ? 'default' : 'secondary'}>
                                {item.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  {/* Analytics Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Website Traffic</p>
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-2xl font-bold">24.5K</h4>
                            <span className="text-sm text-green-600">+12%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Social Followers</p>
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-2xl font-bold">12.8K</h4>
                            <span className="text-sm text-green-600">+5%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Email Subscribers</p>
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-2xl font-bold">8.2K</h4>
                            <span className="text-sm text-green-600">+8%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">Conversion Rate</p>
                          <div className="flex items-baseline justify-between">
                            <h4 className="text-2xl font-bold">3.2%</h4>
                            <span className="text-sm text-green-600">+0.5%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Analytics */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Traffic Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={[
                                  { name: 'Organic', value: 400 },
                                  { name: 'Social', value: 300 },
                                  { name: 'Email', value: 200 },
                                  { name: 'Paid', value: 100 },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                label
                              />
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Conversion Funnel</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Visits</span>
                              <span>24,500</span>
                            </div>
                            <Progress value={100} className="h-2 mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Sign-ups</span>
                              <span>12,300</span>
                            </div>
                            <Progress value={50} className="h-2 mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Active Users</span>
                              <span>8,200</span>
                            </div>
                            <Progress value={33} className="h-2 mt-1" />
                          </div>
                          <div>
                            <div className="flex justify-between text-sm">
                              <span>Conversions</span>
                              <span>784</span>
                            </div>
                            <Progress value={15} className="h-2 mt-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Engagement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Engagement Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <h4 className="text-sm font-medium mb-4">Social Media</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Likes</span>
                              <span className="font-medium">3.2K</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Comments</span>
                              <span className="font-medium">856</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Shares</span>
                              <span className="font-medium">432</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-4">Email Campaign</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Open Rate</span>
                              <span className="font-medium">24.5%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Click Rate</span>
                              <span className="font-medium">12.3%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Unsubscribes</span>
                              <span className="font-medium">0.8%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-4">Website</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Avg. Time</span>
                              <span className="font-medium">2:45</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Bounce Rate</span>
                              <span className="font-medium">42%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Pages/Visit</span>
                              <span className="font-medium">3.2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Content
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Social Monitor
                </Button>
              </CardContent>
            </Card>

            {/* Campaign Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.filter(c => c.status === 'active').map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-gray-500">
                            Budget: ${campaign.spent}/${campaign.budget}
                          </p>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <Progress value={campaign.progress} className="mt-4 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Marketing Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Marketing Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Best time to post on social media is between 10 AM and 2 PM.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Engage with your audience by responding to comments within 24 hours.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="link" className="w-full justify-start p-0 text-blue-600">
                    <FileText className="w-4 h-4 mr-2" />
                    Marketing Strategy Guide
                  </Button>
                  <Button variant="link" className="w-full justify-start p-0 text-blue-600">
                    <Image className="w-4 h-4 mr-2" />
                    Brand Assets Library
                  </Button>
                  <Button variant="link" className="w-full justify-start p-0 text-blue-600">
                    <Target className="w-4 h-4 mr-2" />
                    Audience Targeting Tips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingService;