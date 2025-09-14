
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Helmet } from "react-helmet";
import Index from "./pages/Index";
import { SplashScreen } from "./components/SplashScreen";
import { SupabaseAuthForm } from "./components/auth/SupabaseAuthForm";

const queryClient = new QueryClient();

// Main App component with authentication flow
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Set app as fully loaded with slight delay to ensure smooth transition
    const timer = setTimeout(() => {
      setAppLoaded(true);
    }, 100);
    
    // Check for authentication in localStorage
    const storedUser = localStorage.getItem('mumbi_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.isAuthenticated) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('mumbi_user');
      }
    }
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSplashComplete = () => {
    setShowSplash(false);
    // After splash screen, check if user is logged in
    if (!isAuthenticated) {
      setShowAuth(true);
    }
  };
  
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
  };
  
  return (
    <>
      <Helmet titleTemplate="%s | Mumbi Farm Management" defaultTitle="Mumbi Farm Management System">
        <meta name="description" content="Comprehensive sheep farm management system" />
      </Helmet>
      
      {/* Show splash screen initially */}
      {showSplash && appLoaded && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {/* Show auth form after splash if no user */}
      {!showSplash && showAuth && (
        <SupabaseAuthForm onAuthSuccess={handleAuthSuccess} />
      )}
      
      {/* Only render main app when authenticated and not showing auth or splash */}
      {!showSplash && !showAuth && (
        <Index />
      )}
    </>
  );
}

// Root App component with providers
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Removed AuthProvider since we're using manual auth */}
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
