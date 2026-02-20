import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('congestion');
  const [congestionData, setCongestionData] = useState([]);
  const [violationsData, setViolationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeReport === 'congestion') {
      fetchCongestion();
    } else {
      fetchViolations();
    }
  }, [activeReport]);

  const fetchCongestion = async () => {
    setLoading(true);
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from('STOPPED_BUS')
        .select(`
          stoppedMinutes,
          expectedArrival,
          actualArrival,
          BUS_STATION!inner(name, intersectionId),
          BUS!inner(line, regNr)
        `)
        .gte('actualArrival', sevenDaysAgo.toISOString())
        .limit(20)
        .order('stoppedMinutes', { ascending: false });

      setCongestionData(
        (data || []).map(item => ({
          intersection: item.BUS_STATION?.name || 'Unknown',
          type: 'Bus',
          line: item.BUS?.line || 'N/A',
          regNumber: item.BUS?.regNr || 'N/A',
          station: item.BUS_STATION?.name || 'Unknown',
          stoppedMinutes: item.stoppedMinutes || 0,
          expectedArrival: item.expectedArrival,
          actualArrival: item.actualArrival,
          timestamp: item.actualArrival
        }))
      );
    } catch (error) {
      console.error('Error fetching congestion:', error);
      setCongestionData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    setLoading(true);
    try {
      setViolationsData(
        Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          intersection: `Intersection ${i + 1}`,
          type: 'Red Light',
          timestamp: new Date(Date.now() - i * 3600000).toISOString(),
          speed: Math.floor(Math.random() * 30) + 50
        }))
      );
    } catch (error) {
      console.error('Error fetching violations:', error);
      setViolationsData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // redirect to home (or '/login' if you prefer)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Enhanced Header */}
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
              onClick={() => navigate('/')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Map
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Analytics
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
              onClick={handleLogout}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Log Out
            </button>
          </nav>
        </div>
      </header>

      {/* Enhanced Reports Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold text-text-dark mb-4">Reports</h2>

          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveReport('congestion')}
              className={`px-6 py-3 font-medium transition-all rounded-t-lg ${
                activeReport === 'congestion'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'text-text-light hover:text-text-dark bg-white/50 hover:bg-white/80'
              }`}
            >
              Most Delayed Public Transport
            </button>
            <button
              onClick={() => setActiveReport('violations')}
              className={`px-6 py-3 font-medium transition-colors rounded-t-lg ${
                activeReport === 'violations'
                  ? 'bg-accent-green text-white'
                  : 'text-text-light hover:text-text-dark bg-gray-100'
              }`}
            >
              Recent Red Light Crossing Violations
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-text-dark">Loading...</div>
        ) : activeReport === 'congestion' ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
            <h3 className="text-xl font-bold text-text-dark mb-6">
              Most Delayed Public Transport
            </h3>
            {congestionData.length === 0 ? (
              <p className="text-text-light">No congestion data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Line
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Reg Number
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Intersection
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Station
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Stopped Minutes
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Expected Arrival
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Actual Arrival
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {congestionData.map((item, index) => (
                      (() => {
                        const isDelayed = item.stoppedMinutes >= 3;
                        return (
                          <tr
                            key={index}
                            className={`border-b border-gray-100 ${
                              index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                            } ${isDelayed ? 'text-alert-red' : 'text-text-dark'}`}
                          >
                            <td className="py-3 px-4">{item.type}</td>
                            <td className="py-3 px-4">{item.line}</td>
                            <td className="py-3 px-4">{item.regNumber}</td>
                            <td className="py-3 px-4">{item.intersection}</td>
                            <td className="py-3 px-4">{item.station}</td>
                            <td
                              className={`py-3 px-4 font-semibold ${
                                isDelayed ? 'text-alert-red' : 'text-text-dark'
                              }`}
                            >
                              {item.stoppedMinutes}
                            </td>
                            <td className="py-3 px-4">
                              {formatDate(item.expectedArrival)}
                            </td>
                            <td className="py-3 px-4">
                              {formatDate(item.actualArrival)}
                            </td>
                          </tr>
                        );
                      })()
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
            <h3 className="text-xl font-bold text-text-dark mb-6">
              Recent Red Light Crossing Violations
            </h3>
            {violationsData.length === 0 ? (
              <p className="text-text-light">No violations data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Intersection
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Street
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Sense
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Timestamp
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-dark">
                        Speed (km/h)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {violationsData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={`border-b border-gray-100 ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-4">{item.type || 'N/A'}</td>
                        <td className="py-3 px-4">{item.intersection}</td>
                        <td className="py-3 px-4">{item.street}</td>
                        <td className="py-3 px-4">{item.sense}</td>
                        <td className="py-3 px-4">
                          {formatDate(item.timestamp)}
                        </td>
                        <td className="py-3 px-4">{item.speed || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
