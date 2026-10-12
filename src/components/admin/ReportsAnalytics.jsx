import React, { useState, useEffect } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Button from '../common/Button';
import {
  Download, FileSpreadsheet, FileDown, Filter,
  Shield, MapPin, Bell, CheckCircle, TrendingUp,
} from 'lucide-react';
import {
  getIncidentStats, getIncidents, getIncidentsByType,
  getIncidentsByStatus, getIncidentsBySeverity, getIncidentTrend,
} from '../../services/incidentStorage';
import { exportToPDF, exportToCSV, exportToExcel } from '../../services/exportService';
import toast from 'react-hot-toast';

const ReportsAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, resolved: 0, underReview: 0, reported: 0, actionTaken: 0 });
  const [types, setTypes] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [severityCounts, setSeverityCounts] = useState({});
  const [trend, setTrend] = useState([]);
  const [areasCount, setAreasCount] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const [exporting, setExporting] = useState('');
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    period: '30',
    type: 'all',
    status: 'all',
    chartType: 'line',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all = await getIncidents();
      setIncidents(all);

      const statsData = await getIncidentStats();
      setStats(statsData);

      const typesData = await getIncidentsByType();
      setTypes(typesData);

      const statusData = await getIncidentsByStatus();
      setStatusCounts(statusData);

      const severityData = await getIncidentsBySeverity();
      setSeverityCounts(severityData);

      const trendData = await getIncidentTrend(14);
      setTrend(trendData);

      const uniqueAreas = new Set(all.map((i) => i.location));
      setAreasCount(uniqueAreas.size);

      setLoading(false);
    };
    load();
  }, []);

  const handleExport = async (type) => {
    if (incidents.length === 0) {
      toast.error('No incidents to export');
      return;
    }
    setExporting(type);
    try {
      let count = 0;
      if (type === 'pdf') count = exportToPDF(incidents, filters);
      else if (type === 'csv') count = exportToCSV(incidents, filters);
      else if (type === 'excel') count = exportToExcel(incidents, filters);
      toast.success(`Exported ${count} incident${count !== 1 ? 's' : ''}!`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const TYPE_COLORS = {
    theft: '#dc2626', robbery: '#dc2626', harassment: '#f59e0b',
    suspicious: '#f59e0b', poor_lighting: '#3b82f6',
    vandalism: '#3b82f6', other: '#64748b',
  };
  const STATUS_COLORS = {
    reported: '#3b82f6', under_review: '#f59e0b',
    action_taken: '#22c55e', resolved: '#16a34a', rejected: '#dc2626',
  };
  const SEVERITY_COLORS = {
    critical: '#dc2626', high: '#f59e0b', medium: '#3b82f6', low: '#64748b',
  };

  // ============================================================
  // Pie Chart
  // ============================================================
  const PieChart = ({ data, colors, size = 140 }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height: size }}>
          <p className="text-xs text-secondary-400">No data yet</p>
        </div>
      );
    }

    let cumulativeAngle = -90;
    const center = size / 2;
    const radius = size / 2 - 10;

    const paths = data.map((item, i) => {
      const angle = (item.count / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      const startX = center + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = center + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = center + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = center + radius * Math.sin((endAngle * Math.PI) / 180);
      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M ${center} ${center}`,
        `L ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
        'Z',
      ].join(' ');

      cumulativeAngle += angle;
      return { path, color: colors[item.key] || '#64748b', key: i };
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p) => (
          <path key={p.key} d={p.path} fill={p.color} stroke="white" strokeWidth="2" />
        ))}
        <circle cx={center} cy={center} r={radius * 0.4} fill="white" />
      </svg>
    );
  };

  // ============================================================
  // Line Chart
  // ============================================================
  const LineChart = ({ data, height = 220 }) => {
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const width = 800;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    if (data.every((d) => d.count === 0)) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-400">No incidents in the last 14 days</p>
          </div>
        </div>
      );
    }

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.count / maxCount) * chartHeight;
      return { x, y, ...d };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding + chartHeight * frac;
          return (
            <line
              key={frac}
              x1={padding}
              y1={y}
              x2={padding + chartWidth}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        <path d={areaD} fill="url(#lineGradient)" />
        <path
          d={pathD}
          fill="none"
          stroke="#16a34a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#16a34a" />
            {i % 2 === 0 && (
              <text x={p.x} y={height - 10} fontSize="10" textAnchor="middle" fill="#64748b">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    );
  };

  // ============================================================
  // Bar Chart
  // ============================================================
  const BarChart = ({ data, height = 220 }) => {
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const width = 800;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barGap = 4;

    if (data.every((d) => d.count === 0)) {
      return (
        <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-secondary-300 mx-auto mb-2" />
            <p className="text-sm text-secondary-400">No incidents in the last 14 days</p>
          </div>
        </div>
      );
    }

    const barWidth = (chartWidth - barGap * (data.length - 1)) / data.length;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="1" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = padding + chartHeight * frac;
          return (
            <line
              key={frac}
              x1={padding}
              y1={y}
              x2={padding + chartWidth}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {[0, 0.5, 1].map((frac) => {
          const value = Math.round(maxCount * (1 - frac));
          const y = padding + chartHeight * frac;
          return (
            <text
              key={frac}
              x={padding - 10}
              y={y + 4}
              fontSize="10"
              textAnchor="end"
              fill="#64748b"
            >
              {value}
            </text>
          );
        })}

        {data.map((d, i) => {
          const barHeight = (d.count / maxCount) * chartHeight;
          const x = padding + i * (barWidth + barGap);
          const y = padding + chartHeight - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="url(#barGradient)"
                rx="4"
              />
              {d.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#16a34a"
                  fontWeight="600"
                >
                  {d.count}
                </text>
              )}
              {i % 2 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={height - 10}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#64748b"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Reports & Analytics" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-secondary-900">
                  Reports & Analytics
                </h1>
                <p className="text-secondary-500">
                  Generate and export safety reports for community planning.
                </p>
              </div>
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => toast('Saved Reports coming soon', { icon: '🚧' })}
              >
                Saved Reports
              </Button>
            </div>

            {/* Report Parameters */}
            <div className="card mb-6">
              <h3 className="font-display font-semibold text-secondary-900 mb-4">
                Report Parameters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Time Period
                  </label>
                  <select
                    className="input-field"
                    value={filters.period}
                    onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Area / Zone
                  </label>
                  <select className="input-field">
                    <option>All Areas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Incident Types
                  </label>
                  <select
                    className="input-field"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="all">All Types</option>
                    <option value="theft">Theft</option>
                    <option value="robbery">Robbery</option>
                    <option value="harassment">Harassment</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="poor_lighting">Poor Lighting</option>
                    <option value="vandalism">Vandalism</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Chart Type
                  </label>
                  <select
                    className="input-field"
                    value={filters.chartType}
                    onChange={(e) => setFilters({ ...filters, chartType: e.target.value })}
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                  </select>
                </div>
              </div>
              <Button
                variant="primary"
                icon={Filter}
                onClick={() => toast.success('Filters applied')}
              >
                Apply Filters
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { title: 'Total Incidents', value: stats.total, icon: Shield, color: 'primary' },
                { title: 'Areas Affected', value: areasCount, icon: MapPin, color: 'warning' },
                { title: 'Active Alerts', value: stats.reported, icon: Bell, color: 'info' },
                { title: 'Resolved Cases', value: stats.resolved, icon: CheckCircle, color: 'success' },
              ].map((stat, i) => (
                <div key={i} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center
                        ${stat.color === 'primary' ? 'bg-primary-100' : ''}
                        ${stat.color === 'warning' ? 'bg-warning-100' : ''}
                        ${stat.color === 'info' ? 'bg-info-100' : ''}
                        ${stat.color === 'success' ? 'bg-green-100' : ''}`}
                    >
                      <stat.icon
                        className={`w-5 h-5
                          ${stat.color === 'primary' ? 'text-primary-600' : ''}
                          ${stat.color === 'warning' ? 'text-warning-600' : ''}
                          ${stat.color === 'info' ? 'text-info-600' : ''}
                          ${stat.color === 'success' ? 'text-green-600' : ''}`}
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                  <p className="text-sm text-secondary-500 mt-1">{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Incident Trend */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-secondary-900">
                  Incident Trend (Last 14 Days)
                </h3>
                <span className="text-xs text-secondary-400 capitalize">
                  {filters.chartType === 'bar' ? '📊 Bar chart' : '📈 Line chart'}
                </span>
              </div>
              {loading ? (
                <div className="flex items-center justify-center" style={{ height: '220px' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : filters.chartType === 'bar' ? (
                <BarChart data={trend} height={220} />
              ) : (
                <LineChart data={trend} height={220} />
              )}
            </div>

            {/* 3 Pie charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="card">
                <h4 className="font-display font-semibold text-sm text-secondary-900 mb-3">
                  By Incident Type
                </h4>
                <div className="flex items-center gap-4">
                  <PieChart
                    data={types.map((t) => ({ ...t, key: t.type }))}
                    colors={TYPE_COLORS}
                    size={120}
                  />
                  <div className="flex-1 space-y-1">
                    {types.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: TYPE_COLORS[t.type] || '#64748b' }}
                        />
                        <span className="text-secondary-600 flex-1 truncate">{t.label}</span>
                        <span className="font-medium text-secondary-700">{t.count}</span>
                      </div>
                    ))}
                    {types.length === 0 && <p className="text-xs text-secondary-400">No incidents</p>}
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-display font-semibold text-sm text-secondary-900 mb-3">
                  By Severity
                </h4>
                <div className="flex items-center gap-4">
                  <PieChart
                    data={Object.entries(severityCounts).map(([k, v]) => ({ key: k, count: v }))}
                    colors={SEVERITY_COLORS}
                    size={120}
                  />
                  <div className="flex-1 space-y-1">
                    {Object.entries(severityCounts).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: SEVERITY_COLORS[key] }}
                        />
                        <span className="text-secondary-600 flex-1 capitalize">{key}</span>
                        <span className="font-medium text-secondary-700">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-display font-semibold text-sm text-secondary-900 mb-3">
                  By Status
                </h4>
                <div className="flex items-center gap-4">
                  <PieChart
                    data={Object.entries(statusCounts).map(([k, v]) => ({ key: k, count: v }))}
                    colors={STATUS_COLORS}
                    size={120}
                  />
                  <div className="flex-1 space-y-1">
                    {Object.entries(statusCounts).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[key] }}
                        />
                        <span className="text-secondary-600 flex-1 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="font-medium text-secondary-700">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options — Excel is back, Email is gone */}
            <div className="card mb-6">
              <h3 className="font-display font-semibold text-secondary-900 mb-4">
                Export Options
              </h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  icon={FileDown}
                  loading={exporting === 'pdf'}
                  onClick={() => handleExport('pdf')}
                >
                  Generate PDF
                </Button>
                <Button
                  variant="secondary"
                  icon={FileSpreadsheet}
                  loading={exporting === 'csv'}
                  onClick={() => handleExport('csv')}
                >
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  icon={Download}
                  loading={exporting === 'excel'}
                  onClick={() => handleExport('excel')}
                >
                  Export Excel
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ReportsAnalytics;