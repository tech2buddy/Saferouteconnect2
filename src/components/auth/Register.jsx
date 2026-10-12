import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import LegalModal from '../common/LegalModal';
import BackToLanding from '../common/BackToLanding';
import { Mail, Lock, Shield, User, Phone, MapPin, Eye, EyeOff, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PENDING_KEY = 'saferoute_pending_verification';

// ---------- Password strength helper ----------
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 5);

  const levels = {
    0: { label: '', color: '' },
    1: { label: 'Very Weak', color: 'bg-danger-500' },
    2: { label: 'Weak', color: 'bg-danger-500' },
    3: { label: 'Fair', color: 'bg-warning-500' },
    4: { label: 'Good', color: 'bg-info-500' },
    5: { label: 'Strong', color: 'bg-primary-600' },
  };

  return { score, ...levels[score] };
};

const PasswordChecklist = ({ password }) => {
  const checks = [
    { label: 'At least 6 characters', ok: password.length >= 6 },
    { label: 'Contains a number', ok: /[0-9]/.test(password) },
    { label: 'Contains uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', ok: /[a-z]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check, i) => (
        <div
          key={i}
          className={`flex items-center gap-1.5 text-xs ${
            check.ok ? 'text-primary-600' : 'text-secondary-400'
          }`}
        >
          {check.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          <span>{check.label}</span>
        </div>
      ))}
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    area: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [legalModal, setLegalModal] = useState({ open: false, type: 'terms' });

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone) newErrors.phone = 'Phone number is required';

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        phone: formData.phone,
        area: formData.area,
        role: 'resident',
      });

      // Store pending verification info
      localStorage.setItem(
        PENDING_KEY,
        JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          createdAt: new Date().toISOString(),
        })
      );

      toast.success('Account created! Please check your email.');
      navigate('/verify');
    } catch (error) {
      toast.error(error.message || 'Error creating account');
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
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

          <h2 className="font-display text-3xl font-bold mb-6">
            Create your account to get started.
          </h2>

          <div className="space-y-5">
            {[
              { icon: '🛡️', title: 'Report incidents', desc: 'Help keep your community safe by reporting incidents.' },
              { icon: '🔔', title: 'Stay informed', desc: 'Receive alerts and updates about your area.' },
              { icon: '🗺️', title: 'Plan safe routes', desc: 'Explore safe routes and high-risk areas.' },
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-primary-100">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <BackToLanding />
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Create Account
            </h2>
            <p className="text-secondary-500">
              Fill in your details to create your SafeRoute Connect account.
            </p>
            <p className="text-xs text-danger-500 mt-1">* Required</p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Names" name="fullName" icon={User}
              placeholder="Enter your full names" value={formData.fullName}
              onChange={handleChange} error={errors.fullName} required />

            <Input label="Email Address" name="email" type="email" icon={Mail}
              placeholder="Enter your email address" value={formData.email}
              onChange={handleChange} error={errors.email} required />

            <Input label="Phone Number" name="phone" type="tel" icon={Phone}
              placeholder="Enter your phone number" value={formData.phone}
              onChange={handleChange} error={errors.phone} required />

            <div className="relative">
              <Input label="Password" name="password"
                type={showPassword ? 'text' : 'password'} icon={Lock}
                placeholder="Enter your password (min 6 characters)"
                value={formData.password} onChange={handleChange}
                error={errors.password} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= strength.score ? strength.color : 'bg-secondary-200'
                        }`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    strength.score <= 2 ? 'text-danger-600' :
                    strength.score === 3 ? 'text-warning-600' :
                    strength.score === 4 ? 'text-info-600' : 'text-primary-600'
                  }`}>
                    {strength.label}
                  </span>
                  <PasswordChecklist password={formData.password} />
                </div>
              )}
            </div>

            <div className="relative">
              <Input label="Confirm Password" name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'} icon={Lock}
                placeholder="Confirm your password" value={formData.confirmPassword}
                onChange={handleChange} error={errors.confirmPassword} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600">
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Input label="Residential Area (Optional)" name="area" icon={MapPin}
              placeholder="Enter your residential area" value={formData.area}
              onChange={handleChange} />

            <div className="flex items-start gap-2">
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
              <label className="text-sm text-secondary-600">
                I agree to the{' '}
                <button type="button"
                  onClick={() => setLegalModal({ open: true, type: 'terms' })}
                  className="text-primary-600 hover:underline font-medium">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button"
                  onClick={() => setLegalModal({ open: true, type: 'privacy' })}
                  className="text-primary-600 hover:underline font-medium">
                  Privacy Policy
                </button>
                <span className="text-danger-500 ml-1">*</span>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-sm text-danger-600">{errors.agreeTerms}</p>
            )}

            <Button type="submit" variant="primary" size="lg"
              loading={loading} className="w-full">
              CREATE ACCOUNT
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
              Sign In
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-secondary-200">
            <Link to="/staff-login"
              className="flex items-center justify-center gap-2 p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors group">
              <Shield className="w-4 h-4 text-secondary-500 group-hover:text-primary-600" />
              <span className="text-sm font-medium text-secondary-600 group-hover:text-primary-600">
                Staff & Administrator Portal
              </span>
            </Link>
          </div>
        </div>
      </div>

      <LegalModal
        isOpen={legalModal.open}
        onClose={() => setLegalModal({ open: false, type: 'terms' })}
        type={legalModal.type}
      />
    </div>
  );
};

export default Register;
