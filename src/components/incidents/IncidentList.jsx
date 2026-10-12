import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Badge from '../common/Badge';
import { getIncidents, isReporter } from '../../services/incidentStorage';
import { MapPin, Clock, Search, ChevronRight, MessageSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  resolved: { variant: 'success', label: 'Resolved' },
  under_review: { variant: 'warning', label: 'Under Review' },
  reported: { variant: 'info', label: 'Reported' },
  action_taken: { variant: 'primary', label: 'Action Taken' },
  rejected: { variant: 'danger', label: 'Rejected' },
};

const IncidentList = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getIncidents();
      setIncidents(data);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  const filtered = incidents.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Community Reports" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">
                Community Reports
              </h1>
              <p className="text-secondary-500">
                {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported in your community.
              </p>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input type="text" placeholder="Search incidents..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} className="input-field pl-10" />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto" />
                <p className="text-secondary-500 mt-3">Loading incidents...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((incident) => {
                  const status = statusConfig[incident.status] || statusConfig.reported;
                  const hasReplyForMe =
                    incident.userResponse &&
                    isReporter(incident, user);

                  return (
                    <button key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="w-full card flex items-center gap-4 text-left group">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {incident.photoUrl ? (
                          <img src={incident.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{incident.emoji}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-medium text-secondary-900 truncate">{incident.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          {hasReplyForMe && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full border border-primary-300">
                              <MessageSquare className="w-3 h-3" />
                              Reply received
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{incident.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{incident.time}
                          </span>
                          <span>Reported by: {incident.reportedBy}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">
                      {searchQuery
                        ? `No incidents matching "${searchQuery}"`
                        : 'No incidents reported yet'}
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">
                      Reports will appear here once residents submit them.
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

export default IncidentList;