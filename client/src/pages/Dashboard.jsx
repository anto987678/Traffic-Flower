import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [weeklyTraffic, setWeeklyTraffic] = useState([]);
  const [vehicleDistribution, setVehicleDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const results = await Promise.allSettled([
        supabase
          .from('CROSSING_CAR')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', sevenDaysAgo.toISOString()),
        supabase
          .from('CROSSING_BUS')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', sevenDaysAgo.toISOString()),
        supabase
          .from('CROSSING_TRAM')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', sevenDaysAgo.toISOString()),
        supabase
          .from('CROSSING_TROLEIBUS')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', sevenDaysAgo.toISOString()),
        supabase
          .from('INTERSECTION')
          .select('id'),
        supabase
          .from('STOPPED_BUS')
          .select('stoppedMinutes')
          .gte('actualArrival', sevenDaysAgo.toISOString())
      ]);

      const carCount = results[0]?.value?.count || 0;
      const busCount = results[1]?.value?.count || 0;
      const tramCount = results[2]?.value?.count || 0;
      const troleibusCount = results[3]?.value?.count || 0;
      const intersections = results[4]?.value?.data || [];
      const delays = results[5]?.value?.data || [];

      const totalVehicles = carCount + busCount + tramCount + troleibusCount;
      const totalDelayMinutes = delays.reduce((sum, d) => sum + (d?.stoppedMinutes || 0), 0);

      setStats({
        totalIntersections: intersections.length,
        totalDelays: totalDelayMinutes,
        totalViolations: Math.floor(totalVehicles * 0.05),
        avgDelay: delays.length > 0 ? Math.round(totalDelayMinutes / delays.length) : 0,
        activeAlerts: 0
      });

      setRecentActivity([
        { type: 'violation', message: 'Red light violation detected', time: new Date().toLocaleTimeString(), severity: 'high' },
        { type: 'delay', message: 'Bus delay at intersection', time: new Date().toLocaleTimeString(), severity: 'medium' }
      ]);

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setWeeklyTraffic(days.map(day => ({
        name: day,
        vehicles: Math.floor(Math.random() * 100),
        violations: Math.floor(Math.random() * 10)
      })));

      setVehicleDistribution([
        { name: 'Cars', value: carCount, color: '#22C55E' },
        { name: 'Buses', value: busCount, color: '#3B82F6' },
        { name: 'Trams', value: tramCount, color: '#F59E0B' },
        { name: 'Troleibuses', value: troleibusCount, color: '#8B5CF6' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalIntersections: 0,
        totalDelays: 0,
        totalViolations: 0,
        avgDelay: 0,
        activeAlerts: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears user/localStorage
    navigate('/');       // redirect to home
  };

  const chartData = weeklyTraffic;
  const pieData = vehicleDistribution;
  const pieTotal = pieData.reduce((sum, entry) => sum + entry.value, 0);

  const renderPieLabel = ({ name, percent, value }) => {
    if (!value || !percent || percent < 0.05) return '';
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  const pieLegendPayload = pieData.map((entry) => ({
    value: `${entry.name} ${entry.value}`,
    type: 'square',
    color: entry.color
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-green mx-auto mb-4" />
          <p className="text-text-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Header */}
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
              onClick={() => navigate('/analytics')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Analytics
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl shadow-xl p-6 card-hover border-2 border-indigo-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 mb-1 font-medium">
                  Total Intersections
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {stats?.totalIntersections || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-xl p-6 card-hover border-2 border-orange-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 mb-1 font-medium">
                  Total Delays
                </p>
                <p className="text-3xl font-bold text-orange-900">
                  {stats?.totalDelays || 0} min
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl shadow-xl p-6 card-hover border-2 border-red-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 mb-1 font-medium">
                  Violations
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats?.totalViolations || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-xl p-6 card-hover border-2 border-blue-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 mb-1 font-medium">
                  Avg Delay
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats?.avgDelay || 0} min
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl shadow-xl p-6 card-hover border-2 border-emerald-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 mb-1 font-medium">
                  Active Alerts
                </p>
                <p className="text-3xl font-bold text-emerald-900">
                  {stats?.activeAlerts || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🔔</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
            <h3 className="text-xl font-bold text-text-dark mb-4">
              Weekly Traffic Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{ fill: '#22C55E', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="violations"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
            <h3 className="text-xl font-bold text-text-dark mb-4">
              Vehicle Distribution
            </h3>
            {pieTotal === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-text-light">
                No vehicle data for this week
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend payload={pieLegendPayload} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
          <h3 className="text-xl font-bold text-text-dark mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-text-light text-center py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.severity === 'high'
                          ? 'bg-red-500 animate-pulse'
                          : activity.severity === 'medium'
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-text-dark">
                        {activity.message}
                      </p>
                      <p className="text-sm text-text-light">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      activity.type === 'violation'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {activity.type === 'violation' ? 'Violation' : 'Delay'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
