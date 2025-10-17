import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Error types for better error handling
const ErrorTypes = {
  ROUTE_ERROR: 'ROUTE_ERROR',
  API_ERROR: 'API_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Custom error class for better error categorization
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN_ERROR, originalError = null, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.timestamp = new Date().toISOString();
    this.originalError = originalError;
    this.context = context;
  }
}

export default class ErrorBoundary extends React.Component {
  state = { 
    hasError: false, 
    error: null,
    errorInfo: null,
    lastLocation: null
  };

  static getDerivedStateFromError(error) {
    return { 
      hasError: true, 
      error,
      lastLocation: window.location.pathname
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to monitoring service
    this.logError(error, errorInfo);
    
    // Report to error tracking service (e.g., Sentry, LogRocket)
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    // Reset error state when location changes
    if (this.state.hasError && this.props.location !== prevProps.location) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  logError = (error, errorInfo) => {
    const errorLog = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: error.type || ErrorTypes.UNKNOWN_ERROR
      },
      errorInfo: errorInfo?.componentStack,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        route: this.props.location?.pathname,
        ...error.context
      }
    };

    console.error('Error caught by boundary:', errorLog);
    
    // In production, send to your logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorLog);
    }
  };

  sendToLoggingService = (errorLog) => {
    // Example: Send to your backend logging endpoint
    fetch('/api/logs/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog)
    }).catch(console.error);
  };

  reportError = (error, errorInfo) => {
    // Integration with error reporting services
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
    
    if (window.LogRocket) {
      window.LogRocket.captureException(error);
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate('/');
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoBack = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.navigate(-1);
  };

  getErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    if (!error) return null;

    const errorType = error.type || ErrorTypes.UNKNOWN_ERROR;
    
    const errorMessages = {
      [ErrorTypes.ROUTE_ERROR]: {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist or has been moved.',
        icon: '🗺️',
        actions: ['home', 'back']
      },
      [ErrorTypes.API_ERROR]: {
        title: 'Service Temporarily Unavailable',
        message: 'We are experiencing issues with our services. Please try again later.',
        icon: '🔧',
        actions: ['retry', 'home']
      },
      [ErrorTypes.AUTH_ERROR]: {
        title: 'Authentication Required',
        message: 'Please log in to access this page.',
        icon: '🔐',
        actions: ['home', 'back']
      },
      [ErrorTypes.NETWORK_ERROR]: {
        title: 'Network Connection Issue',
        message: 'Please check your internet connection and try again.',
        icon: '📡',
        actions: ['retry', 'home']
      },
      [ErrorTypes.UNKNOWN_ERROR]: {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Our team has been notified.',
        icon: '🚨',
        actions: ['retry', 'home', 'back']
      }
    };

    return errorMessages[errorType] || errorMessages[ErrorTypes.UNKNOWN_ERROR];
  };

  renderErrorActions = (actions) => {
    const actionHandlers = {
      home: {
        label: 'Go Home',
        handler: this.handleReset,
        variant: 'primary'
      },
      retry: {
        label: 'Try Again',
        handler: this.handleRetry,
        variant: 'secondary'
      },
      back: {
        label: 'Go Back',
        handler: this.handleGoBack,
        variant: 'outline'
      }
    };

    return actions.map(action => {
      const config = actionHandlers[action];
      if (!config) return null;

      const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
      const variantClasses = {
        primary: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-lg",
        secondary: "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-lg",
        outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500"
      };

      return (
        <button
          key={action}
          onClick={config.handler}
          className={`${baseClasses} ${variantClasses[config.variant]}`}
        >
          {config.label}
        </button>
      );
    });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorDetails = this.getErrorDetails();
    const { error, errorInfo } = this.state;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
              <div className="text-6xl mb-4">{errorDetails.icon}</div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {errorDetails.title}
              </h1>
              <p className="text-red-100 text-lg opacity-90">
                {errorDetails.message}
              </p>
            </div>

            {/* Error Content */}
            <div className="p-8">
              {/* User-friendly message */}
              <div className="text-center mb-8">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We apologize for the inconvenience. Here are some things you can try:
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                {this.renderErrorActions(errorDetails.actions)}
              </div>

              {/* Technical Details (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                    Technical Details (Development Only)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div>
                      <strong className="text-gray-700">Error:</strong>
                      <pre className="text-sm text-red-600 mt-1 overflow-auto bg-white p-3 rounded border">
                        {error?.toString()}
                      </pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div>
                        <strong className="text-gray-700">Component Stack:</strong>
                        <pre className="text-xs text-gray-600 mt-1 overflow-auto bg-white p-3 rounded border max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      <div>Location: {this.state.lastLocation}</div>
                      <div>Time: {new Date().toLocaleString()}</div>
                      <div>User Agent: {navigator.userAgent}</div>
                    </div>
                  </div>
                </details>
              )}

              {/* Support Contact */}
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">
                  If the problem persists, please contact our support team at{' '}
                  <a 
                    href="mailto:support@example.com" 
                    className="text-red-500 hover:text-red-600 underline transition-colors"
                  >
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Error ID for support reference */}
          {error?.timestamp && (
            <div className="text-center mt-4">
              <code className="text-xs text-gray-400 bg-gray-800 text-gray-300 px-2 py-1 rounded">
                Error ID: {btoa(error.timestamp).slice(-8)}
              </code>
            </div>
          )}
        </div>
      </div>
    );
  }
}

// Enhanced wrapper component with location tracking
export function ErrorBoundaryWithRouter(props) {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <ErrorBoundary 
      navigate={navigate} 
      location={location}
      {...props} 
    />
  );
}

// Higher Order Component for error boundary
export const withErrorBoundary = (Component) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundaryWithRouter>
        <Component {...props} />
      </ErrorBoundaryWithRouter>
    );
  };
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error, context = {}) => {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorTypes.UNKNOWN_ERROR,
      error,
      context
    );

    // For non-boundary errors, you might want to show a toast or notification
    console.error('Error handled:', appError);
    
    // You can integrate with toast notifications here
    // toast.error(appError.message);
    
    return appError;
  };

  const throwError = (message, type = ErrorTypes.UNKNOWN_ERROR, context = {}) => {
    const error = new AppError(message, type, null, context);
    throw error;
  };

  return { handleError, throwError, ErrorTypes };
};