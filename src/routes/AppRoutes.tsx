
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Animals from "@/pages/Animals";
import AnimalRegister from "@/pages/AnimalRegister";
import Health from "@/pages/Health";
import Events from "@/pages/Events";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Alerts from "@/pages/Alerts";
import NotFound from "@/pages/NotFound";
import { supabase } from "@/integrations/supabase/client";

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication from both Supabase and localStorage
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Try Supabase auth first
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      
      // Fall back to localStorage if no Supabase session
      try {
        const storedUser = localStorage.getItem('mumbi_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.isAuthenticated) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error("Error checking auth:", e);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  // Redirect to the main page if not authenticated
  if (!isAuthenticated) {
    // The App component will show the auth form
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/animals" element={
        <ProtectedRoute>
          <Animals />
        </ProtectedRoute>
      } />
      <Route path="/animals/register" element={
        <ProtectedRoute>
          <AnimalRegister />
        </ProtectedRoute>
      } />
      <Route path="/health" element={
        <ProtectedRoute>
          <Health />
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      } />
      <Route path="/finance" element={
        <ProtectedRoute>
          <Finance />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute>
          <Alerts />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
