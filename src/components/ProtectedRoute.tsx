import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const auth = useAuth();

    if (!auth) {
        console.error("Auth context is missing! Check if ProtectedRoute is inside AuthProvider.");
        return <div>Authentication Error</div>;
    }

    const { user, loading } = auth;

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if unauthorized
        const defaultRoute = user.role === 'admin' || user.role === 'branch_admin' ? '/admin' : '/telecaller';
        return <Navigate to={defaultRoute} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
