import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CalendarTab = ({ intersectionId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 6);

  useEffect(() => {
    fetchHistory();
  }, [intersectionId, selectedDate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (!isWithinLastSevenDays(selectedDate)) {
        setHistoryData(null);
        return;
      }
      const response = await api.get(`/api/intersections/${intersectionId}/history`, {
        params: { date: selectedDate }
      });
      setHistoryData(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryData(null);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    return (
      day !== null &&
      day === today.getDate() &&
      selected.getMonth() === today.getMonth() &&
      selected.getFullYear() === today.getFullYear()
    );
  };

  const toDateOnly = (value) => {
    const date = value instanceof Date ? new Date(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const isWithinLastSevenDays = (value) => {
    const date = toDateOnly(value);
    if (!date) return false;
    return date >= minDate && date <= today;
  };

  const handleDateClick = (day) => {
    if (day === null) return;
    const date = new Date(selectedDate);
    date.setDate(day);
    if (!isWithinLastSevenDays(date)) return;
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const days = getDaysInMonth(selectedDate);
  const dateObj = new Date(selectedDate);
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Card - Calendar */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
        <h3 className="text-xl font-bold text-text-dark mb-4">{monthName}</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-text-light py-2">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            (() => {
              const dateValue = day === null ? null : new Date(dateObj.getFullYear(), dateObj.getMonth(), day);
              const isDisabled = day === null || !isWithinLastSevenDays(dateValue);
              return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`py-2 rounded-lg transition-colors ${
                day === null
                  ? ''
                  : isToday(day)
                  ? 'bg-accent-green text-white font-semibold'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100 text-text-dark'
              }`}
              disabled={isDisabled}
            >
              {day}
            </button>
              );
            })()
          ))}
        </div>
      </div>

      {/* Right Card - Daily Summary */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 animate-fadeIn">
        <h3 className="text-xl font-bold text-text-dark mb-4">Daily Summary</h3>
        
        {loading ? (
          <div className="text-text-light">Loading...</div>
        ) : historyData ? (
          <div className="space-y-6">
            {/* Violations Section */}
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Traffic Violations</h4>
              <div className="flex items-center space-x-2 text-alert-red">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  Red-light crossings: {historyData.violations} total
                </span>
              </div>
              <div className="mt-2 text-sm text-text-light">
                Cars: {historyData.violationsByType?.cars ?? 0}, Buses:{' '}
                {historyData.violationsByType?.buses ?? 0}, Trams:{' '}
                {historyData.violationsByType?.trams ?? 0}, Troleibuses:{' '}
                {historyData.violationsByType?.troleibuses ?? 0}, People:{' '}
                {historyData.violationsByType?.persons ?? 0}
              </div>
            </div>

            {/* Stats Section */}
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Total vehicles: {historyData.totalVehicles}</h4>
            </div>

            {/* Mini Chart */}
            <div>
              <h4 className="font-semibold text-text-dark mb-3">Hourly Activity</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={historyData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-text-light">No data available for this date</div>
        )}
      </div>
    </div>
  );
};

export default CalendarTab;

