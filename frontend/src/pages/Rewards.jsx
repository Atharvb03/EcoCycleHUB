import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import AnimatedCounter from '../components/AnimatedCounter'

const Rewards = () => {

  const { token, backendUrl, navigate } = useContext(ShopContext)

  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState('None')
  const [loginPoints, setLoginPoints] = useState(0)
  const [orderPoints, setOrderPoints] = useState(0)
  const [recyclePoints, setRecyclePoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [myUserId, setMyUserId] = useState(null)

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([])
  const [lbLoading, setLbLoading] = useState(false)
  const [historyUser, setHistoryUser] = useState(null)   // { name, submissions[] }
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const authToken = token || localStorage.getItem('token')
        if (!authToken) return

        const res = await axios.get(
          backendUrl + '/api/rewards/me',
          {
            headers: { token: authToken }
          }
        )

        setPoints(res.data.points)
        setLevel(res.data.level)
        setLoginPoints(res.data.loginPoints || 0)
        setOrderPoints(res.data.orderPoints || 0)
        setRecyclePoints(res.data.recyclePoints || 0)
        if (res.data.userId) setMyUserId(res.data.userId.toString())
      } catch (err) {
        console.error('Failed to fetch rewards', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRewards()
  }, [token, backendUrl])

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const authToken = token || localStorage.getItem('token')
      if (!authToken) return
      setLbLoading(true)
      try {
        const res = await axios.get(backendUrl + '/api/rewards/leaderboard', { headers: { token: authToken } })
        if (res.data.success) setLeaderboard(res.data.leaderboard)
      } catch (err) { console.error(err) }
      finally { setLbLoading(false) }
    }
    fetchLeaderboard()
  }, [token, backendUrl])

  const viewHistory = async (user) => {
    const authToken = token || localStorage.getItem('token')
    setHistoryLoading(true)
    setHistoryUser({ name: user.name, submissions: [] })
    try {
      const res = await axios.get(`${backendUrl}/api/rewards/history/${user.userId}`, { headers: { token: authToken } })
      if (res.data.success) setHistoryUser({ name: user.name, submissions: res.data.submissions })
    } catch (err) { console.error(err) }
    finally { setHistoryLoading(false) }
  }

  const medalSymbol = (lvl) =>
    lvl === 'Gold' ? { icon: '★', bg: 'linear-gradient(135deg,#facc15,#ca8a04)', color: '#78350f' } :
    lvl === 'Silver' ? { icon: '✦', bg: 'linear-gradient(135deg,#d1d5db,#6b7280)', color: '#1f2937' } :
    lvl === 'Bronze' ? { icon: '✿', bg: 'linear-gradient(135deg,#d97706,#92400e)', color: '#fff7ed' } :
    { icon: '·', bg: '#e5e7eb', color: '#6b7280' }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-slate-950">
        <div className="text-9xl animate-spin-slow">♻️</div>
        <div className="mt-8 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
          Loading rewards...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            🌱 My Eco Rewards
          </h1>
          <button
            onClick={() => navigate('/recycle-history')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold
                     hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 hover:-translate-y-1
                     transition-all duration-300"
          >
            View History
          </button>
        </div>

        {/* Main Points Card */}
        <div className="mb-8 animate-scale-in">
          <AnimatedCounter 
            value={points} 
            label="Total Eco Points" 
            icon="🌟"
            color="from-yellow-400 via-orange-500 to-red-500"
          />
        </div>

        {/* Level Badge */}
        <div className="bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-8 border border-white/20 animate-fade-in-up" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-gray-600 dark:text-gray-100 mb-2">Current Level</p>
              <h2 className="text-5xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {level}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-100 mt-2">
                {points < 50 && '🎯 Earn 50 points to reach Bronze!'}
                {points >= 50 && points < 100 && '🥉 Bronze: 50–99 pts'}
                {points >= 100 && points < 200 && '🥈 Silver: 100–199 pts'}
                {points >= 200 && '🥇 Gold: 200+ pts'}
              </p>
            </div>
            
            {/* Level Icon */}
            <div className="text-8xl animate-bounce-slow">
              {points < 50 && '🌱'}
              {points >= 50 && points < 100 && '🥉'}
              {points >= 100 && points < 200 && '🥈'}
              {points >= 200 && '🥇'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-100">Progress to next level</span>
              <span className="text-sm text-gray-600 dark:text-gray-100">{points} / 200</span>
            </div>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                   style={{ backgroundSize: '200% 100%' }} />
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${Math.min((points / 200) * 100, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide-right" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-xs drop-shadow">
                    {Math.round((points / 200) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Breakdown */}
        <div className="grid gap-6 sm:grid-cols-3 mb-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <AnimatedCounter 
              value={loginPoints} 
              label="From Logins" 
              icon="🔐"
              color="from-blue-400 via-cyan-500 to-teal-600"
            />
            <p className="text-xs text-gray-600 dark:text-gray-100 mt-2 text-center">+10 pts each login</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <AnimatedCounter 
              value={orderPoints} 
              label="From Orders" 
              icon="🛍️"
              color="from-purple-400 via-pink-500 to-red-600"
            />
            <p className="text-xs text-gray-600 dark:text-gray-100 mt-2 text-center">+20 pts per order</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <AnimatedCounter 
              value={recyclePoints} 
              label="From Recycling" 
              icon="♻️"
              color="from-green-400 via-emerald-500 to-teal-600"
            />
            <p className="text-xs text-gray-600 dark:text-gray-100 mt-2 text-center">+20 pts per submission</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up mb-8"
             style={{ animationDelay: '0.6s' }}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🏅 Eco Leaderboard
          </h3>

          {lbLoading ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-100 animate-pulse">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-100">No data yet. Be the first to earn points!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-emerald-900 dark:to-slate-800 text-gray-700 dark:text-gray-100">
                    <th className="px-3 py-3 text-left rounded-tl-xl">Rank</th>
                    <th className="px-3 py-3 text-left">Name</th>
                    <th className="px-3 py-3 text-left">Email</th>
                    <th className="px-3 py-3 text-center">Total Pts</th>
                    <th className="px-3 py-3 text-center">Medal</th>
                    <th className="px-3 py-3 text-center">Login</th>
                    <th className="px-3 py-3 text-center">Orders</th>
                    <th className="px-3 py-3 text-center">Recycle</th>
                    <th className="px-3 py-3 text-center rounded-tr-xl">History</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, idx) => {
                    const medal = medalSymbol(user.level)
                    const isTop3 = idx < 3
                    const isMe = myUserId && user.userId.toString() === myUserId
                    return (
                      <tr key={user.userId}
                          className={`border-b transition-colors ${
                            isMe
                              ? 'bg-gradient-to-r from-green-100 to-blue-100 dark:from-emerald-900 dark:to-slate-800 border-green-300 ring-2 ring-inset ring-green-400'
                              : 'border-gray-100 dark:border-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/20'
                          } ${isTop3 ? 'font-semibold' : ''}`}>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                            ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                              idx === 1 ? 'bg-gray-300 text-gray-800 dark:text-gray-100' :
                              idx === 2 ? 'bg-amber-600 text-white' :
                              'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-100'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-gray-800 dark:text-gray-100">
                          {user.name}
                          {isMe && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">You</span>}
                        </td>
                        <td className="px-3 py-3 text-gray-500 dark:text-gray-100 text-xs">{user.email}</td>
                        <td className="px-3 py-3 text-center font-bold text-blue-700">{user.points}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
                                style={{ background: medal.bg, color: medal.color }}>
                            {medal.icon} {user.level}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-cyan-600">{user.loginPoints}</td>
                        <td className="px-3 py-3 text-center text-purple-600">{user.orderPoints}</td>
                        <td className="px-3 py-3 text-center text-green-600">{user.recyclePoints}</td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => viewHistory(user)}
                            className="px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs
                                     hover:shadow-md hover:scale-105 transition-all duration-200">
                            History
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History Modal */}
        {historyUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
               onClick={() => setHistoryUser(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden"
                 onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-bold">♻️ {historyUser.name}'s Recycle History</h4>
                  <button onClick={() => setHistoryUser(null)}
                          className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[55vh]">
                {historyLoading ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-100 animate-pulse">Loading...</div>
                ) : historyUser.submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-100">No recycle submissions yet.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {historyUser.submissions.map((s, i) => (
                      <div key={i} className="bg-green-50 border border-green-100 dark:border-emerald-900/60 rounded-2xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{s.productName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-100 mt-1">
                              {s.actionType} · {s.centerName || 'Center #' + s.centerId}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-100 mt-1">
                              {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            +{s.pointsAwarded || 20} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificates & Badges */}
        <div className="bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/20 animate-fade-in-up" 
             style={{ animationDelay: '0.7s' }}>
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🏆 Certificates & Badges
          </h3>
          
          <p className="text-sm text-gray-700 dark:text-gray-100 mb-6">
            Unlock exclusive badges and certificates as you level up! 🎖️
          </p>

          {/* Badge download per level */}
          {points >= 50 ? (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => navigate('/badge')}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold
                         hover:shadow-lg hover:shadow-gray-800/50 transform hover:scale-105 hover:-translate-y-1
                         transition-all duration-300"
              >
                📥 Download {level} Badge
              </button>

              {points < 200 && (
                <p className="text-sm text-gray-600 dark:text-gray-100">
                  Keep going! Earn more points to upgrade to {points < 100 ? 'Silver (100+)' : 'Gold (200+)'} 🚀
                </p>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <p className="text-sm text-gray-700 dark:text-gray-100">
                🎯 Earn at least 50 points to unlock your first Bronze badge!
              </p>
            </div>
          )}

          {/* Certificate only for Gold */}
          {points >= 200 && (
            <button
              onClick={() => navigate('/certificate')}
              className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold
                       hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 hover:-translate-y-1
                       transition-all duration-300 flex items-center gap-2"
            >
              <span>🎓 Download Gold Certificate</span>
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default Rewards
