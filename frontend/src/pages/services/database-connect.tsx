// src/pages/services/database-connect.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DatabaseConnect = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });

  const handleConnect = async (e) => {
    e.preventDefault();
    // Handle database connection here
    // If successful, redirect to insights page
    navigate('/services/database-insights');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Database className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">Connect Your Database</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input 
                      id="host"
                      placeholder="localhost"
                      value={formData.host}
                      onChange={(e) => setFormData({...formData, host: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input 
                      id="port"
                      placeholder="5432"
                      value={formData.port}
                      onChange={(e) => setFormData({...formData, port: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="database">Database Name</Label>
                  <Input 
                    id="database"
                    placeholder="Enter database name"
                    value={formData.database}
                    onChange={(e) => setFormData({...formData, database: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Connect to Database
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseConnect;