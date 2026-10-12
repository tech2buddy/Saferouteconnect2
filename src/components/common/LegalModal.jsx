import React from 'react';
import Modal from './Modal';
import { FileText, Shield, Lock } from 'lucide-react';

// ============================================================
// Terms of Service Content
// ============================================================
const TermsContent = () => (
  <div className="prose prose-sm max-w-none text-secondary-700">
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-secondary-100">
      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
        <FileText className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-secondary-900 mb-0">
          Terms of Service
        </h3>
        <p className="text-xs text-secondary-500 mb-0">
          Last updated: 22 September 2026
        </p>
      </div>
    </div>

    <p className="text-sm mb-4">
      Welcome to SafeRoute Connect. By accessing or using our Community Safety
      Reporting System, you agree to be bound by these Terms of Service.
      Please read them carefully.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      1. Acceptance of Terms
    </h4>
    <p className="text-sm mb-4">
      By creating an account and using SafeRoute Connect, you confirm that you
      are at least 18 years old and agree to comply with all applicable laws
      and regulations of the Republic of South Africa.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      2. Community Guidelines
    </h4>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>You will only report incidents that are truthful and accurate.</li>
      <li>You will not use this platform to harass, defame, or harm others.</li>
      <li>You will respect the privacy of individuals involved in incidents.</li>
      <li>You will not share false information or spam the platform.</li>
      <li>You understand that reporting is a civic duty, not a weapon.</li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      3. User Responsibilities
    </h4>
    <p className="text-sm mb-4">
      You are responsible for maintaining the confidentiality of your account
      credentials. You agree to notify us immediately of any unauthorized use
      of your account. You are liable for all activities that occur under your
      account.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      4. Incident Reports
    </h4>
    <p className="text-sm mb-4">
      SafeRoute Connect is a reporting platform. We do not guarantee that
      reported incidents will lead to action by law enforcement. All reports
      are shared with community coordinators and relevant authorities. False
      reports may result in account suspension.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      5. Data Accuracy
    </h4>
    <p className="text-sm mb-4">
      While we strive for accuracy, SafeRoute Connect is not liable for
      decisions made based on information displayed on this platform. Always
      exercise personal judgment and prioritize your safety.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      6. Account Termination
    </h4>
    <p className="text-sm mb-4">
      We reserve the right to suspend or terminate accounts that violate these
      terms, misuse the platform, or engage in harmful behavior.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      7. Changes to Terms
    </h4>
    <p className="text-sm mb-4">
      We may update these Terms of Service from time to time. Continued use of
      the platform after changes are posted constitutes your acceptance of the
      revised terms.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      8. Contact
    </h4>
    <p className="text-sm mb-4">
      For questions about these terms, contact us at{' '}
      <span className="text-primary-600 font-medium">
        legal@saferoute.co.za
      </span>
    </p>

    <div className="mt-6 p-3 bg-secondary-50 rounded-lg text-xs text-secondary-500">
      SafeRoute Connect is a community-driven platform developed for the
      Sol Plaatje University Community Safety Project.
    </div>
  </div>
);

// ============================================================
// Privacy Policy Content
// ============================================================
const PrivacyContent = () => (
  <div className="prose prose-sm max-w-none text-secondary-700">
    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-secondary-100">
      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
        <Shield className="w-6 h-6 text-primary-600" />
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-secondary-900 mb-0">
          Privacy Policy
        </h3>
        <p className="text-xs text-secondary-500 mb-0">
          Last updated: 22 September 2026
        </p>
      </div>
    </div>

    <p className="text-sm mb-4">
      At SafeRoute Connect, your privacy is important to us. This Privacy
      Policy explains what information we collect, how we use it, and how we
      protect it.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      1. Information We Collect
    </h4>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>
        <strong>Personal Information:</strong> Full name, email address, phone
        number, and residential area.
      </li>
      <li>
        <strong>Account Data:</strong> Encrypted password and account activity.
      </li>
      <li>
        <strong>Incident Reports:</strong> Description, location, time, type,
        and optional photos of reported incidents.
      </li>
      <li>
        <strong>Usage Data:</strong> Pages visited, features used, and general
        app interactions.
      </li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      2. How We Use Your Information
    </h4>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>To provide and maintain the SafeRoute Connect service</li>
      <li>To alert you of safety incidents in your area</li>
      <li>To help community coordinators respond to reports</li>
      <li>To improve our platform based on user feedback</li>
      <li>To communicate important updates about your account</li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      3. Anonymous Reporting
    </h4>
    <p className="text-sm mb-4">
      When you choose to report an incident anonymously, your personal
      identity is not shown to other community members or the public. However,
      administrators may still access your account information for verification
      purposes.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      4. Data Sharing
    </h4>
    <p className="text-sm mb-4">
      We do <strong>not</strong> sell your personal data. We may share
      incident data with:
    </p>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>Community safety coordinators</li>
      <li>Relevant law enforcement when required by law</li>
      <li>Service providers who help us run the platform</li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      5. Data Security
    </h4>
    <p className="text-sm mb-4">
      We use industry-standard security measures to protect your data,
      including:
    </p>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>Encrypted passwords (never stored in plain text)</li>
      <li>Secure HTTPS connections</li>
      <li>Regular security audits</li>
      <li>Limited access to personal data</li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      6. Your Rights
    </h4>
    <p className="text-sm mb-4">
      Under the Protection of Personal Information Act (POPIA), you have the
      right to:
    </p>
    <ul className="text-sm mb-4 list-disc pl-5 space-y-1">
      <li>Access your personal information</li>
      <li>Request correction of your data</li>
      <li>Request deletion of your account</li>
      <li>Object to processing of your data</li>
      <li>Lodge a complaint with the Information Regulator</li>
    </ul>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      7. Location Data
    </h4>
    <p className="text-sm mb-4">
      SafeRoute Connect uses location data to show nearby incidents and
      safer routes. Photo location data is automatically removed for your
      privacy before upload.
    </p>

    <h4 className="font-semibold text-secondary-900 mt-6 mb-2 text-sm">
      8. Contact Us
    </h4>
    <p className="text-sm mb-4">
      For privacy questions or data requests, contact us at{' '}
      <span className="text-primary-600 font-medium">
        privacy@saferoute.co.za
      </span>
    </p>

    <div className="mt-6 p-3 bg-primary-50 rounded-lg flex items-start gap-2">
      <Lock className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-primary-700 mb-0">
        Your privacy matters. We are committed to protecting your personal
        information and complying with POPIA.
      </p>
    </div>
  </div>
);

// ============================================================
// Main LegalModal Component
// ============================================================
const LegalModal = ({ isOpen, onClose, type }) => {
  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
    </Modal>
  );
};

export default LegalModal;