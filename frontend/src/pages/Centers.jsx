import React, { useState, useEffect, useContext } from 'react';
import { Loader, X, Check } from 'lucide-react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function RecycleRepairFinder() {
  const { token } = useContext(ShopContext);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [actionType, setActionType] = useState(''); // 'recycle' or 'repair'
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [condition, setCondition] = useState('Good'); // Default condition
  const [submitting, setSubmitting] = useState(false);

  // Default fallback location: Khed, Ratnagiri (only used for center loading, NOT for directions)
  const defaultLocation = { lat: 17.7186, lng: 73.3953 };

  // Separate state: real GPS location (null until user clicks "Use My Location")
  const [gpsLocation, setGpsLocation] = useState(null);
  const [manualOrigin, setManualOrigin] = useState('');
  const [qrCenter, setQrCenter] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState(50); // km

  // Get user's geolocation
  const getUserLocation = () => {
    setLoading(true);
    setError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(coords);
          setGpsLocation(coords); // real GPS — used for directions origin
          setLoading(false);
        },
        () => {
          setUserLocation(defaultLocation);
          setError('Unable to get my current location. Using default (Khed, Ratnagiri).');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation(defaultLocation);
      setError('Geolocation not supported. Using default for my current location.');
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Recycle & repair centers in Khed (Ratnagiri)
  const manualCenters = [
    {
      id: 1,
      name: 'Mashaallah Scrap (Shivtar)',
      type: 'recycle',
      address: 'Near Telephone Exchange, Shivtar, Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Scrap materials', 'General scrap'],
      lat: 17.7186,
      lng: 73.3953
    },
    {
      id: 2,
      name: 'Sonkar Scrap Merchant',
      type: 'recycle',
      address: 'Near Railway Station, Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Plastic', 'Paper', 'General scrap'],
      lat: 17.7165,
      lng: 73.3930
    },
    {
      id: 3,
      name: 'Kalpataru Environment & Engineering Services',
      type: 'both',
      address: 'Main Road, Sanmitra Nagar, Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Waste management', 'Water purifier repair'],
      lat: 17.7220,
      lng: 73.3980
    },
    {
      id: 4,
      name: 'Moreshwar and Ravindra Brothers',
      type: 'repair',
      address: 'Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Gas stove repair'],
      lat: 17.7200,
      lng: 73.3960
    },
    {
      id: 5,
      name: 'Unique Systems',
      type: 'repair',
      address: 'Samartha Nagar, Near MSEB Office/Government Godowns, Shivtar, Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Laptops', 'LED projectors', 'Routers', 'RO purifiers'],
      lat: 17.7190,
      lng: 73.3940
    },
    {
      id: 6,
      name: 'Classic Systems',
      type: 'repair',
      address: 'Teenbatti Naka, Near City Pride Anand Theatre, Khed Dapoli Road, Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Computer/laptop repairs and parts'],
      lat: 17.7210,
      lng: 73.3970
    },
    {
      id: 7,
      name: 'Omkar Computer Services',
      type: 'repair',
      address: 'Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Laptop repairs', 'CCTV services'],
      lat: 17.7180,
      lng: 73.3960
    },
    {
      id: 8,
      name: 'Login Systems',
      type: 'repair',
      address: 'Khed, Ratnagiri',
      phone: 'Justdial',
      hours: 'Contact for hours',
      rating: 4.0,
      services: ['Computer and laptop repair'],
      lat: 17.7170,
      lng: 73.3950
    }
  ];

  // Load centers from backend based on current location
  const loadCenters = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${backendUrl}/api/centers/nearby`, {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng
        }
      });

      const apiCenters = res.data || [];

      if (apiCenters.length === 0) {
        // Fallback to manual data if no centers in DB
        const centersWithDistance = manualCenters.map((center) => ({
          ...center,
          distanceNum: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            center.lat,
            center.lng
          ),
          distance:
            calculateDistance(
              userLocation.lat,
              userLocation.lng,
              center.lat,
              center.lng
            ) + ' km'
        }));
        setLocations(centersWithDistance);
      } else {
        const centersWithDistance = apiCenters.map((center) => ({
          id: center._id,
          name: center.name,
          type: center.type,
          address: center.address,
          phone: center.phone,
          hours: center.hours || 'See details',
          services: center.services || [],
          lat: center.location?.lat,
          lng: center.location?.lng,
          distanceNum: center.distanceKm?.toFixed
            ? center.distanceKm.toFixed(1)
            : center.distanceKm,
          distance:
            (center.distanceKm?.toFixed
              ? center.distanceKm.toFixed(1)
              : center.distanceKm) + ' km'
        }));
        setLocations(centersWithDistance);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load centers from server. Showing sample centers near my current location.');

      const centersWithDistance = manualCenters.map((center) => ({
        ...center,
        distanceNum: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          center.lat,
          center.lng
        ),
        distance:
          calculateDistance(
            userLocation.lat,
            userLocation.lng,
            center.lat,
            center.lng
          ) + ' km'
      }));
      setLocations(centersWithDistance);
    } finally {
      setLoading(false);
    }
  };

  // Default to Khed, Ratnagiri on mount so centers load immediately
  useEffect(() => {
    if (!userLocation) {
      setUserLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadCenters();
    }
  }, [userLocation]);

  // Open modal for submission
  const openSubmissionModal = (center, type) => {
    if (!token) {
      toast.error('Please login to submit recycling/repair requests');
      return;
    }
    setSelectedCenter(center);
    setActionType(type);
    setProductName('');
    setProductDescription('');
    setCondition('Good'); // Reset condition
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCenter(null);
    setActionType('');
    setProductName('');
    setProductDescription('');
    setCondition('Good');
  };

  // Submit recycling/repair request
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setSubmitting(true);

    try {
      const authToken = token || localStorage.getItem('token');
      const res = await axios.post(
        `${backendUrl}/api/recycle`,
        {
          centerId: selectedCenter.id,
          centerName: selectedCenter.name,
          productName,
          productDescription,
          actionType,
          condition
        },
        {
          headers: { token: authToken }
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        closeModal();
        // Optionally refresh page or update rewards
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res.data.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-10">
      {/* Animated Background */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            ♻️ Recycle & Repair Centers
          </h1>
          {token && (
            <button
              onClick={() => window.location.href = '/recycle-history'}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold
                       hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 hover:-translate-y-1
                       transition-all duration-300"
            >
              📜 View My Submissions
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={getUserLocation}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold
                     hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 hover:-translate-y-1
                     transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-xl">📍</span>
            Use My Location
          </button>

          {/* Manual origin for directions — useful when browser location is wrong */}
          <div className="flex flex-1 items-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-full px-4 py-2 shadow">
            <span className="text-gray-400 text-sm whitespace-nowrap">🗺️ My location:</span>
            <input
              type="text"
              value={manualOrigin}
              onChange={e => setManualOrigin(e.target.value)}
              placeholder="e.g. Khed, Ratnagiri (for accurate directions)"
              className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
            />
            {manualOrigin && (
              <button onClick={() => setManualOrigin('')} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20 animate-fade-in">
            <div className="text-6xl animate-spin-slow mb-4">🔄</div>
            <p className="text-gray-600">Finding centers near you...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6 animate-scale-in">
            <p className="text-yellow-800 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {locations.length > 0 && (
          <>
            {/* Distance filter chips */}
            <div className="flex items-center gap-2 mb-4 flex-wrap animate-fade-in-up">
              <span className="text-sm text-gray-500 font-medium">Filter by distance:</span>
              {[5, 10, 25, 50].map(km => (
                <button
                  key={km}
                  onClick={() => setDistanceFilter(km)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    distanceFilter === km
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md'
                      : 'bg-white/80 text-gray-600 border border-gray-200 hover:border-green-400'
                  }`}
                >
                  {km} km
                </button>
              ))}
            </div>

            <p className="text-gray-600 mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              📍 Showing {locations.filter(l => parseFloat(l.distanceNum) <= distanceFilter).length} of {locations.length} centers within {distanceFilter} km
            </p>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {locations.filter(l => parseFloat(l.distanceNum) <= distanceFilter).map((loc, index) => (
            <div 
              key={loc.id} 
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100
                       hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20
                       transition-all duration-500 hover:-rotate-1 animate-fade-in-up"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {/* Type Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  loc.type === 'recycle' 
                    ? 'bg-green-100 text-green-700' 
                    : loc.type === 'repair'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {loc.type === 'recycle' ? '♻️ Recycle' : loc.type === 'repair' ? '🔧 Repair' : '🔄 Both'}
                </span>
                {loc.distance && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    📏 {loc.distance}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {loc.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                <span className="text-lg">📍</span>
                <span>{loc.address}</span>
              </p>

              <div className="mt-4 flex gap-2 flex-wrap">
                {(loc.type === 'recycle' || loc.type === 'both') && (
                  <button
                    onClick={() => openSubmissionModal(loc, 'recycle')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold
                             hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    ♻️ Submit for Recycle
                  </button>
                )}
                {(loc.type === 'repair' || loc.type === 'both') && (
                  <button
                    onClick={() => openSubmissionModal(loc, 'repair')}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl text-sm font-semibold
                             hover:shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    🔧 Submit for Repair
                  </button>
                )}
                <button
                  onClick={() => {
                    const dest = encodeURIComponent(loc.name + ', ' + loc.address);
                    const origin = manualOrigin.trim()
                      ? encodeURIComponent(manualOrigin.trim())
                      : gpsLocation
                      ? `${gpsLocation.lat},${gpsLocation.lng}`
                      : null;
                    const url = origin
                      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
                      : `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
                    // On mobile, open directly; on desktop show QR
                    const isMobile = /iPhone|Android|iPad/i.test(navigator.userAgent);
                    if (isMobile) {
                      window.open(url, '_blank');
                    } else {
                      setQrCenter({ ...loc, mapsUrl: url });
                    }
                  }}
                  className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-3 rounded-xl text-sm font-semibold
                           hover:shadow-lg hover:shadow-gray-800/50 transform hover:-translate-y-1 transition-all duration-300
                           flex items-center gap-2"
                >
                  <span>🗺️</span>
                  Directions
                </button>
              </div>
            </div>
          ))}
        </div>

        {locations.length > 0 && locations.filter(l => parseFloat(l.distanceNum) <= distanceFilter).length === 0 && (
          <div className="text-center py-16 animate-fade-in-up">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-lg text-gray-600 mb-2">No centers within {distanceFilter} km</p>
            <p className="text-sm text-gray-500">Try a larger distance filter above</p>
          </div>
        )}

        {locations.length === 0 && !loading && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-8xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">No centers found nearby</p>
            <p className="text-sm text-gray-500">Try using your location or check back later</p>
          </div>
        )}
      </div>

      {/* QR Code Modal — scan with phone to get accurate GPS directions */}
      {qrCenter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
             onClick={() => setQrCenter(null)}>
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
               onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Open on Your Phone 📱</h3>
              <button onClick={() => setQrCenter(null)}
                className="w-8 h-8 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Scan this QR code with your phone camera.<br/>
              Google Maps will open with your phone's GPS as origin — much more accurate!
            </p>

            <div className="flex justify-center mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <QRCodeSVG value={qrCenter.mapsUrl} size={200} level="H" />
            </div>

            <p className="text-xs font-semibold text-gray-700 mb-1">{qrCenter.name}</p>
            <p className="text-xs text-gray-500 mb-5">{qrCenter.address}</p>

            <a href={qrCenter.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all">
              Or open directly on this device →
            </a>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in overflow-hidden">
            {/* Animated Header Gradient */}
            <div className="h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 animate-gradient-x" 
                 style={{ backgroundSize: '200% 200%' }} />
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {actionType === 'recycle' ? '♻️ Submit for Recycling' : '🔧 Submit for Repair'}
                </h2>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white 
                           transition-all duration-300 flex items-center justify-center text-xl font-bold
                           hover:rotate-90 transform"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
                <p className="font-semibold text-gray-800 mb-1">{selectedCenter?.name}</p>
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <span>📍</span>
                  <span>{selectedCenter?.address}</span>
                </p>
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                  <span>📞</span>
                  <span>{selectedCenter?.phone}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Old Laptop, Plastic Bottles"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                             transition-all duration-300"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Product Description (Optional)
                  </label>
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Any additional details..."
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                             transition-all duration-300 resize-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
                             focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                             transition-all duration-300"
                  >
                    <option value="Excellent">✨ Excellent - Like new, no defects</option>
                    <option value="Good">👍 Good - Minor wear, fully functional</option>
                    <option value="Fair">👌 Fair - Visible wear, functional</option>
                    <option value="Poor">⚠️ Poor - Damaged or not working</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3 text-green-700">
                    <div className="text-3xl animate-bounce-slow">🎉</div>
                    <div>
                      <span className="font-bold text-lg">You'll earn 20 points!</span>
                      <p className="text-xs text-green-600 mt-1">Keep recycling to level up! 🌱</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold
                             hover:bg-gray-300 transition-all duration-300"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold
                             hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Submitting...
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecycleRepairFinder;
