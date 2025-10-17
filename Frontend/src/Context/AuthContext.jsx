// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

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
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (userData, authToken) => {
    try {
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  // Update user data
  const updateUser = useCallback(async (updatedData) => {
    try {
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: error.message };
    }
  }, [user]);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || user?.role === role;
  }, [user]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission);
  }, [user]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return { success: true, token: data.token };
      } else {
        logout();
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return { success: false, error: error.message };
    }
  }, [token, logout]);

  // Utility functions that don't depend on the hook
  const getDisplayName = () => {
    if (!user) return 'Guest';
    return user.fullName || user.name || user.username || user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
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
  };

  const can = (action, resource) => {
    if (!isAuthenticated) return false;
    return hasPermission(`${resource}:${action}`) || hasRole('admin');
  };

  const isOwner = (resourceUserId) => {
    return user?._id === resourceUserId || user?.id === resourceUserId;
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return null;
    return new Date(user.createdAt).toLocaleDateString();
  };

  // Value to be provided by context
  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    updateUser,
    hasRole,
    hasPermission,
    refreshToken,
    // Include utility functions in context
    displayName: getDisplayName(),
    initials: getUserInitials(),
    joinDate: getJoinDate(),
    can,
    isOwner
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export the context itself
export { AuthContext };

// Export as default
export default AuthContext;