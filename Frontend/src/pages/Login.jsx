import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext.jsx';
import { useUser } from '../Context/UserContext.jsx'; // Use the custom hook
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Shield,
  Zap,
  Smartphone,
  Globe
} from 'lucide-react';
import axios from 'axios';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [isFocused, setIsFocused] = useState({ email: false, password: false });
    const [rememberMe, setRememberMe] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    
    const { serverUrl } = useContext(AuthContext);
    const { setUserData } = useUser(); // Use the custom hook instead of useContext directly
    const navigate = useNavigate();
    const location = useLocation();
    
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    // Demo user credentials
    const demoUsers = [
        { email: 'demo@airbnb.com', password: 'demo123', role: 'user' },
        { email: 'host@airbnb.com', password: 'host123', role: 'host' },
        { email: 'admin@airbnb.com', password: 'admin123', role: 'admin' }
    ];

    // Check for success message from signup
    useEffect(() => {
        if (location.state?.fromSignup) {
            setSuccess('Account created successfully! Please log in to continue.');
            setTimeout(() => setSuccess(''), 5000);
        }
    }, [location.state]);

    // Auto-focus email field on mount
    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    // Enhanced login handler with better error handling
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        // Basic validation
        if (!email.trim() || !password.trim()) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            // For demo purposes - simulate successful login without backend
            const demoUser = demoUsers.find(user => user.email === email && user.password === password);
            
            if (demoUser) {
                // Simulate API response
                const userData = {
                    user: {
                        _id: 'demo-user-id',
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                        email: email,
                        role: demoUser.role,
                        isVerified: true,
                        profilePicture: null
                    },
                    token: 'demo-jwt-token'
                };

                // Save to localStorage if remember me is checked
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                setUserData(userData);
                setShowSuccessAnimation(true);
                
                // Show success and navigate
                setTimeout(() => {
                    const returnUrl = location.state?.returnUrl || '/';
                    navigate(returnUrl, { 
                        replace: true,
                        state: { 
                            showWelcome: true,
                            userName: userData.user.name
                        }
                    });
                }, 1500);
            } else {
                setError("Invalid email or password. Try demo@airbnb.com / demo123");
                
                // Shake animation for error
                const form = e.target;
                form.classList.add('animate-shake');
                setTimeout(() => form.classList.remove('animate-shake'), 500);
            }

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                setError("Network error. Please check your connection and try again.");
            } else if (error.response?.status === 401) {
                setError("Invalid email or password. Please try again.");
            } else if (error.response?.status === 429) {
                setError("Too many login attempts. Please try again in a few minutes.");
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
            
            // Shake animation for error
            const form = e.target;
            form.classList.add('animate-shake');
            setTimeout(() => form.classList.remove('animate-shake'), 500);
        } finally {
            setLoading(false);
        }
    };

    // Load remembered email
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    // Demo login for testing
    const handleDemoLogin = (userType = 'user') => {
        const demoUser = demoUsers.find(user => user.role === userType) || demoUsers[0];
        setEmail(demoUser.email);
        setPassword(demoUser.password);
        setTimeout(() => {
            emailRef.current?.focus();
        }, 100);
        
        setSuccess(`Demo ${userType} credentials loaded! Click Sign In to continue.`);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Forgot password handler
    const handleForgotPassword = () => {
        if (!email) {
            setError("Please enter your email address first");
            emailRef.current?.focus();
            return;
        }
        setSuccess(`Password reset instructions would be sent to ${email} in a real app`);
        setTimeout(() => setSuccess(''), 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl opacity-50 animate-float"></div>
                <div className="absolute top-1/4 -right-10 w-16 h-16 bg-blue-200 rounded-full blur-xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-cyan-200 rounded-full blur-xl opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 flex items-center gap-3 text-gray-600 hover:text-purple-600 transition-all duration-300 group z-10"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Home</span>
            </button>

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10">
                {/* Success Animation Overlay */}
                {showSuccessAnimation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-3xl p-8 max-w-sm text-center animate-bounce-in">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h3>
                            <p className="text-gray-600">Redirecting you to your dashboard...</p>
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
                        </div>
                    </div>
                )}

                {/* Login Card */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                        
                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <div className="text-2xl font-bold text-white">🏠</div>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-blue-100 text-lg">Sign in to your account</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="p-8 space-y-6">
                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-green-700 flex items-center gap-3 animate-slide-down">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                <div className="text-sm">{success}</div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 flex items-center gap-3 animate-shake">
                                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                <div className="text-sm font-medium">{error}</div>
                            </div>
                        )}

                        {/* Demo Users Quick Access */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <Zap size={16} />
                                Quick Demo Access
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('user')}
                                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-1 rounded-lg transition-colors"
                                >
                                    Regular User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('host')}
                                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 py-2 px-1 rounded-lg transition-colors"
                                >
                                    Host
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDemoLogin('admin')}
                                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-1 rounded-lg transition-colors"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Mail size={16} className="text-purple-500" />
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                                    onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                                    placeholder="Enter your email"
                                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 ${
                                        error && !email 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                                            : isFocused.email 
                                            ? 'border-purple-500 focus:ring-purple-500/20' 
                                            : 'border-gray-200 focus:border-purple-500'
                                    }`}
                                    required
                                />
                                <Mail 
                                    size={20} 
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                                        isFocused.email ? 'text-purple-500' : 'text-gray-400'
                                    }`} 
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Lock size={16} className="text-purple-500" />
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                                    onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                                    placeholder="Enter your password"
                                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 transition-all duration-200 ${
                                        error && !password 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
                                            : isFocused.password 
                                            ? 'border-purple-500 focus:ring-purple-500/20' 
                                            : 'border-gray-200 focus:border-purple-500'
                                    }`}
                                    required
                                />
                                <Lock 
                                    size={20} 
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                                        isFocused.password ? 'text-purple-500' : 'text-gray-400'
                                    }`} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 border-2 rounded transition-all duration-200 group-hover:border-purple-500 ${
                                        rememberMe 
                                            ? 'bg-purple-500 border-purple-500' 
                                            : 'bg-white border-gray-300'
                                    }`}>
                                        {rememberMe && (
                                            <CheckCircle size={14} className="text-white absolute top-0.5 left-0.5" />
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:scale-105'
                            }`}
                        >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                                    Sign In
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        {/* Social Login (Placeholder) */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="p-3 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:text-purple-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                <Globe size={18} />
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button
                                type="button"
                                className="p-3 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:text-purple-600 transition-all duration-200 flex items-center justify-center gap-2 group"
                            >
                                <Smartphone size={18} />
                                <span className="text-sm font-medium">Phone</span>
                            </button>
                        </div>

                        {/* Signup Link */}
                        <div className="text-center pt-4 border-t border-gray-100">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate("/signup")}
                                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors flex items-center gap-2 justify-center mx-auto mt-2 group"
                                >
                                    <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
                                    Create an account
                                </button>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <Shield size={14} />
                        <span>Your data is securely encrypted and protected</span>
                    </div>
                </div>
            </div>

            {/* Add custom animations to global CSS */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slide-down {
                    0% { transform: translateY(-20px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
                .animate-slide-down { animation: slide-down 0.3s ease-out; }
            `}</style>
        </div>
    );
}

export default Login;