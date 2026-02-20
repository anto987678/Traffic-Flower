import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SchedulesTab = ({ intersectionId }) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [intersectionId]);

  const fetchSchedule = async () => {
    try {
      const response = await api.get(`/api/intersections/${intersectionId}/schedule`, {
        params: { days: 7 }
      });
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-text-dark">Loading schedule...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
      <h3 className="text-xl font-bold text-text-dark mb-6">Public Transport Schedule</h3>
      
      {schedule.length === 0 ? (
        <p className="text-text-light">No schedule data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-text-dark">Line</th>
                <th className="text-left py-3 px-4 font-semibold text-text-dark">Reg Number</th>
                <th className="text-left py-3 px-4 font-semibold text-text-dark">Expected Arrival</th>
                <th className="text-left py-3 px-4 font-semibold text-text-dark">Calendar</th>
                <th className="text-left py-3 px-4 font-semibold text-text-dark">Stopped Minutes</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => (
                (() => {
                  const isDelayed = item.stoppedMinutes >= 3;
                  return (
                <tr
                  key={index}
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } ${
                    isDelayed ? 'text-alert-red' : 'text-text-dark'
                  }`}
                >
                  <td className="py-3 px-4">{item.line}</td>
                  <td className="py-3 px-4">{item.regNumber}</td>
                  <td className="py-3 px-4">{formatDate(item.expectedArrival)}</td>
                  <td className="py-3 px-4">
                    {new Date(item.expectedArrival).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold">{item.stoppedMinutes}</td>
                </tr>
                  );
                })()
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;

