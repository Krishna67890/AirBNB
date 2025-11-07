import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './Context/AuthContext';
import { UIProvider } from './Context/UIContext';
import { ListingDataProvider } from './Context/Listingcontext.jsx';
import UserProvider from './Context/UserContext.jsx'; // Use UserProvider
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <ListingDataProvider>
            <UserProvider> {/* Use UserProvider */}
              <App />
            </UserProvider>
          </ListingDataProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);