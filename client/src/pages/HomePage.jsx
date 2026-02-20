import roadTraffic from '../assets/traffic-light-icon.svg';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

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
            <button onClick={() => navigate('/login')} className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10">Log in</button>
            <button onClick={() => navigate('/signup')} className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10">Sign Up</button>
            <button onClick={() => navigate('/aboutus')} className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10">About Us</button>
            <button onClick={() => navigate('/help')} className="hover:text-emerald-300 transition-colors px-3 py-1 rounded-lg hover:bg-white/10">Help</button>
          </nav>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 mt-16 flex items-center gap-12">

        <div className="flex-1 max-w-[600px]">
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Smarter Traffic.
            <br />
            Better Cities.
          </h2>

          <p className="mt-4 text-gray-600 text-lg">
            Monitor traffic flow, public transport, and intersections in real time
            using intelligent analytics and live data.
          </p>
        </div>

        <div className="flex-shrink-0 mr-16 w-[360px] md:w-[420px] lg:w-[480px] drop-shadow-[0_40px_80px_rgb(221,160,221)]">
            <img
            src={roadTraffic}
            alt="Traffic light illustration"
            className="w-full h-auto"
        />
        </div>


      </div>
    </div>
  );
};

export default HomePage;
