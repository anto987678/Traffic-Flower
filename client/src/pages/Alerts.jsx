import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Alerts = () => {
  const [alerts, setAlerts] = useState({
    all: [],
    violations: [],
    delays: []
  });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const [violationsSpeedRes, congestionRes] = await Promise.all([
        api.get('/api/reports/violations', {
          params: { limit: 20, sort: 'speed', days: 7 }
        }),
        api.get('/api/reports/congestion', {
          params: { limit: 20, days: 7 }
        }),
      ]);

      const violationsBySpeed = violationsSpeedRes.data.map((v) => {
        const label = v.type === 'PERSON' ? 'Person' : v.type || 'Vehicle';
        return {
          id: `v-${v.id}`,
          type: 'violation',
          severity: 'high',
          title: 'Red Light Violation',
          message: `${label} crossed red light at ${v.intersection} - ${v.street}`,
          timestamp: v.timestamp,
          location: v.intersection,
          details: {
            street: v.street,
            sense: v.sense,
            speed: v.speed,
            regNumber: v.regNumber,
            line: v.line
          },
        };
      });

      const congestionAlerts = congestionRes.data
        .filter((c) => c.stoppedMinutes > 5)
        .map((c) => ({
          id: `c-${c.type}-${c.regNumber}`,
          type: 'delay',
          severity:
            c.stoppedMinutes > 15
              ? 'high'
              : c.stoppedMinutes > 10
              ? 'medium'
              : 'low',
          title: 'Public Transport Delay',
          message: `${c.type} ${c.line} (${c.regNumber}) delayed ${c.stoppedMinutes} minutes`,
          timestamp: c.expectedArrival,
          location: c.intersection,
          details: {
            line: c.line,
            regNumber: c.regNumber,
            stoppedMinutes: c.stoppedMinutes,
            station: c.station,
            expectedArrival: c.expectedArrival,
            actualArrival: c.actualArrival,
          },
        }));

      const violationAlerts = [...violationsBySpeed].sort((a, b) => {
        const speedA = a.details.speed ?? -1;
        const speedB = b.details.speed ?? -1;
        if (speedB !== speedA) {
          return speedB - speedA;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      const delayAlerts = [...congestionAlerts].sort((a, b) => {
        const delayA = a.details.stoppedMinutes ?? 0;
        const delayB = b.details.stoppedMinutes ?? 0;
        if (delayB !== delayA) {
          return delayB - delayA;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      const allAlerts = [...violationAlerts, ...delayAlerts];

      setAlerts({
        all: allAlerts,
        violations: violationAlerts,
        delays: delayAlerts
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // or '/login' if you prefer
  };

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString();
  };

  const filteredAlerts = useMemo(() => {
    switch (filter) {
      case 'all':
        return alerts.all;
      case 'violation':
        return alerts.violations;
      case 'delay':
        return alerts.delays;
      default:
        return alerts.all;
    }
  }, [alerts, filter]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'medium':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'low':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟠';
      case 'low':
        return '🟡';
      default:
        return '🔵';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <header className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌺</span>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Traffic Flower
            </h1>
          </div>
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-accent-green transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="hover:text-accent-green transition-colors"
            >
              Map
            </button>
            <button
              onClick={() => navigate('/monitoring')}
              className="hover:text-accent-green transition-colors"
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
              onClick={handleLogout}
              className="hover:text-accent-green transition-colors"
            >
              Log Out
            </button>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-text-dark mb-2">
              Traffic Alerts
            </h2>
            <p className="text-text-light">Real-time notifications and warnings</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-text-dark hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('violation')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'violation'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white text-text-dark hover:bg-gray-100'
              }`}
            >
              Violations
            </button>
            <button
              onClick={() => setFilter('delay')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'delay'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-text-dark hover:bg-gray-100'
              }`}
            >
              Delays
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4"></div>
            <p className="text-text-light">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 border border-white/20 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <p className="text-xl font-semibold text-text-dark mb-2">No Alerts</p>
            <p className="text-text-light">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-4" key={filter}>
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 ${getSeverityColor(
                  alert.severity
                )} card-hover animate-slideIn`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-4xl">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold">{alert.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            alert.type === 'violation'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-orange-200 text-orange-800'
                          }`}
                        >
                          {alert.type === 'violation'
                            ? 'Violation'
                            : 'Delay'}
                        </span>
                      </div>
                      <p className="text-lg mb-2">{alert.message}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <span>📍</span>
                          <span className="font-medium">{alert.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>🕐</span>
                          <span>
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {alert.details.speed && (
                          <div className="flex items-center space-x-2">
                            <span>⚡</span>
                            <span>Speed: {alert.details.speed} km/h</span>
                          </div>
                        )}
                        {alert.details.stoppedMinutes && (
                          <div className="flex items-center space-x-2">
                            <span>⏱️</span>
                            <span>
                              Delay: {alert.details.stoppedMinutes} minutes
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAlert(alert)}
                    className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 hover:shadow-lg transition-all font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-text-dark">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-text-dark">
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {selectedAlert.type === 'violation' ? 'Violation' : 'Delay'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {selectedAlert.location}
                </span>
              </div>

              <div>
                <div className="font-semibold text-text-dark">Summary</div>
                <div className="text-text-light">{selectedAlert.message}</div>
              </div>

              {selectedAlert.type === 'violation' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold">Vehicle Type</div>
                    <div className="text-text-light">{selectedAlert.details.line ? 'Public Transport' : 'Car/Person'}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Reg Number</div>
                    <div className="text-text-light">
                      {selectedAlert.details.regNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Line</div>
                    <div className="text-text-light">
                      {selectedAlert.details.line || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Speed</div>
                    <div className="text-text-light">
                      {selectedAlert.details.speed != null
                        ? `${selectedAlert.details.speed} km/h`
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Street</div>
                    <div className="text-text-light">
                      {selectedAlert.details.street || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Sense</div>
                    <div className="text-text-light">
                      {selectedAlert.details.sense || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Timestamp</div>
                    <div className="text-text-light">
                      {formatDateTime(selectedAlert.timestamp)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold">Type</div>
                    <div className="text-text-light">
                      {selectedAlert.details.line ? 'Public Transport' : 'Delay'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Line</div>
                    <div className="text-text-light">
                      {selectedAlert.details.line || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Reg Number</div>
                    <div className="text-text-light">
                      {selectedAlert.details.regNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Station</div>
                    <div className="text-text-light">
                      {selectedAlert.details.station || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Stopped Minutes</div>
                    <div className="text-text-light">
                      {selectedAlert.details.stoppedMinutes ?? 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Expected Arrival</div>
                    <div className="text-text-light">
                      {formatDateTime(selectedAlert.details.expectedArrival)}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold">Actual Arrival</div>
                    <div className="text-text-light">
                      {formatDateTime(selectedAlert.details.actualArrival)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
