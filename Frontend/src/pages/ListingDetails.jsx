import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListingData } from '../Context/Listingcontext.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Home,
  User,
  Calendar,
  Shield,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Edit,
  ArrowRight
} from 'lucide-react';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listingData } = useListingData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [favorites, setFavorites] = useState(new Set());

  const listing = listingData.find(item => item._id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="pt-32 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-rose-500 text-white px-6 py-3 rounded-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = [listing.image1, listing.image2, listing.image3].filter(Boolean);
  
  const amenities = [
    { icon: <Wifi size={20} />, label: 'WiFi', available: true },
    { icon: <Car size={20} />, label: 'Free Parking', available: listing.parkingAvailable },
    { icon: <Coffee size={20} />, label: 'Kitchen', available: listing.kitchenAvailable },
    { icon: <Dumbbell size={20} />, label: 'Gym', available: listing.gymAvailable },
  ];

  const handleBookNow = () => {
    navigate(`/listingpage1?booking=${listing._id}`);
  };

  const handleEditListing = () => {
    navigate(`/listingpage1?edit=${listing._id}`);
  };

  // Check if current user is the owner
  const { userData } = useUser();
  const isOwner = userData?.id === listing.userId;

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            {isOwner && (
              <button
                onClick={handleEditListing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit size={16} />
                Edit Listing
              </button>
            )}
          </div>

          {/* ... rest of your ListingDetails component remains the same ... */}

          {/* Booking Section */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">₹{listing.rent}</span>
                <span className="text-gray-600"> night</span>
              </div>
              <button 
                onClick={handleBookNow}
                className="bg-rose-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center gap-2"
              >
                Book Now
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Desktop Booking Card - Add Book Now button */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-lg">
              {/* ... existing price and details ... */}
              
              <button 
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2"
              >
                Book Now
                <ArrowRight size={16} />
              </button>
              
              {/* ... rest of booking card ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;