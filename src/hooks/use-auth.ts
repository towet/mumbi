// Custom hook for manual authentication
import { useState, useEffect } from 'react';

export type UserData = {
  id: string;
  username: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
  avatar_url?: string;
  full_name?: string;
};

export function useManualAuth() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('mumbi_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (userData.isAuthenticated) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem('mumbi_user');
    setUser(null);
    window.location.reload(); // Reload to reset app state
  };

  // Update user profile
  const updateProfile = (updatedData: Partial<UserData>) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...updatedData
    };
    
    localStorage.setItem('mumbi_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    updateProfile
  };
}
