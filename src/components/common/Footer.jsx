import React from 'react';
import { Shield } from 'lucide-react';

const Footer = ({ compact = false }) => {
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t border-secondary-200 bg-white px-6 py-3">
        <p className="text-xs text-secondary-400 text-center">
          © {currentYear} SafeRoute Connect · Sol Plaatje University · NPRT630
        </p>
      </footer>
    );
  }

  return (
    <footer className="border-t border-secondary-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-secondary-900">
                SafeRoute Connect
              </span>
            </div>
            <p className="text-xs text-secondary-500 leading-relaxed">
              Community Safety Reporting System — working together for
              safer communities across South Africa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm text-secondary-900 mb-3">
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="/dashboard" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/report-incident" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
                  Report Incident
                </a>
              </li>
              <li>
                <a href="/help" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="/feedback" className="text-xs text-secondary-500 hover:text-primary-600 transition-colors">
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm text-secondary-900 mb-3">
              Contact
            </h4>
            <ul className="space-y-1.5 text-xs text-secondary-500">
              <li>📧 support@saferoute.co.za</li>
              <li>📞 +27 53 491 0000</li>
              <li>📍 Sol Plaatje University, Kimberley</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-secondary-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-secondary-400">
            © {currentYear} SafeRoute Connect. All rights reserved.
          </p>
          <p className="text-xs text-secondary-400">
            NPRT630 Project · Sol Plaatje University
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;