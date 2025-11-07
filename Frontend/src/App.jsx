// src/App.jsx
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ListingDataProvider } from './Context/Listingcontext.jsx';
import { UserProvider } from './Context/UserContext.jsx';
import { AuthProvider } from './Context/AuthContext.jsx';
import { UIProvider } from './Context/UIContext.jsx';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ListingPage1 from './pages/ListingPage1';
import ListingPage2 from './pages/ListingPage2';
import ListingPage3 from './pages/Listingpage3';
import ListingDetails from './pages/ListingDetails';
import MyListing from './pages/MyListing';
import NetworkErrorHandler from './components/common/NetworkErrorHandler.jsx';
import NotFound from './pages/NotFound';
import OfflinePage from './pages/OfflinePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <UserProvider>
          <ListingDataProvider>
            <NetworkErrorHandler>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/listing/:id" element={<ListingDetails />} />
                <Route path="/offline" element={<OfflinePage />} />

                {/* Listing Creation Flow */}
                <Route path="/listingpage1" element={<ListingPage1 />} />
                <Route path="/listingpage2" element={<ListingPage2 />} />
                <Route path="/listingpage3" element={<ListingPage3 />} />
                <Route path="/mylisting" element={<MyListing />} />

                {/* Redirect for old hyphenated path */}
                <Route 
                  path="/listing-page3" 
                  element={<Navigate to="/listingpage3" replace />} 
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </NetworkErrorHandler>
          </ListingDataProvider>
        </UserProvider>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;