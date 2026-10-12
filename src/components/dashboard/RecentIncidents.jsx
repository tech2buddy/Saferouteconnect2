import React from 'react';
import { Shield, MapPin, Clock, ChevronRight, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  resolved: { variant: 'success', label: 'Resolved' },
  under_review: { variant: 'warning', label: 'Under Review' },
  reported: { variant: 'info', label: 'Reported' },
  action_taken: { variant: 'primary', label: 'Action Taken' },
};

const RecentIncidents = ({ incidents = [] }) => {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-secondary-900">Recent Incidents</h3>
        <button className="flex items-center gap-1 text-sm font-medium text-secondary-500 hover:text-primary-600">
          Filter: All<ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {incidents.map((incident) => {
          const status = statusConfig[incident.status] || statusConfig.reported;
          return (
            <button key={incident.id} onClick={() => navigate(`/incidents/${incident.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-all duration-200 text-left group">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-secondary-900 truncate">{incident.title}</p>
                <div className="flex items-center gap-3 text-xs text-secondary-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{incident.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{incident.time}</span>
                </div>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
              <ChevronRight className="w-4 h-4 text-secondary-400 group-hover:translate-x-1 transition-transform" />
            </button>
          );
        })}
      </div>
      <button onClick={() => navigate('/incidents')}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg">
        View all incidents<ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default RecentIncidents;