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
  FaApple
} from "react-icons/fa";
import { 
  MdOutlinePerson, 
  MdOutlineEmail, 
  MdLockOutline,
  MdCheckCircle,
  MdError 
} from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from "../Context/AuthContext.jsx";
import { UserDataContext } from "../Context/Usercontext.jsx";

function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const navigate = useNavigate();
    const { serverUrl, setAuthToken } = useContext(AuthContext);
    const [userData, setUserData] = useContext(UserDataContext);

    // Password strength calculator
    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 10;
        return Math.min(strength, 100);
    };

    // Validation rules
    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else {
                    delete newErrors.name;
                }
                break;
                
            case 'email':
                if (!value) {
                    newErrors.email = 'Email is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
                
            case 'password':
                if (!value) {
                    newErrors.password = 'Password is required';
                } else if (value.length < 8) {
                    newErrors.password = 'Password must be at least 8 characters';
                } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    newErrors.password = 'Include uppercase, lowercase, and numbers';
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

    // Handle input changes with validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validate field if it's been touched
        if (touched[name]) {
            validateField(name, value);
        }
    };

    // Handle blur events
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        validateField(name, formData[name]);
    };

    // Check if form is valid
    const isFormValid = () => {
        return (
            formData.name &&
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            Object.keys(errors).length === 0
        );
    };

    // Password strength indicator
    const PasswordStrengthBar = () => {
        const getStrengthColor = () => {
            if (passwordStrength < 40) return 'bg-red-500';
            if (passwordStrength < 70) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        const getStrengthText = () => {
            if (passwordStrength < 40) return 'Weak';
            if (passwordStrength < 70) return 'Moderate';
            return 'Strong';
        };

        if (!formData.password) return null;

        return (
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                        passwordStrength < 40 ? 'text-red-600' :
                        passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                        {getStrengthText()}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                    ></div>
                </div>
            </div>
        );
    };

    // Password requirements checklist
    const PasswordRequirements = () => {
        const requirements = [
            { text: 'At least 8 characters', met: formData.password.length >= 8 },
            { text: 'Uppercase letter', met: /[A-Z]/.test(formData.password) },
            { text: 'Lowercase letter', met: /[a-z]/.test(formData.password) },
            { text: 'Number', met: /[0-9]/.test(formData.password) },
        ];

        if (!formData.password) return null;

        return (
            <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Requirements:</span>
                <div className="space-y-1">
                    {requirements.map((req, index) => (
                        <div key={index} className="flex items-center text-sm">
                            {req.met ? (
                                <MdCheckCircle className="text-green-500 mr-2" />
                            ) : (
                                <MdError className="text-gray-400 mr-2" />
                            )}
                            <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                                {req.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Handle form submission
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
        
        if (!isFormValid()) return;
        
        setLoading(true);
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                name: formData.name.trim(),
                email: formData.email.toLowerCase().trim(),
                password: formData.password
            }, { 
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            
            setLoading(false);
            setUserData(result.data);
            setShowSuccess(true);
            
            // Show success message and redirect
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Account created successfully! Please log in.',
                        email: formData.email 
                    }
                });
            }, 2000);
            
        } catch(error) {
            setLoading(false);
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               "Signup failed. Please try again.";
            setErrors({ submit: errorMessage });
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
                setErrors(prev => ({ ...prev, submit: null }));
            }, 5000);
        }
    };

    // Social signup handlers
    const handleSocialSignup = (provider) => {
        // Implement social signup logic here
        console.log(`Sign up with ${provider}`);
        // window.location.href = `${serverUrl}/api/auth/${provider}`;
    };

    // Success animation component
    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <FaCheck className="text-white text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Airbnb!</h2>
                    <p className="text-gray-600">Your account has been created successfully.</p>
                    <p className="text-gray-500 text-sm mt-4">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-cyan-50 flex items-center justify-center p-4">
            {/* Back Button */}
            <button 
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors z-10"
            >
                <FaArrowLeft className="text-xl" />
                <span className="font-medium">Home</span>
            </button>

            {/* Signup Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-5"></div>
                    <FaAirbnb className="text-4xl text-white mx-auto mb-2 relative z-10" />
                    <h1 className="text-2xl font-bold text-white relative z-10">Join Airbnb</h1>
                    <p className="text-rose-100 relative z-10">Create your account and start your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSignUp} className="p-6 space-y-6">
                    {/* Submit Error */}
                    {errors.submit && (
                        <div className="bg-rose-100 border border-rose-300 text-rose-700 p-4 rounded-lg text-sm flex items-center">
                            <FaTimes className="mr-2 flex-shrink-0" />
                            {errors.submit}
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdOutlinePerson className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {touched.name && !errors.name && formData.name && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <FaCheck className="text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.name && (
                            <p className="text-red-600 text-sm flex items-center">
                                <FaTimes className="mr-1 text-xs" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdOutlineEmail className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {touched.email && !errors.email && formData.email && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <FaCheck className="text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.email && (
                            <p className="text-red-600 text-sm flex items-center">
                                <FaTimes className="mr-1 text-xs" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdLockOutline className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-lg transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <FaEye className="text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        
                        {/* Password Strength & Requirements */}
                        {formData.password && (
                            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                                <PasswordStrengthBar />
                                <PasswordRequirements />
                            </div>
                        )}
                        
                        {errors.password && (
                            <p className="text-red-600 text-sm flex items-center">
                                <FaTimes className="mr-1 text-xs" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdLockOutline className="text-gray-400" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                            />
                            {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <FaCheck className="text-green-500" />
                                </div>
                            )}
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-red-600 text-sm flex items-center">
                                <FaTimes className="mr-1 text-xs" />
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="terms"
                            className="w-4 h-4 text-rose-500 bg-gray-100 border-gray-300 rounded focus:ring-rose-500"
                            required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the{' '}
                            <Link to="/terms" className="text-rose-500 hover:text-rose-600">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link to="/privacy" className="text-rose-500 hover:text-rose-600">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !isFormValid()}
                        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
                            loading || !isFormValid() 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-rose-500 hover:bg-rose-600 transform hover:scale-105 shadow-lg'
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                                Creating account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm">or continue with</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Social Signup Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => handleSocialSignup('google')}
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaGoogle className="text-red-500" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialSignup('facebook')}
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaFacebook className="text-blue-600" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialSignup('apple')}
                            className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FaApple className="text-gray-800" />
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-rose-500 hover:text-rose-600 font-medium transition-colors"
                        >
                            Log in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;