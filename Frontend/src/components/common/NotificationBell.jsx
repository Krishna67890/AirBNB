// src/components/common/NotificationBell.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext.jsx';
import { useUI } from '../../../Context/UIContext.jsx';

function NotificationBell() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useUI();
  
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  // Sample notifications - replace with real data from your API
  const sampleNotifications = useMemo(() => [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking Request',
      message: 'Someone wants to book your property for 3 nights',
      time: '2 hours ago',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from a guest',
      time: '1 day ago',
      read: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'system',
      title: 'Listing Approved',
      message: 'Your listing has been approved and is now live',
      time: '3 days ago',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment Received',
      message: 'You received ₹5,000 for your recent booking',
      time: '1 week ago',
      read: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ], []);

  // Notification types configuration
  const notificationTypes = useMemo(() => ({
    booking: {
      icon: '🏠',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    message: {
      icon: '💬',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    review: {
      icon: '⭐',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    system: {
      icon: '🔔',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    payment: {
      icon: '💳',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    security: {
      icon: '🔒',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    promotion: {
      icon: '🎉',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    }
  }), []);

  // Fetch notifications (simulated)
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch from your API:
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      // setNotifications(data.notifications);
      
      setNotifications(sampleNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      showToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to fetch notifications'
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, sampleNotifications, showToast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId, markAll = false) => {
    try {
      if (markAll) {
        // Mark all as read
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        
        showToast({
          type: 'success',
          title: 'All notifications marked as read',
          duration: 3000
        });
      } else {
        // Mark single as read
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
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
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
    const navigateMap = {
      booking: '/mylisting',
      message: '/messages',
      review: '/reviews',
      payment: '/payments'
    };

    const path = navigateMap[notification.type];
    if (path) {
      navigate(path);
    }

    setIsOpen(false);
  }, [markAsRead, navigate]);

  // Click outside handler
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

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

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

  if (!isAuthenticated) {
    return null; // Don't show notification bell for non-authenticated users
  }

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        {/* Bell Icon */}
        <span className={`text-gray-600 group-hover:text-rose-500 transition-colors ${
          unreadCount > 0 ? 'animate-bounce' : 'group-hover:scale-110'
        }`}>
          🔔
        </span>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
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
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-64">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <p className="text-gray-500 text-sm">No notifications yet</p>
                <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const typeConfig = notificationTypes[notification.type] || notificationTypes.system;
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50
                        ${!notification.read ? `${typeConfig.bgColor} border-l-4 ${typeConfig.borderColor}` : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-lg ${typeConfig.color}`}>
                          {typeConfig.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
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
          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="text-center">
              <button
                onClick={() => navigate('/notifications')}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;