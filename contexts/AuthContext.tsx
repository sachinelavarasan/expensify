import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/lib/secureStorage';
import { clearTokens, onUnauthorized, setTokens as setStoreTokens } from '@/lib/tokenStore';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  isBootstrapping: boolean;
  isSignedIn: boolean;
  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const queryClient = useQueryClient();

  const signOut = async () => {
    clearTokens();
    await clearStoredTokens();
    queryClient.clear();
    setIsSignedIn(false);
  };

  useEffect(() => {
    onUnauthorized(() => {
      signOut();
    });

    (async () => {
      const tokens = await getStoredTokens();
      if (tokens) {
        setStoreTokens(tokens);
        setIsSignedIn(true);
      }
      setIsBootstrapping(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (tokens: AuthTokens) => {
    setStoreTokens(tokens);
    await setStoredTokens(tokens);
    setIsSignedIn(true);
  };

  return (
    <AuthContext.Provider value={{ isBootstrapping, isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
