// Define types for our database tables

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  role?: string;
  isAuthenticated?: boolean;
}

// Extend the User type with auth properties
export interface AuthenticatedUser extends User {
  isAuthenticated: true;
}
