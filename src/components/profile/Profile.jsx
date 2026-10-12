import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Button from '../common/Button';
import Input from '../common/Input';
import { User, Mail, Phone, MapPin, Save, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    area: user?.user_metadata?.area || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile updated!');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentRole = user?.user_metadata?.role || 'resident';

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Profile" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">My Profile</h1>
              <p className="text-secondary-500">View and update your account information.</p>
            </div>

            {/* Profile header card */}
            <div className="card mb-6 flex items-center gap-4">
              <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
                <span className="text-primary-700 font-bold text-3xl">
                  {(formData.fullName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-secondary-900">
                  {formData.fullName || 'User'}
                </h2>
                <p className="text-sm text-secondary-500">{formData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full capitalize">
                    <Shield className="w-3 h-3" />
                    {currentRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSubmit} className="card space-y-4">
              <h3 className="font-display font-semibold text-secondary-900 mb-2">Account Details</h3>

              <Input label="Full Name" name="fullName" icon={User}
                value={formData.fullName} onChange={handleChange} required />

              <Input label="Email Address" name="email" icon={Mail}
                value={formData.email} disabled />
              <p className="text-xs text-secondary-400 -mt-2">
                Email cannot be changed. Contact support if needed.
              </p>

              <Input label="Phone Number" name="phone" type="tel" icon={Phone}
                value={formData.phone} onChange={handleChange} />

              <Input label="Residential Area" name="area" icon={MapPin}
                value={formData.area} onChange={handleChange} />

              <div className="pt-4 border-t border-secondary-100">
                <Button type="submit" variant="primary" size="lg" icon={Save} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </form>

            {/* Danger zone */}
            <div className="card mt-6 border-danger-200">
              <h3 className="font-display font-semibold text-danger-700 mb-2">Danger Zone</h3>
              <p className="text-sm text-secondary-500 mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => toast('Account deletion coming soon', { icon: '🚧' })}
                className="px-4 py-2 text-sm font-medium text-danger-600 border border-danger-300 rounded-lg hover:bg-danger-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;