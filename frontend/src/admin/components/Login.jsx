import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const inputCls = "w-full focus:outline-none text-gray-700 bg-transparent text-sm";

const Field = ({ icon, children }) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-gray-400 transition">
    <span className="text-lg">{icon}</span>
    {children}
  </div>
);

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/user/admin`, { email, password });
      if (res.data.success) {
        setToken(res.data.token, 'admin');
        toast.success('Admin logged in!');
      } else {
        toast.error(res.data.message);
      }
    } catch { toast.error('Connection error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
      <div className="fixed top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl px-10 py-10 max-w-md w-full border border-green-100">
        <div className="text-center mb-8">
          <a href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition mb-4 justify-start">
            ← Back to Homepage
          </a>
          <div className="text-5xl mb-3">♻️</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-gray-500 text-sm mt-1">EcoCycleHub Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <Field icon="✉️">
            <input type="email" placeholder="Admin email" value={email}
              onChange={e => setEmail(e.target.value)} className={inputCls} required />
          </Field>
          <Field icon="🔒">
            <input type="password" placeholder="Admin password" value={password}
              onChange={e => setPassword(e.target.value)} className={inputCls} required />
          </Field>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
            {loading ? '...' : '🔐 Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
