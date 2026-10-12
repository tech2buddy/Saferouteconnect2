import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, Bell, FileText, Users,
  Settings, HelpCircle, LogOut, Shield, X, MessageSquare, Route,
  BarChart3, Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SafetyCard from './SafetyCard';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const role = user?.user_metadata?.role || 'resident';
  const isStaff = user?.user_metadata?.isStaff;
  const isAdmin = role === 'admin';
  const isCoordinator = role === 'coordinator';
  const isStaffMember = isAdmin || isCoordinator;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const residentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/safe-route', icon: Route, label: 'My Routes' },
    { to: '/report-incident', icon: AlertTriangle, label: 'Report Incident' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/incidents', icon: FileText, label: 'Community Reports' },
  ];

  const staffLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/admin/incidents', icon: AlertTriangle, label: 'Incident Management' },
  ];

  const adminOnlyLinks = [
    { to: '/admin/users', icon: Users, label: 'Users Management' },
  ];

  const sharedStaffLinks = [
    { to: '/admin/audit-log', icon: Activity, label: 'Activity Log' },
    { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
  ];

  // Feedback link — only for residents and coordinators
  const feedbackLink = [
    { to: '/feedback', icon: MessageSquare, label: 'Feedback' },
  ];

  // Common links for everyone
  const commonLinks = [
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/help', icon: HelpCircle, label: 'Help & Support' },
  ];

  let links;
  if (isAdmin) {
    // Admin: no Feedback
    links = [...staffLinks, ...adminOnlyLinks, ...sharedStaffLinks, ...commonLinks];
  } else if (isCoordinator) {
    // Coordinator: has Feedback
    links = [...staffLinks, ...sharedStaffLinks, ...feedbackLink, ...commonLinks];
  } else {
    // Resident: has Feedback
    links = [...residentLinks, ...feedbackLink, ...commonLinks];
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-secondary-200 z-50 
          transform transition-transform duration-300 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:z-auto flex flex-col`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-secondary-100">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isStaff ? 'bg-secondary-900' : 'bg-primary-600'
            }`}
          >
            <Shield
              className={`w-6 h-6 ${isStaff ? 'text-primary-400' : 'text-white'}`}
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-secondary-900 text-lg leading-tight">
              SafeRoute
            </h1>
            <p className="text-xs text-secondary-500">Connect</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto lg:hidden p-1 hover:bg-secondary-100 rounded-lg"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>

        {isStaffMember && (
          <div className="px-3 pt-3">
            <div
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isAdmin
                  ? 'bg-danger-50 text-danger-700 border border-danger-200'
                  : 'bg-warning-50 text-warning-700 border border-warning-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              {isAdmin ? 'ADMINISTRATOR' : 'COORDINATOR'}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <SafetyCard />

        <div className="border-t border-secondary-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center ${
                isStaff ? 'bg-secondary-900' : 'bg-primary-100'
              }`}
            >
              <span
                className={`font-semibold text-sm ${
                  isStaff ? 'text-primary-400' : 'text-primary-700'
                }`}
              >
                {user?.user_metadata?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-900 truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-secondary-500 capitalize">
                {role}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;