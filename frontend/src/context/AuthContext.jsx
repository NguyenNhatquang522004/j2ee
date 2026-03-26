import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    });

    const login = async (credentials) => {
        const { data } = await authService.login(credentials);
        if (data.requiresTwoFactor) {
            return data; // Return data so Login.jsx knows it needs 2FA
        }
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const verify2fa = async (username, code) => {
        const { data } = await authService.verify2fa({ username, code });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const { data } = await authService.register(formData);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, verify2fa, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
