// src/context/ListingContext.jsx
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

const ListingDataContext = createContext();

// Custom hook for using listing context
export const useListingData = () => {
  const context = useContext(ListingDataContext);
  if (!context) {
    throw new Error('useListingData must be used within a ListingProvider');
  }
  return context;
};

export const ListingDataProvider = ({ children }) => {
    // Your complex implementation here (the entire second part of your file)
    // ... keep all the useState, useCallback, useEffect, etc.
    
    const value = {
        // Your context value object
    };

    return (
        <ListingDataContext.Provider value={value}>
            {children}
        </ListingDataContext.Provider>
    );
};

export default ListingDataContext;