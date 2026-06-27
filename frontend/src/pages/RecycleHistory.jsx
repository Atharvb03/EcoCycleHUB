import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { Loader } from 'lucide-react';

const RecycleHistory = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const authToken = token || localStorage.getItem('token');
                if (!authToken) {
                    setError('Please login to view your history');
                    setLoading(false);
                    return;
                }

                const res = await axios.get(
                    backendUrl + '/api/recycle/mine',
                    {
                        headers: { token: authToken }
                    }
                );

                if (res.data.success) {
                    setSubmissions(res.data.recycles || []);
                } else {
                    setError(res.data.message || 'Failed to load history');
                }
            } catch (err) {
                console.error('Failed to fetch recycle history', err);
                setError('Failed to load submission history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, backendUrl]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-950 dark:to-slate-950">
                <div className="text-9xl animate-spin-slow">♻️</div>
                <div className="mt-8 text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                    Loading history...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-950 dark:to-red-950">
                <div className="text-8xl mb-4">⚠️</div>
                <p className="text-xl text-red-600 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 py-10 px-4">
            {/* Animated Background */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
            
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
                    ♻️ My Recycle & Repair History
                </h1>

                {submissions.length === 0 ? (
                    <div className="bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-sm p-12 rounded-3xl text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-in">
                        <div className="text-8xl mb-6 animate-bounce-slow">📦</div>
                        <p className="text-xl text-gray-700 dark:text-gray-100 mb-4 font-semibold">No submissions yet</p>
                        <p className="text-gray-600 dark:text-gray-100 mb-6">Visit the Centers page to submit your first recycle or repair request!</p>
                        <a href="/centers" 
                           className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold
                                    hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 hover:-translate-y-1
                                    transition-all duration-300">
                            🌍 Find Centers
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {submissions.map((submission, index) => (
                            <div key={submission._id} 
                                 className="group bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800
                                          hover:scale-102 hover:shadow-2xl hover:shadow-green-500/20
                                          transition-all duration-500 overflow-hidden animate-fade-in-up"
                                 style={{ animationDelay: `${index * 0.1}s` }}>
                                {/* Top Gradient Bar */}
                                <div className={`h-2 bg-gradient-to-r ${
                                    submission.actionType === 'recycle' 
                                        ? 'from-green-400 to-emerald-600' 
                                        : 'from-orange-400 to-red-600'
                                }`} />
                                
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{submission.productName}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-100 mb-3">
                                                {submission.productDescription || 'No description provided'}
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                {submission.condition && (
                                                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 flex items-center gap-1">
                                                        <span>📊</span>
                                                        Condition: {submission.condition}
                                                    </span>
                                                )}
                                                {submission.predictedPrice && (
                                                    <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1">
                                                        <span>💰</span>
                                                        Est. Price: ₹{submission.predictedPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                                                submission.actionType === 'recycle'
                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                    : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                                            }`}>
                                                {submission.actionType === 'recycle' ? '♻️ Recycle' : '🔧 Repair'}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-100 mt-2">
                                                {formatDate(submission.createdAt || submission.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                        {(submission.centerId || submission.centerName) ? (
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-slate-900 p-4 rounded-2xl">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
                                                    <span className="text-lg">🏢</span>
                                                    {submission.centerId?.name || submission.centerName}
                                                </p>
                                                {submission.centerId?.address && (
                                                <p className="text-sm text-gray-600 dark:text-gray-100 flex items-start gap-2">
                                                    <span className="text-lg">📍</span>
                                                    <span>{submission.centerId.address}</span>
                                                </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 dark:text-gray-100 dark:text-gray-100">Center information not available</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                                        <div>
                                            {submission.status === 'completed' && (
                                                <span className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                                    ✓ Completed
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                                <span className="text-xl">🌟</span>
                                                <span>+{submission.pointsAwarded || 20} points earned</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecycleHistory;
