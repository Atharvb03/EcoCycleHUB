import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const COUNTRIES = [
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+1',   flag: '🇺🇸', name: 'USA' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
];

const Field = ({ icon, children }) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-green-400 transition">
    <span className="text-lg">{icon}</span>
    {children}
  </div>
);

const inputCls = "w-full focus:outline-none text-gray-700 bg-transparent text-sm";

const STEPS = ['Info', 'OTP', 'Photo', 'ID', 'Done'];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-1 mb-6">
    {STEPS.map((s, i) => (
      <div key={s} className="flex items-center gap-1">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${i < current ? 'bg-green-500 text-white' : i === current
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white scale-110'
            : 'bg-gray-200 text-gray-400'}`}>
          {i < current ? '✓' : i + 1}
        </div>
        {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
      </div>
    ))}
  </div>
);

function SellerLogin({ setToken }) {
  const [mode, setMode] = useState('login');
  const [step, setStep] = useState(0);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', mobile: '' });
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryList, setShowCountryList] = useState(false);
  const [otp, setOtp] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarName, setAadhaarName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const api = (path) => `${backendUrl}/api/seller${path}`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(api('/login'), { email: loginEmail, password: loginPassword });
      if (res.data.success) {
        setToken(res.data.token);
        toast.success('Welcome back!');
      } else if (res.data.status === 'rejected') {
        toast.error('Your account was rejected. Please re-upload a valid Aadhaar / government-issued ID.');
      } else if (res.data.status === 'pending') {
        toast.warn('Your account is pending admin approval. Please wait 24–48 hours.');
      } else {
        toast.error(res.data.message);
      }
    } catch { toast.error('Connection error'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullMobile = countryCode + form.mobile;
      const res = await axios.post(api('/register'), { ...form, mobile: fullMobile });
      if (res.data.success) {
        setUserId(res.data.userId);
        if (res.data.devOtp) toast.info(`Dev OTP: ${res.data.devOtp}`, { autoClose: 30000 });
        toast.success('OTP sent to your mobile!');
        setStep(1);
      } else {
        toast.error(res.data.message);
      }
    } catch { toast.error('Connection error'); }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(api('/verify-otp'), { userId, otp });
      if (res.data.success) { toast.success('Mobile verified!'); setStep(2); }
      else toast.error(res.data.message);
    } catch { toast.error('Connection error'); }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    const res = await axios.post(api('/resend-otp'), { userId });
    if (res.data.success) {
      if (res.data.devOtp) toast.info(`Dev OTP: ${res.data.devOtp}`, { autoClose: 30000 });
      toast.success('OTP resent!');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return toast.error('Please select a photo');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('userId', userId);
      fd.append('profilePhoto', photoFile);
      const res = await axios.post(api('/upload-photo'), fd);
      if (res.data.success) { toast.success('Profile photo uploaded!'); setStep(3); }
      else toast.error(res.data.message);
    } catch { toast.error('Upload failed'); }
    setLoading(false);
  };

  const handleAadhaarUpload = async (e) => {
    e.preventDefault();
    if (!aadhaarFile) return toast.error('Please select your ID document');
    const cleaned = aadhaarNumber.replace(/\s+/g, '');
    if (!/^\d{12}$/.test(cleaned)) return toast.error('Enter a valid 12-digit Aadhaar number');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('userId', userId);
      fd.append('aadhaar', aadhaarFile);
      fd.append('aadhaarNumber', cleaned);
      const res = await axios.post(api('/upload-aadhaar'), fd);
      if (res.data.success) {
        toast.success(`Aadhaar verified — ${res.data.maskedNumber}`);
        const done = await axios.post(api('/complete'), { userId });
        if (done.data.success) setStep(4);
        else toast.error(done.data.message);
      } else toast.error(res.data.message);
    } catch { toast.error('Upload failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden py-10">
      <div className="fixed top-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl px-8 py-8 w-full max-w-md border border-green-100">
        {/* Back to homepage */}
        <a href="/" className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition mb-4">
          ← Back to Homepage
        </a>

        <div className="text-center mb-6">
          <div className="text-5xl mb-2">♻️</div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            {mode === 'login' ? 'Seller Login' : 'Become a Seller'}
          </h1>
          <p className="text-gray-400 text-xs mt-1">EcoCycleHub · Sell your recyclables</p>
        </div>

        {/* Single toggle button */}
        <div className="flex justify-center mb-6">
          {mode === 'login' ? (
            <button onClick={() => { setMode('signup'); setStep(0); }}
              className="px-6 py-2 text-sm font-medium border-2 border-blue-400 text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
              + Register New Seller
            </button>
          ) : (
            <button onClick={() => { setMode('login'); setStep(0); }}
              className="px-6 py-2 text-sm font-medium border-2 border-green-400 text-green-600 rounded-xl hover:bg-green-50 transition-all">
              ← Back to Login
            </button>
          )}
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field icon="✉️"><input type="email" placeholder="seller@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className={inputCls} required /></Field>
            <Field icon="🔒"><input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className={inputCls} required /></Field>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
              {loading ? '...' : '🌍 Sign In'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <>
            <StepBar current={step} />

            {step === 0 && (
              <form onSubmit={handleRegister} className="space-y-3">
                <Field icon="👤"><input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} required /></Field>
                <Field icon="✉️"><input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} required /></Field>
                <Field icon="🔒"><input type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputCls} required /></Field>
                <Field icon="📍"><input type="text" placeholder="Location (City, State)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputCls} required /></Field>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-green-400 transition relative">
                  <button type="button" onClick={() => setShowCountryList(v => !v)}
                    className="flex items-center gap-1 px-3 py-2 border-r border-gray-200 text-sm font-medium hover:bg-gray-50 shrink-0">
                    <span className="text-xl">{COUNTRIES.find(c => c.code === countryCode)?.flag}</span>
                    <span className="text-gray-600">{countryCode}</span>
                    <span className="text-gray-400 text-xs">▾</span>
                  </button>
                  {showCountryList && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                      {COUNTRIES.map(c => (
                        <button key={c.code} type="button" onClick={() => { setCountryCode(c.code); setShowCountryList(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-green-50 text-left">
                          <span className="text-xl">{c.flag}</span>
                          <span className="text-gray-700">{c.name}</span>
                          <span className="text-gray-400 ml-auto">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="tel" placeholder="10-digit Mobile Number" value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="flex-1 py-2 pr-3 focus:outline-none text-gray-700 bg-transparent text-sm" required />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
                  {loading ? 'Sending OTP...' : 'Continue →'}
                </button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <p className="text-center text-sm text-gray-500">OTP sent to <span className="font-semibold text-gray-700">{countryCode} {form.mobile}</span></p>
                <Field icon="🔢">
                  <input type="text" placeholder="6-digit OTP" maxLength={6} value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`${inputCls} tracking-widest text-center text-lg`} required />
                </Field>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
                  {loading ? 'Verifying...' : '✅ Verify OTP'}
                </button>
                <p onClick={handleResendOTP} className="text-center text-xs text-blue-500 cursor-pointer hover:underline">Resend OTP</p>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handlePhotoUpload} className="space-y-4">
                <p className="text-center text-sm text-gray-500">Upload your profile photo</p>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-2xl p-6 cursor-pointer hover:border-green-500 transition-all bg-green-50/50">
                  {photoPreview ? <img src={photoPreview} alt="preview" className="w-24 h-24 rounded-full object-cover mb-2 shadow-lg" /> : <div className="text-5xl mb-2">🤳</div>}
                  <span className="text-sm text-gray-500">{photoFile ? photoFile.name : 'Click to select photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => { setPhotoFile(e.target.files[0]); setPhotoPreview(URL.createObjectURL(e.target.files[0])); }} />
                </label>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
                  {loading ? 'Uploading...' : '📸 Upload & Continue'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleAadhaarUpload} className="space-y-4">
                <p className="text-center text-sm text-gray-500">Enter your Aadhaar number and upload the card photo</p>
                <div>
                  <Field icon="🪪">
                    <input type="text" placeholder="1234 5678 9012" maxLength={14} value={aadhaarNumber}
                      onChange={e => { const d = e.target.value.replace(/\D/g, '').slice(0, 12); setAadhaarNumber(d.replace(/(\d{4})(?=\d)/g, '$1 ')); }}
                      className={`${inputCls} tracking-widest font-mono`} required />
                  </Field>
                  {aadhaarNumber.replace(/\s/g, '').length === 12 && (
                    <p className="text-xs text-green-600 mt-1 ml-1">✓ Will be stored as: XXXX XXXX {aadhaarNumber.replace(/\s/g, '').slice(8)}</p>
                  )}
                </div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition-all bg-blue-50/50">
                  <div className="text-5xl mb-2">{aadhaarFile ? '📄' : '🪪'}</div>
                  <span className="text-sm text-gray-500">{aadhaarName || 'Upload Aadhaar card photo (front)'}</span>
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG or PDF · max 5MB</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { setAadhaarFile(e.target.files[0]); setAadhaarName(e.target.files[0].name); }} />
                </label>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-lg disabled:opacity-60">
                  {loading ? 'Verifying...' : '🪪 Submit & Complete'}
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center space-y-3 py-4">
                <div className="text-6xl">⏳</div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Documents Submitted!</h2>
                <p className="text-gray-500 text-sm">Your Aadhaar / ID is under review by our team.</p>
                <p className="text-gray-400 text-xs">You'll be able to log in once approved. This usually takes 24–48 hours.</p>
                <button onClick={() => { setMode('login'); setStep(0); }}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all">
                  Go to Login
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SellerLogin;
