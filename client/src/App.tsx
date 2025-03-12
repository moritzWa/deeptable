import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import BlogPostPage from './app/blog/[slug]/page';
import BlogPage from './app/blog/page';
import { ContributorScraper } from './components/ContributorScraper';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { Navbar } from './components/navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import RelatedDevelopersScraper from './components/RelatedDevelopersScraper';
import ResearchPromptPage from './components/ResearchPromptPage';
import SettingsPage from './components/SettingsPage';
import { trpc } from './utils/trpc';

export const defaultPage = "/related-developers-scraper";

function AppContent() {
  return (
    <>
      <Helmet>
        <title>Deep Table</title>
        <meta name="description" content="Generate tables of valuable data." />
        <meta property="og:title" content="Deep Table" />
        <meta property="og:description" content="Generate tables of valuable data." />
        <meta name="twitter:title" content="Deep Table" />
        <meta name="twitter:description" content="Generate tables of valuable data." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-24">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sdxl" element={<LandingPage landingPageKeyword="sdxl" />} />
            <Route path="/stable-diffusion-xl" element={<LandingPage landingPageKeyword="stable-diffusion-xl" />} />
            <Route path="/new" element={<ResearchPromptPage />} />
            <Route 
              path="/related-developers-scraper" 
              element={
                <ProtectedRoute>
                  <RelatedDevelopersScraper />
                </ProtectedRoute>
              } 
            />
            <Route path="/contributors-scraper" element={
              <ProtectedRoute>
                <ContributorScraper />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'}/trpc`,
        }),
      ],
    })
  );

  return (
    <TooltipProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <Router>
              <AppContent />
            </Router>
          </HelmetProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </TooltipProvider>
  );
}

export default App;
