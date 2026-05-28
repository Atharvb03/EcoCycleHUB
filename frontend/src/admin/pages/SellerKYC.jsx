import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'

const SellerKYC = ({ token }) => {
  const [pendingSellers, setPendingSellers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPendingSellers = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/pending-sellers`, { headers: { token } })
      if (res.data.success) setPendingSellers(res.data.sellers)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load pending sellers')
    } finally {
      setLoading(false)
    }
  }

  const reviewSeller = async (sellerId, action) => {
    try {
      const res = await axios.post(`${backendUrl}/api/admin/review-seller`, { sellerId, action }, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message)
        fetchPendingSellers()
      } else toast.error(res.data.message)
    } catch {
      toast.error('Action failed')
    }
  }

  useEffect(() => { if (token) fetchPendingSellers() }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-spin-slow mb-4">⚙️</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6 relative overflow-hidden'>
      <div className="absolute top-20 left-10 w-64 h-64 bg-orange-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-4xl mx-auto'>
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            🪪 Seller KYC Verification
          </h1>
          {pendingSellers.length > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {pendingSellers.length} pending
            </span>
          )}
        </div>

        {pendingSellers.length === 0 ? (
          <div className='text-center py-20 backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl shadow-xl animate-fade-in-up'>
            <div className='text-6xl mb-4'>✅</div>
            <p className='text-xl text-gray-600'>No pending verifications</p>
            <p className='text-sm text-gray-400 mt-2'>All sellers have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSellers.map((seller, index) => (
              <div
                key={seller._id}
                className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex gap-6 items-start">
                  <img
                    src={seller.profilePhoto}
                    alt="profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-300 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 text-lg">{seller.name}</p>
                    <p className="text-gray-500 text-sm">{seller.email} · {seller.mobile}</p>
                    {seller.location && <p className="text-gray-500 text-sm">📍 {seller.location}</p>}
                    {seller.aadhaarNumber && (
                      <p className="text-gray-500 text-sm font-mono">🪪 Aadhaar: {seller.aadhaarNumber}</p>
                    )}
                    {seller.aadhaarUrl && (
                      <a
                        href={seller.aadhaarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        🔗 View Uploaded ID Document
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => reviewSeller(seller._id, 'approve')}
                      className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all shadow-md"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => reviewSeller(seller._id, 'reject')}
                      className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all shadow-md"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerKYC
