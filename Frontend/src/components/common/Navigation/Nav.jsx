// src/components/common/Navigation/Nav.jsx - ADVANCED VERSION
import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { UserDataContext } from "../../../Context/Usercontext.jsx";
import { AuthContext } from '../../../Context/AuthContext.jsx';
import { UIContext } from '../../../Context/UIContext.jsx';
import SearchBar from '../SearchBar.jsx';
import NotificationBell from '../NotificationBell';
import ThemeToggle from '../ThemeToggle';

function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, updateUserData } = useContext(UserDataContext);
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const { theme, toggleTheme, showToast, setModal } = useContext(UIContext);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Enhanced navigation items with permissions and analytics
  const navigationItems = useMemo(() => [
    { 
      path: '/', 
      label: 'Home', 
      icon: '🏠',
      analytics: 'home_nav_click',
      requiresAuth: false 
    },
    { 
      path: '/explore', 
      label: 'Explore', 
      icon: '🌍',
      analytics: 'explore_nav_click',
      requiresAuth: false 
    },
    { 
      path: '/mylisting', 
      label: 'My Listings', 
      icon: '📋', 
      analytics: 'my_listings_nav_click',
      requiresAuth: true,
      requiredRole: 'host'
    },
    { 
      path: '/favorites', 
      label: 'Favorites', 
      icon: '❤️', 
      analytics: 'favorites_nav_click',
      requiresAuth: true 
    },
    { 
      path: '/trips', 
      label: 'Trips', 
      icon: '✈️', 
      analytics: 'trips_nav_click',
      requiresAuth: true 
    },
    { 
      path: '/messages', 
      label: 'Messages', 
      icon: '💬', 
      analytics: 'messages_nav_click',
      requiresAuth: true,
      badge: unreadCount > 0 ? unreadCount : null
    }
  ], [unreadCount]);

  // Filtered navigation based on user permissions
  const filteredNavItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (item.requiresAuth && !isAuthenticated) return false;
      if (item.requiredRole && userData?.role !== item.requiredRole) return false;
      return true;
    });
  }, [navigationItems, isAuthenticated, userData?.role]);

  // Enhanced scroll effect with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Advanced click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Keyboard navigation support
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Enhanced logout with confirmation
  const handleLogout = useCallback(async () => {
    setModal({
      type: 'confirmation',
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout?',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await logout();
          setIsDropdownOpen(false);
          setIsMobileMenuOpen(false);
          showToast({
            type: 'success',
            title: 'Logged out successfully',
            message: 'Hope to see you again soon!',
            duration: 3000
          });
          navigate('/');
        } catch (error) {
          showToast({
            type: 'error',
            title: 'Logout failed',
            message: 'Please try again',
            duration: 5000
          });
        }
      }
    });
  }, [logout, navigate, setModal, showToast]);

  // Enhanced navigation with analytics
  const handleNavigation = useCallback((path, analyticsEvent) => {
    // Track navigation in analytics
    if (analyticsEvent && window.gtag) {
      window.gtag('event', analyticsEvent, {
        event_category: 'navigation',
        event_label: path
      });
    }
    
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [navigate]);

  // Active route detection with multiple segments
  const isActiveRoute = useCallback((path) => {
    if (path === '/') return location.pathname === '/';
    
    // Handle nested routes
    if (path === '/host') {
      return location.pathname.startsWith('/host');
    }
    
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  // Search functionality
  const handleSearch = useCallback((searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchOpen(false);
    }
  }, [navigate]);

  // User menu items
  const userMenuItems = useMemo(() => [
    { label: 'Profile', icon: '👤', path: '/profile', action: () => handleNavigation('/profile', 'profile_nav_click') },
    { label: 'Account Settings', icon: '⚙️', path: '/settings', action: () => handleNavigation('/settings', 'settings_nav_click') },
    { label: 'Payment Methods', icon: '💳', path: '/payments', action: () => handleNavigation('/payments', 'payments_nav_click') },
    { label: 'Security', icon: '🔒', path: '/security', action: () => handleNavigation('/security', 'security_nav_click') },
    { label: 'Help Center', icon: '❓', path: '/help', action: () => handleNavigation('/help', 'help_nav_click') },
  ], [handleNavigation]);

  return (
    <>
      <nav 
        className={`w-full bg-white dark:bg-gray-900 transition-all duration-300 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 ${
          isScrolled ? 'shadow-lg py-2' : 'shadow-sm py-4'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center flex-1 min-w-0">
              <Link 
                to="/"
                className="flex items-center group outline-none rounded-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label="Airbnb Home"
                onClick={() => handleNavigation('/', 'logo_click')}
              >
                <div className="relative">
                  <span className="text-2xl font-bold text-rose-500 transition-all duration-300 group-hover:scale-105 group-hover:text-rose-600">
                    🏠 Airbnb
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-500 transition-all duration-300 group-hover:w-full"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                {filteredNavItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path, item.analytics)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'text-rose-600 bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                    aria-current={isActiveRoute(item.path) ? 'page' : undefined}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center justify-end flex-1 min-w-0 gap-2">
              {/* Search Bar */}
              <div className="hidden md:block" ref={searchRef}>
                <SearchBar 
                  onSearch={handleSearch}
                  isExpanded={searchOpen}
                  onExpand={() => setSearchOpen(true)}
                  onCollapse={() => setSearchOpen(false)}
                />
              </div>

              {/* Host Button */}
              {isAuthenticated && userData?.role === 'host' && (
                <button
                  onClick={() => handleNavigation('/host', 'become_host_click')}
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span>🏡</span>
                  <span>Host</span>
                </button>
              )}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              {isAuthenticated && (
                <NotificationBell 
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={(id) => {
                    // Handle mark as read
                    setNotifications(prev => 
                      prev.map(notif => 
                        notif.id === id ? { ...notif, read: true } : notif
                      )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                  }}
                />
              )}

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-full border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <svg 
                        className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Enhanced Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 py-3 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {userData?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {userData?.email || ''}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 text-xs rounded-full">
                              {userData?.role || 'User'}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                              Verified
                            </span>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="py-2">
                          {userMenuItems.slice(0, 3).map((item) => (
                            <button 
                              key={item.label}
                              onClick={item.action}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                          {userMenuItems.slice(3).map((item) => (
                            <button 
                              key={item.label}
                              onClick={item.action}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 group"
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                              <span>{item.label}</span>
                            </button>
                          ))}
                          
                          <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-150 group mt-2"
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform duration-200">🚪</span>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleNavigation('/login', 'login_nav_click')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={() => handleNavigation('/signup', 'signup_nav_click')}
                      className="px-5 py-2 bg-rose-500 text-white text-sm font-medium rounded-full hover:bg-rose-600 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                aria-label="Open menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1">
                  <span className={`w-full h-0.5 bg-current transition-all duration-200 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}></span>
                  <span className={`w-full h-0.5 bg-current transition-all duration-200 ${
                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}></span>
                  <span className={`w-full h-0.5 bg-current transition-all duration-200 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3" ref={searchRef}>
            <SearchBar 
              onSearch={handleSearch}
              isExpanded={searchOpen}
              onExpand={() => setSearchOpen(true)}
              onCollapse={() => setSearchOpen(false)}
              compact={true}
            />
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div 
            ref={mobileMenuRef}
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-rose-500">🏠 Airbnb</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors duration-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close menu"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                
                {/* User Info in Mobile */}
                {isAuthenticated && userData && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                        {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{userData.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userData.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-4">
                  {filteredNavItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path, item.analytics)}
                      className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                        isActiveRoute(item.path)
                          ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                      <span className="text-lg font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="w-6 h-6 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-gray-400 group-hover:text-rose-500 transition-colors">›</span>
                    </button>
                  ))}
                </nav>

                {/* User Menu Items in Mobile */}
                {isAuthenticated && (
                  <div className="mt-8 px-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-4">
                      Account
                    </h3>
                    <div className="space-y-1">
                      {userMenuItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-base">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {!isAuthenticated ? (
                  <>
                    <button 
                      onClick={() => handleNavigation('/login', 'mobile_login_click')}
                      className="w-full py-3 text-center text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-xl hover:border-rose-300 dark:hover:border-rose-400 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Log in
                    </button>
                    <button 
                      onClick={() => handleNavigation('/signup', 'mobile_signup_click')}
                      className="w-full py-3 text-center bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors duration-200 shadow-sm hover:shadow-md"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 text-center text-red-600 dark:text-red-400 font-medium border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900 transition-colors duration-200"
                  >
                    Logout
                  </button>
                )}
                
                {/* Theme Toggle in Mobile */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <ThemeToggle variant="mobile" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(Nav);