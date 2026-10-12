import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Shield } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Shield className="w-10 h-10 text-primary-600" />
      </div>
      <h1 className="font-display font-bold text-6xl text-secondary-900 mb-2">404</h1>
      <h2 className="font-display font-semibold text-xl text-secondary-700 mb-3">
        Page not found
      </h2>
      <p className="text-secondary-500 mb-6">
        The page you're looking for doesn't exist. It may have been moved or deleted.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to Dashboard
        </Link>
        <Link
          to="/incidents"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-secondary-300 hover:bg-secondary-50 text-secondary-700 font-medium rounded-lg transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Incidents
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;