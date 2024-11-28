// src/pages/home/index.tsx
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
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon: Icon, title, description, path, index }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden relative group"
        onClick={() => navigate(path)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="p-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full transform group-hover:scale-110 transition-transform duration-300" />
              <Icon className="w-12 h-12 text-blue-600 relative z-10 transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
              {title}
            </h3>
            <p className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
              {description}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Your Business Setup Assistant
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to start and grow your business, all in one place
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;