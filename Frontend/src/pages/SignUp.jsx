import React, { useState, useContext, useEffect } from 'react';
import { 
  FaEye, 
  FaEyeSlash, 
  FaArrowLeft, 
  FaAirbnb, 
  FaCheck, 
  FaTimes,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaRocket,
  FaShieldAlt,
  FaUserTie,
  FaHome
} from "react-icons/fa";
import { 
  MdOutlinePerson, 
  MdOutlineEmail, 
  MdLockOutline,
  MdCheckCircle,
  MdError,
  MdSpeed,
  MdSecurity
} from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../Context/AuthContext.jsx";
import { useUser } from "../Context/UserContext.jsx";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "traveler" // traveler, host, business
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1); // Multi-step form
    const [showDemoPanel, setShowDemoPanel] = useState(true);
    
    const navigate = useNavigate();
    const { serverUrl, setAuthToken } = useContext(AuthContext);
    const { setUserData } = useUser();

    // Advanced demo users with different profiles
    const demoUsers = {
        traveler: {
            name: "Alex Traveler",
            email: "traveler@airbnb.com",
            password: "Travel123!",
            confirmPassword: "Travel123!",
            userType: "traveler"
        },
        host: {
            name: "Sarah Host",
            email: "host@airbnb.com",
            password: "Host123!",
            confirmPassword: "Host123!",
            userType: "host"
        },
        business: {
            name: "Business Pro",
            email: "business@airbnb.com",
            password: "Business123!",
            confirmPassword: "Business123!",
            userType: "business"
        },
        quick: {
            name: "Quick Demo",
            email: "demo@airbnb.com",
            password: "demo123",
            confirmPassword: "demo123",
            userType: "traveler"
        }
    };

    // Enhanced demo signup with animation
    const loadDemoUser = (userType = 'quick') => {
        const demoUser = demoUsers[userType];
        
        // Animate form filling
        setFormData(prev => ({ ...prev, ...demoUser }));
        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true,
            userType: true
        });
        setErrors({});
        setPasswordStrength(calculatePasswordStrength(demoUser.password));
        
        // Show success message for demo load
        setErrors({ 
            demo: `🎉 ${demoUser.name} profile loaded! Ready to explore.` 
        });
        
        // Auto-clear demo message
        setTimeout(() => {
            setErrors(prev => ({ ...prev, demo: null }));
        }, 3000);
    };

    // Auto-advance step when form is valid
    useEffect(() => {
        if (currentStep === 1 && formData.name && formData.email && !errors.name && !errors.email) {
            setTimeout(() => setCurrentStep(2), 500);
        }
    }, [formData.name, formData.email, errors.name, errors.email]);

    // Enhanced password strength calculator
    const calculatePasswordStrength = (password) => {
        if (!password) return 0;
        
        let strength = 0;
        const checks = [
            { test: password.length >= 8, weight: 20 },
            { test: /[A-Z]/.test(password), weight: 20 },
            { test: /[a-z]/.test(password), weight: 20 },
            { test: /[0-9]/.test(password), weight: 20 },
            { test: /[^A-Za-z0-9]/.test(password), weight: 10 },
            { test: password.length >= 12, weight: 10 }
        ];
        
        checks.forEach(check => {
            if (check.test) strength += check.weight;
        });
        
        return Math.min(strength, 100);
    };

    // Advanced validation with real-time feedback
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else if (value.trim().length > 50) {
                    newErrors.name = 'Name is too long';
                } else {
                    delete newErrors.name;
                }
                break;
                
            case 'email':
                if (!value) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else if (value.length > 100) {
                    newErrors.email = 'Email is too long';
                } else {
                    delete newErrors.email;
                }
                break;
                
            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters';
                } else if (!/(?=.*[a-z])/.test(value)) {
                    newErrors.password = 'Include at least one lowercase letter';
                } else if (!/(?=.*[A-Z])/.test(value)) {
                    newErrors.password = 'Include at least one uppercase letter';
                } else if (!/(?=.*\d)/.test(value)) {
                    newErrors.password = 'Include at least one number';
                } else if (value.length > 128) {
                    newErrors.password = 'Password is too long';
                } else {
                    delete newErrors.password;
                }
                setPasswordStrength(calculatePasswordStrength(value));
                break;
                
            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(newErrors);
    };

    // Enhanced input handler with debouncing
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (touched[name]) {
            // Small delay for better UX
            setTimeout(() => validateField(name, value), 300);
        }
    };

    // Enhanced blur handler
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validateField(name, formData[name]);
    };

    // Check form validity for current step
    const isStepValid = (step) => {
        switch (step) {
            case 1:
                return formData.name && formData.email && !errors.name && !errors.email;
            case 2:
                return formData.password && formData.confirmPassword && 
                       !errors.password && !errors.confirmPassword;
            default:
                return false;
        }
    };

    // Enhanced password strength indicator
    const PasswordStrengthBar = () => {
        const getStrengthColor = () => {
            if (passwordStrength < 40) return 'bg-red-500';
            if (passwordStrength < 70) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        const getStrengthText = () => {
            if (passwordStrength < 40) return 'Weak';
            if (passwordStrength < 70) return 'Good';
            return 'Strong';
        };

        const getStrengthIcon = () => {
            if (passwordStrength < 40) return '🔴';
            if (passwordStrength < 70) return '🟡';
            return '🟢';
        };

        if (!formData.password) return null;

        return (
            <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Password Strength</span>
                    <span className={`text-sm font-bold ${
                        passwordStrength < 40 ? 'text-red-600' :
                        passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {getStrengthIcon()} {getStrengthText()}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                        className={`h-3 rounded-full transition-all duration-500 ${getStrengthColor()} shadow-sm`}
                        style={{ width: `${passwordStrength}%` }}
                    ></div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                    {passwordStrength}% secure
                </div>
            </div>
        );
    };

    // Advanced password requirements
    const PasswordRequirements = () => {
        const requirements = [
            { 
                text: 'At least 8 characters', 
                met: formData.password.length >= 8,
                important: true 
            },
            { 
                text: 'Uppercase letter (A-Z)', 
                met: /[A-Z]/.test(formData.password),
                important: true 
            },
            { 
                text: 'Lowercase letter (a-z)', 
                met: /[a-z]/.test(formData.password),
                important: true 
            },
            { 
                text: 'Number (0-9)', 
                met: /[0-9]/.test(formData.password),
                important: true 
            },
            { 
                text: '12+ characters (bonus)', 
                met: formData.password.length >= 12,
                important: false 
            },
            { 
                text: 'Special character (!@#$)', 
                met: /[^A-Za-z0-9]/.test(formData.password),
                important: false 
            }
        ];

        if (!formData.password) return null;

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <MdSecurity className="text-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Security Checklist</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {requirements.map((req, index) => (
                        <div key={index} className={`flex items-center text-sm p-2 rounded-lg ${
                            req.met ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                            {req.met ? (
                                <MdCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                                <MdError className="text-gray-400 mr-2 flex-shrink-0" />
                            )}
                            <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                                {req.text}
                            </span>
                            {req.important && (
                                <span className="ml-1 text-red-500">*</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // NEW: Handle login navigation for "Launch My Host Journey"
    const handleLaunchJourney = () => {
        // Save the user type to localStorage or context for login page to use
        const userJourneyData = {
            intendedUserType: formData.userType,
            fromSignup: true,
            message: `Ready to start your ${formData.userType} journey! Please sign in to continue.`
        };
        
        localStorage.setItem('userJourney', JSON.stringify(userJourneyData));
        
        // Navigate to login page
        navigate('/login', { 
            state: { 
                fromSignup: true,
                intendedUserType: formData.userType,
                message: `Welcome future ${formData.userType}! Sign in to start your journey.`
            }
        });
    };

    // Enhanced form submission with progress simulation
    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
        }, {});
        setTouched(allTouched);
        
        // Validate all fields
        Object.keys(formData).forEach(key => {
            validateField(key, formData[key]);
        });
        
        if (!isStepValid(1) || !isStepValid(2)) {
            setErrors(prev => ({ 
                ...prev, 
                submit: 'Please complete all required fields correctly.' 
            }));
            return;
        }
        
        setLoading(true);
        
        try {
            // Simulate API call with progress
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Enhanced demo user data
            const userData = {
                user: {
                    _id: `demo-${formData.userType}-${Date.now()}`,
                    name: formData.name.trim(),
                    email: formData.email.toLowerCase().trim(),
                    role: formData.userType,
                    isVerified: true,
                    profilePicture: null,
                    createdAt: new Date().toISOString(),
                    preferences: {
                        notifications: true,
                        newsletter: true,
                        language: 'en'
                    },
                    stats: {
                        listings: formData.userType === 'host' ? 3 : 0,
                        trips: formData.userType === 'traveler' ? 5 : 0,
                        reviews: 12
                    }
                },
                token: `demo-jwt-${Date.now()}`,
                welcomeBonus: true,
                onboardingComplete: false
            };
            
            setUserData(userData);
            setShowSuccess(true);
            
            // Enhanced success handling
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        fromSignup: true,
                        message: `Welcome to Airbnb! Your ${formData.userType} account is ready.`,
                        email: formData.email,
                        userType: formData.userType,
                        welcomeBonus: true
                    }
                });
            }, 2500);
            
        } catch(error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || 
                               "We encountered an issue. Please try again or use demo mode.";
            setErrors({ submit: errorMessage });
            
            setTimeout(() => {
                setErrors(prev => ({ ...prev, submit: null }));
            }, 5000);
        }
    };

    // User type selection component
    const UserTypeSelector = () => (
        <div className="space-y-4">
            <label className="block text-gray-700 font-semibold">I want to join as a...</label>
            <div className="grid grid-cols-3 gap-3">
                {[
                    { value: 'traveler', label: 'Traveler', icon: <FaRocket />, desc: 'Book stays' },
                    { value: 'host', label: 'Host', icon: <FaHome />, desc: 'List property' },
                    { value: 'business', label: 'Business', icon: <FaUserTie />, desc: 'Team travel' }
                ].map(type => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                        className={`p-4 border-2 rounded-xl text-center transition-all duration-300 ${
                            formData.userType === type.value
                                ? 'border-rose-500 bg-rose-50 shadow-md scale-105'
                                : 'border-gray-200 hover:border-rose-300 hover:bg-rose-25'
                        }`}
                    >
                        <div className="text-2xl text-rose-500 mb-2">{type.icon}</div>
                        <div className="font-semibold text-gray-800">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Progress indicator
    const ProgressBar = () => (
        <div className="flex items-center justify-between mb-8">
            {[1, 2].map(step => (
                <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= step 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                    }`}>
                        {step}
                    </div>
                    {step < 2 && (
                        <div className={`w-12 h-1 mx-2 ${
                            currentStep > step ? 'bg-rose-500' : 'bg-gray-200'
                        }`}></div>
                    )}
                </div>
            ))}
        </div>
    );

    // Success animation component
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-lg">
                        <FaCheck className="text-white text-4xl" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Airbnb! 🎉</h2>
                    <p className="text-gray-600 text-lg mb-2">
                        Your {formData.userType} account is ready to explore.
                    </p>
                    <p className="text-gray-500 mb-6">
                        Redirecting you to start your journey...
                    </p>
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-rose-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute top-1/3 -right-20 w-32 h-32 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-cyan-200 rounded-full blur-3xl opacity-50 animate-pulse delay-2000"></div>
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center gap-3 text-rose-500 hover:text-rose-600 transition-all duration-300 z-10 group"
            >
                <FaArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Home</span>
            </button>

            {/* Demo Panel Toggle */}
            <button
                onClick={() => setShowDemoPanel(!showDemoPanel)}
                className="absolute top-6 right-6 bg-rose-500 text-white p-3 rounded-full shadow-lg hover:bg-rose-600 transition-colors z-10"
                title="Quick Demo Access"
            >
                <FaRocket />
            </button>

            {/* Demo Panel */}
            {showDemoPanel && (
                <div className="absolute top-20 right-6 bg-white rounded-2xl shadow-2xl p-6 w-80 z-20 animate-slide-in">
                    <div className="flex items-center gap-2 mb-4">
                        <FaRocket className="text-rose-500" />
                        <h3 className="font-bold text-gray-800">Quick Start Demo</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Try different user experiences instantly:
                    </p>
                    <div className="space-y-3">
                        {Object.entries(demoUsers).map(([key, user]) => (
                            <button
                                key={key}
                                onClick={() => loadDemoUser(key)}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 group-hover:text-rose-600">
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-gray-500 capitalize">
                                            {key} • {user.email}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Signup Card */}
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl relative z-10">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>
                    
                    <div className="relative z-10 text-center">
                        <FaAirbnb className="text-5xl text-white mx-auto mb-4 filter drop-shadow-lg" />
                        <h1 className="text-4xl font-bold mb-3">Join Airbnb</h1>
                        <p className="text-rose-100 text-lg">Start your extraordinary journey today</p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <ProgressBar />
                    
                    {/* Demo Load Message */}
                    {errors.demo && (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-2xl mb-6 animate-pulse shadow-lg">
                            <div className="flex items-center gap-3">
                                <FaRocket className="text-xl" />
                                <div>
                                    <div className="font-semibold">Demo Mode Activated! 🚀</div>
                                    <div className="text-sm opacity-90">{errors.demo}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-6">
                        {/* User Type Selection - Always visible */}
                        <UserTypeSelector />

                        {/* Step 1: Basic Info */}
                        {currentStep >= 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div className="space-y-3">
                                        <label className="block text-gray-700 font-semibold flex items-center gap-2">
                                            <MdOutlinePerson className="text-rose-500" />
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="name"
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 ${
                                                    errors.name 
                                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                                                }`}
                                                placeholder="Your full name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <MdOutlinePerson className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                            {touched.name && !errors.name && formData.name && (
                                                <FaCheck className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                        {errors.name && (
                                            <p className="text-red-600 text-sm flex items-center gap-2 animate-shake">
                                                <FaTimes className="text-xs" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div className="space-y-3">
                                        <label className="block text-gray-700 font-semibold flex items-center gap-2">
                                            <MdOutlineEmail className="text-rose-500" />
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                name="email"
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 ${
                                                    errors.email 
                                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                                                }`}
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <MdOutlineEmail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                            {touched.email && !errors.email && formData.email && (
                                                <FaCheck className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                        {errors.email && (
                                            <p className="text-red-600 text-sm flex items-center gap-2 animate-shake">
                                                <FaTimes className="text-xs" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Continue Button */}
                                {isStepValid(1) && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-rose-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Continue to Security Setup →
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Step 2: Password */}
                        {currentStep >= 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-4">
                                    {/* Password Field */}
                                    <div className="space-y-3">
                                        <label className="block text-gray-700 font-semibold flex items-center gap-2">
                                            <MdLockOutline className="text-rose-500" />
                                            Create Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 ${
                                                    errors.password 
                                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                                                }`}
                                                placeholder="Create a strong password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <MdLockOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                            <button
                                                type="button"
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-gray-100"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-red-600 text-sm flex items-center gap-2 animate-shake">
                                                <FaTimes className="text-xs" />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Strength & Requirements */}
                                    {formData.password && (
                                        <div className="space-y-4">
                                            <PasswordStrengthBar />
                                            <PasswordRequirements />
                                        </div>
                                    )}

                                    {/* Confirm Password */}
                                    <div className="space-y-3">
                                        <label className="block text-gray-700 font-semibold flex items-center gap-2">
                                            <MdSecurity className="text-rose-500" />
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-300 ${
                                                    errors.confirmPassword 
                                                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20' 
                                                        : 'border-gray-200 focus:border-rose-500 focus:ring-rose-500/20'
                                                }`}
                                                placeholder="Re-enter your password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                            />
                                            <FaShieldAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                                                <FaCheck className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="text-red-600 text-sm flex items-center gap-2 animate-shake">
                                                <FaTimes className="text-xs" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center gap-3 animate-shake">
                                        <FaTimes className="flex-shrink-0" />
                                        <div className="text-sm font-medium">{errors.submit}</div>
                                    </div>
                                )}

                                {/* Terms & Submit */}
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            className="w-5 h-5 text-rose-500 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 mt-1"
                                            required
                                        />
                                        <label htmlFor="terms" className="text-sm text-gray-600">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-rose-500 hover:text-rose-600 font-medium">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link to="/privacy" className="text-rose-500 hover:text-rose-600 font-medium">
                                                Privacy Policy
                                            </Link>
                                            . I understand this is a demo experience.
                                        </label>
                                    </div>

                                    {/* NEW: Launch Journey Button */}
                                    <button
                                        type="button"
                                        onClick={handleLaunchJourney}
                                        disabled={!isStepValid(2)}
                                        className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden ${
                                            !isStepValid(2) 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:shadow-2xl hover:scale-105'
                                        }`}
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                                        <FaRocket className="group-hover:scale-110 transition-transform" />
                                        Launch My {formData.userType.charAt(0).toUpperCase() + formData.userType.slice(1)} Journey
                                    </button>

                                    {/* Original Submit Button (Hidden but kept for reference) */}
                                    <button
                                        type="submit"
                                        disabled={loading || !isStepValid(2)}
                                        className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden ${
                                            loading || !isStepValid(2) 
                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 hover:shadow-2xl hover:scale-105'
                                        }`}
                                        style={{ display: 'none' }} // Hide the original submit button
                                    >
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                                        {loading ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Creating Your {formData.userType} Account...
                                            </>
                                        ) : (
                                            <>
                                                <FaRocket className="group-hover:scale-110 transition-transform" />
                                                Create My {formData.userType.charAt(0).toUpperCase() + formData.userType.slice(1)} Account
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Enhanced Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                            >
                                Sign in here
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out; }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
            `}</style>
        </div>
    );
}

export default SignUp;