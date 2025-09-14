import { supabase } from "@/integrations/supabase/client";
import { User, Profile } from "@/types/supabase";

/**
 * Utility functions for managing user profiles with Supabase
 */
export const ProfileManager = {
  /**
   * Get the current user's profile from Supabase
   * Falls back to localStorage if Supabase is unavailable
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData?.session?.user) {
        // No active session, check localStorage
        return this.getUserFromLocalStorage();
      }
      
      const userData = sessionData.session.user;
      
      // Fetch profile data
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();
          
        if (profileData) {
          // Use profile data with auth user data
          const user: User = {
            id: userData.id,
            email: userData.email,
            username: profileData.username,
            full_name: profileData.full_name,
            role: profileData.role
          };
          
          // Update localStorage for offline access
          this.saveUserToLocalStorage(user);
          
          return user;
        } else {
          // No profile, build basic user object
          const user: User = {
            id: userData.id,
            email: userData.email,
            username: userData.email?.split('@')[0] || 'user',
            role: 'user'
          };
          
          // Create profile for future use
          await this.createProfile(user);
          
          return user;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Fall back to basic user data
        return {
          id: userData.id,
          email: userData.email,
          username: userData.email?.split('@')[0] || 'user',
          role: 'user'
        };
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      // Last resort - check localStorage
      return this.getUserFromLocalStorage();
    }
  },
  
  /**
   * Update user profile in Supabase and localStorage
   */
  async updateProfile(user: User): Promise<boolean> {
    try {
      if (!user.id) {
        console.error("Cannot update profile without user ID");
        return false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: user.username,
          full_name: user.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Error updating profile in Supabase:", error);
        return false;
      }
      
      // Update in localStorage regardless of Supabase result
      this.saveUserToLocalStorage(user);
      
      return true;
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return false;
    }
  },
  
  /**
   * Create new profile in Supabase
   */
  async createProfile(user: User): Promise<boolean> {
    try {
      if (!user.id) {
        console.error("Cannot create profile without user ID");
        return false;
      }
      
      // Check if profile already exists
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (data) {
        console.log("Profile already exists, updating instead");
        return this.updateProfile(user);
      }
      
      // Create new profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: user.username || user.email?.split('@')[0] || 'user',
          email: user.email || '',
          full_name: user.full_name || '',
          role: user.role || 'user',
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error creating profile in Supabase:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in createProfile:", error);
      return false;
    }
  },
  
  /**
   * Get user from localStorage
   */
  getUserFromLocalStorage(): User | null {
    try {
      const storedUser = localStorage.getItem('mumbi_user');
      if (storedUser) {
        return JSON.parse(storedUser) as User;
      }
      return null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },
  
  /**
   * Save user to localStorage for offline access
   */
  saveUserToLocalStorage(user: User): void {
    try {
      if (user) {
        // Add isAuthenticated flag for consistent checking
        const userData = {
          ...user,
          isAuthenticated: true
        };
        localStorage.setItem('mumbi_user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },
  
  /**
   * Clear user data from localStorage
   */
  clearUserFromLocalStorage(): void {
    try {
      localStorage.removeItem('mumbi_user');
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
};

export default ProfileManager;
