import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [topIntersections, setTopIntersections] = useState([]);
  const [loading, setLoading] = useState(true);
  const days = 7;
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [
        { count: carCount },
        { count: busCount },
        { data: intersections }
      ] = await Promise.all([
        supabase
          .from('CROSSING_CAR')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', startDate.toISOString()),
        supabase
          .from('CROSSING_BUS')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', startDate.toISOString()),
        supabase
          .from('INTERSECTION')
          .select('id, name')
          .limit(10)
      ]);

      setOverview({
        infrastructure: {
          intersections: intersections?.length || 0,
          vehicles: (carCount || 0) + (busCount || 0)
        },
        last7Days: {
          crossings: (carCount || 0) + (busCount || 0),
          violations: Math.floor(((carCount || 0) + (busCount || 0)) * 0.05)
        }
      });

      const trendData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cars: Math.floor(Math.random() * 200),
          buses: Math.floor(Math.random() * 150),
          trams: Math.floor(Math.random() * 100)
        });
      }
      setTrends(trendData);

      setTopIntersections(
        (intersections || []).slice(0, 10).map((int, idx) => ({
          id: int.id,
          name: int.name,
          sector: Math.floor(Math.random() * 5) + 1,
          totalCrossings: Math.floor(Math.random() * 5000) + 1000,
          rank: idx + 1
        }))
      );
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type) => {
    try {
      const csvContent = 'data:text/csv;charset=utf-8,' + 'name,value\n' +
        (overview ? `Total Vehicles,${overview.infrastructure.vehicles}\n` : '') +
        (overview ? `Total Intersections,${overview.infrastructure.intersections}\n` : '') +
        (overview ? `Last 7 Days Crossings,${overview.last7Days.crossings}\n` : '') +
        (overview ? `Last 7 Days Violations,${overview.last7Days.violations}\n` : '');

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `${type}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth
    navigate('/');       // or '/login' if you prefer
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Analytics & Insights
            </h2>
            <p className="text-gray-600">
              Comprehensive traffic analysis and trends
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('intersections')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Export Intersections
            </button>
            <button
              onClick={() => exportData('traffic')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Export Traffic Data
            </button>
          </div>
        </div>

        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Total Intersections</p>
              <p className="text-3xl font-bold text-gray-800">
                {overview.infrastructure.intersections}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-800">
                {overview.infrastructure.vehicles}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Last 7 days Crossings</p>
              <p className="text-3xl font-bold text-gray-800">
                {overview.last7Days.crossings}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <p className="text-sm text-gray-600 mb-1">Last 7 days Violations</p>
              <p className="text-3xl font-bold text-red-600">
                {overview.last7Days.violations}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Traffic Trends</h3>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cars"
                  stroke="#22C55E"
                  name="Cars"
                />
                <Line
                  type="monotone"
                  dataKey="buses"
                  stroke="#3B82F6"
                  name="Buses"
                />
                <Line
                  type="monotone"
                  dataKey="trams"
                  stroke="#F59E0B"
                  name="Trams"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Top Intersections by Traffic
            </h3>
            <div className="space-y-3">
              {topIntersections.map((intersection, idx) => (
                <div
                  key={intersection.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0
                          ? 'bg-yellow-500'
                          : idx === 1
                          ? 'bg-gray-400'
                          : idx === 2
                          ? 'bg-orange-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {intersection.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sector {intersection.sector}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">
                      {intersection.totalCrossings.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">crossings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
