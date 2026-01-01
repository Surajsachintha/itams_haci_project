import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, User, XCircle, ArrowRight } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { jwtDecode } from "jwt-decode";
import API_POINT from '../axiosConfig';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [userInfo, setUserInfo] = useState(null);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          setIsTokenInvalid(true);
        } else {
          setUserInfo(decoded);
          setIsTokenInvalid(false);
        }

      } catch (error) {
        setIsTokenInvalid(true);
      }
    } else {
      setIsTokenInvalid(true);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match!' });
      return;
    }

    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);

    try {
      const response = await API_POINT.post('/setup-password', {
        token: token,     
        password: formData.password 
      });
      
      if (response.status === 200) {
        setStatus({ type: 'success', message: 'Password set successfully! Redirecting...' });
        
        setTimeout(() => {
            navigate('/login');
        }, 2000);
      }

    } catch (error) {
      console.error("Password setup error:", error);
      const errorMsg = error.response?.data?.message || 'Failed to set password. Token might be expired.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen flex w-full">
      
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a8a] flex-col justify-center items-center text-white p-12">
        <div className="mb-8">
           <img 
            src="/police-logo.png" 
            alt="Sri Lanka Police Logo" 
            className="w-32 h-32 object-contain mx-auto mb-6"
          />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-center">ABC Police</h1>
        <h2 className="text-xl font-semibold mb-2 text-center text-blue-100">Information Technology Division</h2>
        <p className="text-sm text-blue-200 text-center">Asset Management System (ITAMS)</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

          {isTokenInvalid ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <XCircle size={64} className="text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
              <p className="text-gray-500 mb-8">
                The password reset link you clicked is invalid or has expired. Please request a new link.
              </p>
              
              <Link 
                to="/forgot-password" 
                className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
              >
                Go to Forgot Password
                <ArrowRight size={18} />
              </Link>

               <div className="mt-6">
                <a href="/login" className="text-sm text-gray-500 hover:text-blue-900 hover:underline">
                  Return to Login
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
              </div>

              {userInfo && (
                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-1">
                    <User size={18} className="text-blue-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Account Details</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{userInfo.username}</p>
                    {userInfo.email && (
                      <p className="text-xs text-gray-500">{userInfo.email}</p>
                    )}
                  </div>
                </div>
              )}

              {status.message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  {status.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>

              </form>
              
              <div className="mt-6 text-center">
                <a href="/login" className="text-sm text-blue-900 hover:underline font-medium">
                  Back to Sign In
                </a>
              </div>
            </>
          )}
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
                Design & Development by
            </p>
            <p className="text-sm text-gray-800 font-semibold mt-1">
                RKBMSS Rajapaksha <span className="text-gray-400 mx-1">|</span> S24013317
            </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;