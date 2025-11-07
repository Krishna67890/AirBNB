// src/Context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  
  // Use Vite environment variable (not process.env)
  const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch(`${serverUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [serverUrl]);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }, []);

  // Update user data
  const updateUser = useCallback((updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('userData', JSON.stringify(newUserData));
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Set auth token
  const setAuthToken = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  }, []);

  // Utility functions
  const getDisplayName = useCallback(() => {
    if (!user) return 'Guest';
    return user.fullName || user.name || user.username || user.email?.split('@')[0] || 'User';
  }, [user]);

  const getUserInitials = useCallback(() => {
    if (!user) return 'G';
    if (user.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return getDisplayName().charAt(0).toUpperCase();
  }, [user, getDisplayName]);

  const can = useCallback((action, resource) => {
    if (!isAuthenticated) return false;
    return user?.role === 'admin' || user?.permissions?.includes(`${resource}:${action}`);
  }, [isAuthenticated, user]);

  const isOwner = useCallback((resourceUserId) => {
    return user?._id === resourceUserId || user?.id === resourceUserId;
  }, [user]);

  // Context value
  const value = {
    // Core auth state
    user,
    isAuthenticated,
    loading,
    token,
    serverUrl,
    
    // Auth actions
    login,
    logout,
    updateUser,
    setAuthToken,
    
    // Utility functions
    displayName: getDisplayName(),
    initials: getUserInitials(),
    can,
    isOwner,
  };

  return (
    <AuthContext.Provider value={value}>
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