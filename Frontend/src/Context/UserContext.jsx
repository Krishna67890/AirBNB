// src/Context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(false);

  // Check online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem('airbnb-user');
    if (savedUser) {
      try {
        setUserData(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('airbnb-user');
      }
    }
  }, []);

  // Login function
  const login = (userData) => {
    setUserData(userData);
    localStorage.setItem('airbnb-user', JSON.stringify(userData));
  };

  // Logout function
  const logout = () => {
    setUserData(null);
    localStorage.removeItem('airbnb-user');
  };

  // Update user data
  const updateUser = (updatedData) => {
    setUserData(prev => {
      const newData = { ...prev, ...updatedData };
      localStorage.setItem('airbnb-user', JSON.stringify(newData));
      return newData;
    });
  };

  // Context value
  const value = {
    userData,
    setUserData,
    isOnline,
    loading,
    setLoading,
    login,
    logout,
    updateUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;