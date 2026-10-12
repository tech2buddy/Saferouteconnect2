import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Button from '../common/Button';
import { Bell, Mail, MapPin, Globe, Save, Loader2 } from 'lucide-react';
import { getUserPreferences, saveUserPreferences } from '../../services/preferencesStorage';
import toast from 'react-hot-toast';

const SA_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 'ss', name: 'siSwati' },
  { code: 've', name: 'Tshivenda' },
  { code: 'nr', name: 'isiNdebele' },
  { code: 'nso', name: 'Sepedi' },
];

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    alertRadius: '5',
    language: 'en',
  });

  // Load preferences on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prefs = await getUserPreferences();
        setSettings({
          emailAlerts: prefs.email_alerts ?? true,
          smsAlerts: prefs.sms_alerts ?? false,
          pushAlerts: prefs.push_alerts ?? true,
          alertRadius: String(prefs.alert_radius ?? 5),
          language: prefs.language ?? 'en',
        });
      } catch (err) {
        console.error('Failed to load preferences:', err);
        toast.error('Failed to load your preferences');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveUserPreferences(settings);
      toast.success('Settings saved!');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Settings" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">
                Settings
              </h1>
              <p className="text-secondary-500">Manage your preferences and notifications.</p>
            </div>

            {loading ? (
              <div className="card flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-secondary-500">Loading your settings...</span>
              </div>
            ) : (
              <>
                {/* Notifications */}
                <div className="card mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Bell className="w-5 h-5 text-primary-600" />
                    <h3 className="font-display font-semibold text-secondary-900">Notifications</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'emailAlerts', icon: Mail, label: 'Email Alerts', desc: 'Receive alerts via email' },
                      { key: 'smsAlerts', icon: Mail, label: 'SMS Alerts', desc: 'Receive alerts via SMS' },
                      { key: 'pushAlerts', icon: Bell, label: 'Push Notifications', desc: 'Get notified in the app' },
                    ].map(({ key, icon: Icon, label, desc }) => (
                      <label key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-secondary-50 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-900">{label}</p>
                            <p className="text-xs text-secondary-500">{desc}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleChange(key, e.target.checked)}
                          className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Alert radius */}
                <div className="card mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <h3 className="font-display font-semibold text-secondary-900">Alert Radius</h3>
                  </div>
                  <label className="block text-sm text-secondary-600 mb-2">
                    Receive alerts within this radius:
                  </label>
                  <select
                    value={settings.alertRadius}
                    onChange={(e) => handleChange('alertRadius', e.target.value)}
                    className="input-field"
                  >
                    <option value="1">1 km</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="25">25 km</option>
                    <option value="50">50 km</option>
                  </select>
                </div>

                {/* Language */}
                <div className="card mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-primary-600" />
                    <h3 className="font-display font-semibold text-secondary-900">Language</h3>
                  </div>
                  <label className="block text-sm text-secondary-600 mb-2">
                    Choose your preferred language:
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="input-field"
                  >
                    {SA_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-secondary-400 mt-2">
                    All 11 official South African languages included.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  icon={Save}
                  loading={saving}
                  onClick={handleSave}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Settings;