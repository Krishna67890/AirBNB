import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingData } from '../Context/Listingcontext.jsx';
import { useUser } from '../Context/UserContext.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Home, 
  Search, 
  Filter, 
  SortAsc, 
  MapPin, 
  DollarSign,
  Calendar,
  Star,
  MoreVertical,
  Download,
  Share2,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  List,
  ArrowRight
} from 'lucide-react';

function MyListing() {
  const navigate = useNavigate();
  const { listingData, loading, deleteListing, updateListing } = useListingData();
  const { userData } = useUser();
  
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [showStats, setShowStats] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  // Filter user's listings with proper error handling
  const myListings = useMemo(() => {
    if (!listingData || !Array.isArray(listingData) || !userData) return [];
    
    let filtered = listingData.filter(listing => 
      listing && (listing.userId === userData.id || listing.host === userData.id)
    );

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing?.landMark?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing?.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(listing => listing?.status === filterStatus);
    }

    // Sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'rent-low-high':
        return sorted.sort((a, b) => (a.rent || 0) - (b.rent || 0));
      case 'rent-high-low':
        return sorted.sort((a, b) => (b.rent || 0) - (a.rent || 0));
      case 'title':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case 'popular':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      default:
        return sorted;
    }
  }, [listingData, userData, sortBy, filterStatus, searchTerm]);

  // Statistics
  const stats = useMemo(() => ({
    total: myListings.length,
    active: myListings.filter(listing => listing?.status === 'active').length,
    inactive: myListings.filter(listing => listing?.status === 'inactive').length,
    pending: myListings.filter(listing => listing?.status === 'pending').length,
    totalRent: myListings.reduce((sum, listing) => sum + (listing?.rent || 0), 0),
    avgRent: myListings.length > 0 ? Math.round(myListings.reduce((sum, listing) => sum + (listing?.rent || 0), 0) / myListings.length) : 0,
    totalViews: myListings.reduce((sum, listing) => sum + (listing?.views || 0), 0),
    avgRating: myListings.length > 0 ? (myListings.reduce((sum, listing) => sum + (listing?.rating || 4.5), 0) / myListings.length).toFixed(1) : '0.0'
  }), [myListings]);

  // Handle listing selection
  const toggleListingSelection = (listingId) => {
    setSelectedListings(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(listingId)) {
        newSelection.delete(listingId);
      } else {
        newSelection.add(listingId);
      }
      return newSelection;
    });
  };

  const selectAllListings = () => {
    if (selectedListings.size === myListings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(myListings.map(listing => listing._id)));
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedListings.size === 0) return;

    const actions = {
      activate: { status: 'active' },
      deactivate: { status: 'inactive' },
      archive: { status: 'archived' },
      delete: null
    };

    if (bulkAction === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selectedListings.size} listings?`)) return;
      
      for (const listingId of selectedListings) {
        await deleteListing(listingId);
      }
    } else {
      for (const listingId of selectedListings) {
        await updateListing(listingId, actions[bulkAction]);
      }
    }

    setSelectedListings(new Set());
    setBulkAction('');
  };

  // Individual actions
  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(listingId);
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing._id);
    setEditForm({
      title: listing.title || '',
      rent: listing.rent || '',
      city: listing.city || '',
      landMark: listing.landMark || '',
      category: listing.category || '',
      description: listing.description || ''
    });
  };

  const handleUpdate = async (listingId) => {
    if (!editForm.title || !editForm.rent || !editForm.city) {
      alert('Please fill in all required fields');
      return;
    }

    await updateListing(listingId, editForm);
    setEditingListing(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
    setEditForm({});
  };

  const handleViewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleCreateNewListing = () => {
    navigate('/listingpage1');
  };

  const handleDuplicateListing = async (listing) => {
    const duplicatedListing = {
      ...listing,
      title: `${listing.title} (Copy)`,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    // You'll need to add a createListing function to your context
    // await createListing(duplicatedListing);
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
      inactive: { color: 'bg-yellow-100 text-yellow-800', icon: <XCircle size={14} /> },
      pending: { color: 'bg-blue-100 text-blue-800', icon: <AlertCircle size={14} /> },
      draft: { color: 'bg-gray-100 text-gray-800', icon: <Edit size={14} /> },
      archived: { color: 'bg-red-100 text-red-800', icon: <Archive size={14} /> }
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
              ))}
            </div>
            <div className="bg-gray-200 rounded-lg h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600 mt-2">Manage and track your property listings</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 size={18} />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
              
              <button
                onClick={handleCreateNewListing}
                className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors font-semibold"
              >
                <Plus size={18} />
                Add Listing
              </button>

              {/* Next Button to ListingPage1 */}
              <button
                onClick={() => navigate('/listingpage1')}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create New Listing
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {showStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-rose-600">{stats.total}</div>
                    <div className="text-sm text-rose-700">Total Listings</div>
                  </div>
                  <Home className="text-rose-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                    <div className="text-sm text-green-700">Active</div>
                  </div>
                  <CheckCircle className="text-green-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">₹{stats.totalRent}</div>
                    <div className="text-sm text-blue-700">Monthly Value</div>
                  </div>
                  <DollarSign className="text-blue-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.avgRating}</div>
                    <div className="text-sm text-purple-700">Avg Rating</div>
                  </div>
                  <Star className="text-purple-500" size={24} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedListings.size > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-rose-700 font-medium">
                  {selectedListings.size} listing{selectedListings.size > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-2 border border-rose-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="archive">Archive</option>
                  <option value="delete">Delete</option>
                </select>
                
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Apply
                </button>
                
                <button
                  onClick={() => setSelectedListings(new Set())}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, location, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List size={16} />
                </button>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rent-low-high">Rent: Low to High</option>
                <option value="rent-high-low">Rent: High to Low</option>
                <option value="title">Title A-Z</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid/List */}
        {myListings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="text-rose-500" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by creating your first property listing to share it with travelers and earn income.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button 
                onClick={handleCreateNewListing}
                className="bg-rose-600 text-white px-8 py-3 rounded-xl hover:bg-rose-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Plus size={20} />
                Create Your First Listing
              </button>
              
              {/* Next Button in Empty State */}
              <button 
                onClick={() => navigate('/listingpage1')}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={20} />
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
              >
                Browse Listings
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {myListings.map((listing) => (
                <div
                  key={listing._id}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 ${
                    viewMode === 'list' ? 'flex' : ''
                  } ${selectedListings.has(listing._id) ? 'ring-2 ring-rose-500' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedListings.has(listing._id)}
                        onChange={() => toggleListingSelection(listing._id)}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <StatusBadge status={listing.status} />
                    </label>
                    
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{listing.rating || '4.5'}</span>
                      <span className="text-gray-500 text-sm">({listing.reviews || '12'})</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex' : ''}`}>
                    {viewMode === 'list' && (
                      <div className="w-32 h-24 flex-shrink-0 mr-4">
                        <img
                          src={listing.image1}
                          alt={listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {listing.landMark}, {listing.city}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-rose-600">₹{listing.rent}</div>
                          <div className="text-sm text-gray-500">per night</div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>{listing.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {listing.category}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewListing(listing._id)}
                          className="flex-1 bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        
                        <button
                          onClick={() => handleEdit(listing)}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <div className="relative">
                          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingListing === listing._id && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rent (₹)</label>
                          <input
                            type="number"
                            value={editForm.rent}
                            onChange={(e) => setEditForm(prev => ({ ...prev, rent: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                          <input
                            type="text"
                            value={editForm.landMark}
                            onChange={(e) => setEditForm(prev => ({ ...prev, landMark: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(listing._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Next Button at Bottom when listings exist */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate('/listingpage1')}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg"
              >
                <Plus size={24} />
                Create Another Listing
                <ArrowRight size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyListing;