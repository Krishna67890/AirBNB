// src/routes/AppRoutes.jsx
import React, { lazy, Suspense, useContext } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext.js';
import { UIContext } from '../Context/UIContext.jsx';
import { ErrorBoundaryWithRouter } from '../components/common/ErrorBoundary/ErrorBoundary';
import RouteLogger from './RouteLogger';
import LoadingSpinner from '../components/ui/Loader/LoadingSpinner';
import Layout from '../components/layout/Layout';

// Lazy load pages for code splitting
const Home = lazy(() => import('../pages/Home/Home'));
const Explore = lazy(() => import('../pages/Explore/Explore'));
const ListingDetail = lazy(() => import('../pages/Listing/ListingDetail'));
const CreateListing = lazy(() => import('../pages/Listing/CreateListing'));
const EditListing = lazy(() => import('../pages/Listing/EditListing'));
const MyListings = lazy(() => import('../pages/MyListings/MyListings'));
const Favorites = lazy(() => import('../pages/Favorites/Favorites'));
const Login = lazy(() => import('../pages/Auth/Login'));
const Signup = lazy(() => import('../pages/Auth/Signup'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const HostDashboard = lazy(() => import('../pages/Host/HostDashboard'));
const Booking = lazy(() => import('../pages/Booking/Booking'));
const Trips = lazy(() => import('../pages/Trips/Trips'));
const Messages = lazy(() => import('../pages/Messages/Messages'));
const NotFound = lazy(() => import('../pages/Error/NotFound'));
const ServerError = lazy(() => import('../pages/Error/ServerError'));
const SearchResults = lazy(() => import('../pages/Search/SearchResults'));

// Loading component with different variants
const RouteLoader = ({ type = 'page' }) => {
  const { theme } = useContext(UIContext);
  
  const loaders = {
    page: (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <LoadingSpinner 
          size="lg" 
          variant={theme === 'dark' ? 'light' : 'dark'}
          text="Loading amazing experiences..."
        />
      </div>
    ),
    section: (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="md" text="Loading content..." />
      </div>
    ),
    card: (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    )
  };

  return loaders[type] || loaders.page;
};

// Protected Route Component with multiple permission levels
const ProtectedRoute = ({ 
  children, 
  requiredRole = 'user',
  fallbackPath = '/login',
  requireVerified = false 
}) => {
  const { isAuthenticated, user, isEmailVerified } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Role-based access control
  const roles = {
    user: ['user', 'host', 'admin'],
    host: ['host', 'admin'],
    admin: ['admin']
  };

  const userRole = user?.role || 'user';
  const hasRequiredRole = roles[requiredRole]?.includes(userRole);

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

// Public Only Route (redirects authenticated users away from auth pages)
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to the page they tried to access or home
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Email Verification Required Route
const VerifiedEmailRoute = ({ children }) => {
  const { isAuthenticated, isEmailVerified } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children;
};

// Layout Wrapper with different layout types
const LayoutWrapper = ({ type = 'default', children }) => {
  const layouts = {
    default: <Layout>{children}</Layout>,
    auth: <Layout variant="auth">{children}</Layout>,
    host: <Layout variant="host">{children}</Layout>,
    minimal: <Layout variant="minimal">{children}</Layout>,
    none: children
  };

  return layouts[type];
};

// Route configuration for better maintainability
const routeConfig = [
  // Public routes
  {
    path: '/',
    element: <Home />,
    layout: 'default',
    public: true
  },
  {
    path: '/explore',
    element: <Explore />,
    layout: 'default',
    public: true
  },
  {
    path: '/listing/:id',
    element: <ListingDetail />,
    layout: 'default',
    public: true
  },
  {
    path: '/search',
    element: <SearchResults />,
    layout: 'default',
    public: true
  },

  // Auth routes (public only)
  {
    path: '/login',
    element: <Login />,
    layout: 'auth',
    publicOnly: true
  },
  {
    path: '/signup',
    element: <Signup />,
    layout: 'auth',
    publicOnly: true
  },

  // Protected user routes
  {
    path: '/profile',
    element: <Profile />,
    layout: 'default',
    protected: true
  },
  {
    path: '/favorites',
    element: <Favorites />,
    layout: 'default',
    protected: true
  },
  {
    path: '/trips',
    element: <Trips />,
    layout: 'default',
    protected: true,
    requireVerified: true
  },
  {
    path: '/messages',
    element: <Messages />,
    layout: 'default',
    protected: true
  },
  {
    path: '/booking/:id',
    element: <Booking />,
    layout: 'default',
    protected: true,
    requireVerified: true
  },

  // Host routes
  {
    path: '/host',
    element: <HostDashboard />,
    layout: 'host',
    protected: true,
    requiredRole: 'host'
  },
  {
    path: '/host/listings',
    element: <MyListings />,
    layout: 'host',
    protected: true,
    requiredRole: 'host'
  },
  {
    path: '/host/listings/new',
    element: <CreateListing />,
    layout: 'host',
    protected: true,
    requiredRole: 'host'
  },
  {
    path: '/host/listings/:id/edit',
    element: <EditListing />,
    layout: 'host',
    protected: true,
    requiredRole: 'host'
  },

  // Error routes
  {
    path: '/500',
    element: <ServerError />,
    layout: 'minimal',
    public: true
  },
  {
    path: '/unauthorized',
    element: <NotFound title="Unauthorized" message="You don't have permission to access this page." />,
    layout: 'minimal',
    public: true
  }
];

const AppRoutes = () => {
  const { isLoading } = useContext(AuthContext);

  // Show app-level loading while checking authentication
  if (isLoading) {
    return <RouteLoader type="page" />;
  }

  return (
    <ErrorBoundaryWithRouter>
      <RouteLogger>
        <Suspense fallback={<RouteLoader type="page" />}>
          <Routes>
            {/* Auto-generated routes from config */}
            {routeConfig.map((route) => {
              let element = (
                <LayoutWrapper type={route.layout}>
                  {route.element}
                </LayoutWrapper>
              );

              // Wrap with appropriate route guards
              if (route.protected) {
                element = (
                  <ProtectedRoute 
                    requiredRole={route.requiredRole} 
                    requireVerified={route.requireVerified}
                  >
                    {element}
                  </ProtectedRoute>
                );
              } else if (route.publicOnly) {
                element = (
                  <PublicOnlyRoute>
                    {element}
                  </PublicOnlyRoute>
                );
              } else if (route.requireVerified) {
                element = (
                  <VerifiedEmailRoute>
                    {element}
                  </VerifiedEmailRoute>
                );
              }

              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={element}
                />
              );
            })}

            {/* Nested routes with outlet */}
            <Route path="/host" element={
              <ProtectedRoute requiredRole="host">
                <LayoutWrapper type="host">
                  <Outlet />
                </LayoutWrapper>
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<HostDashboard />} />
              <Route path="analytics" element={<div>Analytics</div>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={
              <LayoutWrapper type="minimal">
                <NotFound />
              </LayoutWrapper>
            } />

            {/* Redirects */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/mylisting" element={<Navigate to="/host/listings" replace />} />
            <Route path="/listingpage1" element={<Navigate to="/host/listings/new" replace />} />
          </Routes>
        </Suspense>
      </RouteLogger>
    </ErrorBoundaryWithRouter>
  );
};

export default AppRoutes;

// Additional utility component for route logging (development)
export { ProtectedRoute, PublicOnlyRoute, VerifiedEmailRoute };