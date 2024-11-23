import React, { useState } from 'react';
import { Globe, Search, Check, X, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// Types remain the same as your original code
interface DomainSuggestion {
  domain: string;
  available: boolean;
  price: number;
  popular?: boolean;
  type: 'primary' | 'variation';
}

interface NameScore {
  score: number;
  length: number;
  memorable: string;
  pronunciation: string;
  uniqueness: string;
}

const DomainService = () => {
  const [businessName, setBusinessName] = useState('');
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainSuggestion | null>(null);
  const [nameScore, setNameScore] = useState<NameScore | null>(null);
  const [alternativeNames, setAlternativeNames] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Your existing helper functions remain the same
  const generateDomainSuggestions = (name: string): DomainSuggestion[] => {
    // ... (keep existing implementation)
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const tlds = ['.com', '.net', '.org', '.io', '.co', '.biz'];
    const prefixes = ['get', 'use', 'try', 'join'];
    const suffixes = ['app', 'web', 'site', 'hub'];
    
    let allSuggestions: DomainSuggestion[] = [];

    tlds.forEach(tld => {
      allSuggestions.push({
        domain: cleanName + tld,
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 30) + 10,
        popular: tld === '.com',
        type: 'primary'
      });
    });

    return allSuggestions;
  };

  const analyzeBusinessName = (name: string): NameScore => {
    return {
      score: Math.floor(Math.random() * 40) + 60,
      length: name.length,
      memorable: name.length <= 10 ? 'Good' : 'Too Long',
      pronunciation: name.length <= 12 ? 'Easy' : 'Complex',
      uniqueness: Math.random() > 0.5 ? 'Unique' : 'Common'
    };
  };

  const generateAlternativeNames = (name: string): string[] => {
    const alternatives = [];
    const suffixes = ['Hub', 'Pro', 'Plus', 'Go', 'Now'];
    
    for (let i = 0; i < 5; i++) {
      alternatives.push(name + ' ' + suffixes[i]);
    }

    return alternatives;
  };

  const handleSearch = () => {
    if (!businessName.trim()) return;

    setLoading(true);
    setSearchHistory(prev => [...new Set([...prev, businessName])]);

    setTimeout(() => {
      const suggestions = generateDomainSuggestions(businessName);
      setSuggestions(suggestions);
      setNameScore(analyzeBusinessName(businessName));
      setAlternativeNames(generateAlternativeNames(businessName));
      setLoading(false);
    }, 1500);
  };

  const DomainListItem = ({ suggestion }: { suggestion: DomainSuggestion }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="flex items-center gap-4 relative z-10">
          {suggestion.available ? (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-4 h-4 text-red-600" />
            </div>
          )}
          <div>
            <span className="font-medium text-lg">{suggestion.domain}</span>
            {suggestion.popular && (
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Popular
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <span className="text-lg font-semibold text-gray-700">${suggestion.price}/year</span>
          {suggestion.available && (
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setSelectedDomain(suggestion)}
            >
              Select
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4"
        >
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Find Your Perfect Domain
            </h1>
            <p className="text-gray-600 mt-2">Discover and secure your ideal online presence</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <CardTitle>Domain Search</CardTitle>
                </div>
                <CardDescription>Enter your business name to check availability</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                    className="pr-32 h-12 text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={!businessName || loading}
                    className="absolute right-1 top-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-10"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {loading && (
                  <div className="text-center py-8">
                    <Progress value={45} className="w-full h-2 mb-4" />
                    <p className="text-gray-600">Searching for available domains...</p>
                  </div>
                )}

                {!loading && suggestions.length > 0 && (
                  <div className="mt-6">
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="w-full justify-start mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-1">
                        <TabsTrigger value="all">All Domains</TabsTrigger>
                        <TabsTrigger value="available">Available</TabsTrigger>
                        <TabsTrigger value="popular">Popular TLDs</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all" className="space-y-4">
                        {suggestions.map((suggestion, index) => (
                          <DomainListItem key={index} suggestion={suggestion} />
                        ))}
                      </TabsContent>

                      <TabsContent value="available" className="space-y-4">
                        {suggestions
                          .filter(s => s.available)
                          .map((suggestion, index) => (
                            <DomainListItem key={index} suggestion={suggestion} />
                          ))}
                      </TabsContent>

                      <TabsContent value="popular" className="space-y-4">
                        {suggestions
                          .filter(s => s.popular)
                          .map((suggestion, index) => (
                            <DomainListItem key={index} suggestion={suggestion} />
                          ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedDomain && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-green-500/10 to-blue-500/10">
                    <CardTitle>Selected Domain</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between p-6 rounded-lg bg-gradient-to-r from-green-500/5 to-blue-500/5">
                      <div>
                        <p className="text-2xl font-semibold text-gray-900">{selectedDomain.domain}</p>
                        <p className="text-gray-600 mt-1">Ready for registration</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${selectedDomain.price}/year</p>
                        <Button className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                          Proceed to Register
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            {nameScore && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <CardTitle>Name Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                          <span className="text-3xl font-bold text-white">{nameScore.score}</span>
                        </div>
                        <p className="mt-2 text-gray-600">Name Score</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { label: 'Length', value: `${nameScore.length} characters` },
                          { label: 'Memorability', value: nameScore.memorable },
                          { label: 'Pronunciation', value: nameScore.pronunciation },
                          { label: 'Uniqueness', value: nameScore.uniqueness }
                        ].map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                            <span className="text-gray-600">{item.label}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {alternativeNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <CardTitle>Alternative Names</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {alternativeNames.map((name, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5"
                          onClick={() => setBusinessName(
                            name)}
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {searchHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="p-6 bg-gradient-to-r from-pink-500/10 to-orange-500/10">
                    <CardTitle>Search History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {searchHistory.map((name, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group"
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-pink-500/5 hover:to-orange-500/5 transition-all duration-300">
                            <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                              {name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              onClick={() => setBusinessName(name)}
                            >
                              <RefreshCw className="w-4 h-4 text-gray-600 hover:text-gray-900" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>
    </div>
  );
};

export default DomainService;