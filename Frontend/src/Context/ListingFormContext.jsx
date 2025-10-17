import React, { createContext, useState, useCallback, useMemo } from 'react';

export const ListingFormContext = createContext();

// Custom hook for using form context
export const useListingForm = () => {
  const context = React.useContext(ListingFormContext);
  if (!context) {
    throw new Error('useListingForm must be used within a ListingFormProvider');
  }
  return context;
};

// Validation schemas
const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-.,!?()]+$/,
    message: 'Title must be 5-100 characters with only letters, numbers, and basic punctuation'
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 1000,
    message: 'Description must be 20-1000 characters'
  },
  rent: {
    required: true,
    min: 100,
    max: 100000,
    pattern: /^\d+$/,
    message: 'Rent must be a number between ₹100 and ₹100,000'
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s\-']+$/,
    message: 'City must be 2-50 letters with spaces and hyphens only'
  },
  landmark: {
    required: true,
    minLength: 5,
    maxLength: 100,
    message: 'Landmark must be 5-100 characters'
  },
  category: {
    required: true,
    message: 'Please select a category'
  }
};

// Available categories
const CATEGORIES = [
  'Apartment', 'House', 'Villa', 'Condo', 'Studio',
  'Cabin', 'Farm', 'Castle', 'Treehouse', 'Boat',
  'Guesthouse', 'Hotel', 'Resort', 'Cottage', 'Loft'
];

// Available amenities
const AMENITIES = [
  'WiFi', 'Pool', 'Kitchen', 'Parking', 'Air Conditioning',
  'Heating', 'Washer', 'Dryer', 'TV', 'Gym', 'Hot Tub',
  'Pet Friendly', 'Breakfast', 'Fireplace', 'Beachfront',
  'Mountain View', 'City View', 'Garden', 'Balcony', 'Elevator'
];

export function ListingFormProvider({ children }) {
  const [form, setForm] = useState({
    // Basic Information
    title: '',
    description: '',
    category: '',
    
    // Location
    city: '',
    landmark: '',
    address: '',
    latitude: null,
    longitude: null,
    
    // Pricing
    rent: '',
    securityDeposit: '',
    cleaningFee: '',
    currency: 'INR',
    
    // Property Details
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    beds: 1,
    squareFeet: '',
    amenities: [],
    
    // Images
    images: [null, null, null, null, null], // Up to 5 images
    
    // Host Rules
    checkInTime: '14:00',
    checkOutTime: '11:00',
    minStay: 1,
    maxStay: 30,
    instantBook: false,
    smokingAllowed: false,
    petsAllowed: false,
    partiesAllowed: false,
    
    // Additional Information
    houseRules: '',
    cancellationPolicy: 'flexible', // flexible, moderate, strict
    availability: 'available' // available, booked, maintenance
  });

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [formHistory, setFormHistory] = useState([]);
  const [autoSave, setAutoSave] = useState(true);

  // Total steps in the form
  const TOTAL_STEPS = 6;

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return null;

    if (rules.required && (!value || value.toString().trim() === '')) {
      return 'This field is required';
    }

    if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        return `Minimum ${rules.minLength} characters required`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Maximum ${rules.maxLength} characters allowed`;
      }

      if (rules.min && parseInt(value) < rules.min) {
        return `Minimum value is ${rules.min}`;
      }

      if (rules.max && parseInt(value) > rules.max) {
        return `Maximum value is ${rules.max}`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return rules.message || 'Invalid format';
      }
    }

    return null;
  }, []);

  // Validate all fields in current step
  const validateStep = useCallback((stepNumber) => {
    const stepFields = getStepFields(stepNumber);
    const newErrors = {};

    stepFields.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // Get fields for specific step
  const getStepFields = useCallback((stepNumber) => {
    const stepFields = {
      1: ['title', 'description', 'category'],
      2: ['city', 'landmark', 'address'],
      3: ['rent', 'securityDeposit', 'cleaningFee'],
      4: ['maxGuests', 'bedrooms', 'bathrooms', 'beds', 'squareFeet', 'amenities'],
      5: ['checkInTime', 'checkOutTime', 'minStay', 'maxStay', 'houseRules', 'cancellationPolicy'],
      6: ['images'] // Images are always last
    };
    return stepFields[stepNumber] || [];
  }, []);

  // Update form with validation
  const updateForm = useCallback((updates) => {
    setForm(prev => {
      const newForm = { ...prev, ...updates };
      
      // Auto-validate touched fields
      if (autoSave) {
        const newErrors = { ...errors };
        Object.keys(updates).forEach(field => {
          if (touched[field]) {
            const error = validateField(field, updates[field]);
            if (error) {
              newErrors[field] = error;
            } else {
              delete newErrors[field];
            }
          }
        });
        setErrors(newErrors);
      }

      // Save to history for undo functionality
      setFormHistory(prevHistory => [...prevHistory.slice(-9), prev]); // Keep last 10 states

      return newForm;
    });
  }, [errors, touched, autoSave, validateField]);

  // Update image with file validation
  const updateImage = useCallback((index, file) => {
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          images: 'Please upload only JPG, PNG, or WebP images'
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: 'Image size must be less than 5MB'
        }));
        return;
      }

      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }

    setForm(prev => {
      const images = [...prev.images];
      images[index] = file;
      return { ...prev, images };
    });
  }, []);

  // Mark field as touched
  const markAsTouched = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate immediately when touched
    const error = validateField(fieldName, form[fieldName]);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  }, [form, validateField]);

  // Navigation with validation
  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= TOTAL_STEPS) {
      // Validate all previous steps when jumping
      let canProceed = true;
      for (let i = 1; i < stepNumber; i++) {
        if (!validateStep(i)) {
          canProceed = false;
          break;
        }
      }
      
      if (canProceed) {
        setStep(stepNumber);
      }
    }
  }, [validateStep]);

  // Form submission
  const submitForm = useCallback(async (onSubmit) => {
    if (typeof onSubmit !== 'function') {
      throw new Error('Submit callback is required');
    }

    // Validate all steps
    let allValid = true;
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (!validateStep(i)) {
        allValid = false;
        if (i > step) {
          setStep(i); // Go to first invalid step
        }
        break;
      }
    }

    if (!allValid) {
      setSubmitStatus('error');
      return { success: false, error: 'Please fix all validation errors' };
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare form data for submission
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(form).forEach(key => {
        if (key === 'images') {
          form.images.forEach((image, index) => {
            if (image) {
              formData.append(`images`, image);
            }
          });
        } else if (Array.isArray(form[key])) {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });

      const result = await onSubmit(formData);
      setSubmitStatus('success');
      return { success: true, data: result };
    } catch (error) {
      setSubmitStatus('error');
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [form, step, validateStep]);

  // Reset form completely
  const resetForm = useCallback(() => {
    setForm({
      title: '',
      description: '',
      category: '',
      city: '',
      landmark: '',
      address: '',
      latitude: null,
      longitude: null,
      rent: '',
      securityDeposit: '',
      cleaningFee: '',
      currency: 'INR',
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      squareFeet: '',
      amenities: [],
      images: [null, null, null, null, null],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      minStay: 1,
      maxStay: 30,
      instantBook: false,
      smokingAllowed: false,
      petsAllowed: false,
      partiesAllowed: false,
      houseRules: '',
      cancellationPolicy: 'flexible',
      availability: 'available'
    });
    setStep(1);
    setErrors({});
    setTouched({});
    setSubmitStatus(null);
    setFormHistory([]);
  }, []);

  // Undo last change
  const undo = useCallback(() => {
    if (formHistory.length > 0) {
      const previousState = formHistory[formHistory.length - 1];
      setForm(previousState);
      setFormHistory(prev => prev.slice(0, -1));
    }
  }, [formHistory]);

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    const totalFields = Object.keys(form).length;
    const filledFields = Object.values(form).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0 && value.some(item => item !== null);
      }
      return value !== null && value !== '' && value !== false;
    }).length;

    return Math.round((filledFields / totalFields) * 100);
  }, [form]);

  // Check if current step is valid
  const isStepValid = useMemo(() => {
    return validateStep(step);
  }, [step, validateStep]);

  // Get step title and description
  const getStepInfo = useCallback((stepNumber) => {
    const stepInfo = {
      1: { title: 'Basic Information', description: 'Tell us about your place' },
      2: { title: 'Location', description: 'Where is your place located?' },
      3: { title: 'Pricing', description: 'Set your rental price and fees' },
      4: { title: 'Property Details', description: 'Describe your space and amenities' },
      5: { title: 'House Rules', description: 'Set rules and policies' },
      6: { title: 'Photos', description: 'Add photos of your place' }
    };
    return stepInfo[stepNumber] || { title: '', description: '' };
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    // State
    form,
    step,
    errors,
    touched,
    isSubmitting,
    submitStatus,
    autoSave,

    // Actions
    updateForm,
    updateImage,
    markAsTouched,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    submitForm,
    undo,
    setAutoSave,

    // Computed values
    totalSteps: TOTAL_STEPS,
    completionPercentage,
    isStepValid,
    getStepInfo,
    currentStepInfo: getStepInfo(step),

    // Constants
    categories: CATEGORIES,
    amenities: AMENITIES,
    cancellationPolicies: [
      { value: 'flexible', label: 'Flexible - Full refund 1 day before arrival' },
      { value: 'moderate', label: 'Moderate - Full refund 5 days before arrival' },
      { value: 'strict', label: 'Strict - 50% refund up to 1 week before arrival' }
    ],

    // Utilities
    validateField,
    validateStep,
    canGoNext: step < TOTAL_STEPS,
    canGoPrev: step > 1,
    canSubmit: step === TOTAL_STEPS && isStepValid && !isSubmitting,
    hasUnsavedChanges: formHistory.length > 0,
    getStepFields: (stepNum) => getStepFields(stepNum || step)
  }), [
    form, step, errors, touched, isSubmitting, submitStatus, autoSave,
    updateForm, updateImage, markAsTouched, nextStep, prevStep, goToStep,
    resetForm, submitForm, undo, completionPercentage, isStepValid,
    getStepInfo, validateField, validateStep, getStepFields, formHistory
  ]);

  return (
    <ListingFormContext.Provider value={contextValue}>
      {children}
    </ListingFormContext.Provider>
  );
}