// client/src/pages/Help.jsx
import roadTraffic from '../assets/traffic-light-icon.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Help = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // or navigate('/login') if you prefer
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
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
              Home
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-16">
        <h1 className="text-5xl font-bold text-gray-900">Help</h1>

        <p className="mt-4 text-gray-600 text-lg">
          Welcome to <strong>Traffic Flower</strong> 🌸
        </p>

        <p className="mt-2 text-gray-600 text-lg">
          This page will help you understand how to use the main features of the
          application and navigate the platform efficiently.
        </p>

        <h2 className="mt-12 text-3xl font-bold text-gray-800 underline">
          Getting Started
        </h2>

        <h3 className="mt-6 text-2xl font-semibold text-gray-700">
          Logging In
        </h3>

        <ul className="mt-4 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>Use your registered email and password to log in.</li>
          <li>
            If you do not have an account, create one using the{' '}
            <strong>Sign Up</strong> page.
          </li>
          <li>All features of the application require authentication.</li>
        </ul>

        <h2 className="mt-14 text-3xl font-bold text-gray-800 underline">
          Main Features Overview
        </h2>

        <h3 className="mt-6 text-2xl font-semibold text-gray-700">
          City Map Dashboard
        </h3>

        <p className="mt-3 text-gray-600 text-lg">
          The City Map is the main entry point of the application.
        </p>

        <ul className="mt-4 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>Displays all monitored intersections on an interactive map.</li>
          <li>Each intersection is marked with a green location pin.</li>
          <li>You can zoom, pan, and search the map.</li>
          <li>Click on a pin to open the Intersection Dashboard.</li>
        </ul>

        {/* Intersection Dashboard */}
        <h3 className="mt-10 text-2xl font-semibold text-gray-700">
          Intersection Dashboard
        </h3>

        <p className="mt-3 text-gray-600 text-lg">
          Each intersection provides detailed traffic information organized into
          three tabs.
        </p>

        <h4 className="mt-6 text-xl font-semibold text-gray-700">
          Graphics Tab
        </h4>

        <ul className="mt-3 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>
            Traffic volume charts for cars, buses, trams, trolleybuses, and
            pedestrians.
          </li>
          <li>Summary cards showing total vehicle counts.</li>
          <li>
            Interactive intersection schematic with real-time semaphore status.
          </li>
        </ul>

        <h4 className="mt-6 text-xl font-semibold text-gray-700">
          Schedules Tab
        </h4>

        <ul className="mt-3 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>Public transport schedule table.</li>
          <li>
            Shows line number, registration number, expected arrival, and
            stopped minutes.
          </li>
          <li>Delayed vehicles are highlighted in red.</li>
        </ul>

        <h4 className="mt-6 text-xl font-semibold text-gray-700">
          Calendar Tab
        </h4>

        <ul className="mt-3 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>Select a date to view historical traffic data.</li>
          <li>Daily summary of traffic violations and total vehicle count.</li>
          <li>Hourly traffic activity bar chart.</li>
        </ul>

        <h2 className="mt-14 text-3xl font-bold text-gray-800 underline">
          Reports
        </h2>

        <ul className="mt-6 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>
            <strong>Most Delayed Public Transport</strong> – lists vehicles with
            the highest delays.
          </li>
          <li>
            <strong>Traffic Violations</strong> – shows recent red-light
            crossing events.
          </li>
        </ul>

        <h2 className="mt-14 text-3xl font-bold text-gray-800 underline">
          Troubleshooting
        </h2>

        <ul className="mt-6 list-disc pl-6 text-gray-600 text-lg space-y-2">
          <li>If a page does not load, try refreshing the browser.</li>
          <li>Make sure you are logged in before accessing protected pages.</li>
          <li>Some data depends on the selected date or intersection.</li>
        </ul>

        <p className="mt-16 mb-12 text-gray-600 text-lg">
          This project was developed by <strong>FILS UPB Year 2 students</strong>{' '}
          as part of a database-focused academic project. Thank you for using
          Traffic Flower 🌸
        </p>
      </div>
    </div>
  );
};

export default Help;