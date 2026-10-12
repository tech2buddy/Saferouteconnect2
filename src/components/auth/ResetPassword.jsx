import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import Button from '../common/Button';
import Input from '../common/Input';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase puts the reset token in the URL hash
    // We need to wait for Supabase to process it
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
        } else {
          // Give Supabase a moment to parse the URL
          setTimeout(async () => {
            const { data: { session: s } } = await supabase.auth.getSession();
            setSessionReady(!!s);
            if (!s) {
              setError('Invalid or expired reset link. Please request a new one.');
            }
          }, 1500);
        }
      } catch (err) {
        setError('Failed to validate reset link');
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      toast.success('Password updated successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Password Reset!
            </h2>
            <p className="text-secondary-600 mb-6">
              Your password has been updated successfully. Redirecting you to login...
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-display font-bold text-xl text-secondary-900">
                SafeRoute Connect
              </h1>
              <p className="text-xs text-secondary-500">
                Community Safety Reporting System
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-primary-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Set New Password
            </h2>
            <p className="text-secondary-500 text-sm">
              Choose a strong password for your account
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter new password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                icon={Lock}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={!sessionReady}
              className="w-full"
            >
              {sessionReady ? 'Reset Password' : 'Validating link...'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-secondary-500">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;