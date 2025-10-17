// src/context/UIContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Create the context
const UIContext = createContext();

// UI Provider Component
export const UIProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme } 
    }));
  }, [theme]);

  // Set theme directly
  const setThemeDirect = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  // Show toast notification
  const showToast = useCallback(({ 
    type = 'info', 
    title, 
    message, 
    duration = 5000 
  }) => {
    const id = Date.now().toString();
    const newToast = { id, type, title, message, duration };
    
    setToast(newToast);

    // Auto hide after duration
    if (duration > 0) {
      setTimeout(() => {
        setToast(current => current?.id === id ? null : current);
      }, duration);
    }

    return id;
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Show modal
  const showModal = useCallback(({ 
    component, 
    props = {}, 
    size = 'md',
    closable = true 
  }) => {
    setModal({ component, props, size, closable });
  }, []);

  // Hide modal
  const hideModal = useCallback(() => {
    setModal(null);
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  // Toggle notifications
  const toggleNotifications = useCallback(() => {
    setNotificationsOpen(prev => !prev);
  }, []);

  // Set loading state
  const setLoadingState = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Context value
  const value = {
    // State
    theme,
    sidebarOpen,
    modal,
    toast,
    loading,
    mobileMenuOpen,
    notificationsOpen,
    
    // Actions
    toggleTheme,
    setTheme: setThemeDirect,
    showToast,
    hideToast,
    showModal,
    hideModal,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    toggleNotifications,
    setNotificationsOpen,
    setLoading: setLoadingState,
    
    // Computed
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook to use UI context
export const useUI = () => {
  const context = useContext(UIContext);
  
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  
  return context;
};

// Export the context itself
export { UIContext };

// Export as default
export default UIContext;