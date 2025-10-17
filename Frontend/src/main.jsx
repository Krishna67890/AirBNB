// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { ListingDataProvider } from './context/ListingContext'; 
import { UserDataProvider } from './context/UserContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <ListingDataProvider> {/* ✅ Use correct provider name */}
            <UserDataProvider>
              <App />
            </UserDataProvider>
          </ListingDataProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);