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

export const getUserRole = (tokenKey) => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;

    const userData = decodeJwt(token);
    return userData ? userData.role : null;
};

export const ACCESS_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;