import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import BackToLanding from '../common/BackToLanding';
import { Mail, Lock, Shield, Eye, EyeOff, ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffLogin = () => {
  const navigate = useNavigate();
  const { signInStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Staff email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signInStaff(formData.email, formData.password);
      toast.success('Welcome, staff member!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Dark branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-800 via-secondary-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/50">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl">Staff Portal</h1>
              <p className="text-secondary-400">SafeRoute Connect — Restricted Access</p>
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold mb-6 leading-tight">
            Administrator and
            <br />
            <span className="text-primary-400">Coordinator Access</span>
          </h2>

          <p className="text-secondary-300 text-lg mb-8 max-w-md">
            This portal is reserved for authorised staff members only.
            All actions are logged for accountability.
          </p>

          <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl max-w-md">
            <AlertTriangle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-primary-200 mb-1">
                Authorised Access Only
              </p>
              <p className="text-xs text-secondary-400">
                Unauthorised access attempts are recorded. Contact system
                administrators if you need access.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Staff Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-secondary-50">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <BackToLanding />
          </div>

          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-secondary-900 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-secondary-900">
                Staff Portal
              </h1>
              <p className="text-xs text-secondary-500">SafeRoute Connect</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-900 text-primary-400 rounded-full text-xs font-medium mb-4">
              <Shield className="w-3 h-3" />
              RESTRICTED ACCESS
            </div>
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Staff Sign In
            </h2>
            <p className="text-secondary-500">
              Enter your staff credentials to continue.
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Staff Email"
              name="email"
              type="email"
              icon={Mail}
              placeholder="Enter your staff email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="off"
            />

            <div className="relative">
              <Input
                label="Staff Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your staff password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              icon={Shield}
            >
              SIGN IN TO STAFF PORTAL
            </Button>
          </form>

          {/* Info note (no credentials) */}
          <div className="mt-6 p-4 bg-secondary-100 border border-secondary-200 rounded-xl">
            <p className="text-xs text-secondary-600 leading-relaxed">
              <strong className="text-secondary-700">🔒 Staff Access:</strong>{' '}
              This portal is for administrators and community coordinators.
              If you don't have staff credentials, contact your system
              administrator.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-secondary-200">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Resident Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;