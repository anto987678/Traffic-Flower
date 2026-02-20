import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const GraphicsTab = ({ intersectionId }) => {
  const [volumeStats, setVolumeStats] = useState(null);
  const [semaphoreStatus, setSemaphoreStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [intersectionId]);

  const fetchData = async () => {
    try {
      const [statsResponse, semaphoreResponse] = await Promise.all([
        api.get(`/api/intersections/${intersectionId}/stats/volume`, {
          params: { days: 7 }
        }),
        api.get(`/api/intersections/${intersectionId}/semaphores/current`)
      ]);

      setVolumeStats(statsResponse.data);
      setSemaphoreStatus(semaphoreResponse.data);
    } catch (error) {
      console.error('Error fetching graphics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-text-dark">Loading graphics...</div>;
  }

  const chartData = [
    { name: 'Cars', value: volumeStats?.cars || 0 },
    { name: 'Buses', value: volumeStats?.buses || 0 },
    { name: 'Trams', value: volumeStats?.trams || 0 },
    { name: 'Troleibuses', value: volumeStats?.troleibuses || 0 },
    { name: 'Persons', value: volumeStats?.persons || 0 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Container */}
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 card-hover animate-fadeIn">
          <h3 className="text-xl font-bold text-text-dark mb-4">Traffic Volume</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#22C55E" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 card-hover animate-fadeIn">
            <p className="text-sm text-text-light mb-2">Total Cars</p>
            <p className="text-4xl font-bold text-accent-green">{volumeStats?.cars || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-6 border border-blue-100 card-hover">
            <p className="text-sm text-text-light mb-2">Total Buses</p>
            <p className="text-4xl font-bold text-blue-600">{volumeStats?.buses || 0}</p>
          </div>
        </div>
      </div>

      {/* Right Container - Intersection Schematic */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
        <h3 className="text-xl font-bold text-text-dark mb-4">Intersection Schematic</h3>
        <div className="relative h-96 flex items-center justify-center">
          {/* X-shaped intersection */}
          <div className="relative w-64 h-64">
            {/* Horizontal road */}
            <div className="absolute top-1/2 left-0 right-0 h-16 bg-gray-300 transform -translate-y-1/2 border-2 border-gray-400"></div>
            {/* Vertical road */}
            <div className="absolute left-1/2 top-0 bottom-0 w-16 bg-gray-300 transform -translate-x-1/2 border-2 border-gray-400"></div>
            
            {/* Semaphores positioned on the arms */}
            {semaphoreStatus.map((sem, index) => {
              const positions = [
                { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // North
                { top: '50%', right: '10%', transform: 'translateY(-50%)' }, // East
                { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }, // South
                { top: '50%', left: '10%', transform: 'translateY(-50%)' } // West
              ];
              const pos = positions[index % 4];
              
              return (
                <div
                  key={sem.id}
                  className="absolute"
                  style={pos}
                >
                  <div className={`w-8 h-8 rounded-full ${
                    sem.currentColor === 'RED' ? 'bg-red-500' :
                    sem.currentColor === 'GREEN' ? 'bg-green-500' :
                    sem.currentColor === 'YELLOW' ? 'bg-yellow-500' :
                    'bg-gray-400'
                  } border-2 border-white shadow-lg`}></div>
                  <div className="text-xs text-center mt-1 text-text-dark font-medium">
                    {sem.street}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicsTab;

