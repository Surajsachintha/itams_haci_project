import React, { useState, useEffect } from 'react';
import { requestForToken } from '../firebase'; 
import { useNavigate } from "react-router";

const LOGIN_API_URL = import.meta.env.VITE_LOGIN_API_URL;
const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
const PoliceLogo = './police-logo.png'; 

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fcmToken, setFcmToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFcmToken = async () => {
            try {
                const token = await requestForToken();
                if (token) {
                    setFcmToken(token);
                }
            } catch (err) {
                console.error("Error fetching FCM token:", err);
            }
        };

        fetchFcmToken();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!LOGIN_API_URL) {
            setError('Login API URL is not configured in your .env file (VITE_LOGIN_API_URL).');
            setLoading(false);
            return;
        }
        if (!ACCESS_TOKEN_KEY) {
            setError('Auth Token Key is not configured in your .env file (VITE_AUTH_TOKEN_KEY).');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    fcmToken: fcmToken 
                }),
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
                window.location.href = '/dashboard';
            } else {
                setError(data.message || 'Login failed. Check your credentials.');
            }

        } catch (err) {
            console.error('Login Error:', err);
            setError('A network error occurred. Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-900 text-white p-12 shadow-2xl relative overflow-hidden">
                <img 
                    src={PoliceLogo} 
                    alt="Sri Lanka Police Logo" 
                    className="w-40 h-40 mb-6 z-10" 
                />
                <h1 className="text-4xl font-bold mb-2 text-center z-10">
                    ABC Police
                </h1>
                <h1 className="text-3xl font-bold mb-2 text-center z-10">
                    Information Technology Division
                </h1>
                <h2 className="text-2xl font-light text-blue-200 text-center mb-6 z-10">
                    Asset Management System (ITAMS)
                </h2>
            </div>

            <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-50 p-8 sm:p-12 relative">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl z-10">
                    
                    <img 
                        src={PoliceLogo} 
                        alt="Logo" 
                        className="w-16 h-16 mx-auto mb-6 md:hidden" 
                    />

                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
                        Welcome!
                    </h2>
                    <p className="text-center text-gray-500 mb-8">
                        Sign in to your ITAMS account.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="text-sm font-medium text-gray-700 block mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </span>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-medium text-gray-700 block mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM9 10V7a3 3 0 016 0v3" /></svg>
                                </span>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end text-sm">
                            <a onClick={() => navigate('/forgot-password')} className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                                Forgot Password?
                            </a>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
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
    );
};

export default LoginPage;