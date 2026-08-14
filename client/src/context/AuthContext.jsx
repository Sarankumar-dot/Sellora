import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiClient, setAccessToken, getAccessToken } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  sessionExpired: false,
  login: () => {},
  logout: () => {},
  checkAuth: async () => {},
  clearSessionExpired: () => {},
});
let authRefreshPromise = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const queryClient = useQueryClient();

  const updateToken = useCallback((newToken) => {
    setAccessToken(newToken);
    setTokenState(newToken);
  }, []);

  const forceClearAuth = useCallback(() => {
    setUser(null);
    updateToken(null);
    queryClient.clear();
    setSessionExpired(true);
  }, [queryClient, updateToken]);

  const checkAuth = useCallback(async () => {
    try {
      // 1. Try refreshing token via httpOnly cookie first
      let currentToken = getAccessToken();
      if (!currentToken) {
        if (!authRefreshPromise) {
          authRefreshPromise = apiClient.post('/auth/refresh-token').finally(() => {
            authRefreshPromise = null;
          });
        }
        const refreshResponse = await authRefreshPromise;
        const payload = refreshResponse.data?.data || refreshResponse.data;
        currentToken = payload?.token || payload?.accessToken;
        if (currentToken) {
          updateToken(currentToken);
        }
      }

      if (currentToken) {
        // 2. Fetch current user profile
        const userResponse = await apiClient.get('/auth/me');
        const userData = userResponse.data?.data || userResponse.data?.user || userResponse.data;
        setUser(userData);
        setSessionExpired(false);
      } else {
        setUser(null);
        updateToken(null);
      }
    } catch {
      setUser(null);
      updateToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [updateToken]);

  useEffect(() => {
    checkAuth();

    const handleSessionExpired = () => {
      forceClearAuth();
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  }, [checkAuth, forceClearAuth]);

  const login = (newToken, userData) => {
    updateToken(newToken);
    setUser(userData);
    setSessionExpired(false);
    queryClient.invalidateQueries({ queryKey: ['user'] });
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  };

  const logout = async () => {
    setUser(null);
    updateToken(null);
    setSessionExpired(false);
    queryClient.clear();
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        sessionExpired,
        login,
        logout,
        checkAuth,
        clearSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
