import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error types for better categorization
const ERROR_TYPES = {
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  BACKEND_DOWN: 'BACKEND_DOWN',
  BACKEND_SLOW: 'BACKEND_SLOW',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

// Configuration
const CONFIG = {
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  SLOW_RESPONSE_THRESHOLD: 5000, // 5 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 2000,
  DEBOUNCE_DELAY: 1000
};

export default function NetworkErrorHandler({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [backendStatus, setBackendStatus] = useState({
    available: true,
    responseTime: 0,
    lastChecked: null,
    errorCount: 0
  });
  const [networkQuality, setNetworkQuality] = useState('good'); // good, slow, poor
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Refs for tracking
  const retryCountRef = useRef(0);
  const toastIdRef = useRef(null);
  const healthCheckTimeoutRef = useRef(null);
  const slowResponseTimeoutRef = useRef(null);

  // Debounced function to prevent rapid state changes
  const debouncedSetBackendStatus = useCallback((updates) => {
    if (slowResponseTimeoutRef.current) {
      clearTimeout(slowResponseTimeoutRef.current);
    }
    
    slowResponseTimeoutRef.current = setTimeout(() => {
      setBackendStatus(prev => ({ ...prev, ...updates }));
    }, CONFIG.DEBOUNCE_DELAY);
  }, []);

  // Enhanced health check with performance monitoring
  const checkBackendHealth = useCallback(async (isRetry = false) => {
    if (!isOnline && !isRetry) return;

    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/health`, 
        {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      clearTimeout(timeoutId);
      
      const responseTime = performance.now() - startTime;
      const isSlow = responseTime > CONFIG.SLOW_RESPONSE_THRESHOLD;

      if (response.ok) {
        const newStatus = {
          available: true,
          responseTime,
          lastChecked: new Date(),
          errorCount: 0
        };

        debouncedSetBackendStatus(newStatus);

        // Determine network quality based on response time
        let quality = 'good';
        if (responseTime > 5000) quality = 'poor';
        else if (responseTime > 2000) quality = 'slow';
        
        setNetworkQuality(quality);

        // Show recovery toast if this was a retry after failure
        if (isRetry || retryCountRef.current > 0) {
          toast.dismiss(toastIdRef.current);
          toast.success(`Backend connection restored! (${Math.round(responseTime)}ms)`, {
            toastId: 'backend-recovered',
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false
          });
          retryCountRef.current = 0;
        }

        // Show slow response warning
        if (isSlow) {
          toast.warning(`Backend response is slow (${Math.round(responseTime)}ms)`, {
            toastId: 'slow-response',
            position: "bottom-right",
            autoClose: 5000,
            type: toast.TYPE.WARNING
          });
        }

        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      const newStatus = {
        available: false,
        responseTime,
        lastChecked: new Date(),
        errorCount: backendStatus.errorCount + 1
      };

      debouncedSetBackendStatus(newStatus);

      // Only show toast for new errors or after retry attempts
      if (!isRetry || retryCountRef.current === 0) {
        handleBackendError(error, isRetry);
      }

      return false;
    }
  }, [isOnline, backendStatus.errorCount, debouncedSetBackendStatus]);

  // Enhanced error handling with retry logic
  const handleBackendError = useCallback((error, isRetry = false) => {
    const errorType = determineErrorType(error);
    
    // Don't show duplicate toasts
    if (toastIdRef.current && toast.isActive(toastIdRef.current)) {
      return;
    }

    let toastConfig = {
      position: "bottom-right",
      autoClose: false, // Don't auto-close critical errors
      closeOnClick: false,
      draggable: false,
      closeButton: true
    };

    let message = '';
    let type = toast.TYPE.ERROR;

    switch (errorType) {
      case ERROR_TYPES.NETWORK_OFFLINE:
        message = 'You are currently offline. Please check your internet connection.';
        type = toast.TYPE.WARNING;
        break;
      
      case ERROR_TYPES.BACKEND_DOWN:
        message = 'Backend service is temporarily unavailable. Some features may not work.';
        break;
      
      case ERROR_TYPES.BACKEND_SLOW:
        message = 'Backend is responding slowly. Please wait...';
        type = toast.TYPE.WARNING;
        toastConfig.autoClose = 5000;
        break;
      
      case ERROR_TYPES.NETWORK_ERROR:
      default:
        message = 'Network error occurred. Please check your connection.';
        break;
    }

    // Add retry button for recoverable errors
    if (errorType !== ERROR_TYPES.NETWORK_OFFLINE && retryCountRef.current < CONFIG.RETRY_ATTEMPTS) {
      toastConfig.render = ({ closeToast }) => (
        <div>
          <div>{message}</div>
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                closeToast();
                retryBackendConnection();
              }}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Retry Now
            </button>
            <button
              onClick={closeToast}
              style={{
                background: 'transparent',
                color: '#666',
                border: '1px solid #ddd',
                padding: '5px 10px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      );
    } else {
      toastConfig.render = message;
    }

    toastIdRef.current = toast(message, { ...toastConfig, type });
  }, []);

  // Determine the type of error for better handling
  const determineErrorType = useCallback((error) => {
    if (!isOnline) return ERROR_TYPES.NETWORK_OFFLINE;
    
    if (error.name === 'AbortError') {
      return ERROR_TYPES.BACKEND_SLOW;
    }
    
    if (error.message && error.message.includes('Failed to fetch')) {
      return ERROR_TYPES.BACKEND_DOWN;
    }
    
    return ERROR_TYPES.NETWORK_ERROR;
  }, [isOnline]);

  // Retry logic with exponential backoff
  const retryBackendConnection = useCallback(async () => {
    if (retryCountRef.current >= CONFIG.RETRY_ATTEMPTS) {
      toast.info('Maximum retry attempts reached. Please try again later.', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    retryCountRef.current++;
    
    toast.info(`Retrying connection... (${retryCountRef.current}/${CONFIG.RETRY_ATTEMPTS})`, {
      toastId: 'retry-attempt',
      position: "bottom-right",
      autoClose: 2000
    });

    // Exponential backoff
    const delay = CONFIG.RETRY_DELAY * Math.pow(2, retryCountRef.current - 1);
    
    setTimeout(async () => {
      const success = await checkBackendHealth(true);
      if (success) {
        retryCountRef.current = 0;
      }
    }, delay);
  }, [checkBackendHealth]);

  // Track pending requests
  const trackRequest = useCallback((url, method) => {
    const requestId = `${method}_${url}_${Date.now()}`;
    setPendingRequests(prev => [...prev, { id: requestId, url, method, startTime: Date.now() }]);
    return requestId;
  }, []);

  const completeRequest = useCallback((requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
  }, []);

  // Monitor request timeouts
  const monitorPendingRequests = useCallback(() => {
    const now = Date.now();
    const longRunningRequests = pendingRequests.filter(
      req => now - req.startTime > CONFIG.SLOW_RESPONSE_THRESHOLD
    );

    if (longRunningRequests.length > 0 && backendStatus.available) {
      toast.warning(`${longRunningRequests.length} request(s) taking longer than expected`, {
        toastId: 'slow-requests',
        position: "bottom-right",
        autoClose: 3000
      });
    }
  }, [pendingRequests, backendStatus.available]);

  // Enhanced event handlers
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.dismiss('offline-warning');
    toast.success('Internet connection restored!', {
      position: "bottom-right",
      autoClose: 3000
    });
    
    // Immediately check backend when coming online
    checkBackendHealth();
  }, [checkBackendHealth]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast.warning('You are currently offline. Some features may not work.', {
      toastId: 'offline-warning',
      position: "bottom-right",
      autoClose: false
    });
  }, []);

  // Global error handler for uncaught errors
  const handleGlobalError = useCallback((event) => {
    // Ignore errors that are likely network-related and already handled
    if (event.error && (
      event.error.message.includes('Network Error') ||
      event.error.message.includes('Failed to fetch') ||
      event.error.message.includes('Loading chunk')
    )) {
      event.preventDefault();
      return;
    }
  }, []);

  // Global rejection handler for unhandled promise rejections
  const handleRejection = useCallback((event) => {
    // Handle network-related promise rejections
    if (event.reason && (
      event.reason.message.includes('Network Error') ||
      event.reason.message.includes('Failed to fetch') ||
      event.reason.name === 'TypeError'
    )) {
      event.preventDefault();
      if (!toast.isActive(toastIdRef.current)) {
        handleBackendError(event.reason);
      }
    }
  }, [handleBackendError]);

  // Effect for setting up event listeners
  useEffect(() => {
    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Global error handlers
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);

    // Initial health check
    checkBackendHealth();

    // Periodic health checks
    healthCheckTimeoutRef.current = setInterval(checkBackendHealth, CONFIG.HEALTH_CHECK_INTERVAL);

    // Monitor pending requests
    const requestMonitor = setInterval(monitorPendingRequests, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
      
      if (healthCheckTimeoutRef.current) {
        clearInterval(healthCheckTimeoutRef.current);
      }
      if (slowResponseTimeoutRef.current) {
        clearTimeout(slowResponseTimeoutRef.current);
      }
      clearInterval(requestMonitor);
      
      toast.dismiss();
    };
  }, [handleOnline, handleOffline, handleGlobalError, handleRejection, checkBackendHealth, monitorPendingRequests]);

  // Effect to handle route changes when backend is down
  useEffect(() => {
    if (!backendStatus.available && location.pathname.includes('/api')) {
      // Redirect away from API-dependent pages when backend is down
      navigate('/', { replace: true });
    }
  }, [backendStatus.available, location.pathname, navigate]);

  // Provide network status to children via context (optional)
  const networkContext = {
    isOnline,
    backendStatus,
    networkQuality,
    pendingRequests,
    checkBackendHealth,
    retryBackendConnection,
    trackRequest,
    completeRequest
  };

  return children;
}

// Custom hook to use network status
export const useNetworkStatus = () => {
  // This would be used with a context provider wrapping the NetworkErrorHandler
  // For simplicity, we're returning a mock implementation
  return {
    isOnline: navigator.onLine,
    isBackendAvailable: true,
    networkQuality: 'good',
    checkConnection: () => Promise.resolve(true),
    retryConnection: () => {}
  };
};

// Utility function to add request tracking to fetch
export const trackedFetch = async (url, options = {}, trackFn, completeFn) => {
  const requestId = trackFn?.(url, options.method || 'GET');
  
  try {
    const response = await fetch(url, options);
    completeFn?.(requestId);
    return response;
  } catch (error) {
    completeFn?.(requestId);
    throw error;
  }
};