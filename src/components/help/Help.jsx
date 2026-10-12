import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Button from '../common/Button';
import Input from '../common/Input';
import { HelpCircle, ChevronDown, Mail, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const faqs = [
  {
    q: 'How do I report an incident?',
    a: 'Go to the "Report Incident" page in the sidebar, fill in the incident details, add a location, and click Submit Report. Your report will appear in Community Reports immediately.',
  },
  {
    q: 'Are my reports anonymous?',
    a: 'You can choose to report anonymously by checking the "Report Anonymously" box. Your personal information will be hidden from public view, but admins may still see it for verification.',
  },
  {
    q: 'How do alerts work?',
    a: 'Alerts are generated automatically from recent incidents in your area. You can view them on the Alerts page, and customise notification settings in Settings.',
  },
  {
    q: 'What does "Under Review" mean?',
    a: 'Under Review means a community coordinator or administrator is looking into your report. You will see the status update on the incident card.',
  },
     
  {
    q: 'Why do I need to verify my email?',
    a: 'Email verification ensures that only real people can create accounts, which helps prevent spam and fake reports. After registering, check your email inbox for a verification link. Then return to the app and click "I\'ve Verified My Email" to activate your account.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. Passwords are never stored in plain text, and we follow POPIA (Protection of Personal Information Act) guidelines. See our Privacy Policy for details.',
  },
];

const Help = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [message, setMessage] = useState({ subject: '', body: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.subject || !message.body) {
      toast.error('Please fill in both fields');
      return;
    }
    toast.success('Message sent! We will get back to you soon.');
    setMessage({ subject: '', body: '' });
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Help & Support" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">Help & Support</h1>
              <p className="text-secondary-500">Find answers or get in touch with our team.</p>
            </div>

            {/* FAQs */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                <h3 className="font-display font-semibold text-secondary-900">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="divide-y divide-secondary-100">
                {faqs.map((faq, i) => (
                  <div key={i} className="py-2">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 text-left py-2 hover:text-primary-600 transition-colors"
                    >
                      <span className="text-sm font-medium text-secondary-900">{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-secondary-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="pb-3 text-sm text-secondary-600 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact support */}
            <div className="card mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                <h3 className="font-display font-semibold text-secondary-900">
                  Still need help?
                </h3>
              </div>
              <p className="text-sm text-secondary-500 mb-4">
                Send us a message and we'll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Subject"
                  placeholder="What do you need help with?"
                  value={message.subject}
                  onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    value={message.body}
                    onChange={(e) => setMessage({ ...message, body: e.target.value })}
                    rows={5}
                    placeholder="Describe your issue or question..."
                    className="input-field resize-none"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" icon={Send}>
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact info */}
            <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">Contact us directly</h3>
                  <p className="text-sm text-primary-100">
                    support@saferoute.co.za · +27 53 491 0000
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;