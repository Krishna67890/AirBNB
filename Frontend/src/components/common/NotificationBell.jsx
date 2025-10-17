// src/components/common/Notification/NotificationBell.jsx
import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UIContext } from "../../Context/UIContext";
import { AuthContext } from '../../Context/AuthContext.jsx';
import { UserDataContext } from '../../Context/Usercontext.jsx';
import './NotificationBell.css';

const NotificationBell = ({ 
  variant = 'default',
  size = 'medium',
  maxNotifications = 10,
  autoMarkRead = false,
  showCount = true,
  pollingInterval = 30000, // 30 seconds
  enableSounds = false,
  position = 'bottom-right'
}) => {
  const navigate = useNavigate();
  const { showToast, setModal } = useContext(UIContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const { userData } = useContext(UserDataContext);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [playSound, setPlaySound] = useState(false);

  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);
  const websocketRef = useRef(null);

  // Notification types configuration
  const notificationTypes = useMemo(() => ({
    booking: {
      icon: '🏠',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      action: 'view_booking'
    },
    message: {
      icon: '💬',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      action: 'view_messages'
    },
    review: {
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      action: 'view_reviews'
    },
    system: {
      icon: '🔔',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      action: 'view_system'
    },
    payment: {
      icon: '💳',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      action: 'view_payments'
    },
    security: {
      icon: '🔒',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      action: 'view_security'
    },
    promotion: {
      icon: '🎉',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      action: 'view_promotions'
    }
  }), []);

  // Size variants
  const sizeClasses = useMemo(() => ({
    small: {
      bell: 'w-8 h-8 text-sm',
      badge: 'w-4 h-4 text-xs -top-1 -right-1',
      dropdown: 'w-80'
    },
    medium: {
      bell: 'w-10 h-10 text-base',
      badge: 'w-5 h-5 text-xs -top-1 -right-1',
      dropdown: 'w-96'
    },
    large: {
      bell: 'w-12 h-12 text-lg',
      badge: 'w-6 h-6 text-sm -top-1.5 -right-1.5',
      dropdown: 'w-108'
    }
  }), []);

  // Variant styles
  const variantClasses = useMemo(() => ({
    default: 'bg-white hover:bg-gray-50 border border-gray-200',
    minimal: 'bg-transparent border border-transparent hover:bg-gray-100',
    filled: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'bg-transparent border-2 border-rose-500 text-rose-500 hover:bg-rose-50'
  }), []);

  // Position classes
  const positionClasses = useMemo(() => ({
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2'
  }), []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) return;

    if (showLoading) setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setLastChecked(new Date());
        
        // Play sound for new notifications
        if (enableSounds && data.newNotifications > 0) {
          setPlaySound(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setConnectionStatus('disconnected');
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to fetch notifications'
      });
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [isAuthenticated, enableSounds, showToast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId, markAll = false) => {
    try {
      if (markAll) {
        // Mark all as read
        await fetch('/api/notifications/mark-all-read', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
        
        showToast({
          type: 'success',
          title: 'All notifications marked as read',
          duration: 3000
        });
      } else {
        // Mark single as read
        await fetch(`/api/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not mark notification as read'
      });
    }
  }, [showToast]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read if autoMarkRead is enabled
    if (autoMarkRead && !notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    const navigateMap = {
      booking: `/bookings/${notification.data?.bookingId}`,
      message: `/messages/${notification.data?.conversationId}`,
      review: `/reviews`,
      payment: `/payments`,
      security: `/security`,
      promotion: `/promotions`
    };

    const path = navigateMap[notification.type];
    if (path) {
      navigate(path);
    }

    setIsOpen(false);
  }, [autoMarkRead, markAsRead, navigate]);

  // Initialize WebSocket connection for real-time notifications
  const initializeWebSocket = useCallback(() => {
    if (!isAuthenticated || websocketRef.current) return;

    try {
      const ws = new WebSocket(`ws://localhost:3001/notifications?token=${localStorage.getItem('token')}`);
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connected for real-time notifications');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_notification') {
          setNotifications(prev => [data.notification, ...prev.slice(0, maxNotifications - 1)]);
          setUnreadCount(prev => prev + 1);
          
          // Show desktop notification if permitted
          if (Notification.permission === 'granted') {
            new Notification('New Notification', {
              body: data.notification.message,
              icon: '/favicon.ico'
            });
          }

          // Play sound
          if (enableSounds) {
            setPlaySound(true);
          }
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        // Attempt reconnect after 5 seconds
        setTimeout(initializeWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

      websocketRef.current = ws;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [isAuthenticated, maxNotifications, enableSounds]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize notifications and polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      initializeWebSocket();

      // Set up polling as fallback
      pollingRef.current = setInterval(() => {
        fetchNotifications(false);
      }, pollingInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [isAuthenticated, fetchNotifications, initializeWebSocket, pollingInterval]);

  // Request notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        showToast({
          type: 'success',
          title: 'Notifications Enabled',
          message: 'You will now receive desktop notifications'
        });
      }
    }
  }, [showToast]);

  // Play notification sound
  useEffect(() => {
    if (playSound && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play was prevented, ignore
      });
      setPlaySound(false);
    }
  }, [playSound]);

  // Format time ago
  const formatTimeAgo = useCallback((timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }, []);

  // Get priority notifications (unread first, then by date)
  const priorityNotifications = useMemo(() => {
    return [...notifications]
      .sort((a, b) => {
        // Unread first
        if (a.read !== b.read) return a.read ? 1 : -1;
        // Then by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, maxNotifications);
  }, [notifications, maxNotifications]);

  // Connection status indicator
  const ConnectionIndicator = () => (
    <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
      connectionStatus === 'connected' ? 'bg-green-500' :
      connectionStatus === 'disconnected' ? 'bg-yellow-500' :
      'bg-red-500'
    }`} />
  );

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={bellRef}>
      {/* Notification Sound (hidden) */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>

      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        onMouseEnter={() => !isOpen && fetchNotifications(false)}
        className={`
          relative flex items-center justify-center rounded-full
          ${sizeClasses[size].bell}
          ${variantClasses[variant]}
          transition-all duration-200
          hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
          group
        `}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        {/* Bell Icon */}
        <span className={`transform transition-transform duration-200 ${
          unreadCount > 0 ? 'animate-bounce' : 'group-hover:scale-110'
        }`}>
          🔔
        </span>

        {/* Unread Count Badge */}
        {showCount && unreadCount > 0 && (
          <span className={`
            absolute flex items-center justify-center rounded-full bg-rose-500 text-white font-semibold
            ${sizeClasses[size].badge}
            animate-pulse
          `}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Connection Status Dot */}
        <ConnectionIndicator />
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`
            absolute ${positionClasses[position]}
            ${sizeClasses[size].dropdown}
            bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600
            max-h-96 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200
          `}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-rose-500 text-white text-xs rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead(null, true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  View all
                </button>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Last checked: {formatTimeAgo(lastChecked)}</span>
              <button
                onClick={() => fetchNotifications()}
                disabled={isLoading}
                className="flex items-center gap-1 hover:text-gray-700 disabled:opacity-50"
              >
                {isLoading ? '🔄' : '↻'} Refresh
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : priorityNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {priorityNotifications.map((notification) => {
                  const typeConfig = notificationTypes[notification.type] || notificationTypes.system;
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700
                        ${!notification.read ? `${typeConfig.bgColor} border-l-4 ${typeConfig.borderColor}` : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-lg ${typeConfig.color}`}>
                          {typeConfig.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={requestNotificationPermission}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                🔔 Enable desktop notifications
              </button>
              <ConnectionIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Higher Order Component for notification-aware components
export const withNotifications = (Component) => {
  return function NotificationAwareComponent(props) {
    return (
      <Component {...props} />
    );
  };
};

// Custom hook for notification functionality
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const markAsRead = useCallback(async (notificationId) => {
    // Implementation for marking as read
  }, []);

  const clearAll = useCallback(async () => {
    // Implementation for clearing all notifications
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  };
};

export default React.memo(NotificationBell);