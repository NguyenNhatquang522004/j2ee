import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }) {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
    const { user, isAdmin } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;

    // Enforce 2FA for admins if required but not enabled
    if (user.isTwoFactorEnforced && !user.isTwoFactorEnabled) {
        return <Navigate to="/admin/settings?setup2fa=true" replace />;
    }

    return children;
}
