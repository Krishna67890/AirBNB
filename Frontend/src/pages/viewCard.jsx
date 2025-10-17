import React, { useContext, useState, useEffect } from 'react'
import { 
  FaArrowLeft, 
  FaEdit, 
  FaShare, 
  FaHeart, 
  FaMapMarkerAlt, 
  FaTag,
  FaRupeeSign,
  FaCalendarAlt,
  FaStar,
  FaImages
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ListingDataContext } from '../Context/Listingcontext'
import { AuthContext } from '../Context/AuthContext'

const ViewCard = () => {
    const navigate = useNavigate()
    const { cardDetails, setCardDetails } = useContext(ListingDataContext)
    const { userData } = useContext(AuthContext)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFavorite, setIsFavorite] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [imageLoading, setImageLoading] = useState({})
    const [copySuccess, setCopySuccess] = useState('')

    // Destructure with fallbacks
    const {
        frontEndImage1,
        frontEndImage2,
        frontEndImage3,
        title = 'Untitled Listing',
        description = 'No description provided',
        landmark = 'Not specified',
        city = 'Not specified',
        category = 'General',
        rent = 0,
        amenities = [],
        availability = 'Available',
        maxGuests = 1,
        contactInfo = {}
    } = cardDetails || {}

    const images = [frontEndImage1, frontEndImage2, frontEndImage3].filter(Boolean)

    // Handle image loading states
    const handleImageLoad = (index) => {
        setImageLoading(prev => ({ ...prev, [index]: false }))
    }

    const handleImageError = (index) => {
        setImageLoading(prev => ({ ...prev, [index]: true }))
    }

    // Navigation functions
    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    // Share functionality
    const handleShare = async () => {
        const shareData = {
            title: title,
            text: description,
            url: window.location.href,
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                setShowShareModal(true)
            }
        } catch (error) {
            console.log('Sharing cancelled', error)
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href)
        setCopySuccess('Copied!')
        setTimeout(() => setCopySuccess(''), 2000)
    }

    // Favorite functionality
    const toggleFavorite = () => {
        setIsFavorite(!isFavorite)
        // Here you would typically make an API call to update favorites
    }

    // Edit functionality
    const handleEdit = () => {
        navigate("/edit-listing", { state: { cardDetails } })
    }

    // Contact functionality
    const handleContact = () => {
        if (contactInfo.phone) {
            window.open(`tel:${contactInfo.phone}`)
        } else if (contactInfo.email) {
            window.open(`mailto:${contactInfo.email}`)
        }
    }

    // Format price with commas
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN').format(price)
    }

    // Get category icon
    const getCategoryIcon = (cat) => {
        const icons = {
            'apartment': '🏠',
            'house': '🏡',
            'villa': '💎',
            'room': '🚪',
            'hotel': '🏨',
            'resort': '🌴'
        }
        return icons[cat?.toLowerCase()] || '📍'
    }

    // Get availability color
    const getAvailabilityColor = (status) => {
        const colors = {
            'available': 'text-green-600 bg-green-100',
            'booked': 'text-red-600 bg-red-100',
            'maintenance': 'text-yellow-600 bg-yellow-100'
        }
        return colors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100'
    }

    // Auto-advance images
    useEffect(() => {
        if (images.length > 1) {
            const interval = setInterval(nextImage, 5000)
            return () => clearInterval(interval)
        }
    }, [images.length])

    if (!cardDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-4">🏠</div>
                    <h2 className="text-2xl font-bold text-gray-600 mb-2">No Listing Found</h2>
                    <p className="text-gray-500 mb-6">Please create a listing first</p>
                    <button
                        onClick={() => navigate("/listingpage2")}
                        className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors"
                    >
                        Create Listing
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 py-8">
            {/* Header with Back Button */}
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate("/listingpage2")}
                        className="flex items-center gap-3 text-gray-600 hover:text-rose-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md"
                    >
                        <FaArrowLeft className="text-lg" />
                        <span className="font-medium">Back to Listings</span>
                    </button>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-blue-600"
                        >
                            <FaShare />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={toggleFavorite}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
                                isFavorite 
                                    ? 'bg-rose-500 text-white' 
                                    : 'bg-white text-gray-600 hover:text-rose-600'
                            }`}
                        >
                            <FaHeart className={isFavorite ? 'fill-current' : ''} />
                            <span>{isFavorite ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Image Gallery */}
                    <div className="relative h-96 bg-gray-100">
                        {images.length > 0 ? (
                            <>
                                <img
                                    src={typeof images[currentImageIndex] === 'string' 
                                        ? images[currentImageIndex] 
                                        : URL.createObjectURL(images[currentImageIndex])
                                    }
                                    alt={title}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                    onLoad={() => handleImageLoad(currentImageIndex)}
                                    onError={() => handleImageError(currentImageIndex)}
                                />
                                
                                {/* Image Navigation */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                                
                                {/* Image Indicators */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-3 h-3 rounded-full transition-all ${
                                                index === currentImageIndex 
                                                    ? 'bg-white' 
                                                    : 'bg-white bg-opacity-50'
                                            }`}
                                        />
                                    ))}
                                </div>
                                
                                {/* Image Counter */}
                                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <FaImages className="text-6xl mb-4 mx-auto" />
                                    <p>No images available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                        {/* Main Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
                                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                                        <div className="flex items-center gap-1">
                                            <FaMapMarkerAlt className="text-rose-500" />
                                            <span>{landmark}, {city}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FaTag className="text-rose-500" />
                                            <span className="capitalize">{category}</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(availability)}`}>
                                            {availability}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-rose-600 flex items-center gap-1">
                                        <FaRupeeSign className="text-2xl" />
                                        {formatPrice(rent)}
                                        <span className="text-lg text-gray-500 font-normal">/day</span>
                                    </div>
                                    <div className="text-sm text-gray-500">Excluding taxes & fees</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{description}</p>
                            </div>

                            {/* Amenities */}
                            {amenities && amenities.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Amenities</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {amenities.map((amenity, index) => (
                                            <div key={index} className="flex items-center gap-2 text-gray-600">
                                                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                                <span className="capitalize">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold text-gray-800">Property Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Category:</span>
                                            <span className="font-medium flex items-center gap-2">
                                                {getCategoryIcon(category)}
                                                <span className="capitalize">{category}</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Max Guests:</span>
                                            <span className="font-medium">{maxGuests} people</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Availability:</span>
                                            <span className={`font-medium px-2 py-1 rounded ${getAvailabilityColor(availability)}`}>
                                                {availability}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                {contactInfo && Object.keys(contactInfo).length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-gray-800">Contact Info</h3>
                                        <div className="space-y-3">
                                            {contactInfo.name && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Contact Person:</span>
                                                    <span className="font-medium">{contactInfo.name}</span>
                                                </div>
                                            )}
                                            {contactInfo.phone && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Phone:</span>
                                                    <span className="font-medium">{contactInfo.phone}</span>
                                                </div>
                                            )}
                                            {contactInfo.email && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Email:</span>
                                                    <span className="font-medium">{contactInfo.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Sidebar */}
                        <div className="space-y-6">
                            {/* Edit Card */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Manage Listing</h3>
                                <button
                                    onClick={handleEdit}
                                    className="w-full flex items-center justify-center gap-2 bg-rose-500 text-white py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors font-medium"
                                >
                                    <FaEdit />
                                    Edit Listing
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleContact}
                                        className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">Contact Owner</div>
                                        <div className="text-sm text-gray-600">Get more information</div>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
                                    >
                                        <div className="font-medium text-gray-800">Print Details</div>
                                        <div className="text-sm text-gray-600">Save for offline</div>
                                    </button>
                                </div>
                            </div>

                            {/* Status Info */}
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Listing Status</h3>
                                <p className="text-blue-600 text-sm mb-3">
                                    Your listing is currently in preview mode. Make sure all information is accurate before publishing.
                                </p>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <FaCalendarAlt />
                                    <span className="text-sm">Created: {new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Share this listing</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 py-3 rounded-lg transition-colors font-medium"
                                >
                                    {copySuccess || 'Copy Link'}
                                </button>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="flex-1 bg-rose-500 text-white py-3 rounded-lg hover:bg-rose-600 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewCard