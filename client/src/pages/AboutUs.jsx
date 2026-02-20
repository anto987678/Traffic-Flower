// client/src/pages/AboutUs.jsx
import roadTraffic from '../assets/traffic-light-icon.svg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AboutUs = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();      // calls /api/signup/logout and clears auth state
    navigate('/');       // or '/login' if you prefer
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

      <div className="max-w-[1400px] mx-auto px-8 mt-16 flex items-center gap-12">
        <div className="flex-1 max-w-[600px]">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            About us
          </h1>

          <p className="mt-4 text-gray-600 text-lg">
            Traffic Flower is a Smart City Traffic Monitoring SaaS developed as a
            database-focused full-stack project by a team of four second-year
            students from FILS, University Politehnica of Bucharest (UPB).
          </p>

          <br />

          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            Mission
          </h3>

          <p className="mt-4 text-gray-600 text-lg">
            Traffic Flower provides a comprehensive view of urban traffic by
            combining:
          </p>

          <ul className="mt-4 text-gray-600 text-lg">
            <li className="mb-2">• real-time traffic flow visualization</li>
            <li className="mb-2">• public transport schedules and delays</li>
            <li className="mb-2">• traffic light (semaphore) monitoring</li>
            <li className="mb-2">• traffic violation tracking</li>
            <li className="mb-2">
              • and analytical reports for decision support
            </li>
          </ul>

          <br />

          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            Technical details
          </h3>

          <p className="mt-4 text-gray-600 text-lg">
            From a technical perspective, the application follows a full-stack
            architecture, using a MySQL relational database, a Node.js /
            Express backend, and a React-based frontend.
          </p>

          <br />

          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            Motivation
          </h3>

          <p className="mt-4 text-gray-600 text-lg">
            Beyond fulfilling academic requirements, this project reflects our
            interest in smart city technologies, data-driven systems, and
            practical software engineering practices, including authentication,
            role-based access, API design, and responsive UI development.
          </p>

          <br />

          <h3 className="text-2xl font-bold text-gray-900 leading-tight">
            Conclusion
          </h3>

          <p className="mt-4 text-gray-600 text-lg">
            Traffic Flower represents both a learning experience and a portfolio
            project, demonstrating how database systems can be applied to solve
            real-world urban challenges.
          </p>

          <br />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;