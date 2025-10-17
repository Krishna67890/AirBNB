// src/routes/ProtectedRoute.jsx
import React, { useContext, useMemo, useEffect, useState } from 'react';
import { 
  Navigate, 
  useLocation, 
  useNavigate,
  Outlet 
} from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { UIContext } from '../Context/UIContext';
import LoadingSpinner from '../components/ui/Loader/LoadingSpinner';
import VerificationModal from '../components/auth/VerificationModal';
import SessionTimeoutModal from '../components/auth/SessionTimeoutModal';
import AccessDenied from '../pages/Error/AccessDenied';

/**
 * Advanced ProtectedRoute Component with multiple protection levels
 * Features:
 * - Role-based access control (RBAC)
 * - Email verification requirements
 * - Session management
 * - Graceful redirects with state preservation
 * - Custom permission validators
 * - Loading states and error handling
 */

// Permission levels hierarchy
export const PermissionLevels = {
  PUBLIC: 'public',
  USER: 'user',
  VERIFIED_USER: 'verified_user',
  HOST: 'host',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Role definitions with permissions
export const RolePermissions = {
  [PermissionLevels.USER]: [PermissionLevels.USER],
  [PermissionLevels.VERIFIED_USER]: [PermissionLevels.USER, PermissionLevels.VERIFIED_USER],
  [PermissionLevels.HOST]: [PermissionLevels.USER, PermissionLevels.VERIFIED_USER, PermissionLevels.HOST],
  [PermissionLevels.ADMIN]: [PermissionLevels.USER, PermissionLevels.VERIFIED_USER, PermissionLevels.HOST, PermissionLevels.ADMIN],
  [PermissionLevels.SUPER_ADMIN]: [PermissionLevels.USER, PermissionLevels.VERIFIED_USER, PermissionLevels.HOST, PermissionLevels.ADMIN, PermissionLevels.SUPER_ADMIN]
};

// Custom validator function type
/**
 * @typedef {Function} PermissionValidator
 * @param {Object} user - Current user object
 * @param {Object} routeParams - Route parameters and props
 * @returns {boolean} - Whether access is granted
 */

const ProtectedRoute = ({
  children,
  element,
  requiredPermission = PermissionLevels.USER,
  requiredRole,
  requireVerifiedEmail = false,
  requireCompleteProfile = false,
  requireTwoFactor = false,
  customValidator = null,
  fallbackPath = '/login',
  unauthorizedPath = '/access-denied',
  verificationPath = '/verify-email',
  profileCompletionPath = '/complete-profile',
  twoFactorPath = '/two-factor',
  onAccessDenied = null,
  onAccessGranted = null,
  showLoading = true,
  enableSessionTimeout = true,
  sessionTimeoutMinutes = 30,
  preserveQueryParams = true,
  allowPartialProfile = false,
  ...routeProps
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    isLoading,
    isEmailVerified,
    isProfileComplete,
    isTwoFactorEnabled,
    hasTwoFactorVerified,
    sessionExpiry,
    refreshSession
  } = useContext(AuthContext);

  const { showToast, setModal } = useContext(UIContext);

  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Memoized permission check
  const hasPermission = useMemo(() => {
    if (!isAuthenticated || !user) return false;

    // Check role-based permissions
    if (requiredRole) {
      const userRole = user.role || PermissionLevels.USER;
      const userPermissions = RolePermissions[userRole] || [];
      
      if (!userPermissions.includes(requiredPermission)) {
        return false;
      }
    }

    // Check email verification
    if (requireVerifiedEmail && !isEmailVerified) {
      return false;
    }

    // Check profile completion
    if (requireCompleteProfile && !isProfileComplete) {
      if (!allowPartialProfile) return false;
    }

    // Check two-factor authentication
    if (requireTwoFactor && isTwoFactorEnabled && !hasTwoFactorVerified) {
      return false;
    }

    // Custom validator check
    if (customValidator && !customValidator(user, routeProps)) {
      return false;
    }

    return true;
  }, [
    isAuthenticated,
    user,
    requiredPermission,
    requiredRole,
    requireVerifiedEmail,
    isEmailVerified,
    requireCompleteProfile,
    isProfileComplete,
    requireTwoFactor,
    isTwoFactorEnabled,
    hasTwoFactorVerified,
    customValidator,
    routeProps,
    allowPartialProfile
  ]);

  // Check session timeout
  const isSessionValid = useMemo(() => {
    if (!enableSessionTimeout || !sessionExpiry) return true;
    
    const now = new Date().getTime();
    const expiry = new Date(sessionExpiry).getTime();
    return now < expiry;
  }, [sessionExpiry, enableSessionTimeout]);

  // Session management effect
  useEffect(() => {
    if (isAuthenticated && enableSessionTimeout) {
      const checkSession = async () => {
        if (!isSessionValid && !isCheckingSession) {
          setIsCheckingSession(true);
          try {
            const refreshed = await refreshSession();
            if (!refreshed) {
              setShowSessionModal(true);
            }
          } catch (error) {
            console.error('Session refresh failed:', error);
            setShowSessionModal(true);
          } finally {
            setIsCheckingSession(false);
          }
        }
      };

      checkSession();
    }
  }, [isAuthenticated, isSessionValid, refreshSession, enableSessionTimeout, isCheckingSession]);

  // Build redirect path with state preservation
  const buildRedirectPath = (basePath) => {
    if (!preserveQueryParams) return basePath;

    const searchParams = new URLSearchParams(location.search);
    const state = {
      from: {
        pathname: location.pathname,
        search: location.search
      },
      message: getRedirectMessage()
    };

    return {
      pathname: basePath,
      search: searchParams.toString(),
      state
    };
  };

  // Get appropriate redirect message
  const getRedirectMessage = () => {
    if (!isAuthenticated) {
      return 'Please log in to access this page.';
    }
    if (requireVerifiedEmail && !isEmailVerified) {
      return 'Please verify your email to access this page.';
    }
    if (requireCompleteProfile && !isProfileComplete) {
      return 'Please complete your profile to access this page.';
    }
    if (!hasPermission) {
      return 'You do not have permission to access this page.';
    }
    return 'Redirecting...';
  };

  // Handle access denied callback
  const handleAccessDenied = () => {
    if (onAccessDenied) {
      onAccessDenied({
        user,
        requiredPermission,
        location,
        reason: getRedirectMessage()
      });
    }

    // Show toast notification
    showToast({
      type: 'warning',
      title: 'Access Restricted',
      message: getRedirectMessage(),
      duration: 5000
    });
  };

  // Handle access granted callback
  const handleAccessGranted = () => {
    if (onAccessGranted) {
      onAccessGranted({
        user,
        requiredPermission,
        location
      });
    }
  };

  // Determine the appropriate redirect
  const getRedirectTarget = () => {
    if (!isAuthenticated) {
      return buildRedirectPath(fallbackPath);
    }

    if (!hasPermission) {
      handleAccessDenied();
      return buildRedirectPath(unauthorizedPath);
    }

    if (requireVerifiedEmail && !isEmailVerified) {
      setShowVerificationModal(true);
      return buildRedirectPath(verificationPath);
    }

    if (requireCompleteProfile && !isProfileComplete) {
      return buildRedirectPath(profileCompletionPath);
    }

    if (requireTwoFactor && isTwoFactorEnabled && !hasTwoFactorVerified) {
      return buildRedirectPath(twoFactorPath);
    }

    handleAccessGranted();
    return null;
  };

  // Handle session extension
  const handleExtendSession = async () => {
    setIsCheckingSession(true);
    try {
      await refreshSession();
      setShowSessionModal(false);
      showToast({
        type: 'success',
        title: 'Session Extended',
        message: 'Your session has been extended.',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Session Error',
        message: 'Failed to extend session. Please log in again.',
        duration: 5000
      });
      navigate(buildRedirectPath(fallbackPath));
    } finally {
      setIsCheckingSession(false);
    }
  };

  // Handle session logout
  const handleSessionLogout = () => {
    setShowSessionModal(false);
    navigate(buildRedirectPath(fallbackPath));
  };

  // Show loading state
  if (isLoading || isCheckingSession) {
    if (!showLoading) return null;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner 
            size="lg" 
            variant="primary" 
            text="Checking permissions..."
          />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Verifying your access rights...
          </p>
        </div>
      </div>
    );
  }

  // Check if redirect is needed
  const redirectTarget = getRedirectTarget();
  if (redirectTarget) {
    return <Navigate to={redirectTarget} replace />;
  }

  // Render session timeout modal
  if (showSessionModal) {
    return (
      <>
        <SessionTimeoutModal
          isOpen={showSessionModal}
          onExtend={handleExtendSession}
          onLogout={handleSessionLogout}
          isExtending={isCheckingSession}
          remainingTime={5} // minutes
        />
        {children || element || <Outlet />}
      </>
    );
  }

  // Render verification modal for unverified emails
  if (showVerificationModal) {
    return (
      <>
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onResendEmail={() => console.log('Resend verification email')}
          userEmail={user?.email}
        />
        {children || element || <Outlet />}
      </>
    );
  }

  // Render the protected content
  return children || element || <Outlet />;
};

// Higher Order Component for protecting components
export const withProtection = (Component, options = {}) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Hook for programmatic permission checks
export const usePermission = () => {
  const { user, isAuthenticated, isEmailVerified, isProfileComplete } = useContext(AuthContext);

  const hasPermission = (permission, options = {}) => {
    if (!isAuthenticated || !user) return false;

    const {
      requireVerified = false,
      requireCompleteProfile = false,
      customValidator = null
    } = options;

    // Basic permission check
    const userRole = user.role || PermissionLevels.USER;
    const userPermissions = RolePermissions[userRole] || [];
    
    if (!userPermissions.includes(permission)) {
      return false;
    }

    // Additional requirements
    if (requireVerified && !isEmailVerified) return false;
    if (requireCompleteProfile && !isProfileComplete) return false;
    if (customValidator && !customValidator(user)) return false;

    return true;
  };

  const canAccess = (routeConfig) => {
    return hasPermission(routeConfig.requiredPermission, {
      requireVerified: routeConfig.requireVerifiedEmail,
      requireCompleteProfile: routeConfig.requireCompleteProfile,
      customValidator: routeConfig.customValidator
    });
  };

  return { hasPermission, canAccess };
};

// Custom validators
export const PermissionValidators = {
  // Only allow access to own resources
  isOwner: (user, resource) => {
    return user.id === resource.userId || user.id === resource.hostId;
  },

  // Allow access to own resources or admin
  isOwnerOrAdmin: (user, resource) => {
    return user.id === resource.userId || user.id === resource.hostId || user.role === PermissionLevels.ADMIN;
  },

  // Check if user has specific feature flag
  hasFeature: (feature) => (user) => {
    return user.featureFlags?.includes(feature);
  },

  // Check if user is in specific plan
  hasPlan: (plan) => (user) => {
    return user.subscription?.plan === plan;
  }
};

export default ProtectedRoute;