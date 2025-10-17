import React, { useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingData } from "../../../Context/Listingcontext.jsx";
// import { ListingDataContext } from '../../../Context/Listingcontext.jsx';
import { useUserData } from "../../context/UserContext";

function Card({ 
  title, 
  landMark, 
  image1, 
  image2, 
  image3, 
  rent, 
  city, 
  category, 
  id,
  status = 'active',
  host,
  amenities = [],
  rating,
  reviewCount,
  instantBook = false
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const navigate = useNavigate();
  const { userData } = useContext(UserDataContext);
  const { handleViewCard, favoriteListings, toggleFavorite } = useContext(ListingDataContext);

  // Memoized image array
  const images = useMemo(() => {
    const validImages = [image1, image2, image3].filter(img => img && img.trim() !== '');
    return validImages.length > 0 ? validImages : [null];
  }, [image1, image2, image3]);

  // Check if listing is favorited by current user
  const isFavorited = useMemo(() => {
    return favoriteListings?.some(fav => fav.listingId === id) || false;
  }, [favoriteListings, id]);

  // Format price with commas
  const formattedRent = useMemo(() => {
    if (!rent) return 'N/A';
    return new Intl.NumberFormat('en-US').format(rent);
  }, [rent]);

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (rating) return rating;
    return 4.5; // Fallback rating
  }, [rating]);

  // Render star rating
  const renderStars = useCallback(() => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">½</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  }, [averageRating]);

  // Handle image navigation
  const nextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev + 1) % images.length);
    setImageLoaded(false);
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    setImageLoaded(false);
  }, [images.length]);

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback((e) => {
    e.stopPropagation();
    if (!userData) {
      navigate('/login');
      return;
    }
    toggleFavorite(id);
  }, [userData, navigate, toggleFavorite, id]);

  // Handle card click
  const handleClick = useCallback(() => {
    if (userData) {
      handleViewCard(id);
      navigate(`/listing/${id}`);
    } else {
      navigate('/login');
    }
  }, [userData, handleViewCard, id, navigate]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Render image with loading state
  const renderCurrentImage = useCallback(() => {
    const currentImage = images[currentImageIndex];
    
    if (!currentImage) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2 text-gray-400">🏠</div>
            <p className="text-gray-500 text-sm">No Image Available</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        <img 
          src={currentImage} 
          alt={`${title} - Image ${currentImageIndex + 1}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </>
    );
  }, [images, currentImageIndex, title, imageLoaded, handleImageLoad, handleImageError]);

  return (
    <>
      <div 
        className="group w-[330px] max-w-[85vw] h-[460px] flex flex-col rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl bg-white transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        onClick={handleClick}
      >
        {/* Image Gallery Section */}
        <div className="relative w-full h-[60%] overflow-hidden">
          {renderCurrentImage()}
          
          {/* Image Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                ‹
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                ›
              </button>
            </>
          )}
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Favorite Button */}
          <button 
            onClick={handleFavoriteToggle}
            className="absolute top-3 right-3 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
          >
            <svg 
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'
              }`}
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Status Badge */}
          {status && status !== 'active' && (
            <div className="absolute top-3 left-3">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status === 'inactive' ? 'bg-gray-500 text-white' :
                status === 'pending' ? 'bg-yellow-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
          )}

          {/* Instant Book Badge */}
          {instantBook && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                INSTANT BOOK
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Location and Title */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {(title || 'No Title').toUpperCase()}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  In {(landMark || 'Unknown').toUpperCase()}, {(city || 'Unknown').toUpperCase()}
                </p>
              </div>
            </div>

            {/* Category */}
            {category && (
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {(category || 'Other').toUpperCase()}
              </span>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1">
              {renderStars()}
              <span className="text-sm text-gray-600 ml-1">
                {averageRating.toFixed(1)}
                {reviewCount && ` (${reviewCount})`}
              </span>
            </div>

            {/* Amenities Preview */}
            {amenities && amenities.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>🏠</span>
                <span className="truncate">
                  {amenities.slice(0, 2).join(' • ')}
                  {amenities.length > 2 && ` • +${amenities.length - 2} more`}
                </span>
              </div>
            )}
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <span className="text-lg font-bold text-gray-900">${formattedRent}</span>
              <span className="text-sm text-gray-600">/day</span>
            </div>
            <button 
              onClick={handleClick}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 transform hover:scale-105"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            <img 
              src={images[currentImageIndex]} 
              alt={`${title} - Full View`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default React.memo(Card);