import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import Button from '../common/Button';
import BackToLanding from '../common/BackToLanding';
import {
  Shield, Mail, CheckCircle2, RotateCcw, ArrowRight, Clock, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PENDING_KEY = 'saferoute_pending_verification';

const VerifyIdentity = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PENDING_KEY);
      if (stored) {
        setPending(JSON.parse(stored));
      } else {
        navigate('/register');
      }
    } catch {
      navigate('/register');
    }
  }, [navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!pending) return;
    setVerifying(true);
    setError('');

    try {
      // Try to sign in — if email is confirmed, this works
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: pending.email,
        password: pending.password || '',
      });

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setError(
            'Your email is not confirmed yet. Please check your inbox and click the verification link we sent you.'
          );
          toast.error('Email not confirmed yet');
        } else if (
          signInError.message.includes('Invalid login') ||
          signInError.message.includes('Invalid credentials')
        ) {
          // Account may already be verified from a previous session
          setError(
            'Your account may already be verified. Please go to the login page and sign in.'
          );
          toast.success('Try signing in now!');
          setTimeout(() => navigate('/login'), 2500);
        } else {
          setError(signInError.message);
        }
        return;
      }

      // Success — user is verified and logged in
      localStorage.removeItem(PENDING_KEY);
      toast.success('Email verified! Welcome to SafeRoute Connect.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!pending?.email) return;
    setResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pending.email,
      });

      if (error) throw error;

      setCountdown(30);
      toast.success(`Verification email resent to ${pending.email}`);
    } catch (err) {
      console.error('Resend error:', err);
      toast.error('Could not resend email. Try again in a moment.');
    } finally {
      setResending(false);
    }
  };

  if (!pending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <BackToLanding />
        </div>

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

        {/* Card */}
        <div className="card">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center border-4 border-white">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-secondary-900 mb-2">
              Check your email
            </h2>
            <p className="text-secondary-500 text-sm leading-relaxed">
              We've sent a verification link to
            </p>
            <p className="font-semibold text-secondary-900 mt-1 break-all">
              {pending.email}
            </p>
          </div>

          {/* Info box */}
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-primary-700 leading-relaxed">
              <strong>📧 What to do next:</strong> Check your email inbox
              (and spam folder). Click the verification link. Then come back
              here and click the button below.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-warning-700">{error}</p>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3 mb-6">
            {[
              { icon: Mail, text: 'Check your email inbox', done: true },
              { icon: CheckCircle2, text: 'Click the verification link', done: false },
              { icon: Shield, text: 'Access your dashboard', done: false },
            ].map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  step.done
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-secondary-50 border border-secondary-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    step.done ? 'bg-primary-600' : 'bg-secondary-300'
                  }`}
                >
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`text-sm ${
                    step.done
                      ? 'font-medium text-primary-800'
                      : 'text-secondary-600'
                  }`}
                >
                  {step.text}
                </span>
                {step.done && (
                  <CheckCircle2 className="w-4 h-4 text-primary-600 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* Verify button */}
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            loading={verifying}
            onClick={handleVerify}
            className="w-full mb-3"
          >
            I've Verified My Email
          </Button>

          {/* Resend */}
          <div className="text-center">
            <span className="text-xs text-secondary-500">
              Didn't receive the email?{' '}
            </span>
            <button
              onClick={handleResend}
              disabled={resending || countdown > 0}
              className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                resending || countdown > 0
                  ? 'text-secondary-400 cursor-not-allowed'
                  : 'text-primary-600 hover:text-primary-700 hover:underline'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              {resending
                ? 'Sending...'
                : countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend email'}
            </button>
          </div>
        </div>

        {/* Footer help */}
        <div className="mt-6 text-center">
          <p className="text-xs text-secondary-400">
            Wrong email?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:underline"
            >
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;