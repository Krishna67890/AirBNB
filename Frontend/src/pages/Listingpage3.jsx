import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingData } from '../Context/Listingcontext.jsx';
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
  Shield,
  Sparkles,
  Upload,
  Eye,
  Zap,
  ArrowRight
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
        listingType,
        setListingType,
        resetForm,
        addListing, // Make sure this function exists in your context
        setListingData // Make sure this function exists in your context
    } = useListingData();

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Debug logging to check what's in context
    useEffect(() => {
        console.log("🔍 ListingPage3 - Context Data:", {
            title,
            description,
            rent,
            city,
            landmark,
            category,
            listingType,
            hasImage1: !!frontEndImage1,
            hasImage2: !!frontEndImage2,
            hasImage3: !!frontEndImage3
        });
    }, [title, description, rent, city, landmark, category, listingType, frontEndImage1, frontEndImage2, frontEndImage3]);

    // Create image URLs for preview
    const getImageUrls = () => {
        const urls = [];
        
        if (frontEndImage1) {
            if (typeof frontEndImage1 === 'string') {
                urls.push(frontEndImage1);
            } else if (frontEndImage1 instanceof File) {
                urls.push(URL.createObjectURL(frontEndImage1));
            }
        }
        
        if (frontEndImage2) {
            if (typeof frontEndImage2 === 'string') {
                urls.push(frontEndImage2);
            } else if (frontEndImage2 instanceof File) {
                urls.push(URL.createObjectURL(frontEndImage2));
            }
        }
        
        if (frontEndImage3) {
            if (typeof frontEndImage3 === 'string') {
                urls.push(frontEndImage3);
            } else if (frontEndImage3 instanceof File) {
                urls.push(URL.createObjectURL(frontEndImage3));
            }
        }
        
        return urls;
    };

    const images = getImageUrls();

    // Calculate listing quality score
    const listingScore = useMemo(() => {
        let score = 0;
        if (title && title.length > 5) score += 20;
        if (description && description.length > 20) score += 20;
        if (images.length >= 1) score += 20;
        if (rent) score += 10;
        if (city) score += 10;
        if (landmark) score += 10;
        if (category) score += 10;
        if (listingType) score += 10;
        return score;
    }, [title, description, images.length, rent, city, landmark, category, listingType]);

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

    // Clean up object URLs
    useEffect(() => {
        return () => {
            images.forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [images]);

    const validateForm = () => {
        console.log("🔄 Validating form...");
        console.log("📋 listingType value:", listingType);
        
        const newErrors = {};

        // Check listingType first and separately
        if (!listingType || listingType.trim() === '') {
            newErrors.listingType = 'Please select whether this is for Rent or Purchase';
            console.log("❌ listingType validation failed");
        }

        // Check other required fields
        if (!title?.trim()) newErrors.title = 'Property title is required';
        if (!description?.trim()) newErrors.description = 'Property description is required';
        if (!rent || isNaN(Number(rent)) || Number(rent) <= 0) newErrors.rent = 'Please enter a valid rent amount';
        if (!city?.trim()) newErrors.city = 'City is required';
        if (!landmark?.trim()) newErrors.landmark = 'Landmark is required';
        if (!category?.trim()) newErrors.category = 'Property category is required';
        if (!frontEndImage1) newErrors.images = 'At least one property photo is required';

        console.log("📊 Validation errors:", newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Create user-friendly error message
            const errorFields = Object.keys(newErrors);
            let errorMessage = 'Please complete: ';
            
            const fieldNames = {
                listingType: 'Rent or Purchase',
                title: 'Property Title',
                description: 'Description',
                rent: 'Daily Rent',
                city: 'City',
                landmark: 'Landmark',
                category: 'Property Category',
                images: 'Property Photos'
            };

            errorMessage += errorFields.map(field => fieldNames[field] || field).join(', ');
            setError(errorMessage);
            return false;
        }

        console.log("✅ Form validation passed");
        return true;
    };

    const handleSubmit = async () => {
        console.log("🚀 Starting submission process...");
        
        if (!validateForm()) {
            console.log("❌ Validation failed - stopping submission");
            setTimeout(() => {
                const errorElement = document.getElementById('error-message');
                errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");
        console.log("✅ Validation passed - proceeding with submission");

        try {
            // Prepare listing data
            const listingData = {
                _id: Date.now().toString(),
                title: title.trim(),
                description: description.trim(),
                rent: parseInt(rent),
                city: city.trim(),
                landmark: landmark.trim(),
                category: category.trim(),
                listingType: listingType.trim(),
                // Handle image URLs properly
                image1: frontEndImage1 instanceof File ? 
                    URL.createObjectURL(frontEndImage1) : frontEndImage1,
                image2: frontEndImage2 instanceof File ? 
                    URL.createObjectURL(frontEndImage2) : frontEndImage2,
                image3: frontEndImage3 instanceof File ? 
                    URL.createObjectURL(frontEndImage3) : frontEndImage3,
                createdAt: new Date().toISOString(),
                status: 'active',
                rating: 4.5, // Default rating
                reviews: 0,
                views: 0,
                userId: 'current-user' // You might want to get this from user context
            };

            console.log("📦 Prepared listing data:", listingData);

            // Save using context function (if available) or fallback to localStorage
            if (addListing) {
                addListing(listingData);
            } else {
                // Fallback: Save to localStorage directly
                const existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');
                const updatedListings = [...existingListings, listingData];
                localStorage.setItem('userListings', JSON.stringify(updatedListings));
                
                // Also update the context if possible
                if (setListingData) {
                    setListingData(updatedListings);
                }
            }

            // Complete progress bar
            setUploadProgress(100);
            
            setSuccess(`🎉 Amazing! Your ${listingType} listing is now live!`);
            setShowSuccessAnimation(true);
            console.log("✅ Submission successful");
            
            // Navigate to home page after success
            setTimeout(() => {
                console.log("🏠 Navigating to home page...");
                if (resetForm && typeof resetForm === 'function') {
                    resetForm();
                }
                navigate("/", { 
                    state: { 
                        newListing: listingData,
                        showSuccess: true,
                        listingType: listingType
                    } 
                });
            }, 2000);

        } catch (err) {
            console.error("💥 Submission error:", err);
            setError("We encountered an issue while creating your listing. Please try again.");
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    // Fallback function to save to localStorage (keep as backup)
    const saveToLocalStorage = async (listingData) => {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    try {
                        const newListing = {
                            _id: Date.now().toString(),
                            ...listingData,
                            userId: 'current-user',
                            // Handle images for localStorage
                            image1: listingData.image1 instanceof File ? 
                                URL.createObjectURL(listingData.image1) : listingData.image1,
                            image2: listingData.image2 instanceof File ? 
                                URL.createObjectURL(listingData.image2) : listingData.image2,
                            image3: listingData.image3 instanceof File ? 
                                URL.createObjectURL(listingData.image3) : listingData.image3
                        };

                        // Get existing listings from localStorage
                        const existingListings = JSON.parse(localStorage.getItem('userListings') || '[]');
                        
                        // Add new listing
                        const updatedListings = [...existingListings, newListing];
                        
                        // Save back to localStorage
                        localStorage.setItem('userListings', JSON.stringify(updatedListings));
                        
                        console.log("💾 Saved to localStorage:", newListing);
                        resolve(newListing);
                    } catch (storageError) {
                        console.error("💾 LocalStorage error:", storageError);
                        reject(new Error("Failed to save listing"));
                    }
                }, 1000);
            } catch (error) {
                reject(error);
            }
        });
    };

    const handleEditField = (section) => {
        if (section === 'images' || section === 'details') {
            navigate("/listingpage1");
        } else if (section === 'category' || section === 'listingType') {
            navigate("/listingpage2");
        }
    };

    const handleFixListingType = () => {
        console.log("🔧 Navigating to fix listing type...");
        navigate("/listingpage2");
    };

    // Quick fix: Allow setting listingType directly on this page
    const handleSetListingType = (type) => {
        console.log("🎯 Setting listing type to:", type);
        if (setListingType) {
            setListingType(type);
            setError(""); // Clear any previous errors
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
                            <span className="font-semibold text-lg">Back to Details</span>
                        </button>
                        
                        <div className="text-center">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                                Almost There! Review Your Listing
                            </h1>
                            <p className="text-gray-600 mt-1">Final Step - Preview & Publish</p>
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
                                            {index === 0 ? 'Basic Info' : index === 1 ? 'Category & Type' : 'Review'}
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
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
                                <p className="text-gray-600 mb-6">Your {listingType} listing is now live!</p>
                                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-blue-600 p-8 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Ready to Go Live! 🚀</h1>
                                <p className="text-green-100 text-lg">Double-check everything looks perfect</p>
                            </div>
                            <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(listingScore)} bg-white/20 rounded-full w-16 h-16 flex items-center justify-center`}>
                                    {listingScore}%
                                </div>
                                <div className="text-green-100 text-sm mt-2">Listing Quality</div>
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
                                <div className="flex-1">
                                    <div className="font-semibold text-lg mb-1">Almost There!</div>
                                    <p className="mb-3">{error}</p>
                                    {error.includes('Rent or Purchase') && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleSetListingType('rent')}
                                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                            >
                                                Set as Rent
                                            </button>
                                            <button
                                                onClick={() => handleSetListingType('purchase')}
                                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                                            >
                                                Set as Purchase
                                            </button>
                                            <button
                                                onClick={handleFixListingType}
                                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                                            >
                                                More Options
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="m-6 p-6 bg-green-50 border border-green-200 rounded-2xl text-green-700">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                <div>
                                    <div className="font-semibold text-lg mb-1">Perfect! 🎉</div>
                                    <p>{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {loading && (
                        <div className="mx-6 mt-6">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Getting your listing ready...</span>
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
                                    Property Photos
                                </h2>
                                <button
                                    onClick={() => handleEditField('images')}
                                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors font-semibold group"
                                >
                                    <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                                    Change Photos
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
                                                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    {idx === 0 ? 'Main Photo' : `Photo ${idx + 1}`}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Upload size={32} />
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                {/* Listing Type - Most Important Section */}
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    !listingType ? 'bg-yellow-50 border-yellow-300' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
                                }`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Tag size={20} className={!listingType ? "text-yellow-600" : "text-purple-600"} />
                                        <h3 className="font-semibold text-gray-800">Listing Type</h3>
                                        {!listingType && (
                                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {listingType ? (
                                            <span className={`px-4 py-2 rounded-full font-semibold ${
                                                listingType === 'rent' 
                                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                                            }`}>
                                                {listingType.charAt(0).toUpperCase() + listingType.slice(1)}
                                            </span>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-yellow-700 font-medium">Is this property for Rent or Purchase?</p>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleSetListingType('rent')}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                                                    >
                                                        For Rent
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetListingType('purchase')}
                                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                                                    >
                                                        For Purchase
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Other details remain the same */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Home size={20} className="text-gray-600" />
                                        <h3 className="font-semibold text-gray-800">Property Title</h3>
                                    </div>
                                    <p className="text-gray-900 text-lg font-medium">{title || "No title provided"}</p>
                                </div>

                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FileText size={20} className="text-gray-600" />
                                        <h3 className="font-semibold text-gray-800">Description</h3>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description || "No description provided"}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Tag size={20} className="text-purple-600" />
                                            <h3 className="font-semibold text-gray-800">Category</h3>
                                        </div>
                                        <p className="text-gray-900 font-medium">{category || "No category selected"}</p>
                                    </div>

                                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <DollarSign size={20} className="text-yellow-600" />
                                            <h3 className="font-semibold text-gray-800">
                                                {listingType === 'rent' ? 'Daily Rate' : 'Price'}
                                            </h3>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">₹{rent || "0"}</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MapPin size={20} className="text-red-500" />
                                        <h3 className="font-semibold text-gray-800">Location</h3>
                                    </div>
                                    <p className="text-gray-900 font-medium">
                                        {landmark && city ? `${landmark}, ${city}` : "No location provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Shield size={20} />
                                <span className="text-sm">Your listing is secure and protected</span>
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
                                            {listingType ? `Publish ${listingType.charAt(0).toUpperCase() + listingType.slice(1)} Listing` : 'Publish Listing'}
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