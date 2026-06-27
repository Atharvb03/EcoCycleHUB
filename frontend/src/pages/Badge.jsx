import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Badge = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [userName, setUserName] = useState('');
  const [level, setLevel] = useState('None');
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const loadProfile = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/user/me', { headers: { token } });
        if (!res.data.success) { toast.error(res.data.message); navigate('/rewards'); return; }
        const points = res.data.rewards?.points || 0;
        const lvl = res.data.rewards?.level || 'None';
        if (points < 50 || lvl === 'None') { toast.error('You need at least 50 points to unlock a badge.'); navigate('/rewards'); return; }
        setUserName(res.data.user.name);
        setLevel(lvl);
      } catch (err) { toast.error('Failed to load badge data'); navigate('/rewards'); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [token, backendUrl, navigate]);

  const handleDownload = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 3, canvas.height / 3] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`EcoCycleHub_Badge_${userName}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    }
  };

  const handlePrint = () => {
    const card = document.getElementById('badge-card');
    const win = window.open('', '_blank', 'width=500,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>Badge</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A5 portrait; margin: 10mm; }
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: Georgia, serif; }
      </style></head><body>${card.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 flex items-center justify-center">
      <p className="text-xl text-gray-600 dark:text-gray-300">Preparing your badge...</p>
    </div>
  );

  const badgeBg =
    level === 'Gold' ? 'linear-gradient(135deg, #facc15, #ca8a04)' :
    level === 'Silver' ? 'linear-gradient(135deg, #d1d5db, #6b7280)' :
    'linear-gradient(135deg, #d97706, #92400e)';

  const badgeTextColor =
    level === 'Gold' ? '#78350f' :
    level === 'Silver' ? '#1f2937' :
    '#fff7ed';

  const medalSymbol =
    level === 'Gold' ? '★' :
    level === 'Silver' ? '✦' :
    '✿';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 p-4 relative overflow-hidden">

      {/* Screen-only decorative blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse print:hidden" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse print:hidden" />

      {/* Card — all inline styles so html2canvas renders correctly */}
      <div
        id="badge-card"
        ref={cardRef}
        style={{
          background: '#ffffff',
          border: '4px solid #16a34a',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Header */}
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', fontFamily: 'sans-serif' }}>EcoCycleHub</p>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#15803d', marginBottom: '24px', fontFamily: 'sans-serif' }}>
          Eco Reward Badge
        </h1>

        {/* Badge medal — pure CSS, no emoji so html2canvas renders it */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '110px', height: '110px', borderRadius: '50%',
            background: badgeBg,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            border: '4px solid rgba(255,255,255,0.6)',
          }}>
            <span style={{ fontSize: '32px', color: badgeTextColor, lineHeight: 1 }}>{medalSymbol}</span>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: badgeTextColor, marginTop: '4px', fontFamily: 'sans-serif' }}>{level}</span>
          </div>
        </div>

        {/* Awarded to */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#374151', fontSize: '16px', marginBottom: '6px', fontFamily: 'sans-serif' }}>Awarded to</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d', fontFamily: 'Georgia, serif' }}>{userName}</p>
        </div>

        {/* Description box */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '12px', padding: '16px', marginBottom: '24px',
        }}>
          <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', fontFamily: 'sans-serif' }}>
            In recognition of your outstanding contribution to sustainable fashion and recycling.
            Keep making a difference!
          </p>
        </div>

        {/* Badge levels */}
        <div style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'sans-serif', lineHeight: '1.8' }}>
          <p style={{ fontWeight: '600', marginBottom: '2px' }}>Badge Levels:</p>
          <p>Bronze: 50-99 pts</p>
          <p>Silver: 100-199 pts</p>
          <p>Gold: 200+ pts</p>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #d1d5db', fontSize: '11px', color: '#9ca3af', fontFamily: 'sans-serif' }}>
          <p>EcoCycleHub · {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <button onClick={handleDownload}
        className="mt-8 px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all print:hidden"
        style={{ background: 'linear-gradient(to right, #22c55e, #10b981)' }}>
        Download as PDF 📥
      </button>
      <button onClick={handlePrint}
        className="mt-3 px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all print:hidden"
        style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)' }}>
        Print Badge 🖨️
      </button>
    </div>
  );
};

export default Badge;
