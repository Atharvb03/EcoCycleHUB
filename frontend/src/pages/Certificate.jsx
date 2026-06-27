import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = () => {
  const { token, backendUrl, navigate } = useContext(ShopContext);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const loadProfile = async () => {
      try {
        const res = await axios.get(backendUrl + '/api/user/me', { headers: { token } });
        if (!res.data.success) { toast.error(res.data.message); navigate('/rewards'); return; }
        const points = res.data.rewards?.points || 0;
        if (points < 200) { toast.error('You need at least 200 points (Gold level) to download the certificate.'); navigate('/rewards'); return; }
        setUserName(res.data.user.name);
      } catch (err) { toast.error('Failed to load certificate data'); navigate('/rewards'); }
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
      // Use A4 landscape
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = canvas.width / 3;
      const imgH = canvas.height / 3;
      // Scale to fit page with padding
      const ratio = Math.min((pageW - 20) / imgW, (pageH - 20) / imgH);
      const finalW = imgW * ratio;
      const finalH = imgH * ratio;
      const x = (pageW - finalW) / 2;
      const y = (pageH - finalH) / 2;
      pdf.addImage(imgData, 'PNG', x, y, finalW, finalH);
      pdf.save(`EcoCycleHub_Certificate_${userName}.pdf`);
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    }
  };

  const handlePrint = () => {
    const card = document.getElementById('cert-card');
    const win = window.open('', '_blank', 'width=900,height=650');
    win.document.write(`<!DOCTYPE html><html><head><title>Certificate</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4 landscape; margin: 10mm; }
        body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; font-family: Georgia, serif; }
      </style></head><body>${card.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 flex items-center justify-center">
      <p className="text-xl text-gray-600 dark:text-gray-100">Preparing your certificate...</p>
    </div>
  );

  const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 p-4 relative overflow-hidden">

      <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl animate-pulse print:hidden" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse print:hidden" />

      {/* Certificate card — all inline styles */}
      <div
        id="cert-card"
        ref={cardRef}
        style={{
          background: '#ffffff',
          border: '8px double #16a34a',
          borderRadius: '24px',
          padding: '56px 64px',
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}
      >
        {/* Corner decorations — using text chars, not emoji */}
        <span style={{ position: 'absolute', top: '16px', left: '20px', fontSize: '20px', color: '#16a34a' }}>✦</span>
        <span style={{ position: 'absolute', top: '16px', right: '20px', fontSize: '20px', color: '#16a34a' }}>✦</span>
        <span style={{ position: 'absolute', bottom: '16px', left: '20px', fontSize: '20px', color: '#16a34a' }}>✦</span>
        <span style={{ position: 'absolute', bottom: '16px', right: '20px', fontSize: '20px', color: '#16a34a' }}>✦</span>

        {/* Org name */}
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontFamily: 'sans-serif', letterSpacing: '2px', textTransform: 'uppercase' }}>
          EcoCycleHub
        </p>

        {/* Title */}
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#15803d', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
          Certificate of Eco Recycling
        </h1>
        <div style={{ width: '80px', height: '3px', background: 'linear-gradient(to right, #16a34a, #2563eb)', margin: '0 auto 32px', borderRadius: '2px' }} />

        {/* Presented to */}
        <p style={{ color: '#6b7280', fontSize: '16px', fontStyle: 'italic', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
          This certificate is proudly presented to
        </p>

        {/* Name box */}
        <div style={{
          background: '#f0fdf4', border: '2px solid #86efac',
          borderRadius: '16px', padding: '20px 32px', marginBottom: '24px',
          display: 'inline-block', minWidth: '300px',
        }}>
          <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#15803d', fontFamily: 'Georgia, serif', margin: 0 }}>
            {userName}
          </p>
        </div>

        {/* Body text */}
        <p style={{ color: '#374151', fontSize: '15px', lineHeight: '1.8', marginBottom: '24px', fontFamily: 'sans-serif', maxWidth: '560px', margin: '0 auto 24px' }}>
          For outstanding contribution to sustainable fashion and recycling,
          achieving <strong style={{ color: '#ca8a04' }}>Gold level (200+ points)</strong> in the Eco Rewards program.
        </p>

        {/* Thank you box */}
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '14px 24px', marginBottom: '40px', display: 'inline-block' }}>
          <p style={{ color: '#374151', fontSize: '13px', lineHeight: '1.6', fontFamily: 'sans-serif', margin: 0 }}>
            Thank you for helping reduce waste and promote circular fashion.
            Your efforts make a real difference in creating a sustainable future!
          </p>
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #e5e7eb', paddingTop: '24px', marginTop: '8px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ width: '160px', borderBottom: '2px solid #9ca3af', marginBottom: '6px' }} />
            <p style={{ fontWeight: '600', color: '#374151', fontSize: '13px', fontFamily: 'sans-serif', margin: 0 }}>EcoCycleHub Team</p>
            <p style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'sans-serif', margin: 0 }}>Authorized Signature</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #facc15, #ca8a04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(202,138,4,0.4)',
            }}>
              <span style={{ fontSize: '22px', color: '#78350f', fontWeight: 'bold' }}>★</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#16a34a', fontFamily: 'sans-serif', margin: 0 }}>{today}</p>
            <p style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'sans-serif', margin: 0 }}>Date of Issue</p>
          </div>
        </div>
      </div>

      <button onClick={handleDownload}
        className="mt-10 px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all print:hidden"
        style={{ background: 'linear-gradient(to right, #22c55e, #10b981)' }}>
        Download as PDF 📥
      </button>
      <button onClick={handlePrint}
        className="mt-3 px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all print:hidden"
        style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)' }}>
        Print Certificate 🖨️
      </button>
    </div>
  );
};

export default Certificate;
