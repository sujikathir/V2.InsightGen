// src/pages/services/domain.tsx
import React, { useState } from 'react';
import { Globe, Search, Check, X, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

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

  const generateDomainSuggestions = (name: string): DomainSuggestion[] => {
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

    prefixes.forEach(prefix => {
      allSuggestions.push({
        domain: prefix + cleanName + '.com',
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 20) + 10,
        type: 'variation'
      });
    });

    suffixes.forEach(suffix => {
      allSuggestions.push({
        domain: cleanName + suffix + '.com',
        available: Math.random() > 0.3,
        price: Math.floor(Math.random() * 20) + 10,
        type: 'variation'
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
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3">
        {suggestion.available ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <X className="w-4 h-4 text-red-500" />
        )}
        <span className="font-medium">{suggestion.domain}</span>
        {suggestion.popular && (
          <Badge variant="secondary" className="text-xs">Popular</Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">${suggestion.price}/year</span>
        {suggestion.available && (
          <Button 
            size="sm" 
            variant="secondary"
            className="h-8 px-3 text-xs whitespace-nowrap"
            onClick={() => setSelectedDomain(suggestion)}
          >
            Select
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Globe className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Domain & Business Name</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Find Your Perfect Domain</CardTitle>
                <CardDescription>
                  Enter your business name to check availability and get suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {/* Search Container - Separate div */}
                <div>
                  <div className="flex space-x-2">
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={!businessName || loading}
                      className="whitespace-nowrap"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Results Container - Separate div outside of search context */}
                <div className="mt-6">
                  {loading && (
                    <div className="text-center py-4">
                      <Progress value={45} className="w-full mb-2" />
                      <p className="text-sm text-gray-600">Checking domain availability...</p>
                    </div>
                  )}

                  {!loading && suggestions.length > 0 && (
                    <Tabs defaultValue="all" className="flex-col  !items-start">
                      <TabsList className="w-full justify-start mb-4">
                        <TabsTrigger value="all">All Domains</TabsTrigger>
                        <TabsTrigger value="available">Available</TabsTrigger>
                        <TabsTrigger value="popular">Popular TLDs</TabsTrigger>
                      </TabsList>

                      <TabsContent value="all">
                        {suggestions.map((suggestion, index) => (
                          <DomainListItem key={index} suggestion={suggestion} />
                        ))}
                      </TabsContent>

                      <TabsContent value="available">
                        <div className="flex flex-col gap-2">
                          {suggestions
                            .filter(s => s.available)
                            .map((suggestion, index) => (
                              <DomainListItem key={index} suggestion={suggestion} />
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="popular">
                        <div className="flex flex-col gap-2">
                          {suggestions
                            .filter(s => s.popular)
                            .map((suggestion, index) => (
                              <DomainListItem key={index} suggestion={suggestion} />
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedDomain && (
              <Card className="flex-col  !items-end">
                <CardHeader className="p-4  flex-col  !items-end">
                  <CardTitle>Selected Domain</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                    <div>
                      <p className="font-medium text-lg">{selectedDomain.domain}</p>
                      <p className="text-sm text-gray-600">Ready for registration</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${selectedDomain.price}/year</p>
                      <Button className="mt-2">
                        Proceed to Register
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 md:space-y-6">
            {nameScore && (
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle>Name Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                        <span className="text-2xl font-bold text-primary">{nameScore.score}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">Name Score</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Length</span>
                        <span>{nameScore.length} characters</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Memorability</span>
                        <span>{nameScore.memorable}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pronunciation</span>
                        <span>{nameScore.pronunciation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Uniqueness</span>
                        <span>{nameScore.uniqueness}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {alternativeNames.length > 0 && (
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle>Alternative Names</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-2">
                    {alternativeNames.map((name, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setBusinessName(name)}
                      >
                        {name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {searchHistory.length > 0 && (
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle>Search History</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-2">
                    {searchHistory.map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 text-sm hover:bg-accent rounded-md"
                      >
                        <span>{name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBusinessName(name)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainService;