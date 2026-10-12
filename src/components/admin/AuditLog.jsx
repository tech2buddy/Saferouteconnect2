import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import {
  Activity, Search, LogIn, LogOut, Edit, UserCog, Ban, FileText, RefreshCw, Loader2,
} from 'lucide-react';
import { getAuditLog } from '../../services/auditService';

const entryConfig = {
  login: { icon: LogIn, color: 'info', label: 'Login' },
  logout: { icon: LogOut, color: 'secondary', label: 'Logout' },
  incident_status: { icon: Edit, color: 'warning', label: 'Incident Updated' },
  user_role_change: { icon: UserCog, color: 'primary', label: 'Role Changed' },
  user_status_change: { icon: Ban, color: 'danger', label: 'User Status' },
  incident_created: { icon: FileText, color: 'info', label: 'Incident Created' },
  user_deleted: { icon: Ban, color: 'danger', label: 'User Deleted' },
  user_created: { icon: FileText, color: 'primary', label: 'User Created' },
};

const formatTime = (isoString) => {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hours ago`;
  if (diffMin < 10080) return `${Math.floor(diffMin / 1440)} days ago`;

  return d.toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const formatFullTime = (isoString) => {
  return new Date(isoString).toLocaleString('en-ZA', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const AuditLog = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [log, setLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadLog = async () => {
    setLoading(true);
    try {
      const entries = await getAuditLog();
      setLog(entries);
    } catch (err) {
      console.error('Failed to load audit log:', err);
      setLog([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLog();
  }, []);

  const filtered = log.filter((entry) => {
    const matchSearch =
      (entry.actorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.details || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || entry.type === typeFilter;
    return matchSearch && matchType;
  });

  const counts = {
    total: log.length,
    logins: log.filter((e) => e.type === 'login').length,
    incidentUpdates: log.filter((e) => e.type === 'incident_status').length,
    userChanges: log.filter(
      (e) => e.type === 'user_role_change' || e.type === 'user_status_change'
    ).length,
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Activity Log" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-secondary-900">
                    Activity Log
                  </h1>
                  <p className="text-sm text-secondary-500">
                    Full audit trail of all staff actions in the system.
                  </p>
                </div>
              </div>
              <button
                onClick={loadLog}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-300 hover:bg-secondary-50 rounded-lg text-sm font-medium text-secondary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total Activities', value: counts.total, color: 'primary' },
                { label: 'Staff Logins', value: counts.logins, color: 'info' },
                { label: 'Incident Updates', value: counts.incidentUpdates, color: 'warning' },
                { label: 'User Changes', value: counts.userChanges, color: 'danger' },
              ].map((stat, i) => (
                <div key={i} className="card text-center p-4">
                  <p className={`text-2xl font-bold ${
                    stat.color === 'primary' ? 'text-primary-600' :
                    stat.color === 'info' ? 'text-info-600' :
                    stat.color === 'warning' ? 'text-warning-600' :
                    'text-danger-600'
                  }`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-secondary-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search by staff name, action, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field sm:w-56"
              >
                <option value="all">All Activities</option>
                <option value="login">Staff Logins</option>
                <option value="logout">Staff Logouts</option>
                <option value="incident_status">Incident Updates</option>
                <option value="user_role_change">Role Changes</option>
                <option value="user_status_change">User Suspensions</option>
                <option value="user_deleted">User Deletions</option>
                <option value="user_created">User Creations</option>
              </select>
            </div>

            <div className="card overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-600 mx-auto animate-spin" />
                  <p className="text-secondary-500 mt-3">Loading activity log...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                  <p className="text-secondary-500">
                    {searchQuery || typeFilter !== 'all'
                      ? 'No activity matching your filters'
                      : 'No activity recorded yet'}
                  </p>
                  <p className="text-xs text-secondary-400 mt-2">
                    Staff actions will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-secondary-100">
                  {filtered.map((entry) => {
                    const config = entryConfig[entry.type] || {
                      icon: Activity,
                      color: 'secondary',
                      label: 'Activity',
                    };
                    const Icon = config.icon;

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-4 p-4 hover:bg-secondary-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${config.color === 'primary' ? 'bg-primary-100' : ''}
                          ${config.color === 'info' ? 'bg-info-100' : ''}
                          ${config.color === 'warning' ? 'bg-warning-100' : ''}
                          ${config.color === 'danger' ? 'bg-danger-100' : ''}
                          ${config.color === 'secondary' ? 'bg-secondary-100' : ''}
                        `}>
                          <Icon className={`w-5 h-5
                            ${config.color === 'primary' ? 'text-primary-600' : ''}
                            ${config.color === 'info' ? 'text-info-600' : ''}
                            ${config.color === 'warning' ? 'text-warning-600' : ''}
                            ${config.color === 'danger' ? 'text-danger-600' : ''}
                            ${config.color === 'secondary' ? 'text-secondary-600' : ''}
                          `} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-secondary-900">
                              {entry.actorName || 'System'}
                            </span>
                            <Badge variant={config.color === 'secondary' ? 'default' : config.color} size="sm">
                              {config.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-secondary-700 mb-1">
                            {entry.action}
                          </p>

                          {entry.details && (
                            <p className="text-xs text-secondary-500">
                              {entry.details}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-secondary-400">
                            <span title={formatFullTime(entry.timestamp)}>
                              {formatTime(entry.timestamp)}
                            </span>
                            {entry.actorRole && (
                              <>
                                <span>·</span>
                                <span className="capitalize">{entry.actorRole}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <span className="text-xs text-secondary-400 flex-shrink-0 hidden md:block">
                          {formatFullTime(entry.timestamp)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-xs text-secondary-400 mt-3 text-center">
              💡 The activity log keeps the most recent 500 actions.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AuditLog;