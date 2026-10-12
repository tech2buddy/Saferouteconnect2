import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import StatCard from './StatCard';
import HeatMap from './HeatMap';
import IncidentChart from './IncidentChart';
import RecentIncidents from './RecentIncidents';
import { getIncidents, getIncidentStats } from '../../services/incidentStorage';
import { Shield, FileText, Clock, CheckCircle, Bell, Map, Route, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [statsData, setStatsData] = useState({
    total: 0, newThisWeek: 0, underReview: 0, resolved: 0, reported: 0, actionTaken: 0,
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'User';

  useEffect(() => {
    const load = async () => {

      const incidentsData = await getIncidents();
      setIncidents(incidentsData);
      const stats = await getIncidentStats();
      setStatsData(stats);

    };
    load();
  }, []);

  const stats = [
    { title: 'Total Incidents', value: statsData.total, icon: Shield, trend: '+12%', trendUp: true, color: 'primary', subtitle: 'vs last week' },
    { title: 'New Reports', value: statsData.reported, icon: FileText, trend: '+20%', trendUp: true, color: 'warning', subtitle: 'vs last week' },
    { title: 'Under Review', value: statsData.underReview, icon: Clock, trend: 'same', trendUp: null, color: 'info', subtitle: 'as last week' },
    { title: 'Resolved', value: statsData.resolved, icon: CheckCircle, trend: '+18%', trendUp: true, color: 'success', subtitle: 'vs last week' },
  ];

  const quickActions = [
    { icon: AlertTriangle, label: 'Report Incident', color: 'bg-primary-600', path: '/report-incident' },
    { icon: Bell, label: 'Alerts', color: 'bg-warning-500', path: '/alerts' },
    { icon: Map, label: 'Map', color: 'bg-info-500', path: '/safe-route' },
    { icon: Route, label: 'My Routes', color: 'bg-purple-600', path: '/safe-route' },
  ];

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Dashboard" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-secondary-900 mb-1">
              Welcome back, {userName}!
            </h1>
            <p className="text-secondary-500">Here's your community safety overview.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <HeatMap />
            <IncidentChart />
          </div>

          <RecentIncidents incidents={incidents.slice(0, 5)} />

          <div className="mt-6">
            <h3 className="font-display font-semibold text-secondary-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => navigate(action.path)}
                  className="card flex items-center gap-3 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-secondary-700 text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-1">
                  Together, we can build a safer community.
                </h3>
                <p className="text-primary-100 text-sm">
                  Stay alert, report incidents, and look out for one another.
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;