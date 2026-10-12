import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import {
  Shield, FileText, Eye, CheckCircle, Users, AlertTriangle,
  BarChart3, ArrowRight,
} from 'lucide-react';
import { getIncidentStats, getIncidents } from '../../services/incidentStorage';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0, reported: 0, underReview: 0, resolved: 0, actionTaken: 0,
  });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const navigate = useNavigate();
  const { user, getAllUsers } = useAuth();

  const role = user?.user_metadata?.role || 'resident';
  const isAdmin = role === 'admin';
  const isCoordinator = role === 'coordinator';

  useEffect(() => {
    const load = async () => {
      const statsData = await getIncidentStats();
      setStats(statsData);

      const incidents = await getIncidents();
      setRecentIncidents(incidents.slice(0, 5));

      const users = await getAllUsers();
      setUserCount(users.length);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statCards = [
    { title: 'Total Incidents', value: stats.total, icon: Shield, color: 'primary' },
    { title: 'New Reports', value: stats.reported, icon: FileText, color: 'warning' },
    { title: 'Under Review', value: stats.underReview, icon: Eye, color: 'info' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'success' },
  ];

  const quickLinks = [
    {
      icon: AlertTriangle,
      label: 'Manage Incidents',
      desc: 'Update incident statuses',
      path: '/admin/incidents',
      color: 'bg-primary-600',
      showTo: ['admin', 'coordinator'],
    },
    {
      icon: Users,
      label: 'Manage Users',
      desc: 'View and edit user accounts',
      path: '/admin/users',
      color: 'bg-info-600',
      showTo: ['admin'],
    },
    {
      icon: BarChart3,
      label: 'Reports & Analytics',
      desc: 'Generate and export reports',
      path: '/admin/reports',
      color: 'bg-warning-600',
      showTo: ['admin', 'coordinator'],
    },
  ].filter((link) => link.showTo.includes(role));

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Admin Dashboard" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-secondary-900">
                Admin Overview
              </h1>
              {isCoordinator && (
                <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                  Coordinator View
                </span>
              )}
              {isAdmin && (
                <span className="px-2 py-0.5 bg-danger-100 text-danger-700 text-xs font-medium rounded-full">
                  Administrator View
                </span>
              )}
            </div>
            <p className="text-secondary-500">
              System-wide view of incidents, users, and activity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, i) => (
              <div key={i} className="card flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                  ${stat.color === 'primary' ? 'bg-primary-100' : ''}
                  ${stat.color === 'warning' ? 'bg-warning-100' : ''}
                  ${stat.color === 'info' ? 'bg-info-100' : ''}
                  ${stat.color === 'success' ? 'bg-green-100' : ''}`}>
                  <stat.icon className={`w-6 h-6
                    ${stat.color === 'primary' ? 'text-primary-600' : ''}
                    ${stat.color === 'warning' ? 'text-warning-600' : ''}
                    ${stat.color === 'info' ? 'text-info-600' : ''}
                    ${stat.color === 'success' ? 'text-green-600' : ''}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-500">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-info-100 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-info-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-secondary-900">{userCount}</p>
              <p className="text-sm text-secondary-500">
                Registered Users
                {isCoordinator && (
                  <span className="ml-2 text-xs text-secondary-400">(view only)</span>
                )}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => navigate('/admin/users')}
                className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                Manage Users <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <h3 className="font-display font-semibold text-secondary-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {quickLinks.map((link, i) => (
              <button key={i} onClick={() => navigate(link.path)}
                className="card text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-3`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-medium text-secondary-900 mb-1">{link.label}</h4>
                <p className="text-sm text-secondary-500">{link.desc}</p>
              </button>
            ))}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-secondary-900">Recent Incidents</h3>
              <button onClick={() => navigate('/admin/incidents')}
                className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {recentIncidents.map((incident) => (
                <div key={incident.id}
                  className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg">
                    {incident.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {incident.title}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">
                      {incident.location}
                    </p>
                  </div>
                  <span className="text-xs text-secondary-400">{incident.time}</span>
                </div>
              ))}
              {recentIncidents.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-secondary-500">No incidents yet</p>
                  <p className="text-xs text-secondary-400 mt-1">
                    Incidents will appear here once reported.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;