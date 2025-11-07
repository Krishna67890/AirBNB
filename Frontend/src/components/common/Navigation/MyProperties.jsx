import React, { useState, useMemo } from 'react';
import Card from '../common/card/Card.jsx';
import Nav from '../common/Navigation/Nav.jsx';

function MyProperties() {
  // Temporary mock data - replace with your actual data source
  const [listings, setListings] = useState([]);
  const [user] = useState({ _id: 'current-user-id' });
  const [sortBy, setSortBy] = useState('newest');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filter user's listings
  const myListings = useMemo(() => {
    return listings.filter(listing => listing.host === user._id);
  }, [listings, user._id]);

  const handleDelete = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      // Add your delete logic here
      console.log('Delete listing:', listingId);
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
    // Add your update logic here
    console.log('Update listing:', listingId, editForm);
    setEditingListing(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingListing(null);
    setEditForm({});
  };

  const stats = {
    total: myListings.length,
    active: myListings.filter(listing => listing.status === 'active').length,
    inactive: myListings.filter(listing => listing.status === 'inactive').length,
    totalRent: myListings.reduce((sum, listing) => sum + listing.rent, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
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

        {/* Add your listing grid UI here */}
        <div className="text-center py-12">
          <p className="text-gray-600">Your properties will appear here</p>
          <button className="mt-4 bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700">
            Add New Property
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyProperties;