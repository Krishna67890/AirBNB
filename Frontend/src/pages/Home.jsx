import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useListingData } from '../Context/Listingcontext.jsx';
import { useUser } from '../Context/UserContext.jsx';
import Card from '../components/common/card/Card.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  TrendingUp,
  Star,
  Home as HomeIcon,
  Map,
  Filter,
  SortAsc,
  Heart,
  Plus,
  MapPin
} from 'lucide-react';
import debounce from 'lodash/debounce';

function Home() {
  const { listingData, loading: listingsLoading, refreshListings } = useListingData();
  const { userData, isOnline } = useUser();
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const { newListing, showSuccess } = location.state || {};
  
  // State management
  const [displayedListings, setDisplayedListings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);

  // Add this useEffect to load listings from localStorage
  useEffect(() => {
    const loadListingsFromStorage = () => {
      try {
        const savedListings = localStorage.getItem('userListings');
        console.log("📋 Loading from localStorage:", savedListings);
        if (savedListings) {
          const listings = JSON.parse(savedListings);
          console.log("🔄 Parsed listings:", listings);
          setDisplayedListings(listings);
          console.log("✅ Set displayed listings:", listings.length);
        } else {
          console.log("❌ No listings found in localStorage");
        }
      } catch (error) {
        console.error("❌ Error loading listings from storage:", error);
      }
    };

    // Load initially
    loadListingsFromStorage();

    // Also load when we come back from creating a listing
    if (location.state?.showSuccess) {
      console.log("🎉 Success state detected, reloading listings...");
      setTimeout(() => {
        loadListingsFromStorage();
      }, 100);
    }
  }, [location.state?.showSuccess]);

  // Also load from context if available (as fallback)
  useEffect(() => {
    if (listingData && listingData.length > 0) {
      console.log("📦 Loading from context data:", listingData.length);
      setDisplayedListings(listingData);
    }
  }, [listingData]);

  // Debug: Log when displayedListings changes
  useEffect(() => {
    console.log("🔄 displayedListings updated:", displayedListings.length);
  }, [displayedListings]);

  // Success message handler
  useEffect(() => {
    if (showSuccess) {
      setSuccessMessage('🎉 Your listing has been successfully added!');
      
      // Reload listings when success message shows
      setTimeout(() => {
        const savedListings = localStorage.getItem('userListings');
        if (savedListings) {
          const listings = JSON.parse(savedListings);
          setDisplayedListings(listings);
          console.log("🔄 Reloaded listings after success:", listings.length);
        }
      }, 500);
      
      const timer = setTimeout(() => {
        setSuccessMessage('');
        // Clear the state from navigation
        window.history.replaceState({}, document.title);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showSuccess, newListing]);

  // Load favorites and recent searches from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('airbnb-favorites');
    const savedSearches = localStorage.getItem('airbnb-recent-searches');
    
    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
    if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('airbnb-favorites', JSON.stringify([...favorites]));
    localStorage.setItem('airbnb-recent-searches', JSON.stringify(recentSearches.slice(0, 5)));
  }, [favorites, recentSearches]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.trim() && !recentSearches.includes(query.toLowerCase())) {
        setRecentSearches(prev => [query.toLowerCase(), ...prev].slice(0, 5));
      }
    }, 1000),
    [recentSearches]
  );

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Filtering and sorting
  const filteredAndSortedListings = useMemo(() => {
    if (!displayedListings.length) {
      console.log("❌ No displayed listings to filter");
      return [];
    }

    console.log("🔍 Filtering listings:", displayedListings.length);
    const searchTerms = searchQuery.toLowerCase().split(' ');
    
    let filtered = displayedListings.filter(listing => {
      if (!listing) return false;
      
      const searchableText = `
        ${listing.title || ''} ${listing.description || ''} ${listing.city || ''} ${listing.landMark || ''} ${listing.category || ''}
      `.toLowerCase();

      const matchesSearch = searchTerms.every(term => 
        searchableText.includes(term)
      );

      const matchesCategory = 
        selectedCategory === 'all' || 
        listing.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesPrice = 
        listing.rent >= priceRange[0] && listing.rent <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    console.log("✅ After filtering:", filtered.length);

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.rent || 0) - (b.rent || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.rent || 0) - (a.rent || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => {
          const scoreA = (new Date(a.createdAt || 0).getTime()) + (Math.random() * 1000000);
          const scoreB = (new Date(b.createdAt || 0).getTime()) + (Math.random() * 1000000);
          return scoreB - scoreA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [displayedListings, searchQuery, selectedCategory, priceRange, sortBy]);

  // Categories with counts
  const categoriesWithCounts = useMemo(() => {
    const categoryCounts = displayedListings.reduce((acc, listing) => {
      if (!listing) return acc;
      const cat = listing.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'all', count: displayedListings.length, label: 'All Properties' },
      ...Object.entries(categoryCounts).map(([name, count]) => ({
        name: name.toLowerCase(),
        count,
        label: name
      }))
    ];
  }, [displayedListings]);

  // Price statistics
  const priceStats = useMemo(() => {
    if (!displayedListings.length) return { min: 0, max: 10000, avg: 5000 };
    
    const prices = displayedListings
      .map(listing => listing?.rent || 0)
      .filter(price => price > 0 && price < 1000000);
    
    if (prices.length === 0) return { min: 0, max: 10000, avg: 5000 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    };
  }, [displayedListings]);

  // Favorite toggle
  const toggleFavorite = useCallback((listingId, event) => {
    event?.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  }, []);

  // Filter management
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, priceStats.max || 10000]);
    setSortBy('newest');
    searchInputRef.current?.focus();
  }, [priceStats.max]);

  const applyQuickFilter = useCallback((filterType) => {
    switch (filterType) {
      case 'popular':
        setSortBy('popular');
        break;
      case 'trending':
        setSortBy('popular');
        setPriceRange([0, priceStats.avg || 5000]);
        break;
      case 'affordable':
        setPriceRange([0, Math.min(2000, priceStats.avg || 2000)]);
        setSortBy('price-low');
        break;
      case 'luxury':
        setPriceRange([priceStats.avg || 5000, priceStats.max || 10000]);
        setSortBy('price-high');
        break;
      default:
        break;
    }
    setShowFilters(false);
  }, [priceStats.avg, priceStats.max]);

  // Quick actions
  const quickActions = [
    { 
      icon: <TrendingUp size={20} />, 
      label: 'Trending', 
      filter: 'trending',
      description: 'Most popular right now'
    },
    { 
      icon: <Star size={20} />, 
      label: 'Affordable', 
      filter: 'affordable',
      description: 'Great deals under $2,000'
    },
    { 
      icon: <HomeIcon size={20} />, 
      label: 'Luxury', 
      filter: 'luxury',
      description: 'High-end properties'
    },
    { 
      icon: <Map size={20} />, 
      label: 'Near Me', 
      filter: 'location',
      description: 'Properties in your area'
    },
  ];

  // Handle card click to view details
  const handleCardClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // Debug button to check localStorage
  const debugLocalStorage = () => {
    const listings = localStorage.getItem('userListings');
    console.log('🔍 DEBUG - localStorage userListings:', listings ? JSON.parse(listings) : 'Empty');
    console.log('🔍 DEBUG - displayedListings:', displayedListings);
    console.log('🔍 DEBUG - filteredAndSortedListings:', filteredAndSortedListings);
  };

  // Loading state
  if (listingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="w-full pt-32 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mx-auto mb-8">
              <div className="h-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-32 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Nav />
      
      {/* Debug Button - Remove after testing */}
      <button 
        onClick={debugLocalStorage}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-50"
        title="Debug localStorage"
      >
        🐛
      </button>

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="font-medium">{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            You're currently offline
          </div>
        </div>
      )}

      <div className="w-full pt-28 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover unique homes and experiences that make your trip unforgettable
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by location, property, amenities..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-24 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-white/80 shadow-xl transition-all duration-300"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    showFilters ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-500 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal size={16} />
                </button>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {quickActions.map((action) => (
              <button
                key={action.filter}
                onClick={() => applyQuickFilter(action.filter)}
                className="flex items-center gap-3 px-6 py-4 bg-white/80 border-2 border-gray-200 rounded-2xl hover:border-rose-500 hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-rose-500">
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{action.label}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </button>
            ))}
            
            {/* Add My Listing Button */}
            <button
              onClick={() => navigate('/mylisting')}
              className="flex items-center gap-3 px-6 py-4 bg-rose-500 text-white border-2 border-rose-500 rounded-2xl hover:bg-rose-600 hover:shadow-2xl transition-all duration-300"
            >
              <Plus size={20} />
              <div className="text-left">
                <div className="font-semibold">My Listing</div>
                <div className="text-sm text-rose-100">Manage your properties</div>
              </div>
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            {/* Results Count */}
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredAndSortedListings.length} Properties Found
              </h2>
              {(searchQuery || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < (priceStats.max || 10000)) && (
                <button
                  onClick={clearFilters}
                  className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1"
                >
                  <X size={16} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <SortAsc size={18} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categoriesWithCounts.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                }`}
              >
                <span className="font-medium">{category.label}</span>
                <span className={`text-sm ${
                  selectedCategory === category.name ? 'text-rose-100' : 'text-gray-500'
                }`}>
                  ({category.count})
                </span>
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max={priceStats.max || 10000}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max={priceStats.max || 10000}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹{priceStats.max || 10000}</span>
                  </div>
                </div>

                {/* Quick Price Buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Select
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: 'Under ₹2,000', range: [0, 2000] },
                      { label: '₹2,000-₹5,000', range: [2000, 5000] },
                      { label: '₹5,000-₹10,000', range: [5000, 10000] },
                      { label: 'Over ₹10,000', range: [10000, priceStats.max || 20000] }
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPriceRange(item.range)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-rose-500 hover:text-rose-500 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedListings.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-6"
            }>
              {filteredAndSortedListings.map((listing) => (
                <div
                  key={listing._id}
                  onClick={() => handleCardClick(listing._id)}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'
                  }`}>
                    <img
                      src={listing.image1 || '/placeholder-image.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <button
                      onClick={(e) => toggleFavorite(listing._id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        size={20} 
                        className={
                          favorites.has(listing._id) 
                            ? "text-rose-500 fill-current" 
                            : "text-gray-600"
                        } 
                      />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                      ₹{listing.rent}/night
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-rose-500 transition-colors">
                        {listing.title}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin size={14} className="mr-1" />
                      <span>{listing.landMark}, {listing.city}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-rose-500 fill-current" />
                        <span className="text-sm font-medium">4.89</span>
                        <span className="text-gray-500 text-sm">(128)</span>
                      </div>
                      
                      <div className="bg-rose-50 text-rose-700 px-2 py-1 rounded-full text-xs font-medium">
                        {listing.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {displayedListings.length === 0 ? "No properties available" : "No properties found"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {searchQuery || selectedCategory !== 'all' 
                  ? "Try adjusting your search criteria or filters to find more properties."
                  : "There are no properties available at the moment. Check back later!"
                }
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="bg-rose-500 text-white px-8 py-3 rounded-2xl hover:bg-rose-600 transition-colors font-semibold"
                >
                  Clear all filters
                </button>
              )}
              <div className="mt-4">
                <button
                  onClick={() => navigate('/listingpage1')}
                  className="bg-green-500 text-white px-8 py-3 rounded-2xl hover:bg-green-600 transition-colors font-semibold"
                >
                  Create Your First Listing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;