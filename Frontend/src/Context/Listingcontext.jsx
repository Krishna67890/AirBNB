import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ListingDataContext = createContext();

// Custom hook to use the listing context
export const useListingData = () => {
  const context = useContext(ListingDataContext);
  if (!context) {
    throw new Error('useListingData must be used within a ListingDataProvider');
  }
  return context;
};

// Sync function for localStorage
const syncListingsWithLocalStorage = () => {
  try {
    const savedListings = localStorage.getItem('userListings');
    if (savedListings) {
      return JSON.parse(savedListings);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return [];
};

// Provider component
export const ListingDataProvider = ({ children }) => {
  // State for all listing data
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Individual form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frontEndImage1, setFrontEndImage1] = useState(null);
  const [frontEndImage2, setFrontEndImage2] = useState(null);
  const [frontEndImage3, setFrontEndImage3] = useState(null);
  const [rent, setRent] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [category, setCategory] = useState('');
  const [listingType, setListingType] = useState('');

  // Load from localStorage on initial render
  useEffect(() => {
    const savedListings = syncListingsWithLocalStorage();
    if (savedListings.length > 0) {
      setListingData(savedListings);
    }
  }, []);

  // Function to add new listing
  const addListing = (newListing) => {
    setListingData(prev => {
      const updatedListings = [...prev, newListing];
      // Also save to localStorage
      localStorage.setItem('userListings', JSON.stringify(updatedListings));
      return updatedListings;
    });
  };

  // Function to update existing listing
  const updateListing = (listingId, updatedData) => {
    setListingData(prev => {
      const updatedListings = prev.map(listing => 
        listing._id === listingId ? { ...listing, ...updatedData } : listing
      );
      // Save to localStorage
      localStorage.setItem('userListings', JSON.stringify(updatedListings));
      return updatedListings;
    });
  };

  // Function to delete listing
  const deleteListing = (listingId) => {
    setListingData(prev => {
      const updatedListings = prev.filter(listing => listing._id !== listingId);
      // Save to localStorage
      localStorage.setItem('userListings', JSON.stringify(updatedListings));
      return updatedListings;
    });
  };

  // Function to reset form (clear all form state)
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFrontEndImage1(null);
    setFrontEndImage2(null);
    setFrontEndImage3(null);
    setRent('');
    setCity('');
    setLandmark('');
    setCategory('');
    setListingType('');
  };

  // Function to refresh listings (useful for manual refresh)
  const refreshListings = () => {
    const savedListings = syncListingsWithLocalStorage();
    setListingData(savedListings);
  };

  // Context value
  const value = {
    // Main listing data
    listingData,
    setListingData,
    loading,
    setLoading,
    
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    frontEndImage1,
    setFrontEndImage1,
    frontEndImage2,
    setFrontEndImage2,
    frontEndImage3,
    setFrontEndImage3,
    rent,
    setRent,
    city,
    setCity,
    landmark,
    setLandmark,
    category,
    setCategory,
    listingType,
    setListingType,
    
    // Actions
    addListing,
    updateListing,
    deleteListing,
    resetForm,
    refreshListings,
  };

  return (
    <ListingDataContext.Provider value={value}>
      {children}
    </ListingDataContext.Provider>
  );
};

export default ListingDataContext;