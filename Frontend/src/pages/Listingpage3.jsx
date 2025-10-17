import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingDataContext } from '../Context/Listingcontext.jsx';
import {
  ArrowLeft,
  Edit3,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  DollarSign,
  Home,
  FileText,
  Tag,
  Clock,
  Shield,
  Sparkles,
  Upload,
  Eye,
  Zap,
  Calendar,
  Users,
  Star,
  Heart
} from 'lucide-react';

function ListingPage3() {
    const {
        title,
        description,
        frontEndImage1,
        frontEndImage2,
        frontEndImage3,
        rent,
        city,
        landmark,
        category,
        handleAddListing,
        resetForm,
        createImageUrls
    } = useContext(ListingDataContext);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Create image URLs for preview
    const imageUrls = createImageUrls(frontEndImage1, frontEndImage2, frontEndImage3);
    const images = [imageUrls.image1, imageUrls.image2, imageUrls.image3].filter(Boolean);

    // Calculate listing quality score
    const listingScore = useMemo(() => {
        let score = 0;
        if (title && title.length > 10) score += 25;
        if (description && description.length > 50) score += 25;
        if (images.length >= 1) score += 25;
        if (rent && city && landmark && category) score += 25;
        return score;
    }, [title, description, images.length, rent, city, landmark, category]);

    // Simulate upload progress
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);
            return () => clearInterval(interval);
        } else {
            setUploadProgress(0);
        }
    }, [loading]);

    const validateForm = () => {
        const requiredFields = { title, description, rent, city, landmark, category };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            setError(`Please complete these fields: ${missingFields.map(field => field.charAt(0).toUpperCase() + field.slice(1)).join(', ')}`);
            return false;
        }

        if (!frontEndImage1) {
            setError('At least one image is required for your listing');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            // Scroll to error
            setTimeout(() => {
                const errorElement = document.getElementById('error-message');
                errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const newListingData = await handleAddListing();
            
            // Complete progress bar
            setUploadProgress(100);
            
            setSuccess("🎉 Amazing! Your listing is live!");
            setShowSuccessAnimation(true);
            
            // Navigate to home page with the new listing data
            setTimeout(() => {
                resetForm();
                navigate("/", { 
                    state: { 
                        newListing: newListingData,
                        showSuccess: true 
                    } 
                });
            }, 2500);
        } catch (err) {
            console.error("Submission error:", err);
            setError(err.response?.data?.message || "We encountered an issue while creating your listing. Please try again in a moment.");
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const handleEditField = (section) => {
        if (section === 'images') {
            navigate("/listingpage1");
        } else if (section === 'category') {
            navigate("/listingpage2");
        } else {
            navigate("/listingpage1");
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreMessage = (score) => {
        if (score >= 80) return 'Excellent! Your listing is ready to shine!';
        if (score >= 60) return 'Good! A few tweaks could make it perfect.';
        return 'Needs improvement. Consider adding more details.';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-6xl">
                {/* Progress Header */}
                <div className="bg-white rounded-3xl shadow-2xl mb-6 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/listingpage2")}
                            className="flex items-center gap-3 text-gray-600 hover:text-green-500 transition-colors group"
                        >
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-semibold text-lg">Back to Category</span>
                        </button>
                        
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                                Review Your Listing
                            </h1>
                            <p className="text-gray-600 mt-1">Step 3 of 3 - Final Preview</p>
                        </div>

                        <div className="w-24"></div>
                    </div>

                    {/* Enhanced Stepper */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center">
                            {[1, 2, 3].map((step, index) => (
                                <React.Fragment key={step}>
                                    <div className={`flex flex-col items-center text-green-500`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            index === 2 
                                                ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110' 
                                                : 'bg-green-500 border-green-500 text-white'
                                        }`}>
                                            <CheckCircle size={20} />
                                        </div>
                                        <span className="text-sm font-medium mt-2">
                                            {index === 0 ? 'Details' : index === 1 ? 'Category' : 'Preview'}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div className="w-16 h-1 mx-4 bg-green-500 transition-all duration-300" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Success Animation Overlay */}
                    {showSuccessAnimation && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-3xl p-8 max-w-md text-center animate-bounce-in">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                                <p className="text-gray-600 mb-6">Your listing is now live and ready for bookings!</p>
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Ready to Launch! 🚀</h1>
                                <p className="text-green-100 text-lg">Review your listing before it goes live</p>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(listingScore)}`}>
                                    {listingScore}%
                                </div>
                                <div className="text-green-100 text-sm">Listing Quality</div>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div 
                            id="error-message"
                            className="m-6 p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-shake"
                        >
                            <div className="flex items-center gap-3">
                                <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-lg mb-1">Attention Needed</div>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="m-6 p-6 bg-green-50 border border-green-200 rounded-2xl text-green-700">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-lg mb-1">Success!</div>
                                    <p>{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {loading && (
                        <div className="mx-6 mt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Uploading your listing...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div 
                                    className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 p-8">
                        {/* Images Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <ImageIcon size={24} className="text-blue-500" />
                                    Property Gallery
                                </h2>
                                <button
                                    onClick={() => handleEditField('images')}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors font-semibold group"
                                >
                                    <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                                    Edit Photos
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 group relative">
                                        {img ? (
                                            <>
                                                <img
                                                    src={img}
                                                    alt={`Property view ${idx + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Upload size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                            {idx === 0 ? 'Main' : `Photo ${idx + 1}`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Image Tips */}
                            <div className="bg-blue-50 rounded-2xl p-4">
                                <div className="flex items-center gap-3 text-blue-700">
                                    <Eye size={20} />
                                    <div className="text-sm">
                                        <strong>Pro Tip:</strong> High-quality photos can increase bookings by up to 40%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <FileText size={24} className="text-green-500" />
                                    Property Details
                                </h2>
                                <button
                                    onClick={() => handleEditField('details')}
                                    className="flex items-center gap-2 text-green-500 hover:text-green-700 transition-colors font-semibold group"
                                >
                                    <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                                    Edit Details
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Home size={20} className="text-gray-600" />
                                        <h3 className="font-semibold text-gray-800">Property Title</h3>
                                    </div>
                                    <p className="text-gray-900 text-lg font-medium">{title}</p>
                                    {title && title.length > 10 && (
                                        <div className="flex items-center gap-1 mt-2 text-green-500 text-sm">
                                            <CheckCircle size={14} />
                                            Great title length
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileText size={20} className="text-gray-600" />
                                        <h3 className="font-semibold text-gray-800">Description</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
                                    {description && description.length > 50 && (
                                        <div className="flex items-center gap-1 mt-2 text-green-500 text-sm">
                                            <CheckCircle size={14} />
                                            Detailed description
                                        </div>
                                    )}
                                </div>

                                {/* Category & Price */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Tag size={20} className="text-purple-600" />
                                            <h3 className="font-semibold text-gray-800">Category</h3>
                                        </div>
                                        <p className="text-gray-900 font-medium">{category}</p>
                                        <button
                                            onClick={() => handleEditField('category')}
                                            className="text-purple-500 hover:text-purple-700 text-sm mt-2 transition-colors"
                                        >
                                            Change category
                                        </button>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <DollarSign size={20} className="text-yellow-600" />
                                            <h3 className="font-semibold text-gray-800">Daily Rate</h3>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">₹{rent}</p>
                                        <p className="text-gray-600 text-sm">per night</p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapPin size={20} className="text-red-500" />
                                        <h3 className="font-semibold text-gray-800">Location</h3>
                                    </div>
                                    <p className="text-gray-900 font-medium">{landmark}, {city}</p>
                                    <div className="flex items-center gap-1 mt-2 text-blue-500 text-sm">
                                        <MapPin size={14} />
                                        Perfect for location-based searches
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quality Score & Tips */}
                    <div className="px-8 pb-8">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles size={24} className="text-yellow-500" />
                                <h3 className="text-xl font-bold text-gray-900">Listing Quality Score</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`text-4xl font-bold ${getScoreColor(listingScore)}`}>
                                            {listingScore}%
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-800">{getScoreMessage(listingScore)}</div>
                                            <div className="text-sm text-gray-600">Based on completeness and quality</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className={title && title.length > 10 ? "text-green-500" : "text-gray-300"} />
                                            <span>Compelling title (10+ chars)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className={description && description.length > 50 ? "text-green-500" : "text-gray-300"} />
                                            <span>Detailed description (50+ chars)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className={images.length >= 1 ? "text-green-500" : "text-gray-300"} />
                                            <span>High-quality photos ({images.length}/3)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} className={rent && city && landmark && category ? "text-green-500" : "text-gray-300"} />
                                            <span>Complete location & pricing</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                        <Zap size={16} className="text-yellow-500" />
                                        Quick Tips to Improve
                                    </h4>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>• Add more high-quality photos from different angles</p>
                                        <p>• Include unique amenities and special features</p>
                                        <p>• Set competitive pricing based on local market</p>
                                        <p>• Consider adding house rules and check-in instructions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Shield size={20} />
                                <span className="text-sm">Your listing is protected by our quality standards</span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <button
                                    onClick={() => navigate("/listingpage2")}
                                    disabled={loading}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-blue-500 hover:text-blue-500 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    <ArrowLeft size={20} />
                                    Back to Edit
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300" />
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={20} className="group-hover:scale-110 transition-transform" />
                                            Publish Listing
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ListingPage3;