import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import {
  Bell, AlertTriangle, Check, MapPin, Clock, CheckCircle, Shield,
  RefreshCw, Loader2, ChevronRight,
} from 'lucide-react';
import {
  getUserAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '../../services/alertService';
import toast from 'react-hot-toast';

const severityConfig = {
  high: { variant: 'danger', label: 'High', icon: AlertTriangle },
  medium: { variant: 'warning', label: 'Medium', icon: Bell },
  low: { variant: 'info', label: 'Low', icon: Shield },
};

const Alerts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getUserAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Manual "Mark as read" button — does NOT open the incident
  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    const success = await markAlertAsRead(id);
    if (success) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
      toast.success('Alert marked as read');
    } else {
      toast.error('Failed to update alert');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAlertsAsRead();
    if (success) {
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      toast.success('All alerts marked as read');
    } else {
      toast.error('Failed to update alerts');
    }
  };

  // ✅ Opening an alert auto-marks it as read, then navigates
  const handleOpenIncident = async (alert) => {
    if (!alert.incidentId) {
      toast.error('Incident no longer available');
      return;
    }

    if (!alert.read) {
      const success = await markAlertAsRead(alert.id);
      if (success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, read: true } : a))
        );
      }
    }

    navigate(`/incidents/${alert.incidentId}`);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.read;
    if (filter === 'read') return a.read;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Alerts" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">
                  Safety Alerts
                </h1>
                <p className="text-secondary-500">
                  {loading
                    ? 'Loading...'
                    : unreadCount > 0
                    ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up!'}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={loadAlerts}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-secondary-300 hover:bg-secondary-50 rounded-lg text-sm font-medium text-secondary-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark all as read ({unreadCount})
                  </button>
                )}
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {['all', 'unread', 'read'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
                    ${
                      filter === tab
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
                    }`}
                >
                  {tab}
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-danger-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Alerts list */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 mx-auto animate-spin" />
                <p className="text-secondary-500 mt-3">Loading alerts...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAlerts.map((alert) => {
                  const severity =
                    severityConfig[alert.severity] || severityConfig.low;
                  const SeverityIcon = severity.icon;

                  return (
                    <div
                      key={alert.id}
                      onClick={() => handleOpenIncident(alert)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpenIncident(alert);
                        }
                      }}
                      className={`card flex items-start gap-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 ${
                        !alert.read
                          ? 'border-l-4 border-l-primary-500 bg-primary-50/30'
                          : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${alert.severity === 'high' ? 'bg-danger-100' : ''}
                          ${alert.severity === 'medium' ? 'bg-warning-100' : ''}
                          ${alert.severity === 'low' ? 'bg-info-100' : ''}`}
                      >
                        <SeverityIcon
                          className={`w-5 h-5
                            ${alert.severity === 'high' ? 'text-danger-600' : ''}
                            ${alert.severity === 'medium' ? 'text-warning-600' : ''}
                            ${alert.severity === 'low' ? 'text-info-600' : ''}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className={`text-sm ${
                              !alert.read ? 'font-semibold' : 'font-medium'
                            } text-secondary-900`}
                          >
                            {alert.title}
                          </h3>
                          <Badge variant={severity.variant} size="sm">
                            {severity.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.area}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {alert.time}
                          </span>
                        </div>
                        {!alert.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(e, alert.id)}
                            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            <Check className="w-3 h-3" /> Mark as read
                          </button>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary-400 flex-shrink-0 self-center" />
                    </div>
                  );
                })}

                {filteredAlerts.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">
                      {filter === 'unread'
                        ? 'No unread alerts'
                        : 'No alerts yet'}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">
                      Alerts will appear here when incidents are reported.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Alerts;