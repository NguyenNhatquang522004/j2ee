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
    
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = async (credentials) => {
        const { data } = await authService.login(credentials);
        if (data.requiresTwoFactor) return data;
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
        if (data.accessToken) {
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data));
            setUser(data);
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
    const isStaff = user?.role === 'ROLE_STAFF' || user?.role === 'STAFF';
    const isManagement = isAdmin || isStaff;

    const hasPermission = (p) => {
        if (isAdmin) return true;
        if (!user?.permissions || !Array.isArray(user.permissions)) return false;

        const check = (perm) => {
            if (user.permissions.includes(perm)) return true;
            // If checking for view:X, also accept manage:X
            if (perm.startsWith('view:')) {
                const domain = perm.split(':')[1];
                return user.permissions.includes(`manage:${domain}`);
            }
            return false;
        };

        if (Array.isArray(p)) return p.some(check);
        return check(p);
    };

    const googleLogin = async (userData) => {
        const { data } = await authService.socialLogin({
            email: userData.email,
            provider: 'GOOGLE',
            providerId: userData.sub,
            fullName: userData.name
        });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, googleLogin, register, logout, verify2fa, isAdmin, isStaff, isManagement, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
