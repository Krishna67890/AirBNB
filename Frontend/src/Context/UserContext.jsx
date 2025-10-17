import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from "./AuthContext.jsx";

// Create context
export const UserDataContext = createContext();

// Custom hook for using user context
export const useUser = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

function UserProvider({ children }) {
    const { serverUrl, isAuthenticated, logout } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshInterval, setRefreshInterval] = useState(5 * 60 * 1000); // 5 minutes default

    // Enhanced user data fetcher with retry logic
    const getCurrentUser = useCallback(async (retryCount = 0) => {
        if (!serverUrl) {
            setLoading(false);
            setError({ message: 'Server URL not configured' });
            return;
        }

        if (!isAuthenticated) {
            setLoading(false);
            setUserData(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const result = await axios.get(
                `${serverUrl}/api/user/currentuser`, 
                { 
                    withCredentials: true,
                    timeout: 10000,
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                }
            );
            
            if (result.data && (result.data._id || result.data.id)) {
                setUserData(result.data);
                setLastUpdated(new Date());
                setError(null);
            } else {
                throw new Error('Invalid user data received');
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
            
            // Retry logic for network errors
            if (retryCount < 2 && (
                error.code === 'NETWORK_ERROR' || 
                error.message.includes('Network Error') ||
                !error.response
            )) {
                console.log(`Retrying user fetch... Attempt ${retryCount + 1}`);
                setTimeout(() => getCurrentUser(retryCount + 1), 2000 * (retryCount + 1));
                return;
            }
            
            const errorDetails = {
                message: error.response?.data?.message || 'Failed to fetch user data',
                code: error.code,
                status: error.response?.status,
                timestamp: new Date().toISOString()
            };
            
            setError(errorDetails);
            
            // Clear user data on authentication errors
            if (error.response?.status === 401 || error.response?.status === 403) {
                setUserData(null);
                if (logout) {
                    logout();
                }
            }
        } finally {
            setLoading(false);
        }
    }, [serverUrl, isAuthenticated, logout]);

    // Update user profile
    const updateUserProfile = async (updateData) => {
        try {
            setLoading(true);
            setError(null);
            
            const result = await axios.put(
                `${serverUrl}/api/user/profile`,
                updateData,
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );
            
            setUserData(prev => ({ ...prev, ...result.data }));
            setLastUpdated(new Date());
            
            return { success: true, data: result.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update profile';
            const errorDetails = {
                message: errorMsg,
                code: error.code,
                status: error.response?.status
            };
            setError(errorDetails);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    // Update user preferences
    const updateUserPreferences = async (preferences) => {
        try {
            const result = await axios.put(
                `${serverUrl}/api/user/preferences`,
                { preferences },
                { 
                    withCredentials: true,
                    timeout: 10000
                }
            );
            
            setUserData(prev => ({ 
                ...prev, 
                preferences: { ...prev?.preferences, ...result.data.preferences } 
            }));
            setLastUpdated(new Date());
            
            return { success: true, data: result.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to update preferences';
            return { success: false, error: errorMsg };
        }
    };

    // Upload profile picture
    const uploadProfilePicture = async (file) => {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            const result = await axios.post(
                `${serverUrl}/api/user/upload-profile-picture`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    timeout: 30000,
                }
            );
            
            setUserData(prev => ({ ...prev, profilePicture: result.data.profilePicture }));
            setLastUpdated(new Date());
            return { success: true, data: result.data };
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to upload profile picture';
            return { success: false, error: errorMsg };
        }
    };

    // Clear user data (on logout)
    const clearUserData = useCallback(() => {
        setUserData(null);
        setError(null);
        setLastUpdated(null);
        setLoading(false);
    }, []);

    // Refresh user data manually
    const refreshUserData = useCallback(() => {
        return getCurrentUser();
    }, [getCurrentUser]);

    // Check if user has specific role
    const hasRole = useCallback((role) => {
        return userData?.roles?.includes(role) || false;
    }, [userData]);

    // Check if user has specific permission
    const hasPermission = useCallback((permission) => {
        return userData?.permissions?.includes(permission) || false;
    }, [userData]);

    // Get user display name (fallbacks: full name -> username -> email)
    const getDisplayName = useCallback(() => {
        if (!userData) return 'Guest';
        return userData.fullName || userData.username || userData.name || userData.email?.split('@')[0] || 'User';
    }, [userData]);

    // Get user initials for avatar
    const getUserInitials = useCallback(() => {
        if (!userData) return 'G';
        if (userData.fullName) {
            return userData.fullName
                .split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        }
        return getDisplayName().charAt(0).toUpperCase();
    }, [userData, getDisplayName]);

    // Get user avatar URL with fallback
    const getAvatarUrl = useCallback((size = 64) => {
        if (userData?.profilePicture) {
            return userData.profilePicture;
        }
        // Generate initial-based avatar as fallback
        const initials = getUserInitials();
        return `https://ui-avatars.com/api/?name=${initials}&background=random&size=${size}`;
    }, [userData, getUserInitials]);

    // Check if user can perform action
    const can = useCallback((action, resource) => {
        if (!userData) return false;
        
        // Simple permission check - extend based on your permission system
        const requiredPermission = `${resource}:${action}`;
        return hasPermission(requiredPermission) || userData.isAdmin;
    }, [userData, hasPermission]);

    // Check if user is the owner of a resource
    const isOwner = useCallback((resourceUserId) => {
        return userData?._id === resourceUserId || userData?.id === resourceUserId;
    }, [userData]);

    // Format user join date
    const getJoinDate = useCallback(() => {
        if (!userData?.createdAt) return null;
        return new Date(userData.createdAt).toLocaleDateString();
    }, [userData]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Auto-refresh user data at intervals when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        getCurrentUser();

        const interval = setInterval(() => {
            getCurrentUser();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [getCurrentUser, isAuthenticated, refreshInterval]);

    // Refresh when window gains focus (if data is stale)
    useEffect(() => {
        if (!isAuthenticated) return;

        const handleFocus = () => {
            // Refresh if data is older than 2 minutes
            if (lastUpdated && (Date.now() - lastUpdated.getTime() > 120000)) {
                getCurrentUser();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [getCurrentUser, isAuthenticated, lastUpdated]);

    // Initial data fetch
    useEffect(() => {
        if (serverUrl && isAuthenticated) {
            getCurrentUser();
        } else {
            setLoading(false);
        }
    }, [serverUrl, isAuthenticated, getCurrentUser]);

    // Context value
    const value = {
        // State
        userData,
        loading,
        error,
        lastUpdated,
        
        // Actions
        setUserData,
        getCurrentUser: refreshUserData,
        updateUserProfile,
        updateUserPreferences,
        uploadProfilePicture,
        clearUserData,
        refreshUserData,
        clearError,
        
        // Utilities
        hasRole,
        hasPermission,
        getDisplayName,
        getUserInitials,
        getAvatarUrl,
        can,
        isOwner,
        getJoinDate,
        
        // Configuration
        setRefreshInterval,
        
        // Derived state
        isUserLoading: loading,
        isUserAuthenticated: !!userData && isAuthenticated,
        userRoles: userData?.roles || [],
        userPermissions: userData?.permissions || [],
        isAdmin: userData?.isAdmin || false,
        isEmailVerified: userData?.isEmailVerified || false
    };

    return (
        <UserDataContext.Provider value={value}>
            {children}
        </UserDataContext.Provider>
    );
}

export default UserProvider;