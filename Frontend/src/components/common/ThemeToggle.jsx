// src/components/common/Theme/ThemeToggle.jsx
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { UIContext } from "../../Context/UIContext.jsx";
import './ThemeToggle.css';

const ThemeToggle = ({ 
  variant = 'default', 
  size = 'medium',
  showLabel = false,
  animated = true,
  persistPreference = true 
}) => {
  const { theme, toggleTheme, setTheme } = useContext(UIContext);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Set mounted to true after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      if (persistPreference) {
        try {
          // Try to load from localStorage
          const savedTheme = localStorage.getItem('theme');
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle('dark', savedTheme === 'dark');
          }
        } catch (error) {
          console.warn('Failed to load theme preference:', error);
        }
      }
    };

    loadTheme();
  }, [persistPreference, setTheme]);

  // Enhanced theme toggle with animations and persistence
  const handleThemeToggle = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsPressed(true);

    try {
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const newTheme = theme === 'light' ? 'dark' : 'light';
      
      // Update theme in context
      toggleTheme();

      // Persist to localStorage
      if (persistPreference) {
        localStorage.setItem('theme', newTheme);
      }

      // Update document class for Tailwind dark mode
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('themeChange', { 
        detail: { theme: newTheme } 
      }));

      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'theme_toggle', {
          event_category: 'ui_interaction',
          event_label: newTheme
        });
      }

    } catch (error) {
      console.error('Failed to toggle theme:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsPressed(false), 200);
    }
  }, [theme, toggleTheme, persistPreference, isLoading]);

  // Keyboard accessibility
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleThemeToggle();
    }
  }, [handleThemeToggle]);

  // Size variants
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
    xlarge: 'w-14 h-14 text-xl'
  };

  // Variant styles
  const variantClasses = {
    default: `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 
              hover:border-gray-300 dark:hover:border-gray-500 
              shadow-sm hover:shadow-md`,
    minimal: `bg-transparent border border-transparent 
              hover:bg-gray-100 dark:hover:bg-gray-800`,
    filled: `bg-gradient-to-r from-rose-500 to-orange-400 text-white 
             shadow-lg hover:shadow-xl`,
    outline: `bg-transparent border-2 border-rose-500 text-rose-500 
              hover:bg-rose-50 dark:hover:bg-rose-900/20`,
    advanced: `bg-transparent` // Added for the advanced variant
  };

  // Animation classes
  const animationClasses = animated ? 
    'transition-all duration-300 ease-in-out transform' : '';

  // Press effect
  const pressEffect = isPressed ? 'scale-95' : 'hover:scale-105';

  // Don't render until mounted (SSR compatibility)
  if (!mounted) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 animate-pulse`} />
    );
  }

  // Mobile variant
  if (variant === 'mobile') {
    return (
      <button
        onClick={handleThemeToggle}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-left 
                   bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                   ${animationClasses} transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <div className={`flex items-center justify-center rounded-full bg-white dark:bg-gray-700 
                        ${sizeClasses.medium} shadow-sm border border-gray-200 dark:border-gray-600
                        ${animationClasses}`}>
          <span className={`transform transition-transform duration-500 ${
            theme === 'light' ? 'rotate-0 scale-100' : 'rotate-180 scale-110'
          }`}>
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Switch to {theme === 'light' ? 'dark' : 'light'} theme
          </div>
        </div>
        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
          theme === 'light' ? 'bg-gray-300' : 'bg-rose-500'
        }`}>
          <div className={`bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
            theme === 'light' ? 'translate-x-0' : 'translate-x-6'
          } ${sizeClasses.small}`} />
        </div>
      </button>
    );
  }

  // Advanced toggle with slider (alternative design)
  if (variant === 'advanced') {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ☀️
        </span>
        <div 
          onClick={handleThemeToggle}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
            theme === 'light' ? 'bg-gray-300' : 'bg-rose-500'
          } ${animationClasses}`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className={`
            bg-white rounded-full shadow-lg transform transition-transform duration-300
            ${theme === 'light' ? 'translate-x-0' : 'translate-x-7'}
            ${sizeClasses.small}
          `} />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          🌙
        </span>
      </div>
    );
  }

  // Default toggle with multiple variants
  return (
    <div className="relative inline-block">
      <button
        onClick={handleThemeToggle}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        disabled={isLoading}
        className={`
          relative flex items-center justify-center rounded-full
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${animationClasses}
          ${pressEffect}
          focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          group
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-pressed={theme === 'dark'}
        role="switch"
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-spin rounded-full border-2 border-rose-500 border-t-transparent ${
              size === 'small' ? 'w-4 h-4' :
              size === 'medium' ? 'w-5 h-5' :
              size === 'large' ? 'w-6 h-6' : 'w-7 h-7'
            }`} />
          </div>
        )}

        {/* Theme icons with advanced animations */}
        <div className={`relative w-full h-full flex items-center justify-center ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200`}>
          
          {/* Sun icon */}
          <span className={`absolute transform transition-all duration-500 ease-in-out ${
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          }`}>
            ☀️
          </span>
          
          {/* Moon icon */}
          <span className={`absolute transform transition-all duration-500 ease-in-out ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`}>
            🌙
          </span>

          {/* Particle effects on hover */}
          {isHovered && !isLoading && (
            <>
              <div className="absolute inset-0 rounded-full bg-rose-500/10 animate-ping" />
              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500/20 to-orange-400/20 ${
                theme === 'light' ? 'opacity-30' : 'opacity-50'
              } blur-sm transition-opacity duration-300`} />
            </>
          )}
        </div>

        {/* Ripple effect on click */}
        {isPressed && (
          <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ripple" />
        )}
      </button>

      {/* Tooltip */}
      {showLabel && (
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 mt-2
          px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none whitespace-nowrap z-50
        `}>
          {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
        </div>
      )}
    </div>
  );
};

// Higher Order Component for theme-aware components
export const withTheme = (Component) => {
  return function ThemeAwareComponent(props) {
    const { theme } = useContext(UIContext);
    return <Component {...props} theme={theme} />;
  };
};

// Custom hook for theme functionality
export const useTheme = () => {
  const context = useContext(UIContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a UIProvider');
  }

  const { theme, toggleTheme, setTheme } = context;

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  const themeClass = useCallback((lightClass, darkClass) => {
    return theme === 'light' ? lightClass : darkClass;
  }, [theme]);

  const applyThemeStyles = useCallback((styles) => {
    return {
      ...styles.light,
      ...(theme === 'dark' ? styles.dark : {})
    };
  }, [theme]);

  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setTheme,
    themeClass,
    applyThemeStyles
  };
};

export default React.memo(ThemeToggle);