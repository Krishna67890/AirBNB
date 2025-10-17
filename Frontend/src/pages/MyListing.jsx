import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingDataContext } from '../Context/Listingcontext.jsx';
import { UserDataContext } from '../Context/Usercontext.jsx';
import Card from '../components/common/card/Card.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import {
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Edit3,
  Eye,
  DollarSign,
  MapPin,
  Calendar,
  TrendingUp,
  Archive,
  MoreVertical,
  X,
  Sparkles,
  Home,
  Building,
  Crown,
  Zap,
  BarChart3,
  Target
} from 'lucide-react';

function MyListing() {
  const { listingData, loading: listingsLoading } = useContext(ListingDataContext);
  const { userData, loading: userLoading } = useContext(UserDataContext);
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showStats, setShowStats] = useState(true);

  // Filter listings where host matches current user _id
  const myListings = useMemo(() => {
    if (!userData || !listingData) return [];
    return listingData.filter(listing => listing.host === userData._id);
  }, [listingData, userData]);

  // Enhanced filtering and sorting
  const filteredAndSortedListings = useMemo(() => {
    let filtered = myListings.filter(listing => {
      const matchesSearch = 
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.rent || 0) - (a.rent || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.rent || 0) - (b.rent || 0));
        break;
      case 'popular':
        // Simulate popularity based on views
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [myListings, searchQuery, statusFilter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalListings = myListings.length;
    const activeListings = myListings.filter(listing => !listing.archived).length;
    const totalEarnings = myListings.reduce((sum, listing) => sum + (listing.earnings || 0), 0);
    const averageRating = myListings.length > 0 
      ? (myListings.reduce((sum, listing) => sum + (listing.rating || 0), 0) / myListings.length).toFixed(1)
      : 0;

    return {
      totalListings,
      activeListings,
      totalEarnings,
      averageRating,
      archivedListings: totalListings - activeListings
    };
  }, [myListings]);

  // Quick actions
  const quickActions = [
    {
      icon: <Plus size={20} />,
      label: 'Create New',
      description: 'Add a new property',
      action: () => navigate('/listingpage1'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'View Analytics',
      description: 'Performance insights',
      action: () => setShowStats(!showStats),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: <Target size={20} />,
      label: 'Optimize',
      description: 'Improve listings',
      action: () => {},
      color: 'from-purple-500 to-pink-600'
    }
  ];

  // Loading state
  if (userLoading || listingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="pt-32 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Skeleton Header */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home size={40} className="text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-gray-600 mb-8 text-lg">
              Please sign in to view and manage your property listings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-rose-500 text-white px-8 py-3 rounded-2xl hover:bg-rose-600 transition-colors font-semibold"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-colors font-semibold"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Nav />
      
      <div className="pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  My Properties
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage your listings and track performance
                </p>
              </div>
              
              <button
                onClick={() => navigate('/listingpage1')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-3 group hover:scale-105"
              >
                <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                Create New Listing
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`bg-gradient-to-r ${action.color} text-white p-6 rounded-2xl hover:shadow-xl transition-all duration-300 text-left group hover:scale-105`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-lg mb-1">{action.label}</div>
                      <div className="text-white/80 text-sm">{action.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          {showStats && myListings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Listings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalListings}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Home size={24} className="text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-green-500 text-sm">
                  <TrendingUp size={16} />
                  <span>{stats.activeListings} active</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-3">Lifetime revenue</div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.averageRating}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Sparkles size={24} className="text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                  <span>Across all listings</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Performance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {myListings.length > 0 ? 'Good' : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Zap size={24} className="text-purple-600" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-3">
                  {stats.archivedListings > 0 ? `${stats.archivedListings} archived` : 'All active'}
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          {myListings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search your listings..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <Grid3X3 size={20} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <List size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          {filteredAndSortedListings.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedListings.map((listing) => (
                <div 
                  key={listing._id}
                  className={
                    viewMode === 'list' 
                      ? "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                      : "bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200"
                  }
                >
                  <Card
                    title={listing.title}
                    landMark={listing.landMark}
                    city={listing.city}
                    image1={listing.image1}
                    image2={listing.image2}
                    image3={listing.image3}
                    rent={listing.rent}
                    category={listing.category}
                    id={listing._id}
                    viewMode={viewMode}
                    showActions={true}
                    onEdit={() => {
                      // Implement edit functionality
                      console.log('Edit listing:', listing._id);
                    }}
                    onView={() => navigate(`/listing/${listing._id}`)}
                    status={listing.status}
                    createdAt={listing.createdAt}
                    views={listing.views || 0}
                    earnings={listing.earnings || 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-2xl mx-auto border border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Home size={48} className="text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {myListings.length === 0 ? 'No Listings Yet' : 'No Matching Listings'}
                </h3>
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  {myListings.length === 0 
                    ? "You haven't created any property listings yet. Start by creating your first listing to attract guests and generate income."
                    : "No listings match your current search criteria. Try adjusting your filters or search terms."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/listingpage1')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Create Your First Listing
                  </button>
                  {myListings.length > 0 && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setSortBy('newest');
                      }}
                      className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl hover:border-blue-500 hover:text-blue-500 transition-all duration-300 font-semibold"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          {myListings.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Target size={24} className="text-blue-500" />
                Boost Your Listings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Eye size={20} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">High-Quality Photos</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Listings with professional photos get 40% more views and bookings.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign size={20} className="text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Competitive Pricing</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Research local market rates to optimize your pricing strategy.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Sparkles size={20} className="text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Detailed Descriptions</h4>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Comprehensive descriptions help guests understand your property's unique features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyListing;