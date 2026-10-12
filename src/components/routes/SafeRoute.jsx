import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Polyline, Circle,
  useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Button from '../common/Button';
import {
  MapPin, Navigation, Shield, Clock, CheckCircle, Loader2,
  AlertTriangle, Info, X,
} from 'lucide-react';
import { getIncidents } from '../../services/incidentStorage';
import toast from 'react-hot-toast';

// ============================================================
// Leaflet marker icon fix (default icons don't load in React)
// ============================================================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const KIMBERLEY_CENTER = [-28.7412, 24.7665];

const hasValidCoords = (incident) =>
  typeof incident.lat === 'number' &&
  typeof incident.lng === 'number' &&
  !isNaN(incident.lat) &&
  !isNaN(incident.lng);

// ============================================================
// Custom pin icons for start & destination
// ============================================================
const createPinIcon = (color) =>
  L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color:${color};
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const startIcon = createPinIcon('#16a34a');   // green
const destIcon = createPinIcon('#dc2626');    // red

// ============================================================
// Map controller (recentre)
// ============================================================
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
};

// ============================================================
// Reverse geocode: lat/lng → human address (Nominatim)
// ============================================================
const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    return {
      address: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  } catch (err) {
    console.error('Reverse geocode error:', err);
    return {
      address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      lat,
      lng,
    };
  }
};

// ============================================================
// Handles clicks on the map. First click = start, second = dest.
// ============================================================
const MapClickHandler = ({ onPickStart, onPickDest, hasStart, hasDest }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const place = await reverseGeocode(lat, lng);

      if (!hasStart) {
        onPickStart(place);
      } else if (!hasDest) {
        onPickDest(place);
      } else {
        // both set → restart with a new start
        onPickStart(place);
      }
    },
  });
  return null;
};

// ============================================================
// Distance (Haversine, metres)
// ============================================================
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ============================================================
// Count incidents near a route (200m radius)
// ============================================================
const countIncidentsAlongRoute = (routeCoords, incidents, radiusMeters = 200) => {
  const nearby = [];
  routeCoords.forEach((coord) => {
    const [lat, lng] = coord;
    incidents.forEach((incident) => {
      const dist = getDistanceMeters(lat, lng, incident.lat, incident.lng);
      if (dist <= radiusMeters) {
        if (!nearby.find((i) => i.id === incident.id)) nearby.push(incident);
      }
    });
  });
  return nearby;
};

// ============================================================
// Risk calculator (weighted severities)
// ============================================================
const calculateRisk = (nearbyIncidents) => {
  const severityWeights = {
    theft: 2, robbery: 3, harassment: 3,
    suspicious: 1, poor_lighting: 1, vandalism: 1, other: 1,
  };
  const weightedScore = nearbyIncidents.reduce(
    (sum, inc) => sum + (severityWeights[inc.type] || 1),
    0
  );
  const count = nearbyIncidents.length;

  if (weightedScore === 0)
    return {
      level: 'low', color: '#16a34a', label: 'Low Risk', score: 0,
      description: 'No incidents reported nearby',
    };
  if (weightedScore <= 3)
    return {
      level: 'medium', color: '#f59e0b', label: 'Medium Risk', score: weightedScore,
      description: `${count} incident${count > 1 ? 's' : ''} reported nearby`,
    };
  if (weightedScore <= 7)
    return {
      level: 'high', color: '#dc2626', label: 'High Risk', score: weightedScore,
      description: `${count} incident${count > 1 ? 's' : ''} reported nearby`,
    };
  return {
    level: 'critical', color: '#991b1b', label: 'Critical Risk', score: weightedScore,
    description: `${count} incidents reported nearby — avoid if possible`,
  };
};

// ============================================================
// Fetch main route from OSRM (free, no API key)
// ============================================================
const getRouteFromOSRM = async (startLat, startLng, endLat, endLng) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();
  if (!data.routes || data.routes.length === 0) throw new Error('No route found');
  const route = data.routes[0];
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return { coordinates, distance: route.distance, duration: route.duration };
};

// ============================================================
// Address Autocomplete (type-ahead)
// ============================================================
const AddressAutocomplete = ({ label, placeholder, value, onSelect, icon: Icon = MapPin }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keep the input in sync when parent updates value (e.g., map click)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const fetchSuggestions = async (text) => {
    if (!text || text.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5&countrycodes=za`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setShowSuggestions(true);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 500);
  };

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSelect({
      address: place.display_name,
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
    });
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((p) => Math.min(p + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-secondary-700 mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-secondary-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 3 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-secondary-300 hover:border-secondary-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 pl-10 pr-10 py-2.5 text-secondary-900 placeholder-secondary-400"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-[1000] max-h-64 overflow-y-auto">
          {suggestions.map((place, idx) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-start gap-2 ${
                activeIndex === idx
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{place.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const SafeRoute = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [startPlace, setStartPlace] = useState(null);
  const [destPlace, setDestPlace] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [mapCenter, setMapCenter] = useState(KIMBERLEY_CENTER);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const all = await getIncidents();
      setIncidents(all.filter(hasValidCoords));
    };
    load();
  }, []);

  const handleStartSelect = (place) => {
    setStartPlace(place);
    setMapCenter([place.lat, place.lng]);
  };

  const handleDestSelect = (place) => {
    setDestPlace(place);
    setMapCenter([place.lat, place.lng]);
  };

  const handleClear = () => {
    setStartPlace(null);
    setDestPlace(null);
    setRoutes([]);
    setSelectedRoute(null);
    setMapCenter(KIMBERLEY_CENTER);
  };

  const handleFind = async () => {
    if (!startPlace || !destPlace) {
      toast.error('Please pick both a starting point and a destination');
      return;
    }
    setCalculating(true);
    try {
      const mainRoute = await getRouteFromOSRM(
        startPlace.lat, startPlace.lng, destPlace.lat, destPlace.lng
      );
      const nearbyIncidents = countIncidentsAlongRoute(mainRoute.coordinates, incidents);
      const risk = calculateRisk(nearbyIncidents);

      // Try alternative route via offset waypoint
      let altRoute = null;
      try {
        const altUrl = `https://router.project-osrm.org/route/v1/driving/${startPlace.lng},${startPlace.lat};${destPlace.lng + 0.003},${destPlace.lat + 0.003};${destPlace.lng},${destPlace.lat}?overview=full&geometries=geojson`;
        const altRes = await fetch(altUrl);
        const altData = await altRes.json();
        if (altData.routes && altData.routes[0]) {
          altRoute = {
            coordinates: altData.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
            distance: altData.routes[0].distance,
            duration: altData.routes[0].duration,
          };
        }
      } catch (err) {
        console.warn('Alternative route failed');
      }

      const builtRoutes = [{
        id: 1,
        name: 'Safest Route',
        risk: risk.level,
        riskLabel: risk.label,
        riskColor: risk.color,
        riskDescription: risk.description,
        time: `${Math.round(mainRoute.duration / 60)} min`,
        distance: `${(mainRoute.distance / 1000).toFixed(1)} km`,
        color: risk.color,
        coordinates: mainRoute.coordinates,
        nearbyIncidents: nearbyIncidents.length,
        incidents: nearbyIncidents,
      }];

      if (altRoute) {
        const altNearby = countIncidentsAlongRoute(altRoute.coordinates, incidents);
        const altRisk = calculateRisk(altNearby);
        builtRoutes.push({
          id: 2,
          name: 'Alternative Route',
          risk: altRisk.level,
          riskLabel: altRisk.label,
          riskColor: altRisk.color,
          riskDescription: altRisk.description,
          time: `${Math.round(altRoute.duration / 60)} min`,
          distance: `${(altRoute.distance / 1000).toFixed(1)} km`,
          color: altRisk.color,
          coordinates: altRoute.coordinates,
          nearbyIncidents: altNearby.length,
          incidents: altNearby,
        });
      }

      const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      builtRoutes.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

      setRoutes(builtRoutes);
      setSelectedRoute(builtRoutes[0]);
      setMapCenter([
        (startPlace.lat + destPlace.lat) / 2,
        (startPlace.lng + destPlace.lng) / 2,
      ]);
      toast.success(`Found ${builtRoutes.length} route${builtRoutes.length > 1 ? 's' : ''}`);
    } catch (err) {
      console.error('Route calculation failed:', err);
      toast.error('Could not calculate route. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  // Hint for the next map click
  const nextClickHint = !startPlace
    ? 'Click anywhere on the map to set your starting point'
    : !destPlace
    ? 'Now click on the map to set your destination'
    : 'Both points set — click the map to start over';

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Safe Route" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-1">
                Plan Safe Route
              </h1>
              <p className="text-secondary-500">
                Type an address or click the map to pick your start and end points.
              </p>
            </div>

            {/* Search card */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <AddressAutocomplete
                  label="Starting Point"
                  placeholder="e.g., North Cape Mall"
                  value={startPlace?.address || ''}
                  onSelect={handleStartSelect}
                />
                <AddressAutocomplete
                  label="Destination"
                  placeholder="e.g., SPU Central Campus"
                  value={destPlace?.address || ''}
                  onSelect={handleDestSelect}
                />
              </div>

              {/* Hint bar */}
              <div className="flex items-start gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg mb-4">
                <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary-700">
                  <strong>Tip:</strong> {nextClickHint}
                </p>
                {(startPlace || destPlace) && (
                  <button
                    onClick={handleClear}
                    className="ml-auto flex items-center gap-1 text-xs font-medium text-secondary-500 hover:text-danger-600"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={calculating ? Loader2 : Navigation}
                  onClick={handleFind}
                  loading={calculating}
                  className="flex-1"
                >
                  {calculating ? 'Calculating Route...' : 'Find Safe Route'}
                </Button>
              </div>

              <p className="text-xs text-secondary-500 mt-3 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                Routes use real roads and are analyzed against incidents within 200m of the path.
              </p>
            </div>

            {/* Map + routes list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MAP */}
              <div className="lg:col-span-2 card p-0 overflow-hidden relative">
                <div style={{ height: '500px' }}>
                  <MapContainer
                    center={KIMBERLEY_CENTER}
                    zoom={14}
                    style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
                  >
                    <MapController center={mapCenter} />
                    <MapClickHandler
                      onPickStart={handleStartSelect}
                      onPickDest={handleDestSelect}
                      hasStart={!!startPlace}
                      hasDest={!!destPlace}
                    />

                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Incident pins + 200m danger zones */}
                    {incidents.map((incident) => (
                      <React.Fragment key={incident.id}>
                        <Marker position={[incident.lat, incident.lng]}>
                          <Popup>
                            <div className="text-xs">
                              <strong>{incident.emoji} {incident.title}</strong>
                              <p className="text-secondary-500 mt-1">{incident.location}</p>
                            </div>
                          </Popup>
                        </Marker>
                        <Circle
                          center={[incident.lat, incident.lng]}
                          radius={200}
                          pathOptions={{
                            color: '#dc2626',
                            fillColor: '#dc2626',
                            fillOpacity: 0.1,
                            weight: 1,
                          }}
                        />
                      </React.Fragment>
                    ))}

                    {/* Route polylines */}
                    {routes.map((route) => (
                      <Polyline
                        key={route.id}
                        positions={route.coordinates}
                        pathOptions={{
                          color: route.color,
                          weight: selectedRoute?.id === route.id ? 6 : 3,
                          opacity: selectedRoute?.id === route.id ? 1 : 0.4,
                        }}
                      />
                    ))}

                    {/* Start & Destination markers */}
                    {startPlace && (
                      <Marker position={[startPlace.lat, startPlace.lng]} icon={startIcon}>
                        <Popup>🟢 Start: {startPlace.address.split(',')[0]}</Popup>
                      </Marker>
                    )}
                    {destPlace && (
                      <Marker position={[destPlace.lat, destPlace.lng]} icon={destIcon}>
                        <Popup>🔴 Destination: {destPlace.address.split(',')[0]}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-secondary-200 p-3 z-[500]">
                  <p className="text-xs font-semibold text-secondary-900 mb-2">Map Legend</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-danger-500 flex-shrink-0" />
                      <span className="text-secondary-600">Reported incident</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full border-2 border-danger-500 bg-danger-100 flex-shrink-0" />
                      <span className="text-secondary-600">200m danger zone</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-primary-600 flex-shrink-0" />
                      <span className="text-secondary-600">Starting point</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-danger-600 flex-shrink-0" />
                      <span className="text-secondary-600">Destination</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-0.5 bg-primary-600 flex-shrink-0" />
                      <span className="text-secondary-600">Safe route</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROUTES LIST */}
              <div className="space-y-3">
                <div className="mb-3">
                  <h3 className="font-display font-semibold text-secondary-900">
                    {routes.length > 0 ? 'Available Routes' : 'Route Options'}
                  </h3>
                  {routes.length > 0 && (
                    <p className="text-xs text-secondary-500 mt-1">
                      📍 Red pins show reported incidents. Safer routes avoid those areas.
                    </p>
                  )}
                </div>

                {routes.length === 0 ? (
                  <div className="card text-center py-8">
                    <Navigation className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-sm text-secondary-500">
                      Type your locations above, or click the map, then tap Find Safe Route.
                    </p>
                  </div>
                ) : (
                  routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`w-full card text-left transition-all duration-200 hover:shadow-card-hover ${
                        selectedRoute?.id === route.id
                          ? 'border-2 border-primary-500 shadow-md'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${route.color}20` }}
                        >
                          <Shield className="w-5 h-5" style={{ color: route.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-900 text-sm">
                            {route.name}
                          </h4>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: route.color }}
                          >
                            {route.riskLabel}
                          </span>
                        </div>
                        {selectedRoute?.id === route.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>

                      <div className="flex gap-4 text-xs text-secondary-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {route.time}
                        </span>
                        <span>{route.distance}</span>
                      </div>

                      <div className="pt-3 border-t border-secondary-100">
                        {route.nearbyIncidents === 0 ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {route.riskDescription}
                          </p>
                        ) : (
                          <div className="text-xs">
                            <div className="flex items-center gap-1 mb-2">
                              <AlertTriangle className="w-3 h-3" style={{ color: route.color }} />
                              <span className="font-medium text-secondary-700">
                                {route.riskDescription}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {route.incidents.slice(0, 3).map((inc) => (
                                <span
                                  key={inc.id}
                                  className="inline-block px-1.5 py-0.5 bg-secondary-100 rounded text-xs text-secondary-600"
                                >
                                  {inc.emoji} {inc.type}
                                </span>
                              ))}
                              {route.incidents.length > 3 && (
                                <span className="text-xs text-secondary-400 self-center">
                                  +{route.incidents.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default SafeRoute;