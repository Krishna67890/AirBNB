import { useState, useEffect } from 'react';
import { FaWifi, FaRedo, FaSignal, FaExclamationTriangle } from 'react-icons/fa';

export default function OfflinePage({
  onRetry,
  customMessage,
  showNetworkInfo = true,
  autoRetry = false,
  retryInterval = 5000
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(null);
  const [connectionInfo, setConnectionInfo] = useState({});

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (autoRetry && retryCount > 0) {
        handleAutoRetry();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChecked(new Date());
    };

    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const conn = navigator.connection;
        setConnectionInfo({
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      const conn = navigator.connection;
      conn.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    let retryTimer;
    if (autoRetry && !isOnline) {
      retryTimer = setInterval(() => {
        setRetryCount(prev => prev + 1);
        checkConnection();
      }, retryInterval);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const conn = navigator.connection;
        conn.removeEventListener('change', updateConnectionInfo);
      }
      
      if (retryTimer) {
        clearInterval(retryTimer);
      }
    };
  }, [autoRetry, isOnline, retryInterval, retryCount]);

  const checkConnection = async () => {
    setLastChecked(new Date());
    
    try {
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        setIsOnline(true);
        handleAutoRetry();
        return true;
      }
    } catch (error) {
      setIsOnline(false);
    }
    
    return false;
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setLastChecked(new Date());
    
    const connected = await checkConnection();
    
    if (!connected && onRetry) {
      onRetry();
    }
  };

  const handleAutoRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const getConnectionQuality = () => {
    if (!connectionInfo.effectiveType) return 'Unknown';
    
    const types = {
      'slow-2g': 'Very Slow',
      '2g': 'Slow',
      '3g': 'Moderate',
      '4g': 'Good'
    };
    
    return types[connectionInfo.effectiveType] || connectionInfo.effectiveType;
  };

  const formatTimeSinceLastCheck = () => {
    if (!lastChecked) return 'Never';
    
    const seconds = Math.floor((new Date().getTime() - lastChecked.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  if (isOnline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-green-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center animate-pulse">
          <div className="text-6xl text-green-500 mb-4">
            <FaWifi className="inline-block" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Connection Restored!</h1>
          <p className="text-gray-600 mb-4">
            You're back online. Redirecting...
          </p>
          <div className="text-sm text-gray-500">
            Auto-redirecting in 3 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl text-center border border-red-100">
        <div className="relative mb-6">
          <div className="text-8xl text-red-500 mb-2 animate-pulse">
            <FaWifi className="inline-block opacity-40" />
          </div>
          <div className="absolute -top-2 -right-2">
            <FaExclamationTriangle className="text-3xl text-yellow-500 animate-bounce" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Connection Lost
        </h1>
        
        <p className="text-gray-600 mb-2 text-lg">
          {customMessage || "We're having trouble connecting to the internet."}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-yellow-700 mb-2">
            <FaRedo className="mr-2" />
            <span className="font-medium">Retry Attempt: {retryCount}</span>
          </div>
          <p className="text-sm text-yellow-600">
            Last checked: {formatTimeSinceLastCheck()}
          </p>
        </div>

        {showNetworkInfo && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaSignal className="mr-2 text-blue-500" />
              Network Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium text-red-500">Offline</span>
              </div>
              {connectionInfo.effectiveType && (
                <div className="flex justify-between">
                  <span>Connection Type:</span>
                  <span className="font-medium">{getConnectionQuality()}</span>
                </div>
              )}
              {connectionInfo.downlink && (
                <div className="flex justify-between">
                  <span>Download Speed:</span>
                  <span className="font-medium">{connectionInfo.downlink} Mbps</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <FaRedo className="mr-3" />
            Retry Connection
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• Check your Wi-Fi or mobile data connection</li>
            <li>• Restart your router or modem</li>
            <li>• Disable VPN or proxy settings</li>
            <li>• Check firewall or security software</li>
          </ul>
        </div>

        {autoRetry && (
          <div className="mt-4 text-xs text-gray-500">
            🔄 Auto-retry enabled - Next attempt in {retryInterval / 1000}s
          </div>
        )}
      </div>
    </div>
  );
}