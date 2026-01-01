import React, { useState } from 'react';
import { User, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { Link } from 'react-router';
import API_POINT from '../axiosConfig';

const ForgotPassword = () => {
  const [username, setUsername] = useState(''); 
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!username) {
      setStatus({ type: 'error', message: 'Please enter your username.' });
      return;
    }

    setLoading(true);

    try {
      const response = await API_POINT.post('/forgot-password', {
        username: username
      });

      if (response.status === 200) {
        const userEmail = response.data.email; 

        setStatus({ 
          type: 'success', 
          message: (<span>
                        A password reset link has been sent to{' '}
                        <span className="font-bold text-gray-900">{userEmail || 'your registered email address'}</span>.
                        </span>
                    ) 
        });
        setUsername(''); 
      }

    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMsg = error.response?.data?.message || 'Something went wrong. Please try again.';
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
          
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="text-[#1e3a8a]" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
            <p className="text-gray-500 mt-2 text-sm">
              Enter your <b>System Username</b> below. We will send a password reset link to your registered email address.
            </p>
          </div>

          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 text-sm ${
              status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="mt-0.5">
                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              </div>
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>

          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-[#1e3a8a] transition-colors font-medium"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>

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

export default ForgotPassword;