import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            fetchProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (token) => {
        try {
            // We need to pass token manually here because it might not be in localStorage yet
            // OR if it IS in localStorage, api interceptor handles it. 
            // But fetchProfile takes a token argument? 
            // In useEffect, we get token from localStorage. 
            // api.js reads from localStorage.

            // However, api.js reads 'adminToken'. 
            // So calling api.get('/auth/profile') should work if token is in localStorage.

            const response = await api.get('/auth/profile');

            if (response.data.user.role !== 'admin') {
                throw new Error('Not authorized as admin');
            }

            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('adminToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                if (response.data.user.role !== 'admin') {
                    return { success: false, message: 'Access denied. Admin privileges required.' };
                }

                localStorage.setItem('adminToken', response.data.token);
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
