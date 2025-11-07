import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingData } from '../Context/Listingcontext.jsx';
import {
  ArrowLeft,
  Upload,
  X,
  Camera,
  MapPin,
  DollarSign,
  Home,
  Landmark,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Tag
} from 'lucide-react';

function ListingPage1() {
  const navigate = useNavigate();
  const {
    title: contextTitle, setTitle: setContextTitle,
    description: contextDescription, setDescription: setContextDescription,
    frontEndImage1: contextImage1, setFrontEndImage1: setContextImage1,
    frontEndImage2: contextImage2, setFrontEndImage2: setContextImage2,
    frontEndImage3: contextImage3, setFrontEndImage3: setContextImage3,
    rent: contextRent, setRent: setContextRent,
    city: contextCity, setCity: setContextCity,
    landmark: contextLandmark, setLandmark: setContextLandmark,
    listingType: contextListingType, setListingType: setContextListingType // Added listing type
  } = useListingData();

  // Local state
  const [title, setTitle] = useState(contextTitle || '');
  const [description, setDescription] = useState(contextDescription || '');
  const [rent, setRent] = useState(contextRent || '');
  const [city, setCity] = useState(contextCity || '');
  const [landmark, setLandmark] = useState(contextLandmark || '');
  const [listingType, setListingType] = useState(contextListingType || ''); // Added listing type
  const [frontEndImage1, setFrontEndImage1] = useState(contextImage1);
  const [frontEndImage2, setFrontEndImage2] = useState(contextImage2);
  const [frontEndImage3, setFrontEndImage3] = useState(contextImage3);

  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [showAllErrors, setShowAllErrors] = useState(false);
  
  const fileInputRefs = [useRef(), useRef(), useRef()];

  // Sync local state with context
  useEffect(() => {
    setTitle(contextTitle || '');
    setDescription(contextDescription || '');
    setRent(contextRent || '');
    setCity(contextCity || '');
    setLandmark(contextLandmark || '');
    setListingType(contextListingType || '');
    setFrontEndImage1(contextImage1);
    setFrontEndImage2(contextImage2);
    setFrontEndImage3(contextImage3);
  }, [contextTitle, contextDescription, contextRent, contextCity, contextLandmark, contextListingType, contextImage1, contextImage2, contextImage3]);

  // Sync to context
  useEffect(() => { setContextTitle(title); }, [title, setContextTitle]);
  useEffect(() => { setContextDescription(description); }, [description, setContextDescription]);
  useEffect(() => { setContextRent(rent); }, [rent, setContextRent]);
  useEffect(() => { setContextCity(city); }, [city, setContextCity]);
  useEffect(() => { setContextLandmark(landmark); }, [landmark, setContextLandmark]);
  useEffect(() => { setContextListingType(listingType); }, [listingType, setContextListingType]);
  useEffect(() => { setContextImage1(frontEndImage1); }, [frontEndImage1, setContextImage1]);
  useEffect(() => { setContextImage2(frontEndImage2); }, [frontEndImage2, setContextImage2]);
  useEffect(() => { setContextImage3(frontEndImage3); }, [frontEndImage3, setContextImage3]);

  // Input handlers
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setCharacterCount(value.length);
    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
  };

  const handleRentChange = (e) => {
    const value = e.target.value;
    setRent(value);
    if (errors.rent) setErrors(prev => ({ ...prev, rent: undefined }));
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
  };

  const handleLandmarkChange = (e) => {
    const value = e.target.value;
    setLandmark(value);
    if (errors.landmark) setErrors(prev => ({ ...prev, landmark: undefined }));
  };

  const handleListingTypeSelect = (type) => {
    setListingType(type);
    if (errors.listingType) setErrors(prev => ({ ...prev, listingType: undefined }));
  };

  // Image handling
  const handleImageChange = useCallback((idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, images: 'Please upload only image files' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, images: 'Image size should be less than 5MB' }));
      return;
    }

    if (idx === 0) setFrontEndImage1(file);
    if (idx === 1) setFrontEndImage2(file);
    if (idx === 2) setFrontEndImage3(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[idx] = e.target.result;
        return newPreviews;
      });
    };
    reader.readAsDataURL(file);

    setErrors(prev => ({ ...prev, images: undefined }));
  }, []);

  const removeImage = useCallback((idx) => {
    if (idx === 0) setFrontEndImage1(null);
    if (idx === 1) setFrontEndImage2(null);
    if (idx === 2) setFrontEndImage3(null);
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[idx] = null;
      return newPreviews;
    });

    if (fileInputRefs[idx].current) {
      fileInputRefs[idx].current.value = '';
    }
  }, []);

  const triggerFileInput = (idx) => {
    fileInputRefs[idx].current?.click();
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!title?.trim()) newErrors.title = 'Please add a title for your property';
    if (!description?.trim()) newErrors.description = 'Please describe your property';
    if (!frontEndImage1) newErrors.images = 'Please add at least one photo of your property';
    if (!listingType) newErrors.listingType = 'Please select whether you want to rent or sell this property';
    
    const rentValue = Number(rent);
    if (!rent || isNaN(rentValue) || rentValue <= 0) newErrors.rent = 'Please enter a valid amount';
    
    if (!city?.trim()) newErrors.city = 'Please enter the city where your property is located';
    if (!landmark?.trim()) newErrors.landmark = 'Please add a nearby landmark for easy location';

    setErrors(newErrors);
    setShowAllErrors(true);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      setTimeout(() => {
        const firstError = Object.keys(errors)[0];
        if (firstError === 'images') {
          document.querySelector('[data-image-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (firstError === 'listingType') {
          document.querySelector('[data-listing-type-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    navigate('/listingpage2');
    setIsSubmitting(false);
  };

  // Input field component
  const InputField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    type = 'text', 
    placeholder, 
    icon: Icon, 
    error,
    required = false,
    ...props 
  }) => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        {Icon && <Icon size={20} className="text-rose-500" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 ${
            error && showAllErrors
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
          }`}
          {...props}
        />
        {error && showAllErrors && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle size={20} className="text-red-500" />
          </div>
        )}
      </div>
      {error && showAllErrors && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={16} />
          {error}
        </p>
      )}
    </div>
  );

  // Calculate completion
  const calculateCompletion = () => {
    const fields = [
      title?.trim().length > 0,
      description?.trim().length > 0,
      frontEndImage1,
      rent && !isNaN(Number(rent)) && Number(rent) > 0,
      city?.trim().length > 0,
      landmark?.trim().length > 0,
      listingType // Added listing type to completion calculation
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const canSubmit = calculateCompletion() === 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-cyan-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="bg-white rounded-3xl shadow-2xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/mylisting")}
              className="flex items-center gap-3 text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-lg">My Listings</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                List Your Property
              </h1>
              <p className="text-gray-600 mt-1">Step 1: Tell us about your place</p>
            </div>

            <div className="w-24"></div>
          </div>

          {/* Stepper */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center ${index === 0 ? 'text-rose-500' : 'text-gray-400'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      index === 0 
                        ? 'bg-rose-500 border-rose-500 text-white shadow-lg scale-110' 
                        : 'border-gray-300 bg-white'
                    }`}>
                      {index === 0 ? <CheckCircle size={20} /> : <span className="font-semibold">{step}</span>}
                    </div>
                    <span className="text-sm font-medium mt-2">
                      {index === 0 ? 'Basic Info' : index === 1 ? 'Category' : 'Preview'}
                    </span>
                  </div>
                  {index < 2 && <div className={`w-16 h-1 mx-4 transition-all duration-300 ${index === 0 ? 'bg-rose-500' : 'bg-gray-300'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <form className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 space-y-8" onSubmit={handleSubmit}>
          {/* Listing Type Section - NEW */}
          <div className="space-y-4" data-listing-type-section>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Tag size={20} className="text-rose-500" />
              How do you want to list this property?
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleListingTypeSelect('rent')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  listingType === 'rent'
                    ? 'border-green-500 bg-green-50 shadow-lg scale-105 ring-2 ring-green-500/20'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-xl mb-3 transition-colors ${
                  listingType === 'rent' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <Calendar size={24} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold text-lg transition-colors ${
                    listingType === 'rent' 
                      ? 'text-green-700' 
                      : 'text-gray-800'
                  }`}>
                    For Rent
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Short-term or long-term rental
                  </div>
                </div>
                
                {listingType === 'rent' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleListingTypeSelect('purchase')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  listingType === 'purchase'
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 ring-2 ring-blue-500/20'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className={`p-3 rounded-xl mb-3 transition-colors ${
                  listingType === 'purchase' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <DollarSign size={24} />
                </div>
                <div className="text-left">
                  <div className={`font-semibold text-lg transition-colors ${
                    listingType === 'purchase' 
                      ? 'text-blue-700' 
                      : 'text-gray-800'
                  }`}>
                    For Sale
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Permanent property sale
                  </div>
                </div>
                
                {listingType === 'purchase' && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
            {errors.listingType && showAllErrors && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.listingType}
              </p>
            )}
          </div>

          {/* Title Section */}
          <InputField
            label="Property Title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Beautiful beachfront villa with ocean view"
            icon={Home}
            error={errors.title}
            required
          />

          {/* Description Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <FileText size={20} className="text-rose-500" />
              Description
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Tell guests what makes your property special... Describe the space, amenities, and what makes it unique"
                rows={6}
                className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 resize-none ${
                  errors.description && showAllErrors
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                {characterCount}/1000
              </div>
              {errors.description && showAllErrors && (
                <div className="absolute right-3 top-3">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {errors.description && showAllErrors && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.description}
              </p>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4" data-image-section>
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Camera size={20} className="text-rose-500" />
              Property Photos
              <span className="text-rose-500">*</span>
            </label>
            <p className="text-gray-600 text-sm">Add clear photos to showcase your property. The first image will be your main photo.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRefs[idx]}
                    onChange={(e) => handleImageChange(idx, e)}
                  />
                  
                  {imagePreviews[idx] ? (
                    <div className="aspect-square rounded-2xl border-2 border-gray-200 overflow-hidden relative">
                      <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerFileInput(idx)}
                      className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 group hover:border-rose-500 hover:bg-rose-50 ${
                        idx === 0 ? 'border-rose-300 bg-rose-25' : 'border-gray-300 bg-gray-50'
                      } ${errors.images && showAllErrors ? 'border-red-300' : ''}`}
                    >
                      <div className={`p-3 rounded-full mb-3 transition-colors ${
                        idx === 0 ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx === 0 ? <Camera size={24} /> : <Upload size={24} />}
                      </div>
                      <span className={`font-medium transition-colors ${
                        idx === 0 ? 'text-rose-600' : 'text-gray-600'
                      }`}>
                        {idx === 0 ? 'Main Photo' : `Photo ${idx + 1}`}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.images && showAllErrors && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.images}
              </p>
            )}
          </div>

          {/* Price and Location Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InputField
              label={listingType === 'rent' ? 'Daily Rent (₹)' : 'Price (₹)'}
              name="rent"
              type="number"
              value={rent}
              onChange={handleRentChange}
              placeholder={listingType === 'rent' ? '2500' : '5000000'}
              icon={DollarSign}
              error={errors.rent}
              required
            />

            <InputField
              label="City"
              name="city"
              value={city}
              onChange={handleCityChange}
              placeholder="Mumbai"
              icon={MapPin}
              error={errors.city}
              required
            />

            <div className="lg:col-span-2">
              <InputField
                label="Nearby Landmark"
                name="landmark"
                value={landmark}
                onChange={handleLandmarkChange}
                placeholder="Near Marine Drive, 5 min walk from metro station"
                icon={Landmark}
                error={errors.landmark}
                required
              />
            </div>
          </div>

          {/* Selected Options Preview */}
          {listingType && (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-500" />
                <div>
                  <h4 className="font-semibold text-gray-800">Listing Type Selected</h4>
                  <p className="text-gray-600">
                    You're listing this property for <strong className="text-green-600 capitalize">{listingType}</strong>
                    {listingType === 'rent' ? ' (short-term or long-term rental)' : ' (permanent sale)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/mylisting")}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-all duration-200 font-semibold text-lg"
            >
              Save for Later
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking Details...
                </>
              ) : (
                <>
                  Continue to Category
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your progress</span>
              <span className={`font-semibold ${canSubmit ? 'text-green-500' : 'text-rose-500'}`}>
                {calculateCompletion()}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  canSubmit ? 'bg-green-500' : 'bg-rose-500'
                }`}
                style={{ width: `${calculateCompletion()}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
              <div className={`flex items-center gap-1 ${title?.trim().length > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Clear title</span>
              </div>
              <div className={`flex items-center gap-1 ${description?.trim().length > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Description</span>
              </div>
              <div className={`flex items-center gap-1 ${frontEndImage1 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Property photos</span>
              </div>
              <div className={`flex items-center gap-1 ${listingType ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Rent or Sale</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {canSubmit ? '🎉 All set! Ready to continue.' : 'Fill in all the details to continue'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ListingPage1;