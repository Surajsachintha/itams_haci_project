import React, { useEffect, useState } from 'react';
import { getUserRole, ACCESS_TOKEN_KEY } from '../../utils/authUtils';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userRole = getUserRole(ACCESS_TOKEN_KEY);

        if (!userRole) {
            window.location.href = '/login';
            return;
        }

        if (allowedRoles.includes(userRole)) {
            setIsAuthorized(true);
        } else {
            console.warn(`Access Denied: Role ${userRole} not allowed.`);
            window.location.href = '/dashboard';
        }

        setIsLoading(false);
    }, [allowedRoles]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 text-xl text-blue-900">
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking Permissions...
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default ProtectedRoute;