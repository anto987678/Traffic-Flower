// client/src/pages/Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Signup = () => {
  const [form, setForm] = useState({
    email: '',
    name: '',
    username: '',
    password: '',
    repeatPassword: '',
  });
  const [alert, setAlert] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert('');
    setSuccess('');

    try {
      const res = await api.post('/api/signup/register', form);
      if (res.data.alert === 'error') {
        setAlert(res.data.message);
      } else {
        setSuccess(res.data.message);
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setAlert(
        err.response?.data?.message || 'Signup failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <div className="bg-white/90 rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="mb-4 text-center text-[48px] font-normal">Sign up</h2>   

        <div className="text-text-light text-center">
          Traffic Flower. Your ultimate traffic management solution
        </div>
        
        <div className="text-4xl mb-4 text-center">🌺</div>

        {alert && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {alert}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-[18px] font-semibold">Name</label>
          <input
            name="name"
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <label className="text-[18px] font-semibold">Username</label>
          <input
            name="username"
            placeholder="Enter username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <label className="text-[18px] font-semibold">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <label className="text-[18px] font-semibold">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <label className="text-[18px] font-semibold">Repeat Password</label>
          <input
            name="repeatPassword"
            type="password"
            placeholder="Repeat password"
            value={form.repeatPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
          >
            Create Account
          </button>

          <p className="text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;