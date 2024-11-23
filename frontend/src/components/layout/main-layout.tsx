// src/components/layout/main-layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  Settings, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const location = useLocation();

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: LayoutDashboard
    },
    {
      name: 'Business Registration',
      href: '/services/registration',
      icon: Building2
    },
    {
      name: 'Domain & Branding',
      href: '/services/domain',
      icon: Building2
    },
    {
      name: 'Legal Assistant',
      href: '/services/legal',
      icon: Building2
    },
    {
      name: 'Database Insights',
      href: '/services/database-insights',
      icon: Building2
    },
    {
      name: 'Finance',
      href: '/services/finance',
      icon: Building2
    },
    {
      name: 'Marketing',
      href: '/services/marketing',
      icon: Building2
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen transition-transform",
          !isSidebarOpen && "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-card border-r">
          <Link to="/" className="flex items-center mb-8 px-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="ml-2 text-xl font-semibold">SmallBusiness</span>
          </Link>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <HelpCircle className="mr-2 h-5 w-5" />
                Help & Support
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={cn(
        "transition-all duration-200",
        isSidebarOpen ? "md:ml-64" : "md:ml-0",
        "p-4 md:p-8"
      )}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;