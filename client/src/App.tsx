import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import React, { useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Route, BrowserRouter as Router, Routes, useNavigate } from 'react-router-dom';
import BlogPostPage from './app/blog/[slug]/page';
import BlogPage from './app/blog/page';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import { Navbar } from './components/navbar';
import ResearchPromptPage from './components/ResearchPromptPage';
import SettingsPage from './components/SettingsPage';
import TablePage from './components/TablePage';
import { ThemeProvider } from './components/theme-provider';
import WaitlistFormPage from './components/WaitlistFormPage';
import { trpc } from './utils/trpc';

export const defaultPage = '/home';
export const LINK_TO_WAITLIST = process.env.REACT_APP_LINK_TO_WAITLIST === 'true'; // Toggle this to control the flow after login

// Add a new ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { data: userData, isLoading } = trpc.auth.getUser.useQuery(
    { token: localStorage.getItem('token') || '' },
    {
      enabled: !!localStorage.getItem('token'),
    }
  );

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    if (!isLoading && userData?.isWaitlisted) {
      navigate('/waitlist-form');
    }
  }, [userData, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

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
      <div className="min-h-screen bg-background text-foreground w-full">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <LandingPage />
              </>
            }
          />
          {/* Protect these routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <ResearchPromptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tables/:id"
            element={
              <ProtectedRoute>
                <TablePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Leave these routes unprotected */}
          {/* <Route
            path="/login"
            element={
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24">
                  <LoginPage />
                </div>
              </>
            }
          /> */}
          <Route
            path="/waitlist-form"
            element={
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24">
                  <WaitlistFormPage />
                </div>
              </>
            }
          />
          <Route
            path="/blog"
            element={
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24">
                  <BlogPage />
                </div>
              </>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <>
                <Navbar />
                <div className="container mx-auto px-4 py-8 pt-24">
                  <BlogPostPage />
                </div>
              </>
            }
          />
        </Routes>
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
            <ThemeProvider defaultTheme="system" storageKey="deeptable-theme">
              <Router>
                <SidebarProvider>
                  <AppContent />
                </SidebarProvider>
              </Router>
            </ThemeProvider>
          </HelmetProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </TooltipProvider>
  );
}

export default App;
