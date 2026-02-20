import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

const CityMap = () => {
  const [intersections, setIntersections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [mapCenter, setMapCenter] = useState([44.4268, 26.1025]);
  const [mapZoom, setMapZoom] = useState(13);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIntersections();
  }, []);

  const normalizeIntersection = (intersection) => {
    const lat = Number(intersection.lat);
    const lng = Number(intersection.lng);
    return {
      ...intersection,
      name: intersection.name ?? '',
      sector: intersection.sector ?? null,
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    };
  };

  const fetchIntersections = async () => {
    try {
      setError('');
      const { data, error: dbError } = await supabase
        .from('INTERSECTION')
        .select('id, name, sector, lat, lng')
        .order('name');

      if (dbError) throw dbError;

      const normalized = (data || []).map(normalizeIntersection);
      setIntersections(normalized);

      if (normalized.length > 0) {
        const firstWithCoords = normalized.find((i) => i.lat && i.lng);
        if (firstWithCoords) {
          setMapCenter([firstWithCoords.lat, firstWithCoords.lng]);
        }
      }
    } catch (error) {
      console.error('Error fetching intersections:', error);
      setError('Failed to load intersections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createIntersectionIcon = (color = '#22C55E') => {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
          <circle cx="16" cy="16" r="2" fill="${color}"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredIntersections = intersections.filter((intersection) => {
    const name = String(intersection.name || '').toLowerCase();
    const sectorText = String(intersection.sector ?? '');
    const matchesSearch =
      normalizedSearch === '' ||
      name.includes(normalizedSearch) ||
      sectorText.toLowerCase().includes(normalizedSearch);
    const matchesSector =
      selectedSector === 'all' ||
      String(intersection.sector) === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sectors = [
    ...new Set(
      intersections
        .map((i) => i.sector)
        .filter((sector) => sector !== null && sector !== undefined)
    ),
  ].sort((a, b) => Number(a) - Number(b));
  const intersectionColors = [
    '#22C55E',
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#6366F1',
    '#059669',
    '#0EA5E9',
    '#8B5CF6',
  ];

  const handleIntersectionClick = (id) => {
    navigate(`/intersection/${id}`);
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // or navigate('/login') if you prefer
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <header className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-pulse-slow">🌺</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Traffic Flower
            </h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Reports
            </button>
            <button
              onClick={() => navigate('/monitoring')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Monitoring
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Alerts
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Settings
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Analytics
            </button>
            <button
              onClick={handleLogout}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Log Out
            </button>
          </nav>
        </div>
      </header>

      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center space-x-4 flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              placeholder="Search intersections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sector:</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            >
              <option value="all">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector.toString()}>
                  Sector {sector}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Found:</span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-semibold">
              {filteredIntersections.length} intersections
            </span>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-180px)] relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 text-lg font-semibold">{error}</p>
              <p className="text-gray-500 mt-2">Check your login and try again.</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredIntersections
              .filter((i) => i.lat && i.lng)
              .map((intersection, idx) => {
                const color =
                  intersectionColors[idx % intersectionColors.length];
                return (
                  <Marker
                    key={intersection.id}
                    position={[intersection.lat, intersection.lng]}
                    icon={createIntersectionIcon(color)}
                    eventHandlers={{
                      click: () => handleIntersectionClick(intersection.id),
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-gray-800 mb-2">
                          {intersection.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Sector {intersection.sector ?? 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Coordinates: {intersection.lat.toFixed(4)},{' '}
                          {intersection.lng.toFixed(4)}
                        </p>
                        <button
                          onClick={() => handleIntersectionClick(intersection.id)}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 hover:shadow-lg transition-all w-full"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        )}

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl p-4 border border-white/20 z-[1000]">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-semibold text-gray-700">
              Intersections: {filteredIntersections.length}
            </span>
          </div>
          <div className="text-xs text-gray-500">Click markers for details</div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;
