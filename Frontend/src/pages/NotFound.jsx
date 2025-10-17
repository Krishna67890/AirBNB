import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
  Search,
  Map,
  Compass,
  AlertTriangle,
  RefreshCw,
  Rocket,
  Ghost,
  WifiOff,
  Server,
  Clock,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Countdown for automatic redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [countdown, navigate]);

  // Mouse move effect for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Common error solutions
  const solutions = [
    {
      icon: <Search size={20} />,
      title: 'Check the URL',
      description: 'Make sure the web address is spelled correctly'
    },
    {
      icon: <RefreshCw size={20} />,
      title: 'Refresh the page',
      description: 'Sometimes a simple refresh fixes the issue'
    },
    {
      icon: <Clock size={20} />,
      title: 'Wait a moment',
      description: 'The page might be temporarily unavailable'
    },
    {
      icon: <HelpCircle size={20} />,
      title: 'Get help',
      description: 'Contact support if the problem persists'
    }
  ];

  // Popular pages to suggest
  const popularPages = [
    { path: '/', name: 'Home', icon: <Home size={16} /> },
    { path: '/listingpage1', name: 'Create Listing', icon: <Rocket size={16} /> },
    { path: '/my-listings', name: 'My Listings', icon: <Map size={16} /> },
    { path: '/login', name: 'Sign In', icon: <Compass size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating shapes */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-50 animate-float"
          style={{ 
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-200 rounded-full blur-3xl opacity-50 animate-float"
          style={{ 
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            animationDelay: '2s'
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 left-3/4 w-28 h-28 bg-cyan-200 rounded-full blur-3xl opacity-50 animate-float"
          style={{ 
            transform: `translate(${mousePosition.y}px, ${mousePosition.x}px)`,
            animationDelay: '4s'
          }}
        ></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #999 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Animated 404 */}
            <div className="relative">
              <div className="text-9xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent relative">
                4
                <span className="inline-block animate-bounce">0</span>
                4
                <div className="absolute -top-4 -right-4">
                  <Ghost size={80} className="text-purple-400 animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-2 -left-4 w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Lost in Space?
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Don't worry, even the best explorers get lost sometimes. The page you're looking for has drifted off into the digital cosmos.
              </p>
            </div>

            {/* Auto-redirect Countdown */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-600">
                <Clock size={16} className="text-purple-500" />
                <span>Redirecting to home in </span>
                <span className="font-mono font-bold text-purple-600 text-lg">
                  {countdown}s
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                <Home size={20} className="group-hover:scale-110 transition-transform" />
                <span>Back to Homepage</span>
                {isHovered && (
                  <Sparkles size={16} className="text-yellow-300 animate-ping" />
                )}
              </Link>

              <button
                onClick={() => navigate(-1)}
                className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:border-purple-500 hover:text-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Go Back</span>
              </button>
            </div>

            {/* Quick Links */}
            <div className="pt-4">
              <p className="text-gray-500 text-sm mb-3">Quick navigation:</p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {popularPages.map((page, index) => (
                  <Link
                    key={index}
                    to={page.path}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 hover:bg-white hover:border-purple-500 hover:text-purple-600 transition-all duration-200 group"
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {page.icon}
                    </span>
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Solutions & Illustration */}
          <div className="space-y-6">
            {/* Error Illustration */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={48} className="text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Page Not Found</h3>
                <p className="text-gray-600">
                  We've searched high and low but couldn't find what you're looking for.
                </p>
              </div>
            </div>

            {/* Solutions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-500" />
                Try these solutions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {solutions.map((solution, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-200 group"
                  >
                    <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform duration-200">
                      {solution.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {solution.title}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {solution.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Information */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-3xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <Server size={20} className="text-purple-600" />
                <span className="font-semibold text-gray-900">System Status</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Website is operational</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>All services are running</span>
                </div>
                <div className="text-gray-500 text-xs mt-2">
                  Last checked: Just now
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            If you believe this is an error, please{' '}
            <button className="text-purple-600 hover:text-purple-700 font-medium underline">
              contact support
            </button>
          </p>
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
          40%, 43% { transform: translate3d(0,-30px,0); }
          70% { transform: translate3d(0,-15px,0); }
          90% { transform: translate3d(0,-4px,0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce { animation: bounce 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}