import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Map, Maximize2, ArrowRight, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getIncidents } from '../../services/incidentStorage';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createColoredIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

const getIconColor = (type) => {
  const colors = {
    theft: '#dc2626',
    robbery: '#dc2626',
    harassment: '#f59e0b',
    suspicious: '#f59e0b',
    poor_lighting: '#3b82f6',
    vandalism: '#3b82f6',
    other: '#64748b',
  };
  return colors[type] || '#64748b';
};

const KIMBERLEY_CENTER = [-28.7412, 24.7665];

const HeatMap = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const all = await getIncidents();
      const valid = all.filter(
        (i) =>
          typeof i.lat === 'number' &&
          typeof i.lng === 'number' &&
          !isNaN(i.lat) &&
          !isNaN(i.lng)
      );
      setIncidents(valid);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-secondary-900">Safety Heat Map</h3>
        </div>
        <button onClick={() => navigate('/safe-route')}
          className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
          View Full Map <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden mb-4" style={{ height: '320px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-secondary-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <MapContainer
            center={KIMBERLEY_CENTER}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {incidents.map((incident) => (
              <Circle
                key={`heat-${incident.id}`}
                center={[incident.lat, incident.lng]}
                radius={150}
                pathOptions={{
                  color: getIconColor(incident.type),
                  fillColor: getIconColor(incident.type),
                  fillOpacity: 0.2,
                  weight: 1,
                  opacity: 0.4,
                }}
              />
            ))}

            {incidents.map((incident) => (
              <Marker key={incident.id} position={[incident.lat, incident.lng]}
                icon={createColoredIcon(getIconColor(incident.type))}>
                <Popup>
                  <div className="p-1 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{incident.emoji}</span>
                      <strong className="text-sm">{incident.title}</strong>
                    </div>
                    <p className="text-xs text-secondary-600 mb-2">📍 {incident.location}</p>
                    <p className="text-xs text-secondary-500 mb-2">🕐 {incident.time}</p>
                    <button
                      onClick={() => navigate(`/incidents/${incident.id}`)}
                      className="text-xs font-medium text-primary-600 hover:underline">
                      View Details →
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {!loading && incidents.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[400] pointer-events-none">
            <div className="text-center">
              <Map className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-secondary-700">No incidents yet</p>
              <p className="text-xs text-secondary-500 mt-1">
                Report an incident to see it on the map
              </p>
            </div>
          </div>
        )}

        <button onClick={() => navigate('/safe-route')}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-secondary-50 z-[400]"
          title="Expand map">
          <Maximize2 className="w-4 h-4 text-secondary-600" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger-500" />
          <span className="text-secondary-600">High risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-warning-500" />
          <span className="text-secondary-600">Medium risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-info-500" />
          <span className="text-secondary-600">Low risk</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-secondary-400">
          <Navigation className="w-3 h-3" />
          <span>{incidents.length} incident{incidents.length !== 1 ? 's' : ''} shown</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;