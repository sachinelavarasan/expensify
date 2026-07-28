import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getStoredTokens, setStoredTokens, clearStoredTokens } from '@/lib/secureStorage';
import { clearTokens, onUnauthorized, setTokens as setStoreTokens } from '@/lib/tokenStore';
import { useNotification } from '@/contexts/NotificationContext';
import { useEnableNotificationToken, useDisableNotificationToken } from '@/hooks/useSettings';

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
  const { expoPushToken } = useNotification();
  const { mutate: enableNotificationToken } = useEnableNotificationToken();
  const { mutateAsync: disableNotificationToken } = useDisableNotificationToken();

  const signOut = async () => {
    if (expoPushToken) {
      try {
        await disableNotificationToken(expoPushToken);
      } catch (error) {
        console.error('Failed to disable notification token on sign out:', error);
      }
    }
    clearTokens();
    await clearStoredTokens();
    queryClient.clear();
    setIsSignedIn(false);
  };

  useEffect(() => {
    if (isSignedIn && expoPushToken) {
      enableNotificationToken({ token: expoPushToken });
    }
  }, [isSignedIn, expoPushToken, enableNotificationToken]);

  const signOutRef = useRef(signOut);
  useEffect(() => {
    signOutRef.current = signOut;
  });

  useEffect(() => {
    onUnauthorized(() => {
      signOutRef.current();
    });

    (async () => {
      const tokens = await getStoredTokens();
      if (tokens) {
        setStoreTokens(tokens);
        setIsSignedIn(true);
      }
      setIsBootstrapping(false);
    })();
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
