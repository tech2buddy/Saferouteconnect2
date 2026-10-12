import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import BackToLanding from '../common/BackToLanding';
import {
  Mail, Lock, Shield, Eye, EyeOff, ArrowRight, UserCog, KeyRound, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const REMEMBERED_EMAIL_KEY = 'saferoute_remembered_email';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  // Forgot password modal state
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail && savedEmail.trim()) {
        setFormData({
          email: savedEmail,
          password: '',
          rememberMe: true,
        });
      }
    } catch {
      setFormData({ email: '', password: '', rememberMe: false });
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);

      if (formData.rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, formData.email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ---------- Forgot Password ----------
  const openForgotModal = () => {
    setForgotEmail(formData.email || '');
    setForgotSent(false);
    setForgotModal(true);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email');
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setForgotSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl">SafeRoute Connect</h1>
              <p className="text-primary-100">Community Safety Reporting System</p>
            </div>
          </div>

          <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
            Working together for
            <br />
            <span className="text-primary-200">safer communities.</span>
          </h2>

          <p className="text-primary-100 text-lg mb-8 max-w-md">
            Report incidents, get alerts, and access safer routes in your area.
          </p>

          <div className="space-y-4">
            {[
              'Real-time incident reporting',
              'Safety alerts for your area',
              'Safer route recommendations',
              'Community-driven safety',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-400/30 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
                <span className="text-primary-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <BackToLanding />
          </div>

          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-secondary-900">
                SafeRoute Connect
              </h1>
              <p className="text-xs text-secondary-500">Community Safety System</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Welcome back!
            </h2>
            <p className="text-secondary-500">
              Sign in to continue to SafeRoute Connect.
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email or Phone Number"
              name="email"
              type="text"
              icon={Mail}
              placeholder="Enter your email or phone number"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="off"
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={openForgotModal}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              SIGN IN
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-secondary-200">
            <Link
              to="/staff-login"
              className="flex items-center justify-center gap-2 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group"
            >
              <UserCog className="w-4 h-4 text-secondary-500 group-hover:text-primary-600" />
              <span className="text-sm font-medium text-secondary-600 group-hover:text-primary-600">
                Staff & Administrator Portal
              </span>
              <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-secondary-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModal}
        onClose={() => setForgotModal(false)}
        title="Reset Your Password"
        size="sm"
      >
        {!forgotSent ? (
          <form onSubmit={handleForgotSubmit}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  Forgot your password?
                </p>
                <p className="text-xs text-secondary-500">
                  We'll send you a reset link
                </p>
              </div>
            </div>

            <p className="text-sm text-secondary-600 mb-4">
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </p>

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <div className="flex gap-3 mt-5">
              <Button
                type="submit"
                variant="primary"
                loading={forgotLoading}
                className="flex-1"
              >
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setForgotModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-secondary-900 mb-2">
              Check your email
            </h3>
            <p className="text-sm text-secondary-600 mb-4">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-secondary-900 mb-6 break-all">
              {forgotEmail}
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 mb-4 text-left">
              <p className="text-xs text-primary-700">
                📧 Click the link in the email to set a new password.
                Check your spam folder if you don't see it.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setForgotModal(false)}
              className="w-full"
            >
              Got it
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Login;