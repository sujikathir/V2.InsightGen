import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Globe, 
  Scale, 
  Database, 
  LineChart,
  Megaphone,
  BarChart
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    path: string;
  }

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, path }) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Icon className="w-12 h-12 text-primary" />
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const services = [
    {
      icon: Building2,
      title: "Register Your Business",
      description: "Get step-by-step guidance for business registration based on your location and business type",
      path: "/services/registration"
    },
    {
      icon: Globe,
      title: "Domain & Branding",
      description: "Find the perfect domain name and establish your online presence",
      path: "/services/domain"
    },
    {
      icon: Scale,
      title: "Legal Assistant",
      description: "Get legal guidance and document analysis for your business needs",
      path: "/services/legal"
    },
    {
      icon: Database,
      title: "Connect Database",
      description: "Connect your database to get started with analysis",
      path: "/services/database-connect"
    },
    {
      icon: BarChart,
      title: "Business Insights",
      description: "Analyze your business data and uncover valuable insights",
      path: "/services/database-insights"
    },
    {
      icon: LineChart,
      title: "Financial Advisory",
      description: "Get assistance with finances, taxes, and investment planning",
      path: "/services/finance"
    },
    {
      icon: Megaphone,
      title: "Marketing & Branding",
      description: "Develop effective marketing strategies for your business",
      path: "/services/marketing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Business Setup Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to start and grow your business, all in one place
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;