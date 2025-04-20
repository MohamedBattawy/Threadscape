"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createUser, getCurrentUser, loginUser, logoutUser } from "../utils/api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.data);
      } catch {
        // User is not logged in - we ignore the error
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await loginUser({ email, password });
      setUser(data.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address?: string;
    city?: string;
    country?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      await createUser(data);
      // Successful registration doesn't automatically log in the user
      // They'll need to login after registration
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 