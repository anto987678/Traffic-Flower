import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import GraphicsTab from '../components/IntersectionTabs/GraphicsTab';
import SchedulesTab from '../components/IntersectionTabs/SchedulesTab';
import CalendarTab from '../components/IntersectionTabs/CalendarTab';

const IntersectionDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [intersection, setIntersection] = useState(null);
  const [activeTab, setActiveTab] = useState('graphics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntersection();
  }, [id]);

  const fetchIntersection = async () => {
    try {
      const intersectionId = parseInt(id, 10);

      const [
        { data: intersection, error: intError },
        { data: semaphores },
        { data: busStations },
        { data: tramStations },
        { data: troleibusStations }
      ] = await Promise.all([
        supabase
          .from('INTERSECTION')
          .select('id, name, sector, lat, lng')
          .eq('id', intersectionId)
          .maybeSingle(),
        supabase
          .from('SEMAPHOR')
          .select('id, type, street, sense')
          .eq('intersectionId', intersectionId),
        supabase
          .from('BUS_STATION')
          .select('id, name, intersectionId')
          .eq('intersectionId', intersectionId),
        supabase
          .from('TRAM_STATION')
          .select('id, name, intersectionId')
          .eq('intersectionId', intersectionId),
        supabase
          .from('TROLEIBUS_STATION')
          .select('id, name, intersectionId')
          .eq('intersectionId', intersectionId)
      ]);

      if (intError) throw intError;
      if (!intersection) {
        console.error('Intersection not found');
        setLoading(false);
        return;
      }

      const stations = [
        ...(busStations || []).map(s => ({ ...s, type: 'BUS' })),
        ...(tramStations || []).map(s => ({ ...s, type: 'TRAM' })),
        ...(troleibusStations || []).map(s => ({ ...s, type: 'TROLEIBUS' }))
      ];

      setIntersection({
        ...intersection,
        semaphores: semaphores || [],
        stations
      });
    } catch (error) {
      console.error('Error fetching intersection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // redirect to home (or '/login' if you prefer)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!intersection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800 text-xl mb-4">Intersection not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Back to Map
          </button>
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
              onClick={() => navigate('/dashboard')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Dashboard
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

      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Intersection {intersection.name} - Sector {intersection.sector}
          </h2>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
            <span>Semaphores: {intersection.semaphores?.length || 0}</span>
            <span>Stations: {intersection.stations?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {['graphics', 'schedules', 'calendar'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-emerald-600 text-white rounded-t-lg shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'graphics' && <GraphicsTab intersectionId={id} />}
        {activeTab === 'schedules' && <SchedulesTab intersectionId={id} />}
        {activeTab === 'calendar' && <CalendarTab intersectionId={id} />}
      </div>
    </div>
  );
};

export default IntersectionDashboard;