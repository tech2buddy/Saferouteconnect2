import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const { user, loading } = useAuth();

  // If already logged in, skip the landing page
  if (!loading && user) {
    return <Navigate to={user.user_metadata?.isStaff ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-primary-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-400 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating animated shields */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Shield className="absolute top-[15%] left-[8%] w-16 h-16 text-white/10 animate-float" style={{ animationDelay: '0s' }} />
        <Shield className="absolute top-[25%] right-[12%] w-20 h-20 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <Shield className="absolute bottom-[20%] left-[15%] w-12 h-12 text-white/10 animate-float" style={{ animationDelay: '2s' }} />
        <Shield className="absolute bottom-[30%] right-[20%] w-14 h-14 text-white/10 animate-float" style={{ animationDelay: '3s' }} />
        <Shield className="absolute top-[60%] left-[45%] w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top nav */}
        <header className="px-6 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">
                SafeRoute Connect
              </h1>
              <p className="text-primary-200 text-xs">Community Safety System</p>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8">
          <div className="max-w-6xl w-full">
            {/* BIG Welcome Hero */}
            <div className="text-center mb-14">
              <h1 className="font-display font-bold text-white leading-[1.05] tracking-tight mb-6 
                             text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Welcome to
                <br />
                <span className="text-primary-200">SafeRoute Connect</span>
              </h1>

              <p className="font-display text-primary-100 text-lg md:text-xl lg:text-2xl font-medium mb-4">
                Together, we build safer communities.
              </p>

              <p className="text-primary-100/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                Report incidents, receive alerts, and access safer routes in your area.
                Choose your portal below to get started.
              </p>
            </div>

            {/* Portal Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Resident Portal */}
              <Link
                to="/login"
                className="group relative bg-white/95 backdrop-blur-md rounded-2xl p-10 border-2 border-white/30 
                           hover:border-white hover:bg-white transition-all duration-300 hover:-translate-y-2 
                           hover:shadow-2xl shadow-xl"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="w-20 h-20 bg-primary-100 group-hover:bg-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-colors">
                  <Users className="w-10 h-10 text-primary-600 group-hover:text-white transition-colors" />
                </div>

                <h2 className="font-display font-bold text-3xl text-secondary-900 mb-3 text-center">
                  Resident
                </h2>
                <p className="text-secondary-600 mb-8 text-sm leading-relaxed text-center">
                  Access your dashboard, report incidents, receive safety alerts, and plan safer routes in your community.
                </p>

                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 group-hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    Login / Register
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Staff Portal */}
              <Link
                to="/staff-login"
                className="group relative bg-secondary-900/95 backdrop-blur-md rounded-2xl p-10 border-2 border-secondary-700 
                           hover:border-primary-500 transition-all duration-300 hover:-translate-y-2 
                           hover:shadow-2xl shadow-xl"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-primary-400 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="w-20 h-20 bg-primary-600/20 group-hover:bg-primary-600 rounded-2xl flex items-center justify-center mb-6 mx-auto transition-colors">
                  <Shield className="w-10 h-10 text-primary-400 group-hover:text-white transition-colors" />
                </div>

                <h2 className="font-display font-bold text-3xl text-white mb-3 text-center">
                  Staff Portal
                </h2>
                <p className="text-secondary-400 mb-8 text-sm leading-relaxed text-center">
                  Administrators and community coordinators access incident management, user controls, and analytics.
                </p>

                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-lg transition-colors">
                    Staff Login
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 lg:px-12 py-6 text-center">
          <p className="text-xs text-primary-200/70">
            © 2026 SafeRoute Connect · Community Safety Reporting System
          </p>
          <p className="text-xs text-primary-200/50 mt-1">
            Sol Plaatje University · NPRT630 Project
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;