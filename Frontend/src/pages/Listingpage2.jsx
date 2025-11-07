import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingData } from '../Context/Listingcontext.jsx';

import {
  ArrowLeft,
  Home,
  Building,
  Waves,
  Bed,
  Building2,
  TreePine,
  Store,
  Mountain,
  Castle,
  Tent,
  Ship,
  Car,
  Sparkles,
  CheckCircle,
  Search,
  X,
  Info,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';

function ListingPage2() {
  const navigate = useNavigate();
  const { 
    category, 
    setCategory, 
    title, 
    description, 
    listingType, 
    setListingType,
    frontEndImage1,
    rent,
    city,
    landmark
  } = useListingData();
  
  const [validationError, setValidationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedListingType, setSelectedListingType] = useState(listingType);

  // Enhanced property types with better icons and descriptions
  const propertyTypes = useMemo(() => [
    {
      name: "Apartment",
      icon: <Building size={28} />,
      description: "A self-contained housing unit in a building",
      popular: true
    },
    {
      name: "House",
      icon: <Home size={28} />,
      description: "A standalone residential building",
      popular: true
    },
    {
      name: "Villa",
      icon: <Castle size={28} />,
      description: "A luxurious standalone residence",
      popular: false
    },
    {
      name: "Cabin",
      icon: <TreePine size={28} />,
      description: "A rustic retreat in nature",
      popular: true
    },
    {
      name: "Beach House",
      icon: <Waves size={28} />,
      description: "A property near the waterfront",
      popular: false
    },
    {
      name: "Studio",
      icon: <Bed size={28} />,
      description: "A single-room apartment",
      popular: true
    },
    {
      name: "Penthouse",
      icon: <Building2 size={28} />,
      description: "A luxury apartment on top floor",
      popular: false
    },
    {
      name: "Farm Stay",
      icon: <Tent size={28} />,
      description: "Agricultural property experience",
      popular: false
    },
    {
      name: "Mountain Hut",
      icon: <Mountain size={28} />,
      description: "A cozy retreat in the mountains",
      popular: false
    },
    {
      name: "Boat House",
      icon: <Ship size={28} />,
      description: "A floating accommodation",
      popular: false
    },
    {
      name: "Guesthouse",
      icon: <Building size={28} />,
      description: "A separate guest accommodation",
      popular: true
    },
    {
      name: "Commercial Space",
      icon: <Store size={28} />,
      description: "Business or retail property",
      popular: false
    },
    {
      name: "PG/Hostel",
      icon: <Bed size={28} />,
      description: "Shared accommodation for students",
      popular: true
    },
    {
      name: "Vacation Home",
      icon: <Home size={28} />,
      description: "A property for holiday rentals",
      popular: true
    },
    {
      name: "Luxury Villa",
      icon: <Sparkles size={28} />,
      description: "High-end luxury residence",
      popular: false
    }
  ], []);

  // Listing types
  const listingTypes = useMemo(() => [
    {
      type: "rent",
      title: "For Rent",
      description: "Short-term or long-term rental",
      icon: <Calendar size={24} />,
      color: "green"
    },
    {
      type: "purchase", 
      title: "For Sale",
      description: "Permanent property sale",
      icon: <DollarSign size={24} />,
      color: "blue"
    }
  ], []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return propertyTypes;
    
    return propertyTypes.filter(type =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [propertyTypes, searchQuery]);

  // Popular categories
  const popularCategories = useMemo(() => 
    propertyTypes.filter(type => type.popular),
    [propertyTypes]
  );

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setCategory(categoryName);
    setValidationError('');
  };

  const handleListingTypeSelect = (type) => {
    setSelectedListingType(type);
    setListingType(type);
    setValidationError('');
  };

  // Calculate completion score
  const calculateCompletion = () => {
    const fields = [
      title?.trim().length > 5,
      description?.trim().length > 20,
      !!frontEndImage1,
      !!selectedListingType,
      !!rent && !isNaN(Number(rent)) && Number(rent) > 0,
      !!city?.trim(),
      !!landmark?.trim(),
      !!selectedCategory
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completionScore = calculateCompletion();

  const handleNext = () => {
    if (!selectedCategory) {
      setValidationError('Please select a property type to continue');
      const errorElement = document.getElementById('validation-error');
      if (errorElement) {
        errorElement.classList.add('animate-shake');
        setTimeout(() => errorElement.classList.remove('animate-shake'), 500);
      }
      return;
    }

    if (!selectedListingType) {
      setValidationError('Please select whether this is for Rent or Sale');
      const errorElement = document.getElementById('validation-error');
      if (errorElement) {
        errorElement.classList.add('animate-shake');
        setTimeout(() => errorElement.classList.remove('animate-shake'), 500);
      }
      return;
    }

    navigate("/listingpage3");
  };

  const handlePrevious = () => {
    navigate(-1);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Progress Header */}
        <div className="bg-white rounded-3xl shadow-2xl mb-6 p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/listingpage1")}
              className="flex items-center gap-3 text-gray-600 hover:text-rose-500 transition-colors group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold text-lg">Back to Details</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Choose Property Type
              </h1>
              <p className="text-gray-600 mt-1">Step 2 of 3 - Category & Listing Type</p>
            </div>

            <div className="w-24"></div>
          </div>

          {/* Enhanced Stepper */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center ${
                    index <= 1 ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      index === 1 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110' 
                        : index === 0
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {index <= 1 ? (
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
                      index === 0 ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Overall Progress</span>
              <span className={`font-semibold ${
                completionScore === 100 ? 'text-green-500' : 'text-blue-500'
              }`}>
                {completionScore}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  completionScore === 100 ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionScore}%` }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
              <div className={`flex items-center gap-1 ${title?.trim().length > 5 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Clear title</span>
              </div>
              <div className={`flex items-center gap-1 ${description?.trim().length > 20 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Detailed description</span>
              </div>
              <div className={`flex items-center gap-1 ${frontEndImage1 ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Property photos</span>
              </div>
              <div className={`flex items-center gap-1 ${selectedListingType ? 'text-green-500' : 'text-gray-400'}`}>
                <CheckCircle size={12} />
                <span>Rent or Sale</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
          {/* Property Preview */}
          {title && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                Your Property Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-800">Title:</strong> {title}
                </div>
                <div>
                  <strong className="text-gray-800">Description:</strong> 
                  {description.length > 60 ? `${description.substring(0, 60)}...` : description}
                </div>
              </div>
            </div>
          )}

          {/* Listing Type Selection - NEW SECTION */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Tag size={24} className="text-purple-500" />
              How do you want to list this property?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listingTypes.map((item) => (
                <button
                  key={item.type}
                  onClick={() => handleListingTypeSelect(item.type)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedListingType === item.type
                      ? `border-${item.color}-500 bg-${item.color}-50 shadow-lg scale-105 ring-2 ring-${item.color}-500/20`
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-xl mb-3 transition-colors ${
                    selectedListingType === item.type 
                      ? `bg-${item.color}-500 text-white` 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold text-lg transition-colors ${
                      selectedListingType === item.type 
                        ? `text-${item.color}-700` 
                        : 'text-gray-800'
                    }`}>
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </div>
                  </div>
                  
                  {selectedListingType === item.type && (
                    <div className="absolute top-4 right-4">
                      <div className={`w-6 h-6 bg-${item.color}-500 rounded-full flex items-center justify-center`}>
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search property types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Validation Error */}
          {validationError && (
            <div 
              id="validation-error"
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3 transition-all duration-300"
            >
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <X size={14} className="text-white" />
              </div>
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          {/* Popular Categories */}
          {!searchQuery && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={24} className="text-yellow-500" />
                Popular Choices
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularCategories.map((type) => (
                  <button
                    key={type.name}
                    onClick={() => handleCategorySelect(type.name)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === type.name
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-3 transition-colors ${
                      selectedCategory === type.name ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold transition-colors ${
                        selectedCategory === type.name ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {type.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {type.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Categories */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {searchQuery ? `Search Results (${filteredCategories.length})` : 'All Property Types'}
            </h3>
            
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No property types found matching "{searchQuery}"</p>
                <button
                  onClick={clearSearch}
                  className="mt-4 text-blue-500 hover:text-blue-600 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredCategories.map((type) => (
                  <button
                    key={type.name}
                    onClick={() => handleCategorySelect(type.name)}
                    className={`group p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 relative ${
                      selectedCategory === type.name
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-3 transition-colors group-hover:scale-110 ${
                      selectedCategory === type.name 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-500'
                    }`}>
                      {type.icon}
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold transition-colors ${
                        selectedCategory === type.name 
                          ? 'text-blue-700' 
                          : 'text-gray-800 group-hover:text-blue-600'
                      }`}>
                        {type.name}
                      </div>
                      <div className={`text-xs transition-colors mt-1 line-clamp-2 ${
                        selectedCategory === type.name ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {type.description}
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedCategory === type.name && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Popular Badge */}
                    {type.popular && !searchQuery && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles size={10} />
                          Popular
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Options Preview */}
          {(selectedCategory || selectedListingType) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    Selected Options
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {selectedListingType && (
                      <div>
                        <strong className="text-gray-800">Listing Type:</strong>{' '}
                        <span className="text-green-600 font-medium capitalize">
                          {selectedListingType}
                        </span>
                      </div>
                    )}
                    {selectedCategory && (
                      <div>
                        <strong className="text-gray-800">Property Type:</strong>{' '}
                        <span className="text-green-600 font-medium">
                          {selectedCategory}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">✓</div>
                  <div className="text-sm text-green-500">Ready to continue</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-blue-500 hover:text-blue-500 transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3"
            >
              <ArrowLeft size={20} />
              Back to Details
            </button>
            <button
              onClick={handleNext}
              disabled={!selectedCategory || !selectedListingType}
              className={`flex-1 py-4 px-6 rounded-2xl transition-all duration-200 font-semibold text-lg flex items-center justify-center gap-3 ${
                selectedCategory && selectedListingType
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Preview
              <ArrowLeft size={20} className="rotate-180" />
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <Info size={16} />
              Choosing the right category and listing type helps {selectedListingType === 'rent' ? 'guests' : 'buyers'} find your property more easily
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingPage2;