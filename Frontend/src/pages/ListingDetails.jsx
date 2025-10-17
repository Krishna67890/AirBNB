import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ListingDataContext } from '../Context/Listingcontext.jsx';
import { UserDataContext } from '../Context/Usercontext.jsx';
import Nav from '../components/common/Navigation/Nav.jsx';
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Share2,
  Calendar,
  Users,
  Wifi,
  Car,
  Coffee,
  Dog,
  Cat,
  Utensils,
  Tv,
  AirVent,
  Waves,
  Mountain,
  Sparkles,
  Clock,
  Shield,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Bookmark,
  Eye
} from 'lucide-react';

function ListingDetails() {
  const { id } = useParams();
  const { listingData, handleViewCard } = useContext(ListingDataContext);
  const { userData } = useContext(UserDataContext);
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const listing = listingData.find(list => list._id === id);

  // Simulate similar listings
  const similarListings = useMemo(() => {
    if (!listing) return [];
    return listingData
      .filter(list => list._id !== listing._id && list.category === listing.category)
      .slice(0, 4);
  }, [listing, listingData]);

  // Favorite functionality
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('airbnb-favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('airbnb-favorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter(favId => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    
    localStorage.setItem('airbnb-favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // Image gallery navigation
  const images = [listing?.image1, listing?.image2, listing?.image3].filter(Boolean);
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Amenities data
  const amenities = [
    { icon: <Wifi size={20} />, name: 'WiFi', available: true },
    { icon: <Car size={20} />, name: 'Free parking', available: true },
    { icon: <Coffee size={20} />, name: 'Coffee maker', available: true },
    { icon: <Tv size={20} />, name: 'TV', available: true },
    { icon: <AirVent size={20} />, name: 'Air conditioning', available: true },
    { icon: <Utensils size={20} />, name: 'Kitchen', available: Math.random() > 0.3 },
    { icon: <Dog size={20} />, name: 'Pets allowed', available: Math.random() > 0.5 },
    { icon: <Waves size={20} />, name: 'Pool', available: Math.random() > 0.7 },
    { icon: <Mountain size={20} />, name: 'Mountain view', available: Math.random() > 0.6 },
  ];

  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);

  // Handle booking
  const handleBookNow = () => {
    if (!userData) {
      navigate('/login', { state: { returnUrl: `/listing/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    // Simulate booking process
    alert(`Booking confirmed for ${selectedDate || 'your selected dates'}!`);
    setShowBookingModal(false);
  };

  // Share functionality
  const shareListing = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Sharing cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="text-rose-500" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
            <p className="text-gray-600 mb-8 text-lg">
              The property you're looking for might have been removed or is no longer available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="bg-rose-500 text-white px-8 py-3 rounded-2xl hover:bg-rose-600 transition-colors font-semibold"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate(-1)}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-colors font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Enhanced Header with Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={shareListing}
                className="p-2 text-gray-600 hover:text-rose-500 transition-colors rounded-full hover:bg-gray-100"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-2 transition-colors rounded-full hover:bg-gray-100 ${
                  isFavorite ? 'text-rose-500' : 'text-gray-600 hover:text-rose-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <div className="relative mb-8 rounded-3xl overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <>
              <div className="aspect-w-16 aspect-h-9 relative">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-96 object-cover transition-opacity duration-300"
                  onLoad={() => setImageLoading(false)}
                />
                
                {imageLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="text-gray-400">Loading image...</div>
                  </div>
                )}
              </div>

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'bg-white scale-125'
                            : 'bg-white/50 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-rose-100 to-blue-100 flex items-center justify-center rounded-3xl">
              <div className="text-center text-gray-500">
                <Sparkles size={48} className="mx-auto mb-4 text-rose-400" />
                <p className="text-lg">No images available</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Section */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {listing.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-gray-700">
                  <Star size={18} className="text-rose-500 fill-current" />
                  <span className="font-semibold">4.89</span>
                  <span className="text-gray-500">(128 reviews)</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-700">
                  <MapPin size={18} className="text-rose-500" />
                  <span>{listing.landMark}, {listing.city}</span>
                </div>
                
                <div className="flex items-center gap-1 text-gray-700">
                  <Eye size={18} className="text-rose-500" />
                  <span>2.4k views this month</span>
                </div>
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {listing.host?.name?.charAt(0) || 'H'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Hosted by {listing.host?.name || 'Anonymous'}</h3>
                  <p className="text-gray-600 text-sm">Superhost · 5 years hosting</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 border border-gray-300 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-colors">
                    <MessageCircle size={20} />
                  </button>
                  <button className="p-3 border border-gray-300 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-colors">
                    <Phone size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Highlights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-rose-50 p-6 rounded-2xl text-center">
                <Sparkles className="text-rose-500 mx-auto mb-2" size={24} />
                <h4 className="font-semibold text-gray-900">Sparkling Clean</h4>
                <p className="text-gray-600 text-sm">Recently cleaned and sanitized</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl text-center">
                <CheckCircle className="text-blue-500 mx-auto mb-2" size={24} />
                <h4 className="font-semibold text-gray-900">Self Check-in</h4>
                <p className="text-gray-600 text-sm">Easy access with smart lock</p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl text-center">
                <Shield className="text-green-500 mx-auto mb-2" size={24} />
                <h4 className="font-semibold text-gray-900">Free Cancellation</h4>
                <p className="text-gray-600 text-sm">Cancel anytime before check-in</p>
              </div>
            </div>

            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {listing.description}
              </p>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What this place offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleAmenities.map((amenity, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      amenity.available ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {amenity.icon}
                    <span className={amenity.available ? '' : 'line-through'}>
                      {amenity.name}
                    </span>
                    {amenity.available && (
                      <CheckCircle size={16} className="text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
              
              {amenities.length > 6 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                >
                  {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                </button>
              )}
            </section>

            {/* Similar Listings */}
            {similarListings.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {similarListings.map(similar => (
                    <Link
                      key={similar._id}
                      to={`/listing/${similar._id}`}
                      className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <img
                        src={similar.image1}
                        alt={similar.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                          {similar.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {similar.landMark}, {similar.city}
                        </p>
                        <p className="text-rose-500 font-semibold">
                          ₹{similar.rent}/night
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-gray-200 rounded-3xl shadow-xl p-6 space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ₹{listing.rent}
                  <span className="text-lg font-normal text-gray-600"> / night</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Star size={16} className="text-rose-500 fill-current" />
                  <span>4.89 · 128 reviews</span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-in
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-out
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>₹{listing.rent} × 5 nights</span>
                  <span>₹{listing.rent * 5}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>₹500</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>₹750</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{listing.rent * 5 + 500 + 750}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Reserve Now
              </button>
              
              <button className="w-full border-2 border-gray-900 text-gray-900 py-4 rounded-2xl font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300">
                <div className="flex items-center justify-center gap-2">
                  <Bookmark size={20} />
                  Save for later
                </div>
              </button>

              <p className="text-center text-gray-500 text-sm">
                You won't be charged yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Booking</h3>
            <p className="text-gray-600 mb-6">
              Ready to book your stay at {listing.title}?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                className="flex-1 bg-rose-500 text-white py-3 rounded-2xl hover:bg-rose-600 transition-colors font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetails;