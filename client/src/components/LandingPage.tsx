import { ArrowRight, Eye, GitFork, Star } from "lucide-react";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface LandingPageProps {
  landingPageKeyword?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ landingPageKeyword }) => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  
  // Use the keyword if provided, otherwise use default text
  const keywordText = landingPageKeyword ? landingPageKeyword.toUpperCase() : 'AI';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Store the prompt in local storage
      localStorage.setItem('imagePrompt', prompt.trim());
      // Store the keyword if available
      if (landingPageKeyword) {
        localStorage.setItem('imageModel', landingPageKeyword);
      }
      // Navigate to login page
      navigate('/login');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">

      {/* hero section */}
      <div className="w-full text-center py-16 md:py-24 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span>Generate and fill a Table with </span>
          <span className="text-[#4169E1]">{keywordText}</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Intelligent web research assistant that helps you make informed decisions. 
          From travel planning to product research, we analyze the web to give you 
          comprehensive, unbiased insights.
        </p>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-4 mt-8">
          <div className="w-full relative flex items-center">
            <Input
              type="text"
              placeholder="What would you like to research?"
              className="w-full h-14 pr-24 text-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-2 bg-[#4169E1] hover:bg-[#3a5ecc] text-white px-6"
            >
              <span className="flex items-center">
                Research
                <ArrowRight className="h-5 w-5 ml-2" />
              </span>
            </Button>
          </div>
        </form>
      </div>

      {/* Use cases section */}
      <Card className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Make Better Decisions with Comprehensive Research</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg">Travel Planning & Destinations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg">Product Research & Comparisons</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <GitFork className="h-5 w-5 text-primary" />
                </div>
                <span className="text-lg">Business Software Selection</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-0 md:px-0">
        <Card>
          <CardHeader>
            <CardTitle>Smart Research Assistant</CardTitle>
            <CardDescription>
              Our AI analyzes thousands of web sources to provide comprehensive insights.
              Perfect for travel planning, product research, and business decisions.
              Get unbiased, data-driven recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/research-demo">
              <Button className="w-full md:w-auto">Try Demo Research</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Research Projects</CardTitle>
            <CardDescription>
              Need deeper insights? Our platform can handle complex research queries
              like real estate investment analysis, institution comparisons,
              and market research reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/custom-research">
              <Button className="w-full md:w-auto">Start Custom Research</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    
    {/* footer section */}
    <div className="flex flex-row items-center justify-center mt-12 mb-8">
      <p className="text-muted-foreground">© 2025 Research AI Inc.</p>
    </div>
    </div>
  );
};

export default LandingPage;