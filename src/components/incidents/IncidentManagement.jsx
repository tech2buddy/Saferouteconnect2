import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import {
  getIncidents, updateIncidentStatus, isIncidentLocked,
} from '../../services/incidentStorage';
import { addAuditEntry } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Eye, Check, Clock, Send, Lock, MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  resolved: { variant: 'success', label: 'Resolved' },
  under_review: { variant: 'warning', label: 'Under Review' },
  reported: { variant: 'info', label: 'Reported' },
  action_taken: { variant: 'primary', label: 'Action Taken' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

const STATUS_OPTIONS = ['reported', 'under_review', 'action_taken', 'resolved', 'rejected'];

const RESPONSE_TEMPLATES = [
  {
    label: 'Investigating',
    text: 'We have received your report and are currently investigating the matter. We will provide an update as soon as we have more information.',
  },
  {
    label: 'Action Taken',
    text: 'We have taken action on your report. The relevant authorities have been notified and are responding to the situation.',
  },
  {
    label: 'Case Recovered',
    text: 'Following up on your lead, we were able to make progress. Please check with the local authorities for further details.',
  },
  {
    label: 'Resolved',
    text: 'Your report has been resolved. Thank you for helping keep the community safe.',
  },
  {
    label: 'Need More Info',
    text: 'Unfortunately, we need more information to take action. Please provide additional details at your earliest convenience.',
  },
];

const IncidentManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [updateModal, setUpdateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    userResponse: '',
    adminNotes: '',
  });
  const [updating, setUpdating] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    const data = await getIncidents();
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openUpdateModal = (incident) => {
    // Locked incidents cannot be edited
    if (isIncidentLocked(incident.status)) {
      toast(
        `This incident is ${statusConfig[incident.status]?.label || incident.status} and cannot be edited.`,
        { icon: '🔒' }
      );
      return;
    }

    setSelectedIncident(incident);
    setUpdateForm({
      status: incident.status || 'reported',
      userResponse: incident.userResponse || '',
      adminNotes: incident.adminNotes || '',
    });
    setUpdateModal(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedIncident) return;

    setUpdating(true);
    try {
      const oldStatus = selectedIncident.status;
      const newStatus = updateForm.status;

      const result = await updateIncidentStatus(
        selectedIncident.id,
        newStatus,
        updateForm.adminNotes || null,
        updateForm.userResponse || null
      );

      if (result) {
        await addAuditEntry({
          type: 'incident_status',
          actorId: user?.id,
          actorName: user?.user_metadata?.full_name || 'Staff',
          actorRole: user?.user_metadata?.role || 'admin',
          incidentId: selectedIncident.id,
          incidentTitle: selectedIncident.title,
          action: 'Updated incident status',
          details: `"${selectedIncident.title}" changed from ${statusConfig[oldStatus]?.label || oldStatus} → ${statusConfig[newStatus]?.label || newStatus}${updateForm.userResponse ? ' — sent response to reporter' : ''}`,
        });

        await loadIncidents();
        setUpdateModal(false);
        setSelectedIncident(null);

        if (newStatus === 'resolved' || newStatus === 'rejected') {
          toast.success(`Incident ${newStatus} — now permanently locked`);
        } else {
          toast.success('Incident updated successfully!');
        }
      } else {
        toast.error('Failed to update incident');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update incident');
    } finally {
      setUpdating(false);
    }
  };

  const applyTemplate = (template) => {
    setUpdateForm({ ...updateForm, userResponse: template.text });
  };

  const counts = {
    total: incidents.length,
    reported: incidents.filter((i) => i.status === 'reported').length,
    underReview: incidents.filter((i) => i.status === 'under_review').length,
    resolved: incidents.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Incident Management" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Header — no more Export button */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-secondary-900">Incident Management</h1>
            <p className="text-secondary-500">View, manage and update all incidents in the system.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Incidents', value: counts.total },
              { label: 'New Reports', value: counts.reported },
              { label: 'Under Review', value: counts.underReview },
              { label: 'Resolved', value: counts.resolved },
            ].map((stat, i) => (
              <div key={i} className="card text-center p-4">
                <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-xs text-secondary-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input type="text" placeholder="Search incidents..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field sm:w-48">
              <option value="all">All Status</option>
              <option value="reported">Reported</option>
              <option value="under_review">Under Review</option>
              <option value="action_taken">Action Taken</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="mb-4 p-3 bg-info-50 border border-info-200 rounded-lg flex items-start gap-2">
            <Clock className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-info-700">
              <strong>All status changes are recorded.</strong> Resolved and rejected incidents are permanently locked — they cannot be edited or reopened.
            </p>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                <p className="text-secondary-500 mt-3">Loading incidents...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-secondary-200 bg-secondary-50">
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">ID</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Location</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Reported By</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Response</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inc) => {
                      const status = statusConfig[inc.status] || statusConfig.reported;
                      const locked = isIncidentLocked(inc.status);
                      return (
                        <tr key={inc.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                          <td className="py-3 px-4 text-secondary-500">
                            #{String(inc.id).slice(-4)}
                          </td>
                          <td className="py-3 px-4 font-medium text-secondary-900">
                            <button
                              onClick={() => navigate(`/incidents/${inc.id}`)}
                              className="flex items-center gap-2 hover:text-primary-600 transition-colors text-left">
                              <span>{inc.emoji}</span>
                              <span className="truncate max-w-xs">{inc.title}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-secondary-600">{inc.location}</td>
                          <td className="py-3 px-4 text-secondary-600">{inc.reportedBy}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={status.variant}>{status.label}</Badge>
                              {locked && <Lock className="w-3 h-3 text-secondary-400" />}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {inc.userResponse ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600">
                                <MessageSquare className="w-3 h-3" />
                                Sent
                              </span>
                            ) : (
                              <span className="text-xs text-secondary-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {locked ? (
                                <span
                                  title="Locked — cannot be edited"
                                  className="p-1.5 rounded-lg cursor-not-allowed"
                                >
                                  <Lock className="w-4 h-4 text-secondary-300" />
                                </span>
                              ) : (
                                <button
                                  onClick={() => openUpdateModal(inc)}
                                  title="Update Status & Respond"
                                  className="p-1.5 rounded-lg transition-colors hover:bg-primary-50">
                                  <Check className="w-4 h-4 text-primary-600" />
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/incidents/${inc.id}`)}
                                title="View Details"
                                className="p-1.5 hover:bg-secondary-100 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-secondary-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12">
                          <Search className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                          <p className="text-secondary-500">No incidents found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="text-xs text-secondary-400 mt-3 text-center">
            💡 Resolved and rejected incidents are locked permanently.
          </p>
        </main>
        <Footer />
      </div>

      {/* Update Modal */}
      <Modal
        isOpen={updateModal}
        onClose={() => setUpdateModal(false)}
        title="Update Incident & Respond"
        size="lg"
      >
        {selectedIncident && (
          <div className="space-y-5">
            <div className="p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedIncident.emoji}</span>
                <p className="font-medium text-secondary-900 text-sm">
                  {selectedIncident.title}
                </p>
              </div>
              <p className="text-xs text-secondary-500">
                📍 {selectedIncident.location} · Reported by {selectedIncident.reportedBy}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Update Status <span className="text-danger-500">*</span>
              </label>
              <select
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                className="input-field"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {statusConfig[s]?.label || s}
                  </option>
                ))}
              </select>
              {(updateForm.status === 'resolved' || updateForm.status === 'rejected') && (
                <p className="mt-2 text-xs text-warning-600 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Saving this will permanently lock the incident. It cannot be edited or reopened.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                Response to Reporter{' '}
                <span className="text-xs text-secondary-400">(visible to the resident)</span>
              </label>
              <textarea
                value={updateForm.userResponse}
                onChange={(e) => setUpdateForm({ ...updateForm, userResponse: e.target.value })}
                placeholder="e.g., We followed up on your lead and recovered your phone..."
                rows={4}
                className="input-field resize-none"
              />
              <div className="mt-3">
                <p className="text-xs font-medium text-secondary-500 mb-2">Quick templates:</p>
                <div className="flex flex-wrap gap-2">
                  {RESPONSE_TEMPLATES.map((template, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="px-2.5 py-1 text-xs font-medium bg-secondary-100 hover:bg-primary-100 text-secondary-700 hover:text-primary-700 rounded-full transition-colors"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-secondary-700 mb-1.5">
                <Lock className="w-3.5 h-3.5" />
                Internal Notes{' '}
                <span className="text-xs text-secondary-400 font-normal">(staff only)</span>
              </label>
              <textarea
                value={updateForm.adminNotes}
                onChange={(e) => setUpdateForm({ ...updateForm, adminNotes: e.target.value })}
                placeholder="e.g., Suspects: 2 males, 20-25 years."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-secondary-100">
              <Button
                variant="primary"
                icon={Send}
                onClick={handleSaveUpdate}
                loading={updating}
                className="flex-1"
              >
                Save Update & Send Response
              </Button>
              <Button
                variant="secondary"
                onClick={() => setUpdateModal(false)}
                className="sm:w-32"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentManagement;