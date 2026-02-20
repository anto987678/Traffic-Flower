import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Monitoring = () => {
  const [intersections, setIntersections] = useState([]);
  const [selectedIntersection, setSelectedIntersection] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchIntersections();
  }, []);

  useEffect(() => {
    if (selectedIntersection) {
      fetchRealTimeData();
      const interval = setInterval(fetchRealTimeData, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedIntersection]);

  const fetchIntersections = async () => {
    try {
      setError('');
      const { data, error: dbError } = await supabase
        .from('INTERSECTION')
        .select('id, name, sector, lat, lng')
        .order('name');

      if (dbError) throw dbError;

      const intersectionData = data || [];
      setIntersections(intersectionData);
      if (intersectionData.length > 0) {
        setSelectedIntersection(intersectionData[0].id);
      } else {
        setSelectedIntersection(null);
        setError('No intersections available.');
      }
    } catch (error) {
      console.error('Error fetching intersections:', error);
      setError('Failed to load intersections.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    if (!selectedIntersection) return;

    try {
      setError('');
      const { data: semaphores } = await supabase
        .from('SEMAPHOR')
        .select('id')
        .eq('intersectionId', selectedIntersection);

      if (!semaphores || semaphores.length === 0) {
        setRealTimeData([]);
        return;
      }

      const data = [];
      const now = new Date();
      const minutes = 120;

      for (let i = minutes - 1; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        const timeLabel = time.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const timeStart = new Date(time);
        timeStart.setMinutes(timeStart.getMinutes() - 1);

        const semaphorIds = semaphores.map(s => s.id);

        const [
          { count: cars },
          { count: buses },
          { count: trams },
          { count: troleibuses }
        ] = await Promise.all([
          supabase.from('CROSSING_CAR').select('*', { count: 'exact', head: true })
            .in('semaphorId', semaphorIds)
            .gte('timestamp', timeStart.toISOString())
            .lt('timestamp', time.toISOString()),
          supabase.from('CROSSING_BUS').select('*', { count: 'exact', head: true })
            .in('semaphorId', semaphorIds)
            .gte('timestamp', timeStart.toISOString())
            .lt('timestamp', time.toISOString()),
          supabase.from('CROSSING_TRAM').select('*', { count: 'exact', head: true })
            .in('semaphorId', semaphorIds)
            .gte('timestamp', timeStart.toISOString())
            .lt('timestamp', time.toISOString()),
          supabase.from('CROSSING_TROLEIBUS').select('*', { count: 'exact', head: true })
            .in('semaphorId', semaphorIds)
            .gte('timestamp', timeStart.toISOString())
            .lt('timestamp', time.toISOString())
        ]);

        data.push({
          time: timeLabel,
          cars: cars || 0,
          buses: buses || 0,
          trams: trams || 0,
          troleibuses: troleibuses || 0,
          total: (cars || 0) + (buses || 0) + (trams || 0) + (troleibuses || 0)
        });
      }

      setRealTimeData(data);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      setError('Failed to load monitoring data.');
    }
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // or navigate('/login') if you prefer
  };

  const selectedIntersectionData = intersections.find(
    (i) => i.id === selectedIntersection
  );
  const totals = realTimeData.reduce(
    (acc, row) => ({
      cars: acc.cars + (row.cars || 0),
      buses: acc.buses + (row.buses || 0),
      trams: acc.trams + (row.trams || 0),
      troleibuses: acc.troleibuses + (row.troleibuses || 0)
    }),
    { cars: 0, buses: 0, trams: 0, troleibuses: 0 }
  );
  const totalVehicles =
    totals.cars + totals.buses + totals.trams + totals.troleibuses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
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
              onClick={() => navigate('/reports')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Reports
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Analytics
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Traffic Monitoring
          </h2>
          <p className="text-gray-600">Monitor traffic flow and statistics</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Select Intersection
          </label>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {intersections.map((intersection) => (
              <button
                key={intersection.id}
                onClick={() => setSelectedIntersection(intersection.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedIntersection === intersection.id
                    ? 'border-emerald-600 bg-emerald-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-800">
                  {intersection.name}
                </p>
                <p className="text-sm text-gray-600">
                  Sector {intersection.sector}
                </p>
              </button>
            ))}
          </div>
        </div>

        {selectedIntersectionData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Traffic Flow - {selectedIntersectionData.name}
              </h3>
              {realTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={realTimeData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#22C55E"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22C55E"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#22C55E"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Collecting data...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🚗</span>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Total Vehicles (2h)</p>
                    <p className="text-3xl font-bold">
                      {totalVehicles}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🚌</span>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Buses (2h)</p>
                    <p className="text-3xl font-bold">
                      {totals.buses}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">🚋</span>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Trams (2h)</p>
                    <p className="text-3xl font-bold">
                      {totals.trams}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Status</p>
                    <p className="text-sm text-gray-600">Monitoring active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Monitoring;
