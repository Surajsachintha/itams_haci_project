import React, { useRef, useState } from 'react'
import { Link } from 'react-router'; 

function NotificationPage() {
    const [notification, setNotification] = useState(null);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false); 
    const [notifications, setNotifications] = useState([
            { id: 1, message: 'New asset "Laptop-001" registered.', read: false, time: '2 min ago' },
            { id: 2, message: 'Technician "Kamal" completed Job #123.', read: false, time: '1 hour ago' },
            { id: 3, message: 'Low stock for "Printer Toner HP".', read: true, time: '3 hours ago' },
            { id: 4, message: 'Maintenance scheduled for "Server-Alpha".', read: false, time: 'Yesterday' },
        ]);
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const notificationsRef = useRef(null);

    const handleNotificationClick = (id) => {
        setNotifications(prevNotifications => 
            prevNotifications.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const toggleNotificationsDropdown = () => {
        setShowNotificationsDropdown(prev => !prev);
    };
  return (
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
            <div className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-4 origin-top-right animate-fade-in-down z-20"> 
                <h3 className="font-bold text-lg text-blue-900 mb-3 border-b pb-2 border-gray-200">Notifications</h3>
                {unreadNotificationsCount === 0 && notifications.length === 0 && (
                    <p className="text-gray-500 text-sm py-4 text-center">No new notifications.</p>
                )}
                {notifications.length > 0 ? (
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
                                    <p className={`text-sm ${n.read ? 'text-gray-500' : 'text-blue-900'}`}>{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-sm py-4 text-center">No notifications yet.</p>
                )}
                <div className="border-t border-gray-200 pt-3 mt-4 text-center">
                    <Link to="/notifications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All Notifications</Link>
                </div>
            </div>
        )}
    </div>
)
}

export default NotificationPage