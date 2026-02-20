// client/src/pages/Settings.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    violations: true,
    delays: true,
    weeklyReport: false,
  });

  const [theme, setTheme] = useState('light');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // redirect to home (or '/login' if you want)
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    setDeleteError('');
    setIsDeleting(true);

    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      setDeleteError(
        error.response?.data?.message ||
          'Failed to delete account. Please try again.'
      );
    } finally {
      setIsDeleting(false);
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
              onClick={() => navigate('/reports')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Reports
            </button>
            <button
              onClick={() => navigate('/alerts')}
              className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10"
            >
              Alerts
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text-dark mb-2">Settings</h2>
          <p className="text-text-light">Manage your account and preferences</p>
        </div>

        {/* Profile Section from AuthContext */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-bold text-text-dark mb-4">
            Profile Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                readOnly
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-text-dark"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-bold text-text-dark mb-4">
            Notification Preferences
          </h3>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-text-dark capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-text-light">
                    {key === 'email' && 'Receive notifications via email'}
                    {key === 'push' && 'Enable browser push notifications'}
                    {key === 'violations' &&
                      'Get alerts for traffic violations'}
                    {key === 'delays' &&
                      'Get alerts for public transport delays'}
                    {key === 'weeklyReport' &&
                      'Receive weekly traffic summary'}
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-bold text-text-dark mb-4">Appearance</h3>
          <div className="flex space-x-4">
            {['light', 'dark', 'auto'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  theme === t
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-text-dark hover:bg-gray-200'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h3>
          <p className="text-red-700 mb-4">
            Permanently delete your account and all associated data.
          </p>
          {deleteError && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg p-3">
              {deleteError}
            </div>
          )}
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className={`px-6 py-2 text-white rounded-lg transition-colors font-medium ${
              isDeleting
                ? 'bg-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
