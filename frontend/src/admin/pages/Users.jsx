import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [recycles, setRecycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userRecycles, setUserRecycles] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { token }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    }
  };

  const fetchRecycles = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/recycles`, {
        headers: { token }
      });

      if (response.data.success) {
        setRecycles(response.data.submissions || []);
      } else {
        toast.error(response.data.message || 'Failed to load recycle submissions');
      }
    } catch (error) {
      console.error('Recycle fetch error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load recycle submissions';
      toast.error(errorMsg);
      // Still set empty array so UI doesn't break
      setRecycles([]);
    }
  };

  const fetchUserRecycles = async (userId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/recycles/user/${userId}`, {
        headers: { token }
      });

      if (response.data.success) {
        setUserRecycles(response.data.submissions);
        setSelectedUserId(userId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load user recycle history');
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchUsers(), fetchRecycles()]).finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin-slow mb-4">⚙️</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 relative overflow-hidden'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-7xl mx-auto'>
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up">
          Users & Recycle Analytics
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-2 shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👥 Users & Points
          </button>
          <button
            onClick={() => setActiveTab('recycles')}
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 ${
              activeTab === 'recycles'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ♻️ Recycle/Repair History
          </button>
        </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className='animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">All Users with Reward Points</h3>
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-center font-semibold">Total Points</th>
                    <th className="px-4 py-3 text-center font-semibold">Level</th>
                    <th className="px-4 py-3 text-center font-semibold">Login Points</th>
                    <th className="px-4 py-3 text-center font-semibold">Order Points</th>
                    <th className="px-4 py-3 text-center font-semibold">Recycle Points</th>
                    <th className="px-4 py-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user._id} className="hover:bg-green-50/50 transition-colors border-b border-gray-200">
                      <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className='font-bold text-lg bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent'>
                          {user.points}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.level === 'Gold'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                              : user.level === 'Silver'
                              ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                              : user.level === 'Bronze'
                              ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.level === 'Gold' ? '🥇' : user.level === 'Silver' ? '🥈' : user.level === 'Bronze' ? '🥉' : '⭐'} {user.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">{user.loginPoints}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{user.orderPoints}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{user.recyclePoints}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => fetchUserRecycles(user._id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded-xl font-medium
                                   hover:shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300"
                        >
                          View History
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recycles Tab */}
      {activeTab === 'recycles' && (
        <div className='animate-fade-in-up' style={{ animationDelay: '0.2s' }}>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">All Recycle/Repair Submissions</h3>
          <div className="space-y-4">
            {recycles.map((submission, index) => (
              <div
                key={submission._id}
                className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          submission.actionType === 'recycle'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                        }`}
                      >
                        {submission.actionType === 'recycle' ? '♻️ Recycle' : '🔧 Repair'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-bold text-xl text-gray-800 mb-2">{submission.productName}</p>
                    {submission.productDescription && (
                      <p className="text-gray-600 text-sm mb-3">{submission.productDescription}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div className="backdrop-blur-xl bg-blue-50/80 border-2 border-blue-500/30 rounded-xl p-3">
                        <p className="font-medium text-blue-700">👤 User</p>
                        <p>{submission.userId?.name}</p>
                        <p className="text-xs text-gray-600">{submission.userId?.email}</p>
                      </div>
                      <div className="backdrop-blur-xl bg-purple-50/80 border-2 border-purple-500/30 rounded-xl p-3">
                        <p className="font-medium text-purple-700">📍 Center</p>
                        <p>{submission.centerId?.name || submission.centerName || 'Manual center'}</p>
                        <p className="text-xs text-gray-600">{submission.centerId?.address}</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-semibold shadow-lg">
                      <span>🌟 Points Awarded:</span>
                      <span className="text-lg">+{submission.pointsAwarded}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {recycles.length === 0 && (
              <div className='text-center py-20 backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-xl'>
                <div className='text-6xl mb-4'>♻️</div>
                <p className='text-xl text-gray-600'>No recycle/repair submissions yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Sellers KYC Tab — moved to its own /admin/kyc page */}

      {/* User Recycle History Modal/View */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="backdrop-blur-xl bg-white/95 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Recycle/Repair History for{' '}
                {users.find((u) => u._id === selectedUserId)?.name}
              </h3>
              <button
                onClick={() => {
                  setSelectedUserId(null);
                  setUserRecycles([]);
                }}
                className="w-10 h-10 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 transform hover:rotate-90"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {userRecycles.map((submission, index) => (
                <div key={submission._id} className="backdrop-blur-xl bg-white/80 border-2 border-gray-200 rounded-xl p-4 hover:border-green-500/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.actionType === 'recycle'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      }`}
                    >
                      {submission.actionType === 'recycle' ? '♻️ Recycle' : '🔧 Repair'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{submission.productName}</p>
                  {submission.productDescription && (
                    <p className="text-sm text-gray-600 mt-1">{submission.productDescription}</p>
                  )}
                  <p className="text-sm mt-2">
                    <span className="font-medium">Center:</span> {submission.centerId?.name || submission.centerName || 'Manual center'}
                  </p>
                </div>
              ))}
              {userRecycles.length === 0 && (
                <div className='text-center py-10'>
                  <div className='text-4xl mb-2'>📦</div>
                  <p className="text-gray-500">No recycle/repair submissions for this user.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Users;
