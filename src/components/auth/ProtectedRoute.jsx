import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 * Props:
 *  - adminOnly: allow only admins and coordinators (staff)
 *  - strictAdmin: allow only admins (NOT coordinators)
 *  - children: the component to render
 */
const ProtectedRoute = ({ children, adminOnly = false, strictAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const role = user?.user_metadata?.role;

  // Strict admin: only admins
  if (strictAdmin && role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Admin-only (staff): admins OR coordinators
  if (adminOnly && !['admin', 'coordinator'].includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;