// src/components/common/Navigation/Nav.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUser } from "../../../Context/UserContext.jsx";
import { useAuth } from '../../../Context/AuthContext.jsx';
import { useUI } from '../../../Context/UIContext.jsx';
import ThemeToggle from '../ThemeToggle';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use custom hooks instead of useContext directly
  const { userData } = useUser();
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useUI();
  
  // State variables
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Navigation items
  const navigationItems = useMemo(() => [
    { 
      path: '/', 
      label: 'Home', 
      icon: '🏠',
      requiresAuth: false 
    },
    { 
      path: '/explore', 
      label: 'Explore', 
      icon: '🌍',
      requiresAuth: false 
    },
    { 
      path: '/mylisting', 
      label: 'My Listings', 
      icon: '📋', 
      requiresAuth: true,
    }
  ], []);

  // Filter navigation based on authentication
  const filteredNavItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (item.requiresAuth && !isAuthenticated) return false;
      return true;
    });
  }, [navigationItems, isAuthenticated]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    setIsDropdownOpen(false);
    navigate('/signup', { 
      state: { 
        fromLogout: true,
        message: 'You have been logged out successfully. Sign up to continue your journey!'
      }
    });
  }, [logout, navigate]);

  // Active route detection
  const isActiveRoute = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  // User menu items
  const userMenuItems = useMemo(() => [
    { label: 'Profile', icon: '👤', path: '/profile' },
    { label: 'Account Settings', icon: '⚙️', path: '/settings' },
    { 
      label: 'Logout', 
      icon: '🚪', 
      action: handleLogout,
      isLogout: true
    }
  ], [handleLogout]);

  return (
    <nav className={`w-full bg-white dark:bg-gray-900 transition-all duration-300 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 py-4 ${
      isScrolled ? 'shadow-lg' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="text-2xl font-bold text-rose-500">Airbnb</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActiveRoute(item.path)
                    ? 'text-rose-600 bg-rose-50 border border-rose-200'
                    : 'text-gray-600 hover:text-rose-500 hover:bg-rose-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-2 rounded-full border border-gray-200 hover:shadow-md transition-all hover:border-rose-300"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-600 text-sm hidden sm:block">
                    {userData?.name || 'User'}
                  </span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-600">
                      <div className="text-sm font-semibold text-gray-800 dark:text-white">
                        {userData?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData?.email || 'user@example.com'}
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    {userMenuItems.map((item) => (
                      item.isLogout ? (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-600 mt-2"
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup"
                  className="px-5 py-2 bg-rose-500 text-white text-sm font-medium rounded-full hover:bg-rose-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nav;