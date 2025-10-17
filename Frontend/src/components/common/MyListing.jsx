import React, { useContext, useState, useMemo } from 'react';
import { ListingDataContext } from '../../Context/Listingcontext.jsx';
import { UserDataContext } from '../../Context/Usercontext.jsx';
import Card from '../common/card/Card.jsx';
import Nav from '../common/Navigation/Nav.jsx';

function MyListing() {
  const { listingData, deleteListing, updateListing } = useContext(ListingDataContext);
  const { userData } = useContext(UserDataContext);
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Memoized filtered and sorted listings
  const myListings = useMemo(() => {
    let filtered = listingData.filter(listing => listing.host === userData?._id);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.landMark.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(listing => listing.status === filterStatus);
    }

    // Apply sorting
    switch (sortBy) {
      case 'rent-low-high':
        return filtered.sort((a, b) => a.rent - b.rent);
      case 'rent-high-low':
        return filtered.sort((a, b) => b.rent - a.rent);
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return filtered;
    }
  }, [listingData, userData, sortBy, filterStatus, searchTerm]);

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteListing(listingId);
      } catch (error) {
        console.error('Failed to delete listing:', error);
      }
    }
  };

  const handleEdit = (listing) => {
    setEditingListing(listing._id);
    setEditForm({
      title: listing.title,
      rent: listing.rent,
      city: listing.city,
      landMark: listing.landMark
    });
  };

  const handleUpdate = async (listingId) => {
    try {
      await updateListing(listingId, editForm);
      setEditingListing(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to update listing:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
    setEditForm({});
  };

  const stats = useMemo(() => ({
    total: myListings.length,
    active: myListings.filter(listing => listing.status === 'active').length,
    inactive: myListings.filter(listing => listing.status === 'inactive').length,
    totalRent: myListings.reduce((sum, listing) => sum + listing.rent, 0)
  }), [myListings]);

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
        <div className="text-gray-600">Loading user info...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
              <p className="text-gray-600 mt-2">Manage your property listings</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div className="bg-rose-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-rose-600">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inactive}</div>
                  <div className="text-sm text-gray-600">Inactive</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">${stats.totalRent}</div>
                  <div className="text-sm text-gray-600">Monthly Value</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {myListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'You have not added any listings yet.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors">
                Add Your First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myListings.map(listing => (
              <div key={listing._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Edit Mode */}
                {editingListing === listing._id ? (
                  <div className="p-4">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-rose-500"
                      placeholder="Title"
                    />
                    <input
                      type="number"
                      value={editForm.rent}
                      onChange={(e) => setEditForm(prev => ({ ...prev, rent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-rose-500"
                      placeholder="Rent"
                    />
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:ring-2 focus:ring-rose-500"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={editForm.landMark}
                      onChange={(e) => setEditForm(prev => ({ ...prev, landMark: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-rose-500"
                      placeholder="Landmark"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(listing._id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <>
                    <Card
                      title={listing.title}
                      landMark={listing.landMark}
                      city={listing.city}
                      image1={listing.image1}
                      image2={listing.image2}
                      image3={listing.image3}
                      rent={listing.rent}
                      id={listing._id}
                    />
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {listing.status || 'active'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(listing)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListing;