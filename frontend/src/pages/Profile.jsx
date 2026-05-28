import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const levelConfig = {
  Gold:   { bg: 'from-yellow-400 to-amber-500',  icon: '🥇', ring: 'ring-yellow-400' },
  Silver: { bg: 'from-gray-300 to-gray-500',      icon: '🥈', ring: 'ring-gray-400'   },
  Bronze: { bg: 'from-amber-600 to-amber-800',    icon: '🥉', ring: 'ring-amber-600'  },
  None:   { bg: 'from-green-400 to-emerald-600',  icon: '🌱', ring: 'ring-green-400'  },
}

const Profile = () => {
  const { token, backendUrl, navigate, currency, setToken, setCartItems } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [rewards, setRewards] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const load = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/user/me', { headers: { token } });
        if (!res.data.success) { toast.error(res.data.message); return; }
        setUser(res.data.user);
        setRewards(res.data.rewards);
        setRecentOrders(res.data.recentOrders || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token'); setToken(''); setCartItems({});
          toast.error('Session expired.'); navigate('/login');
        } else toast.error('Failed to load profile');
      } finally { setLoading(false); }
    };
    load();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl animate-spin-slow mb-4">♻️</div>
        <p className="text-xl text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    </div>
  );

  if (!user) return null;

  const lvl = levelConfig[rewards?.level] || levelConfig.None;
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 pb-20 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${lvl.bg} h-40 relative`}>
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10 -mt-16">

        {/* Avatar Card */}
        <div className="backdrop-blur-xl bg-white/90 border border-white/30 rounded-3xl shadow-2xl p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-end gap-5">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${lvl.bg} flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ${lvl.ring} ring-offset-2 shrink-0`}>
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-black text-gray-800">{user.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${lvl.bg} shadow-sm`}>
                {lvl.icon} {rewards?.level || 'None'} Member
              </span>
              {rewards?.points > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                  🌟 {rewards.points} pts
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => navigate('/orders')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              📦 Orders
            </button>
            <button onClick={() => navigate('/rewards')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all">
              🏅 Rewards
            </button>
          </div>
        </div>

        {/* Points Breakdown */}
        {rewards && (
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🌿 Eco Points Breakdown</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Login', pts: rewards.loginPoints, icon: '🔐', color: 'from-blue-400 to-cyan-500' },
                { label: 'Orders', pts: rewards.orderPoints, icon: '🛍️', color: 'from-purple-400 to-pink-500' },
                { label: 'Recycle', pts: rewards.recyclePoints, icon: '♻️', color: 'from-green-400 to-emerald-500' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl overflow-hidden shadow-md hover:-translate-y-1 transition-transform duration-200">
                  <div className={`bg-gradient-to-br ${item.color} p-3 text-center`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <p className="text-xl font-black text-gray-800">{item.pts}</p>
                    <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress to Gold (200 pts)</span>
                <span>{rewards.points} / 200</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${lvl.bg} rounded-full transition-all duration-1000`}
                     style={{ width: `${Math.min((rewards.points / 200) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '♻️', label: 'My Submissions', sub: 'Recycle & repair history', path: '/recycle-history', color: 'from-green-500 to-emerald-600' },
            { icon: '📍', label: 'Centers Near Me', sub: 'Find drop-off points', path: '/centers', color: 'from-blue-500 to-cyan-600' },
            { icon: '🛒', label: 'Buyers Portal', sub: 'Browse products', path: '/buyer', color: 'from-purple-500 to-pink-600' },
            { icon: '🏅', label: 'Leaderboard', sub: 'See your rank', path: '/rewards', color: 'from-yellow-500 to-orange-500' },
          ].map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-4 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">📦 Recent Orders</h2>
            <button onClick={() => navigate('/orders')} className="text-xs text-green-600 hover:underline font-medium">View all →</button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
              <button onClick={() => navigate('/buyer')}
                className="mt-3 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-xl font-semibold hover:shadow-lg transition-all">
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-lg shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-mono truncate">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-gray-700">{currency}{order.amount}</p>
                    <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{order.status}</span>
                    <p className={`text-xs mt-1 ${order.payment ? 'text-green-500' : 'text-orange-400'}`}>
                      {order.payment ? '✓ Paid' : '⏳ Pending'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
