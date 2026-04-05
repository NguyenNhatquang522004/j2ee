import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children, permission }) {
    const { user, isManagement, hasPermission } = useAuth();
    const { pathname } = useLocation();

    if (!user) return <Navigate to="/login" replace />;
    if (!isManagement) return <Navigate to="/" replace />;
    
    // Check specific permission if required
    if (permission && !hasPermission(permission)) {
        // Avoid infinite loop if failing at /admin
        if (pathname === '/admin') return <Navigate to="/" replace />;
        return <Navigate to="/admin" replace />;
    }


    // Enforce 2FA for admins if required but not enabled
    // EXCEPTION: Allow access to /admin/settings so they can actually set it up
    if (user.isTwoFactorEnforced && !user.isTwoFactorEnabled && pathname !== '/admin/settings') {
        return <Navigate to="/admin/settings?setup2fa=true" replace />;
    }

    return children;
}
