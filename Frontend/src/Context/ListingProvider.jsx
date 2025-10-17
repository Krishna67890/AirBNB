import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from './AuthContext.jsx';
import { useUser } from '../Usercontext.jsx';

export const ListingDataContext = createContext();

// Custom hook for using listing context
export const useListing = () => {
  const context = useContext(ListingDataContext);
  if (!context) {
    throw new Error('useListing must be used within a ListingProvider');
  }
  return context;
};

function ListingProvider({ children }) {
    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [frontEndImage1, setFrontEndImage1] = useState(null);
    const [frontEndImage2, setFrontEndImage2] = useState(null);
    const [frontEndImage3, setFrontEndImage3] = useState(null);
    const [rent, setRent] = useState("");
    const [city, setCity] = useState("");
    const [landmark, setLandmark] = useState("");
    const [category, setCategory] = useState("");
    const [amenities, setAmenities] = useState([]);
    const [maxGuests, setMaxGuests] = useState(1);
    const [bedrooms, setBedrooms] = useState(1);
    const [bathrooms, setBathrooms] = useState(1);
    
    // App state
    const [adding, setAdding] = useState(false);
    const [listingData, setListingData] = useState([]);
    const [currentListing, setCurrentListing] = useState(null);
    const [isServerOnline, setIsServerOnline] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const [searchFilters, setSearchFilters] = useState({
        city: '',
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        guests: 1,
        amenities: []
    });
    
    const { serverUrl } = useContext(AuthContext);
    const { userData } = useUser();
    const abortControllerRef = useRef(null);

    // Available categories and amenities
    const categories = [
        'Apartment', 'House', 'Villa', 'Condo', 'Studio', 
        'Cabin', 'Farm', 'Castle', 'Treehouse', 'Boat'
    ];

    const availableAmenities = [
        'Wifi', 'Pool', 'Kitchen', 'Parking', 'Air Conditioning',
        'Heating', 'Washer', 'Dryer', 'TV', 'Gym',
        'Hot Tub', 'Pet Friendly', 'Breakfast', 'Fireplace', 'Beachfront'
    ];

    // Check server status with retry logic
    const checkServerStatus = useCallback(async (retryCount = 0) => {
        if (!serverUrl) return;

        try {
            abortControllerRef.current = new AbortController();
            const response = await axios.get(`${serverUrl}/api/health`, {
                signal: abortControllerRef.current.signal,
                timeout: 5000
            });
            
            setIsServerOnline(true);
            setError(null);
            console.log('✅ Server is online');
        } catch (error) {
            if (axios.isCancel(error)) return;
            
            console.log('❌ Server is offline, using client-side mode');
            setIsServerOnline(false);
            
            // Retry logic for network errors
            if (retryCount < 3 && (!error.response || error.code === 'NETWORK_ERROR')) {
                setTimeout(() => checkServerStatus(retryCount + 1), 2000 * (retryCount + 1));
            }
        }
    }, [serverUrl]);

    // Optimized image URL creation with cleanup
    const createImageUrls = useCallback((img1, img2, img3) => {
        const urls = {};
        
        [img1, img2, img3].forEach((img, index) => {
            if (img) {
                urls[`image${index + 1}`] = typeof img === 'string' ? img : URL.createObjectURL(img);
            }
        });
        
        return urls;
    }, []);

    // Clean up object URLs to prevent memory leaks
    const revokeImageUrls = useCallback((urls) => {
        Object.values(urls).forEach(url => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    }, []);

    // Enhanced listing creation with offline support
    const handleAddListing = useCallback(async () => {
        if (!validateListingForm()) {
            return { success: false, error: 'Please fill all required fields' };
        }

        setLoading(true);
        setError(null);

        try {
            console.log('🚀 Starting handleAddListing...');
            
            // Create image URLs for immediate display
            const imageUrls = createImageUrls(frontEndImage1, frontEndImage2, frontEndImage3);
            
            // Create listing object
            const listingData = {
                _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: title.trim(),
                description: description.trim(),
                rent: parseInt(rent),
                city: city.trim(),
                landMark: landmark.trim(),
                category: category.trim(),
                amenities,
                maxGuests: parseInt(maxGuests),
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                ...imageUrls,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                userId: userData?._id,
                userName: userData?.name || userData?.username,
                userAvatar: userData?.profilePicture,
                isTemp: true,
                status: 'pending'
            };

            let serverListing = null;

            // Try to send to server if online
            if (isServerOnline) {
                console.log('🌐 Server online, sending to backend...');
                
                const formData = new FormData();
                formData.append("title", listingData.title);
                formData.append("description", listingData.description);
                formData.append("rent", listingData.rent);
                formData.append("city", listingData.city);
                formData.append("landMark", listingData.landMark);
                formData.append("category", listingData.category);
                formData.append("amenities", JSON.stringify(listingData.amenities));
                formData.append("maxGuests", listingData.maxGuests);
                formData.append("bedrooms", listingData.bedrooms);
                formData.append("bathrooms", listingData.bathrooms);
                
                if (frontEndImage1) formData.append("images", frontEndImage1);
                if (frontEndImage2) formData.append("images", frontEndImage2);
                if (frontEndImage3) formData.append("images", frontEndImage3);

                const result = await axios.post(
                    `${serverUrl}/api/listing/add`,
                    formData,
                    { 
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            const progress = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress({ overall: progress });
                        },
                        timeout: 30000
                    }
                );
                
                console.log('✅ Server response:', result.data);
                
                if (result.data._id) {
                    serverListing = {
                        ...listingData,
                        _id: result.data._id,
                        isTemp: false,
                        status: 'active',
                        serverImages: result.data.images || []
                    };
                    
                    // Clean up temp image URLs
                    revokeImageUrls(imageUrls);
                }
            }

            // Update state with the listing
            const finalListing = serverListing || listingData;
            
            setListingData(prev => [finalListing, ...prev]);
            setAdding(prev => !prev);
            
            // Reset form on success
            resetForm();
            setUploadProgress({});

            console.log('🎉 Listing created successfully:', finalListing);
            return { success: true, data: finalListing, isTemp: !serverListing };

        } catch (error) {
            console.error("❌ Error in handleAddListing:", error);
            
            const errorMsg = error.response?.data?.message || 
                           error.message || 
                           'Failed to create listing';
            
            setError({
                message: errorMsg,
                code: error.code,
                status: error.response?.status,
                timestamp: new Date().toISOString()
            });

            // Fallback: create temp listing even if server fails
            const imageUrls = createImageUrls(frontEndImage1, frontEndImage2, frontEndImage3);
            const tempListing = {
                _id: `temp-${Date.now()}`,
                title: title.trim(),
                description: description.trim(),
                rent: parseInt(rent),
                city: city.trim(),
                landMark: landmark.trim(),
                category: category.trim(),
                amenities,
                maxGuests: parseInt(maxGuests),
                bedrooms: parseInt(bedrooms),
                bathrooms: parseInt(bathrooms),
                ...imageUrls,
                createdAt: new Date().toISOString(),
                isTemp: true,
                status: 'draft',
                error: errorMsg
            };
            
            setListingData(prev => [tempListing, ...prev]);
            
            return { 
                success: false, 
                error: errorMsg,
                data: tempListing,
                isTemp: true 
            };
        } finally {
            setLoading(false);
        }
    }, [
        title, description, rent, city, landmark, category, amenities,
        maxGuests, bedrooms, bathrooms, frontEndImage1, frontEndImage2, frontEndImage3,
        isServerOnline, serverUrl, userData, createImageUrls, revokeImageUrls
    ]);

    // Form validation
    const validateListingForm = useCallback(() => {
        const errors = [];
        
        if (!title.trim()) errors.push('Title is required');
        if (!description.trim()) errors.push('Description is required');
        if (!rent || parseInt(rent) <= 0) errors.push('Valid rent amount is required');
        if (!city.trim()) errors.push('City is required');
        if (!category.trim()) errors.push('Category is required');
        if (!frontEndImage1) errors.push('At least one image is required');
        
        if (errors.length > 0) {
            setError({ message: errors.join(', ') });
            return false;
        }
        
        return true;
    }, [title, description, rent, city, category, frontEndImage1]);

    // Reset form function
    const resetForm = useCallback(() => {
        setTitle("");
        setDescription("");
        setFrontEndImage1(null);
        setFrontEndImage2(null);
        setFrontEndImage3(null);
        setRent("");
        setCity("");
        setLandmark("");
        setCategory("");
        setAmenities([]);
        setMaxGuests(1);
        setBedrooms(1);
        setBathrooms(1);
        setError(null);
        setUploadProgress({});
    }, []);

    // Enhanced view card with analytics
    const handleViewCard = useCallback((id) => {
        const found = listingData.find(listing => listing._id === id);
        if (found) {
            setCurrentListing(found);
            
            // Track view analytics (could send to analytics service)
            console.log(`📊 Listing viewed: ${found.title} (${found._id})`);
        }
    }, [listingData]);

    // Enhanced listing fetch with caching
    const getListing = useCallback(async (forceRefresh = false) => {
        if (!serverUrl) return;

        setLoading(true);
        setError(null);

        try {
            console.log('📥 Fetching listings...');
            
            const result = await axios.get(`${serverUrl}/api/listing/get`, { 
                withCredentials: true,
                timeout: 10000,
                headers: forceRefresh ? {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                } : {}
            });
            
            console.log('✅ Listings fetched:', result.data.length);
            
            // Merge server data with local temp listings
            const serverListings = result.data || [];
            const tempListings = listingData.filter(listing => listing.isTemp);
            const mergedListings = [...serverListings, ...tempListings];
            
            setListingData(mergedListings);
            setError(null);
            
        } catch (error) {
            console.error("❌ Error fetching listings:", error);
            
            const errorMsg = error.response?.data?.message || 
                           'Failed to fetch listings';
            
            setError({
                message: errorMsg,
                code: error.code,
                status: error.response?.status
            });

            // Use existing data as fallback
            if (listingData.length === 0) {
                const fallbackData = getFallbackListings();
                setListingData(fallbackData);
            }
        } finally {
            setLoading(false);
        }
    }, [serverUrl, listingData]);

    // Fallback data for offline mode
    const getFallbackListings = useCallback(() => {
        return [
            {
                _id: 'fallback-1',
                title: 'Beautiful Beach House',
                description: 'Amazing beachfront property with great views and modern amenities. Perfect for family vacations.',
                rent: 2500,
                city: 'Goa',
                landMark: 'Near Main Beach',
                category: 'Villa',
                amenities: ['Wifi', 'Pool', 'Air Conditioning', 'Beachfront'],
                maxGuests: 6,
                bedrooms: 3,
                bathrooms: 2,
                image1: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
                image2: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
                createdAt: new Date().toISOString(),
                isTemp: false,
                status: 'active'
            },
            {
                _id: 'fallback-2',
                title: 'Cozy Mountain Cabin',
                description: 'Peaceful retreat in the mountains with stunning views and complete privacy.',
                rent: 1200,
                city: 'Manali',
                landMark: 'Mountain View Road',
                category: 'Cabin',
                amenities: ['Fireplace', 'Kitchen', 'Heating', 'Pet Friendly'],
                maxGuests: 4,
                bedrooms: 2,
                bathrooms: 1,
                image1: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                isTemp: false,
                status: 'active'
            }
        ];
    }, []);

    // Search and filter listings
    const getFilteredListings = useCallback(() => {
        return listingData.filter(listing => {
            const matchesCity = !searchFilters.city || 
                listing.city.toLowerCase().includes(searchFilters.city.toLowerCase());
            const matchesCategory = !searchFilters.category || 
                listing.category === searchFilters.category;
            const matchesPrice = listing.rent >= searchFilters.minPrice && 
                listing.rent <= searchFilters.maxPrice;
            const matchesGuests = listing.maxGuests >= searchFilters.guests;
            const matchesAmenities = searchFilters.amenities.length === 0 ||
                searchFilters.amenities.every(amenity => 
                    listing.amenities?.includes(amenity)
                );

            return matchesCity && matchesCategory && matchesPrice && 
                   matchesGuests && matchesAmenities;
        });
    }, [listingData, searchFilters]);

    // Sync temp listings when coming online
    const syncTempListings = useCallback(async () => {
        const tempListings = listingData.filter(listing => listing.isTemp && !listing.error);
        
        for (const tempListing of tempListings) {
            try {
                // Implement sync logic here
                console.log('Syncing temp listing:', tempListing._id);
            } catch (error) {
                console.error('Failed to sync temp listing:', tempListing._id, error);
            }
        }
    }, [listingData]);

    // Update listing
    const updateListing = useCallback(async (id, updateData) => {
        try {
            if (isServerOnline) {
                const result = await axios.put(
                    `${serverUrl}/api/listing/${id}`,
                    updateData,
                    { withCredentials: true }
                );
                
                setListingData(prev => 
                    prev.map(listing => 
                        listing._id === id ? { ...listing, ...result.data } : listing
                    )
                );
                
                return { success: true, data: result.data };
            } else {
                // Update locally
                setListingData(prev => 
                    prev.map(listing => 
                        listing._id === id ? { ...listing, ...updateData, updatedAt: new Date().toISOString() } : listing
                    )
                );
                
                return { success: true, data: updateData, isTemp: true };
            }
        } catch (error) {
            console.error('Error updating listing:', error);
            return { success: false, error: error.message };
        }
    }, [isServerOnline, serverUrl]);

    // Delete listing
    const deleteListing = useCallback(async (id) => {
        try {
            if (isServerOnline) {
                await axios.delete(`${serverUrl}/api/listing/${id}`, {
                    withCredentials: true
                });
            }
            
            setListingData(prev => prev.filter(listing => listing._id !== id));
            
            if (currentListing?._id === id) {
                setCurrentListing(null);
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting listing:', error);
            return { success: false, error: error.message };
        }
    }, [isServerOnline, serverUrl, currentListing]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Effects
    useEffect(() => {
        checkServerStatus();
        getListing();
        
        // Cleanup function
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    useEffect(() => {
        if (isServerOnline) {
            syncTempListings();
        }
    }, [isServerOnline, syncTempListings]);

    // Context value
    const value = {
        // Form state
        title, setTitle,
        description, setDescription,
        frontEndImage1, setFrontEndImage1,
        frontEndImage2, setFrontEndImage2,
        frontEndImage3, setFrontEndImage3,
        rent, setRent,
        city, setCity,
        landmark, setLandmark,
        category, setCategory,
        amenities, setAmenities,
        maxGuests, setMaxGuests,
        bedrooms, setBedrooms,
        bathrooms, setBathrooms,
        
        // App state
        adding, setAdding,
        listingData, setListingData,
        currentListing, setCurrentListing,
        isServerOnline,
        loading,
        error,
        uploadProgress,
        searchFilters, setSearchFilters,
        
        // Functions
        handleAddListing,
        resetForm,
        handleViewCard,
        createImageUrls,
        getListing,
        getFilteredListings,
        updateListing,
        deleteListing,
        clearError,
        validateListingForm,
        
        // Constants
        categories,
        availableAmenities,
        
        // Derived state
        filteredListings: getFilteredListings(),
        totalListings: listingData.length,
        activeListings: listingData.filter(l => l.status === 'active').length,
        tempListings: listingData.filter(l => l.isTemp).length
    };

    return (
        <ListingDataContext.Provider value={value}>
            {children}
        </ListingDataContext.Provider>
    );
}

export default ListingProvider;