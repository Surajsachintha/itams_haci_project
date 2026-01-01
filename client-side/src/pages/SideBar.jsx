import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router'; 
import toast, { Toaster } from 'react-hot-toast';
import { requestForToken, onMessageListener } from '../firebase';

const decodeJwt = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT:", e);
        return null;
    }
};

const PoliceLogo = './it-logo.png'; 
const UserAvatar = './user.png'; 
const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;

const NotificationToast = ({ message, type, onClose }) => {
    const baseClasses = "fixed bottom-5 right-5 z-[100] p-4 rounded-xl shadow-2xl transition-all duration-500 transform";
    let typeClasses = "";
    
    switch (type) {
        case 'success':
            typeClasses = 'bg-green-600 text-white border-green-700';
            break;
        case 'error':
            typeClasses = 'bg-red-600 text-white border-red-700';
            break;
        case 'warning':
            typeClasses = 'bg-yellow-500 text-gray-900 border-yellow-600';
            break;
        default:
            typeClasses = 'bg-blue-600 text-white border-blue-700';
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            <div className="flex items-center">
                {type === 'success' && <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {type === 'error' && <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                <span className="font-semibold">{message}</span>
            </div>
            <button onClick={onClose} className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

const SideBar = (props) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState(null); 
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Asset Registered', message: 'New asset "Laptop-001" registered.', read: false, time: '2 min ago' },
        { id: 2, title: 'Job Completed', message: 'Technician "Kamal" completed Job #123.', read: false, time: '1 hour ago' },
        { id: 3, title: 'Low Stock', message: 'Low stock for "Printer Toner HP".', read: true, time: '3 hours ago' },
    ]);

    const notificationsRef = useRef(null);
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
            const userData = decodeJwt(token);
            if (userData) {
                setUser(userData);
            } else {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                window.location.href = '/login';
            }
        } else {
            window.location.href = '/login'; 
        }

        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotificationsDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        requestForToken();

        onMessageListener().then(payload => {            
            const newNotification = {
                id: Date.now(), 
                title: payload.notification.title,
                message: payload.notification.body,
                read: false,
                time: 'Just now'
            };

            setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);

            toast.custom((t) => (
                <div
                    onClick={() => {
                        toast.dismiss(t.id);
                        navigate('/jobs'); 
                    }}
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer`}
                >
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <img className="h-10 w-10 rounded-full" src="/it-logo.png" alt="" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-bold text-gray-900">{payload.notification.title}</p>
                                <p className="mt-1 text-sm text-gray-500">{payload.notification.body}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ), { duration: 10000 });

        }).catch(err => console.log('failed: ', err));

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        const userName = user ? user.name : 'User'; 
        localStorage.removeItem(ACCESS_TOKEN_KEY); 
        setUser(null); 
        setNotification({
            message: `${userName} logged out successfully.`,
            type: 'success'
        });
        setTimeout(() => {
            window.location.href = '/login'; 
        }, 1000); 
    };

    const handleNotificationClick = (id) => {
        setNotifications(prevNotifications => 
            prevNotifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
        // window.location.href = '/jobs';
    };

    const toggleNotificationsDropdown = () => {
        setShowNotificationsDropdown(prev => !prev);
    };

    const getLinkClasses = (pageName) => {
        const baseClasses = "flex items-center p-3 rounded-xl transition-all duration-200 group relative";
        const activeClasses = "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50 scale-[1.03]";
        const inactiveClasses = "hover:bg-blue-800/50 hover:translate-x-1"; 
        return `${baseClasses} ${props.page === pageName ? activeClasses : inactiveClasses}`;
    };

    const allMenuItems = [
            { 
                name: 'Dashboard', 
                path: '/dashboard', 
                icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1m-4 0h4" /></svg>), 
                roles: ['ADMIN', 'SUPER', 'UNIT_ADMIN', 'TECHNICIAN', 'USER', 'STORCE', 'STATION'] 
            },
            { 
                name: 'Computers', 
                path: '/computers', 
                icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-.75 3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>), 
                roles: ['ADMIN', 'SUPER', 'TECHNICIAN', 'USER', 'STATION'] 
            },
            { 
                name: 'Devices', 
                path: '/devices', 
                icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>), 
                roles: ['ADMIN', 'SUPER', 'TECHNICIAN', 'STATION'] 
            },
            { 
                name: 'User Management', 
                path: '/users', 
                icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>), 
                roles: ['ADMIN', 'SUPER'] 
            },
            { 
                name: 'Settings', 
                path: '/settings', 
                icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" ><path strokeLinecap="round" strokeLinejoin="round"  strokeWidth="2" d="M11.983 13.945a1.983 1.983 0 100-3.966 1.983 1.983 0 000 3.966z" /> <path strokeLinecap="round"  strokeLinejoin="round"  strokeWidth="2" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c0 .69.41 1.31 1.05 1.59.31.13.65.2.99.2H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>), 
                roles: ['SUPER'] 
            },
    ];

    const filteredMenuItems = user ? allMenuItems.filter(item => item.roles.includes(user.role)) : [];

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster 
                position="top-right"
                reverseOrder={false}
                containerStyle={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    right: 20
                }}
            />

            <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 text-white flex flex-col p-5 shadow-2xl transition-all duration-300 relative`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent pointer-events-none"></div>
                
                <div className="flex items-center mb-10 relative z-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20 rounded-full"></div>
                        <img src={PoliceLogo} alt="Logo" className="w-12 h-12 relative z-10 drop-shadow-lg" /> 
                    </div>
                    {!sidebarCollapsed && (
                        <div className="ml-4">
                            <h2 className="text-xl font-bold tracking-wide">ABC Police</h2>
                            <p className="text-sm text-blue-300 font-medium">IT Asset Management</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 space-y-2 relative z-10">
                    {filteredMenuItems.map((item) => (
                        <Link key={item.name} to={item.path} className={getLinkClasses(item.name)}>
                            <div className={`${props.page === item.name ? 'text-white' : 'text-blue-200 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </div>
                            {!sidebarCollapsed && (
                                <span className="ml-3 font-medium">{item.name}</span>
                            )}
                            {props.page === item.name && (
                                <div className="absolute right-0 w-1 h-8 bg-white rounded-l-full"></div>
                            )}
                        </Link>
                    ))}
                </nav>
                
                <div className="mt-auto pt-6 border-t border-blue-800/50 relative z-10">
                    <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl text-red-200 bg-red-900/30 backdrop-blur-sm hover:bg-red-600 hover:text-white transition-all duration-200 hover:scale-[1.03] shadow-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        {!sidebarCollapsed && <span className="ml-3 font-medium">Logout</span>}
                    </button>
                </div>

                {/* Developer Footer - Added Here */}
                {!sidebarCollapsed && (
                    <div className="mt-6 mb-2 text-center relative z-10 opacity-80">
                        <p className="text-[10px] text-blue-300 uppercase tracking-wide">
                            Design & Development by
                        </p>
                        <p className="text-xs text-white font-medium mt-1">
                            RKBMSS Rajapaksha <span className="text-blue-400 mx-1">|</span> S24013317
                        </p>
                    </div>
                )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center bg-white/80 backdrop-blur-lg p-5 shadow-lg border-b border-gray-200/50 z-10">
                    <div className="flex items-center">
                         <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="mr-4 p-2 rounded-full text-blue-900 hover:bg-blue-100 transition-colors duration-200 focus:outline-none">
                            <svg className={`w-6 h-6 transform ${sidebarCollapsed ? 'rotate-180' : 'rotate-0'} transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                        </button>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent">
                            {props.page}
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        
                        <div className="relative mr-2" ref={notificationsRef}>
                            <button
                                onClick={toggleNotificationsDropdown}
                                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </button>
                            
                            {unreadNotificationsCount > 0 && (
                                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {unreadNotificationsCount}
                                </span>
                            )}

                            {showNotificationsDropdown && (
                                <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 origin-top-right animate-fade-in-down z-50">
                                    <h3 className="font-bold text-lg text-blue-900 mb-3 border-b pb-2 border-gray-200">Notifications</h3>
                                    
                                    {notifications.length === 0 && (
                                        <p className="text-gray-500 text-sm py-4 text-center">No new notifications.</p>
                                    )}

                                    {notifications.length > 0 && (
                                        <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                                            {notifications.map(n => (
                                                <li
                                                    key={n.id}
                                                    className={`p-3 rounded-lg flex items-center cursor-pointer transition-colors duration-200 
                                                    ${n.read ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 hover:bg-blue-100 text-gray-800 font-medium'}`}
                                                    onClick={() => handleNotificationClick(n.id)}
                                                >
                                                    <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${n.read ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                                                    <div className="flex-grow">
                                                        {n.title && <p className="text-xs font-bold text-gray-700 mb-0.5">{n.title}</p>}
                                                        <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-blue-900'}`}>{n.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    
                                    <div className="border-t border-gray-200 pt-3 mt-4 text-center">
                                        <Link to="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All Notifications</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="group relative"> 
                            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm cursor-pointer">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-800">{user ? user.name : 'Guest'}</p>
                                    <p className="text-xs text-gray-500">{user ? user.role : 'N/A'}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-400 blur-md opacity-30 rounded-full"></div>
                                    <img src={UserAvatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-blue-400 cursor-pointer relative z-10 shadow-md" /> 
                                </div>
                                <svg className="w-4 h-4 text-gray-600 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            
                            <div className="absolute right-0 top-full mt-3 w-64 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-20">
                                <div className="p-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={UserAvatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-blue-400 shadow-md" />
                                        <div>
                                            <p className="font-bold text-gray-800">{user ? user.name : 'Guest'}</p>
                                            <p className="text-xs text-gray-500">{user ? user.username : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2">
                                        <p className="text-xs font-semibold text-blue-900">{user ? user.role : 'N/A'}</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left p-4 text-red-600 hover:bg-red-50 rounded-b-2xl transition-colors duration-200 flex items-center gap-2 font-medium">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/30 p-8"> 
                    {props.children}
                </main>
            </div>
            
            {notification && (
                <NotificationToast 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default SideBar;