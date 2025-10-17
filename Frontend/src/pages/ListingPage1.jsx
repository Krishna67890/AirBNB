import React, { useContext, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingDataContext } from '../Context/Listingcontext.jsx';
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
  Image as ImageIcon
} from 'lucide-react';

function ListingPage1() {
  const navigate = useNavigate();
  const {
    title, setTitle,
    description, setDescription,
    frontEndImage1, setFrontEndImage1,
    frontEndImage2, setFrontEndImage2,
    frontEndImage3, setFrontEndImage3,
    rent, setRent,
    city, setCity,
    landmark, setLandmark
  } = useContext(ListingDataContext);

  const [imagePreviews, setImagePreviews] = useState([null, null, null]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  
  const imgRefs = [useRef(), useRef(), useRef()];
  const fileInputRefs = [useRef(), useRef(), useRef()];

  // Character counter for description
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setCharacterCount(value.length);
  };

  // Enhanced image handling with previews
  const handleImageChange = useCallback((idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        images: 'Please upload only image files'
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        images: 'Image size should be less than 5MB'
      }));
      return;
    }

    // Set the file in context
    if (idx === 0) setFrontEndImage1(file);
    if (idx === 1) setFrontEndImage2(file);
    if (idx === 2) setFrontEndImage3(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[idx] = e.target.result;
        return newPreviews;
      });
    };
    reader.readAsDataURL(file);

    // Clear errors
    setErrors(prev => ({ ...prev, images: undefined }));
  }, [setFrontEndImage1, setFrontEndImage2, setFrontEndImage3]);

  // Remove image
  const removeImage = useCallback((idx) => {
    if (idx === 0) setFrontEndImage1(null);
    if (idx === 1) setFrontEndImage2(null);
    if (idx === 2) setFrontEndImage3(null);
    
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[idx] = null;
      return newPreviews;
    });

    // Reset file input
    if (fileInputRefs[idx].current) {
      fileInputRefs[idx].current.value = '';
    }
  }, [setFrontEndImage1, setFrontEndImage2, setFrontEndImage3]);

  // Trigger file input click
  const triggerFileInput = (idx) => {
    fileInputRefs[idx].current?.click();
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 50) {
      newErrors.description = 'Description should be at least 50 characters';
    }

    if (!frontEndImage1) {
      newErrors.images = 'At least one image is required';
    }

    if (!rent || rent <= 0) {
      newErrors.rent = 'Please enter a valid rent amount';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!landmark.trim()) {
      newErrors.landmark = 'Landmark is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    navigate('/listingpage2');
    setIsSubmitting(false);
  };

  // Input field component for consistency
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
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
          }`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle size={20} className="text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle size={16} />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-cyan-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="bg-white rounded-3xl shadow-2xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-lg">Back to Home</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                Create Your Listing
              </h1>
              <p className="text-gray-600 mt-1">Step 1 of 3 - Basic Information</p>
            </div>

            <div className="w-24"></div> {/* Spacer for balance */}
          </div>

          {/* Enhanced Stepper */}
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
                      {index === 0 ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span className="font-semibold">{step}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium mt-2">
                      {index === 0 ? 'Details' : index === 1 ? 'Category' : 'Preview'}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                      index === 0 ? 'bg-rose-500' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <form
          className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 space-y-8"
          onSubmit={handleSubmit}
        >
          {/* Title Section */}
          <InputField
            label="Property Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Beautiful Beachfront Villa with Ocean View"
            icon={Home}
            error={errors.title}
            required
            maxLength={100}
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
                placeholder="Describe your property in detail. Include unique features, amenities, and what makes your place special..."
                rows={6}
                className={`w-full p-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                }`}
                maxLength={1000}
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-500">
                {characterCount}/1000
              </div>
              {errors.description && (
                <div className="absolute right-3 top-3">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
              )}
            </div>
            {errors.description && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.description}
              </p>
            )}
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Tip: A detailed description increases booking chances by 40%
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <Camera size={20} className="text-rose-500" />
              Property Images
              <span className="text-rose-500">*</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRefs[idx]}
                    onChange={(e) => handleImageChange(idx, e)}
                    required={idx === 0 && !frontEndImage1}
                  />
                  
                  {imagePreviews[idx] ? (
                    <div className="aspect-square rounded-2xl border-2 border-gray-200 overflow-hidden relative">
                      <img
                        src={imagePreviews[idx]}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        Image {idx + 1}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerFileInput(idx)}
                      className={`w-full aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-200 group hover:border-rose-500 hover:bg-rose-50 ${
                        idx === 0 ? 'border-rose-300 bg-rose-25' : 'border-gray-300 bg-gray-50'
                      } ${errors.images ? 'border-red-300' : ''}`}
                    >
                      <div className={`p-3 rounded-full mb-3 transition-colors ${
                        idx === 0 ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx === 0 ? <Camera size={24} /> : <Upload size={24} />}
                      </div>
                      <span className={`font-medium transition-colors ${
                        idx === 0 ? 'text-rose-600' : 'text-gray-600'
                      }`}>
                        {idx === 0 ? 'Main Image *' : `Image ${idx + 1}`}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        {idx === 0 ? 'Required' : 'Optional'}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {errors.images && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.images}
              </p>
            )}

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Upload high-quality images for better visibility
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                First image will be your main cover photo
              </div>
            </div>
          </div>

          {/* Price and Location Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InputField
              label="Daily Rent"
              name="rent"
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="e.g., 2500"
              icon={DollarSign}
              error={errors.rent}
              required
              min="1"
              step="1"
            />

            <InputField
              label="City"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Mumbai"
              icon={MapPin}
              error={errors.city}
              required
            />

            <InputField
              label="Landmark"
              name="landmark"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g., Near Marine Drive"
              icon={Landmark}
              error={errors.landmark}
              required
              className="lg:col-span-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-rose-500 hover:text-rose-500 transition-all duration-200 font-semibold text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 px-6 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl hover:shadow-xl transition-all duration-200 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Continue to Category
                  <ArrowLeft size={20} className="rotate-180" />
                </>
              )}
            </button>
          </div>

          {/* Form Progress Indicator */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Form Completion</span>
              <span className="font-semibold text-rose-500">
                {Math.round(
                  ((title ? 1 : 0) + 
                   (description.length >= 50 ? 1 : 0) + 
                   (frontEndImage1 ? 1 : 0) + 
                   (rent > 0 ? 1 : 0) + 
                   (city ? 1 : 0) + 
                   (landmark ? 1 : 0)) / 6 * 100
                )}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-rose-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${((title ? 1 : 0) + 
                           (description.length >= 50 ? 1 : 0) + 
                           (frontEndImage1 ? 1 : 0) + 
                           (rent > 0 ? 1 : 0) + 
                           (city ? 1 : 0) + 
                           (landmark ? 1 : 0)) / 6 * 100}%`
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ListingPage1;