import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginData, RegisterData } from '../services/auth';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (userData: User, token: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getUser());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isLoggedIn());
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUserLoggedIn = async () => {
      if (authService.isLoggedIn()) {
        try {
          setLoading(true);
          const userData = await authService.getCurrentUser();
          setUser(userData.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          // If token is invalid, clear local storage
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${response.user.name}!`,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      setUser(response.user);
      setIsAuthenticated(true);
      toast({
        title: 'Registration Successful',
        description: `Welcome to TurfX, ${response.user.name}!`,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage.includes('already exists')
          ? 'This email is already registered. Please use a different email or sign in.'
          : (err.response?.data?.message || 'Registration failed. Please try again.'),
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = (userData: User, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    toast({
      title: 'Login Successful',
      description: `Welcome back, ${userData.name}!`,
    });
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      // Even if the API call fails, we still want to clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};