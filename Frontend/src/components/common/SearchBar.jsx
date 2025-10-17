import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../Context/UIContext';
import { useAuth } from '../../Context/AuthContext';
import './SearchBar.css';

const SearchBar = ({ 
  // Variants and styling
  variant = 'default',
  size = 'medium',
  layout = 'horizontal', // 'horizontal' | 'vertical' | 'compact'
  theme = 'auto', // 'auto' | 'light' | 'dark'
  
  // Content
  placeholder = 'Search destinations, homes, experiences...',
  showFilters = true,
  showSuggestions = true,
  autoFocus = false,
  
  // Functionality
  debounceMs = 300,
  maxSuggestions = 5,
  enableVoiceSearch = true,
  enableRecentSearches = true,
  enablePopularSearches = true,
  
  // Callbacks
  onSearch,
  onFocus,
  onBlur,
  onFiltersChange,
  
  // Customization
  className = '',
  inputClassName = '',
  buttonClassName = '',
  
  // Advanced features
  searchCategories = ['stays', 'experiences', 'restaurants'],
  defaultCategory = 'stays',
  enableGeoLocation = true,
  enablePriceRange = true,
  enableDatePicker = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme: appTheme, showToast } = useUI();
  const { isAuthenticated, user } = useAuth();
  
  // Refs
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const recognitionRef = useRef(null);
  
  // State
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    priceRange: [0, 1000],
    amenities: [],
    instantBook: false,
    superHost: false
  });
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);

  // Memoized data
  const popularSearches = useMemo(() => [
    { id: 1, text: 'Beachfront homes', category: 'stays', count: 1243 },
    { id: 2, text: 'Mountain cabins', category: 'stays', count: 867 },
    { id: 3, text: 'City apartments', category: 'stays', count: 2156 },
    { id: 4, text: 'Luxury villas', category: 'stays', count: 543 },
    { id: 5, text: 'Cooking classes', category: 'experiences', count: 321 },
    { id: 6, text: 'Wine tasting', category: 'experiences', count: 198 },
    { id: 7, text: 'Pet-friendly homes', category: 'stays', count: 765 },
    { id: 8, text: 'Pool villas', category: 'stays', count: 432 }
  ], []);

  const searchCategoriesConfig = useMemo(() => ({
    stays: { icon: '🏠', label: 'Stays' },
    experiences: { icon: '⭐', label: 'Experiences' },
    restaurants: { icon: '🍴', label: 'Restaurants' },
    adventures: { icon: '🚀', label: 'Adventures' }
  }), []);

  // Size variants
  const sizeClasses = useMemo(() => ({
    small: {
      container: 'h-10 text-sm',
      input: 'text-sm',
      button: 'px-3 text-sm',
      icon: 'w-4 h-4'
    },
    medium: {
      container: 'h-12 text-base',
      input: 'text-base',
      button: 'px-4 text-base',
      icon: 'w-5 h-5'
    },
    large: {
      container: 'h-14 text-lg',
      input: 'text-lg',
      button: 'px-5 text-lg',
      icon: 'w-6 h-6'
    }
  }), []);

  // Variant styles
  const variantClasses = useMemo(() => ({
    default: 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
    filled: 'bg-gray-100 dark:bg-gray-700 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-600',
    outline: 'bg-transparent border-2 border-gray-400 dark:border-gray-500 hover:border-gray-600 dark:hover:border-gray-400',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 dark:border-gray-600/20'
  }), []);

  // Layout styles
  const layoutClasses = useMemo(() => ({
    horizontal: 'flex-row rounded-full',
    vertical: 'flex-col rounded-2xl p-4 space-y-4',
    compact: 'flex-row rounded-full max-w-md'
  }), []);

  // Load recent searches from localStorage
  useEffect(() => {
    if (enableRecentSearches) {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    }
  }, [enableRecentSearches]);

  // Initialize voice recognition
  useEffect(() => {
    if (enableVoiceSearch && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsVoiceSearching(false);
        handleSearch(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceSearching(false);
        showToast({
          type: 'error',
          title: 'Voice search failed',
          message: 'Please try again or type your search'
        });
      };

      recognitionRef.current.onend = () => {
        setIsVoiceSearching(false);
      };
    }
  }, [enableVoiceSearch, showToast]);

  // Auto-focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounced search suggestions
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length > 1) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query);
      }, debounceMs);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, debounceMs]);

  // Fetch search suggestions
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!showSuggestions) return;

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual search endpoint
      const filtered = popularSearches.filter(item =>
        item.text.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, maxSuggestions);

      // Add current query as first suggestion
      const querySuggestion = {
        id: 'current',
        text: searchQuery,
        category: category,
        isCustom: true
      };

      setSuggestions([querySuggestion, ...filtered]);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showSuggestions, popularSearches, maxSuggestions, category]);

  // Handle search
  const handleSearch = useCallback((searchQuery = query, searchCategory = category) => {
    const finalQuery = searchQuery.trim();
    if (!finalQuery) return;

    // Save to recent searches
    if (enableRecentSearches) {
      const newRecent = [
        { query: finalQuery, category: searchCategory, timestamp: Date.now() },
        ...recentSearches.filter(item => item.query !== finalQuery)
      ].slice(0, 5);
      
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }

    // Call custom callback or default navigation
    if (onSearch) {
      onSearch(finalQuery, searchCategory, filters);
    } else {
      const searchParams = new URLSearchParams({
        q: finalQuery,
        category: searchCategory,
        ...filters
      });
      navigate(`/search?${searchParams.toString()}`);
    }

    // Reset states
    setSuggestions([]);
    setIsFocused(false);
    setIsExpanded(false);
    inputRef.current?.blur();
  }, [query, category, filters, enableRecentSearches, recentSearches, onSearch, navigate]);

  // Handle voice search
  const handleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) {
      showToast({
        type: 'error',
        title: 'Voice search not supported',
        message: 'Your browser does not support voice search'
      });
      return;
    }

    if (isVoiceSearching) {
      recognitionRef.current.stop();
      setIsVoiceSearching(false);
    } else {
      setIsVoiceSearching(true);
      recognitionRef.current.start();
    }
  }, [isVoiceSearching, showToast]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
          const suggestion = suggestions[currentSuggestionIndex];
          setQuery(suggestion.text);
          handleSearch(suggestion.text, suggestion.category);
        } else {
          handleSearch();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        setCurrentSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setCurrentSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        break;

      case 'Escape':
        setSuggestions([]);
        setIsFocused(false);
        inputRef.current?.blur();
        break;

      default:
        break;
    }
  }, [currentSuggestionIndex, suggestions, handleSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      onFiltersChange?.(newFilters);
      return newFilters;
    });
  }, [onFiltersChange]);

  // Get current theme
  const currentTheme = useMemo(() => {
    if (theme === 'auto') return appTheme;
    return theme;
  }, [theme, appTheme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
        setIsExpanded(false);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render search suggestions
  const renderSuggestions = () => {
    if (!showSuggestions || (!suggestions.length && !recentSearches.length)) return null;

    return (
      <div className="search-suggestions-container">
        {/* Recent Searches */}
        {recentSearches.length > 0 && query.length === 0 && (
          <div className="suggestions-section">
            <div className="suggestions-header">Recent searches</div>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(search.query);
                  setCategory(search.category);
                  handleSearch(search.query, search.category);
                }}
                className="suggestion-item"
              >
                <span className="suggestion-icon">🕒</span>
                <span className="suggestion-text">{search.query}</span>
                <span className="suggestion-category">{search.category}</span>
              </button>
            ))}
          </div>
        )}

        {/* Search Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <div className="suggestions-header">Suggestions</div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => {
                  setQuery(suggestion.text);
                  if (suggestion.category) setCategory(suggestion.category);
                  handleSearch(suggestion.text, suggestion.category);
                }}
                className={`suggestion-item ${
                  index === currentSuggestionIndex ? 'suggestion-item-active' : ''
                }`}
              >
                <span className="suggestion-icon">
                  {suggestion.isCustom ? '🔍' : searchCategoriesConfig[suggestion.category]?.icon || '📍'}
                </span>
                <span className="suggestion-text">{suggestion.text}</span>
                {suggestion.count && (
                  <span className="suggestion-count">{suggestion.count.toLocaleString()}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Popular Searches */}
        {enablePopularSearches && query.length === 0 && (
          <div className="suggestions-section">
            <div className="suggestions-header">Popular searches</div>
            <div className="popular-searches-grid">
              {popularSearches.slice(0, 6).map((search) => (
                <button
                  key={search.id}
                  onClick={() => {
                    setQuery(search.text);
                    setCategory(search.category);
                    handleSearch(search.text, search.category);
                  }}
                  className="popular-search-item"
                >
                  <span className="popular-search-icon">
                    {searchCategoriesConfig[search.category]?.icon}
                  </span>
                  <span className="popular-search-text">{search.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render filters
  const renderFilters = () => {
    if (!showFilters || layout === 'compact') return null;

    return (
      <div className="search-filters-container">
        <div className="filters-grid">
          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Where</label>
            <input
              type="text"
              placeholder="Anywhere"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Check-in Date */}
          <div className="filter-group">
            <label className="filter-label">Check in</label>
            <input
              type="date"
              value={filters.checkIn}
              onChange={(e) => handleFilterChange('checkIn', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Check-out Date */}
          <div className="filter-group">
            <label className="filter-label">Check out</label>
            <input
              type="date"
              value={filters.checkOut}
              onChange={(e) => handleFilterChange('checkOut', e.target.value)}
              className="filter-input"
            />
          </div>

          {/* Guests */}
          <div className="filter-group">
            <label className="filter-label">Guests</label>
            <select
              value={filters.guests}
              onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
              className="filter-input"
            >
              {[1,2,3,4,5,6,7,8].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`
        search-bar-container
        ${layoutClasses[layout]}
        ${className}
        theme-${currentTheme}
      `}
    >
      {/* Search Categories */}
      {searchCategories.length > 1 && (
        <div className="search-categories">
          {searchCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`category-button ${
                category === cat ? 'category-button-active' : ''
              }`}
            >
              <span className="category-icon">{searchCategoriesConfig[cat]?.icon}</span>
              <span className="category-label">{searchCategoriesConfig[cat]?.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Search Input */}
      <div className={`
        search-input-container
        ${sizeClasses[size].container}
        ${variantClasses[variant]}
        ${isFocused ? 'search-input-container-focused' : ''}
      `}>
        {/* Search Icon */}
        <div className="search-icon-container">
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <svg className={sizeClasses[size].icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setIsExpanded(true);
            onFocus?.();
          }}
          onBlur={() => {
            onBlur?.();
          }}
          placeholder={placeholder}
          className={`
            search-input
            ${sizeClasses[size].input}
            ${inputClassName}
          `}
        />

        {/* Action Buttons */}
        <div className="search-actions">
          {/* Voice Search Button */}
          {enableVoiceSearch && (
            <button
              onClick={handleVoiceSearch}
              className={`voice-search-button ${
                isVoiceSearching ? 'voice-search-button-active' : ''
              }`}
              type="button"
            >
              <svg className={sizeClasses[size].icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          )}

          {/* Search Button */}
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim()}
            className={`
              search-button
              ${sizeClasses[size].button}
              ${buttonClassName}
              ${query.trim() 
                ? 'search-button-active' 
                : 'search-button-disabled'
              }
            `}
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      {renderFilters()}

      {/* Suggestions Dropdown */}
      {(isFocused || isExpanded) && renderSuggestions()}
    </div>
  );
};

// Advanced search utilities
export const useSearch = () => {
  const [searchHistory, setSearchHistory] = useState([]);

  const addToHistory = useCallback((query, category, resultsCount = 0) => {
    const searchEntry = {
      query,
      category,
      resultsCount,
      timestamp: Date.now(),
      id: Date.now().toString()
    };

    setSearchHistory(prev => [searchEntry, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  const getSearchStats = useCallback(() => {
    const totalSearches = searchHistory.length;
    const mostSearched = searchHistory.reduce((acc, search) => {
      acc[search.query] = (acc[search.query] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSearches,
      mostSearched: Object.entries(mostSearched)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }, [searchHistory]);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    getSearchStats
  };
};

// Higher Order Component for search functionality
export const withSearch = (Component) => {
  return function SearchEnhancedComponent(props) {
    const searchUtils = useSearch();
    return <Component {...props} searchUtils={searchUtils} />;
  };
};

export default React.memo(SearchBar);