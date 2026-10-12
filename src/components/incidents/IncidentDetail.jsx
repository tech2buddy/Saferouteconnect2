import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  ArrowLeft, MapPin, Clock, User, Shield, History, Edit, UserCog,
  Activity, MessageSquare,
} from 'lucide-react';
import { getIncidentById, canViewResponse } from '../../services/incidentStorage';
import { getAuditLogForIncident } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  resolved: { variant: 'success', label: 'Resolved' },
  under_review: { variant: 'warning', label: 'Under Review' },
  reported: { variant: 'info', label: 'Reported' },
  action_taken: { variant: 'primary', label: 'Action Taken' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

const formatFullTime = (isoString) => {
  return new Date(isoString).toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.user_metadata?.role;
  const isStaff = ['admin', 'coordinator'].includes(role);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const found = await getIncidentById(id);
        setIncident(found);

        // Only staff see the audit history
        if (isStaff) {
          const historyData = await getAuditLogForIncident(id);
          setHistory(historyData);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Failed to load incident:', err);
        setIncident(null);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isStaff]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar isOpen={false} onClose={() => {}} />
        <div className="flex-1 flex flex-col">
          <Header title="Incident Details" />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </main>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex min-h-screen bg-secondary-50">
        <Sidebar isOpen={false} onClose={() => {}} />
        <div className="flex-1 flex flex-col">
          <Header title="Incident Details" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <Shield className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-secondary-900 mb-2">
                Incident not found
              </h2>
              <p className="text-secondary-500 mb-4">
                This incident may have been deleted or never existed.
              </p>
              <Button variant="primary" onClick={() => navigate('/incidents')}>
                Back to Reports
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const status = statusConfig[incident.status] || statusConfig.reported;
  const lastStatusUpdate = history.find((h) => h.type === 'incident_status');

  // ✅ Only admin + the reporter see the response
  const showResponse = canViewResponse(incident, user);

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={false} onClose={() => {}} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Incident Details" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-primary-600 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Main card */}
            <div className="card mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                  {incident.photoUrl ? (
                    <img src={incident.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    incident.emoji
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-secondary-900 mb-2">
                    {incident.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    {isStaff && lastStatusUpdate && (
                      <span className="text-xs text-secondary-500">
                        Last updated by{' '}
                        <span className="font-medium text-secondary-700">
                          {lastStatusUpdate.actorName}
                        </span>
                        {' '}· {formatFullTime(lastStatusUpdate.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-secondary-600">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <span>{incident.time}</span>
                </div>
                <div className="flex items-center gap-3 text-secondary-600">
                  <User className="w-5 h-5 text-primary-600" />
                  <span>Reported by: {incident.reportedBy}</span>
                </div>
              </div>

              <div className="p-4 bg-secondary-50 rounded-xl mb-6">
                <h3 className="font-semibold text-secondary-900 mb-2">Description</h3>
                <p className="text-secondary-600 text-sm">
                  {incident.description || 'No additional details were provided.'}
                </p>
              </div>

              {incident.photoUrl && (
                <div className="mb-6">
                  <h3 className="font-semibold text-secondary-900 mb-2">Photo Evidence</h3>
                  <img
                    src={incident.photoUrl}
                    alt="Incident evidence"
                    className="w-full rounded-xl border border-secondary-200"
                  />
                </div>
              )}

              {/* ⭐ Response — only admin + reporter ⭐ */}
              {showResponse && (
                <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary-800">
                        Response from Staff
                      </p>
                      {lastStatusUpdate && (
                        <p className="text-xs text-primary-600">
                          {lastStatusUpdate.actorName} · {formatFullTime(lastStatusUpdate.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-primary-900 leading-relaxed whitespace-pre-wrap">
                    {incident.userResponse}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {isStaff && (
                  <Button
                    variant="primary"
                    icon={Shield}
                    onClick={() => navigate('/admin/incidents')}
                  >
                    Manage Incident
                  </Button>
                )}
                <Button variant="secondary" onClick={() => navigate(-1)}>
                  Close
                </Button>
              </div>
            </div>

            {/* History — staff only */}
            {isStaff && (
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-primary-600" />
                  <h3 className="font-display font-semibold text-secondary-900">
                    Activity History
                  </h3>
                  <span className="ml-auto text-xs text-secondary-500">
                    {history.length} {history.length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-8 bg-secondary-50 rounded-xl">
                    <Activity className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
                    <p className="text-sm text-secondary-500">
                      No activity recorded yet.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-secondary-200" />
                    <div className="space-y-6">
                      {history.map((entry) => {
                        const isStatusChange = entry.type === 'incident_status';
                        const isUserChange =
                          entry.type === 'user_role_change' ||
                          entry.type === 'user_status_change';
                        const Icon = isStatusChange
                          ? Edit
                          : isUserChange
                          ? UserCog
                          : Activity;
                        const iconBg = isStatusChange
                          ? 'bg-warning-100 text-warning-600'
                          : isUserChange
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-info-100 text-info-600';

                        return (
                          <div key={entry.id} className="relative flex gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${iconBg}`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-medium text-secondary-900 text-sm">
                                  {entry.actorName}
                                </span>
                                <span className="text-xs text-secondary-400 capitalize px-2 py-0.5 bg-secondary-100 rounded-full">
                                  {entry.actorRole}
                                </span>
                              </div>
                              <p className="text-sm text-secondary-700 mb-1">
                                {entry.details}
                              </p>
                              <p className="text-xs text-secondary-400">
                                {formatFullTime(entry.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

export default IncidentDetail;