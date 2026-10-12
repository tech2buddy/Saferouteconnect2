import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { getIncidentsByType } from '../../services/incidentStorage';

const COLOR_MAP = {
  theft: 'bg-danger-500',
  robbery: 'bg-danger-500',
  harassment: 'bg-warning-500',
  suspicious: 'bg-warning-500',
  poor_lighting: 'bg-info-500',
  vandalism: 'bg-info-500',
  other: 'bg-secondary-400',
};

const IncidentChart = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getIncidentsByType();
      setTypes(data);
      setLoading(false);
    };
    load();
  }, []);

  const maxValue = types.length > 0 ? Math.max(...types.map((t) => t.count)) : 1;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600" />
        <h3 className="font-display font-semibold text-secondary-900">Incidents by Type</h3>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        </div>
      ) : types.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
          <p className="text-sm text-secondary-500">No incidents to chart yet</p>
          <p className="text-xs text-secondary-400 mt-1">
            Report incidents to see the breakdown
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {types.map((type, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-secondary-700">{type.label}</span>
                <span className="text-sm text-secondary-500">
                  {type.count} ({type.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${COLOR_MAP[type.type] || 'bg-secondary-400'} rounded-full transition-all duration-500`}
                  style={{ width: `${(type.count / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-secondary-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-500">Total incidents</span>
          <span className="text-sm font-semibold text-secondary-900">
            {types.reduce((sum, t) => sum + t.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncidentChart;