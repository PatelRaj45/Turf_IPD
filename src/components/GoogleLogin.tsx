import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const GoogleLogin: React.FC<GoogleLoginProps> = ({
  onSuccess,
  onError,
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const { loginWithGoogle } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '480297815057-t2soge6hdpr3asd090mo03kmgcc5f9dr.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
          }
        );
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
    try {
      const { credential } = response;
      
      // Send the ID token to your backend
      const authResponse = await api.post('/api/auth/google', {
        idToken: credential,
      });

      if (authResponse.data.success) {
        // Use the new loginWithGoogle method
        loginWithGoogle(authResponse.data.data, authResponse.data.token);

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.error || 'Google login failed';
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleManualGoogleLogin = async () => {
    try {
      // For development/testing purposes, you can implement a manual flow
      // This would typically redirect to Google OAuth URL
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '480297815057-t2soge6hdpr3asd090mo03kmgcc5f9dr.apps.googleusercontent.com';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/google/callback&response_type=code&scope=email profile`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Manual Google login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Google login is not available',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Google OAuth Button */}
      <div id="google-login-button" className="w-full"></div>
      
      {/* Fallback button for when Google OAuth doesn't load */}
      <Button
        variant={variant}
        size={size}
        className={`w-full ${className}`}
        onClick={handleManualGoogleLogin}
        disabled={!window.google}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
    </div>
  );
};