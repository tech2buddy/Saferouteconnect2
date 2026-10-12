import React, { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = ({ onMenuClick, title }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentRole = user?.user_metadata?.role || 'resident';
  const isStaff = user?.user_metadata?.isStaff || false;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/incidents?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary-100 rounded-lg">
            <Menu className="w-5 h-5 text-secondary-600" />
          </button>
          <h1 className="font-display font-semibold text-secondary-900 text-lg">
            {title || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center gap-2 bg-secondary-50 rounded-lg px-3 py-2 w-64"
          >
            <Search className="w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-full"
            />
          </form>

          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 hover:bg-secondary-100 rounded-lg"
          >
            <Bell className="w-5 h-5 text-secondary-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1.5 hover:bg-secondary-100 rounded-lg"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isStaff ? 'bg-secondary-900' : 'bg-primary-100'
              }`}>
                <span className={`font-semibold text-sm ${
                  isStaff ? 'text-primary-400' : 'text-primary-700'
                }`}>
                  {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-secondary-900 leading-tight">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-secondary-500 capitalize">
                  {currentRole}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-secondary-400 hidden md:block" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-dropdown border border-secondary-100 py-1 z-20">
                  <div className="px-4 py-3 border-b border-secondary-100">
                    <p className="text-xs text-secondary-400 uppercase tracking-wide mb-1">Signed in as</p>
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {user?.user_metadata?.full_name}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                    {isStaff && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-secondary-900 text-primary-400 text-xs font-medium rounded-full">
                        {currentRole === 'admin' ? '🛡️ Admin' : '🛡️ Coordinator'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <User className="w-4 h-4" /> Profile
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button
                    onClick={() => { navigate('/help'); setShowDropdown(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50"
                  >
                    <HelpCircle className="w-4 h-4" /> Help & Support
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;