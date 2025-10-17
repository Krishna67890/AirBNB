import React, { useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ListingDataContext } from '../Context/Listingcontext.jsx';
import { UserDataContext } from '../Context/Usercontext.jsx';
import Card from '../components/common/card/Card.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Star, 
  TrendingUp, 
  X,
  SlidersHorizontal,
  Grid3X3,
  List,
  Heart,
  Filter,
  Home as HomeIcon,
  Map
} from 'lucide-react';
import debounce from 'lodash/debounce';

function Home() {
  const { listingData, loading: listingsLoading, refreshListings } = useContext(ListingDataContext);
  const { userData, isOnline } = useContext(UserDataContext);
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

  // Success message handler with enhanced animation
  useEffect(() => {
    if (showSuccess && newListing) {
      setSuccessMessage('🎉 Your listing has been successfully added!');
      
      const timer = setTimeout(() => {
        setSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newListing, showSuccess]);

  // Initialize listings with error handling
  useEffect(() => {
    if (listingData && listingData.length > 0) {
      setDisplayedListings(listingData);
    }
  }, [listingData]);

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

  // Advanced filtering and sorting with performance optimization
  const filteredAndSortedListings = useMemo(() => {
    if (!displayedListings.length) return [];

    const searchTerms = searchQuery.toLowerCase().split(' ');
    
    let filtered = displayedListings.filter(listing => {
      const searchableText = `
        ${listing.title} ${listing.description} ${listing.city} ${listing.landMark} ${listing.category}
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

    // Enhanced sorting with multiple criteria
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.rent - b.rent);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.rent - a.rent);
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

  // Enhanced categories with counts
  const categoriesWithCounts = useMemo(() => {
    const categoryCounts = displayedListings.reduce((acc, listing) => {
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

  // Price statistics with enhanced calculation
  const priceStats = useMemo(() => {
    if (!displayedListings.length) return { min: 0, max: 10000, avg: 5000 };
    
    const prices = displayedListings
      .map(listing => listing.rent)
      .filter(price => price > 0 && price < 1000000); // Sanity check
    
    if (prices.length === 0) return { min: 0, max: 10000, avg: 5000 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    };
  }, [displayedListings]);

  // Enhanced favorite toggle with animation feedback
  const toggleFavorite = useCallback((listingId, event) => {
    event?.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
        // Add haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(50);
      }
      return newFavorites;
    });
  }, []);

  // Enhanced filter management
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
      default:
        break;
    }
    setShowFilters(false);
  }, [priceStats.avg]);

  // Quick actions with enhanced functionality
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

  // Enhanced loading state
  if (listingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="w-full pt-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Skeleton Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="h-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            {/* Skeleton Quick Actions */}
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-32 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
            
            {/* Skeleton Cards */}
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
      
      {/* Enhanced Success Notification */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
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
        {/* Enhanced Hero Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover unique homes and experiences that make your trip unforgettable
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 relative">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by location, property, amenities..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-12 pr-24 py-4 rounded-2xl border-2 border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 bg-white/80 backdrop-blur-sm shadow-xl transition-all duration-300"
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

            {/* Recent Searches Dropdown */}
            {isSearchFocused && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 z-20 animate-slide-down">
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Recent Searches</div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(search);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Search size={16} className="text-gray-400" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Quick Actions */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            {quickActions.map((action) => (
              <button
                key={action.filter}
                onClick={() => applyQuickFilter(action.filter)}
                className="flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl hover:border-rose-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="text-rose-500 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">{action.label}</div>
                  <div className="text-sm text-gray-500">{action.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="max-w-7xl mx-auto mb-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8 animate-slide-down">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Filters & Sorting</h3>
                <p className="text-gray-600 mt-1">Refine your search results</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-rose-500 transition-colors font-medium"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">Property Type</label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {categoriesWithCounts.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.name
                          ? 'bg-rose-500 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.label}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          selectedCategory === category.name
                            ? 'bg-white/20'
                            : 'bg-gray-200'
                        }`}>
                          {category.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Price Range
                </label>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-rose-100 to-rose-200 p-6 rounded-2xl">
                    <div className="text-2xl font-bold text-rose-600 mb-2">
                      ${priceRange[0]} - ${priceRange[1]}
                    </div>
                    <div className="text-sm text-rose-700">
                      Average: ${priceStats.avg}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={0}
                      max={priceStats.max}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">Sort By</label>
                <div className="space-y-3">
                  {[
                    { value: 'newest', label: 'Newest First', icon: '🆕' },
                    { value: 'price-low', label: 'Price: Low to High', icon: '💰' },
                    { value: 'price-high', label: 'Price: High to Low', icon: '💎' },
                    { value: 'popular', label: 'Most Popular', icon: '🔥' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                        sortBy === option.value
                          ? 'bg-rose-500 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">View Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                      viewMode === 'grid'
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Grid3X3 size={20} />
                    <span className="text-sm font-medium">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                      viewMode === 'list'
                        ? 'bg-rose-500 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <List size={20} />
                    <span className="text-sm font-medium">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900">
                {filteredAndSortedListings.length} {filteredAndSortedListings.length === 1 ? 'Property' : 'Properties'} Found
              </h2>
              {searchQuery && (
                <p className="text-gray-600 mt-2 text-lg">
                  Results for "<span className="font-semibold text-rose-500">{searchQuery}</span>"
                </p>
              )}
              {(selectedCategory !== 'all' || priceRange[1] < priceStats.max) && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory('all')}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                  {priceRange[1] < priceStats.max && (
                    <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Under ${priceRange[1]}
                      <button onClick={() => setPriceRange([0, priceStats.max])}>
                        <X size={14} />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced View Toggle */}
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-2xl p-1 border border-gray-200 shadow-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-rose-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-rose-500'
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-rose-500 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-rose-500'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
              
              <button
                onClick={refreshListings}
                className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-all duration-200 shadow-lg"
                title="Refresh listings"
              >
                <div className="w-5 h-5">🔄</div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Listings Grid/List */}
        {filteredAndSortedListings.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }>
              {filteredAndSortedListings.map((list, index) => (
                <div 
                  key={list._id || `temp-${index}`}
                  className={
                    viewMode === 'list' 
                      ? "bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-gray-200/50"
                      : "bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200/50"
                  }
                >
                  <Card
                    title={list.title}
                    landMark={list.landMark || list.landmark}
                    city={list.city}
                    image1={list.image1 || list.frontEndImage1}
                    image2={list.image2 || list.frontEndImage2}
                    image3={list.image3 || list.frontEndImage3}
                    rent={list.rent}
                    category={list.category}
                    id={list._id}
                    isFavorite={favorites.has(list._id)}
                    onToggleFavorite={(e) => toggleFavorite(list._id, e)}
                    viewMode={viewMode}
                    description={list.description}
                    createdAt={list.createdAt}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto text-center py-20">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-16 max-w-2xl mx-auto border border-gray-200/50">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search className="text-rose-500" size={48} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-4">No properties found</h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {searchQuery 
                  ? `We couldn't find any properties matching "${searchQuery}". Try adjusting your search terms or filters.`
                  : 'No properties match your current filters. Try broadening your search criteria.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={clearFilters}
                  className="bg-rose-500 text-white px-8 py-4 rounded-2xl hover:bg-rose-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Show All Properties
                </button>
                <button 
                  onClick={() => navigate('/listingpage1')}
                  className="border-2 border-rose-500 text-rose-500 px-8 py-4 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 font-semibold text-lg"
                >
                  Create New Listing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Floating Action Button */}
      {userData && (
        <button
          onClick={() => navigate('/listingpage1')}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-40 group"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</div>
            <div className="text-left">
              <div className="font-semibold text-sm">Create</div>
              <div className="text-xs opacity-90">New Listing</div>
            </div>
          </div>
        </button>
      )}

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 left-8 bg-white text-gray-600 p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 z-40 border border-gray-200"
      >
        <div className="w-6 h-6">↑</div>
      </button>
    </div>
  );
}

export default Home;