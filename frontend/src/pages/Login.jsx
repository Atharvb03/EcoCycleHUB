import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

// currentState: 'Login' | 'Sign Up' | 'forgot-email' | 'forgot-otp' | 'forgot-reset'

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext)

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  // Forgot password state
  const [fpEmail, setFpEmail] = useState('')
  const [fpOtp, setFpOtp] = useState('')
  const [fpNewPassword, setFpNewPassword] = useState('')
  const [fpConfirm, setFpConfirm] = useState('')
  const [fpLoading, setFpLoading] = useState(false)

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign Up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      } else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleForgotEmail = async (e) => {
    e.preventDefault()
    setFpLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/user/forgot-password', { email: fpEmail })
      if (res.data.success) {
        toast.success('OTP sent! Check your email.')
        // Dev: show OTP in toast
        if (res.data.devOtp) toast.info(`[DEV] OTP: ${res.data.devOtp}`, { autoClose: 15000 })
        setCurrentState('forgot-otp')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setFpLoading(false)
    }
  }

  const handleForgotReset = async (e) => {
    e.preventDefault()
    if (fpNewPassword !== fpConfirm) { toast.error('Passwords do not match'); return }
    setFpLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/user/reset-password', {
        email: fpEmail, otp: fpOtp, newPassword: fpNewPassword
      })
      if (res.data.success) {
        toast.success('Password updated! Please login.')
        setCurrentState('Login')
        setFpEmail(''); setFpOtp(''); setFpNewPassword(''); setFpConfirm('')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setFpLoading(false)
    }
  }

  useEffect(() => {
    if (token) navigate('/')
  }, [token])

  const isForgot = currentState.startsWith('forgot')

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center relative overflow-hidden py-20'>
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className='relative z-10 flex flex-col items-center w-[90%] sm:max-w-md backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl p-8 animate-scale-in'>

        {/* ── FORGOT PASSWORD FLOWS ── */}
        {isForgot && (
          <>
            <div className='inline-flex items-center gap-3 mb-6'>
              <p className='prata-regular text-3xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-bold'>
                {currentState === 'forgot-email' ? 'Forgot Password' :
                 currentState === 'forgot-otp'   ? 'Enter OTP' : 'New Password'}
              </p>
              <div className='h-[2px] w-12 bg-gradient-to-r from-orange-500 to-red-500' />
            </div>

            {/* Step indicator */}
            <div className='flex items-center gap-2 mb-6 w-full justify-center'>
              {['forgot-email', 'forgot-otp', 'forgot-reset'].map((step, i) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${currentState === step ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' :
                      ['forgot-email','forgot-otp','forgot-reset'].indexOf(currentState) > i
                        ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {['forgot-email','forgot-otp','forgot-reset'].indexOf(currentState) > i ? '✓' : i + 1}
                  </div>
                  {i < 2 && <div className={`flex-1 h-1 rounded-full ${['forgot-email','forgot-otp','forgot-reset'].indexOf(currentState) > i ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* Step 1: Email */}
            {currentState === 'forgot-email' && (
              <form onSubmit={handleForgotEmail} className='w-full space-y-4'>
                <p className='text-sm text-gray-500 text-center mb-2'>Enter your registered email to receive an OTP</p>
                <input
                  type="email" required value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                  placeholder='Registered email'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none transition-all bg-white/90'
                />
                <button type="submit" disabled={fpLoading}
                  className='w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-4 rounded-xl
                           hover:shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60'>
                  {fpLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {currentState === 'forgot-otp' && (
              <form onSubmit={e => { e.preventDefault(); setCurrentState('forgot-reset') }} className='w-full space-y-4'>
                <p className='text-sm text-gray-500 text-center mb-2'>Enter the 6-digit OTP sent to <span className='font-semibold text-gray-700'>{fpEmail}</span></p>
                <input
                  type="text" required maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value)}
                  placeholder='6-digit OTP'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none transition-all bg-white/90 text-center text-2xl tracking-[0.5em] font-mono'
                />
                <button type="submit"
                  className='w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-4 rounded-xl
                           hover:shadow-lg hover:shadow-orange-500/50 transform hover:-translate-y-1 transition-all duration-300'>
                  Verify OTP
                </button>
                <p className='text-center text-sm text-gray-500'>
                  Didn't get it?{' '}
                  <span onClick={() => setCurrentState('forgot-email')} className='text-orange-500 cursor-pointer hover:underline'>Resend</span>
                </p>
              </form>
            )}

            {/* Step 3: New password */}
            {currentState === 'forgot-reset' && (
              <form onSubmit={handleForgotReset} className='w-full space-y-4'>
                <p className='text-sm text-gray-500 text-center mb-2'>Set your new password</p>
                <input
                  type="password" required minLength={8} value={fpNewPassword} onChange={e => setFpNewPassword(e.target.value)}
                  placeholder='New password (min 8 chars)'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none transition-all bg-white/90'
                />
                <input
                  type="password" required value={fpConfirm} onChange={e => setFpConfirm(e.target.value)}
                  placeholder='Confirm new password'
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-400 focus:outline-none transition-all bg-white/90'
                />
                <button type="submit" disabled={fpLoading}
                  className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-8 py-4 rounded-xl
                           hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-60'>
                  {fpLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <p onClick={() => setCurrentState('Login')}
               className='mt-6 text-sm text-gray-500 cursor-pointer hover:text-green-600 transition-colors'>
              ← Back to Login
            </p>
          </>
        )}

        {/* ── LOGIN / SIGN UP ── */}
        {!isForgot && (
          <form onSubmit={onSubmitHandler} className='w-full flex flex-col items-center'>
            <div className='inline-flex items-center gap-3 mb-8'>
              <p className='prata-regular text-4xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold'>
                {currentState}
              </p>
              <div className='h-[2px] w-12 bg-gradient-to-r from-green-600 to-blue-600' />
            </div>

            <div className='w-full space-y-4'>
              {currentState === 'Sign Up' && (
                <input onChange={e => setName(e.target.value)} value={name} type="text"
                  className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white/90'
                  placeholder='Name' required />
              )}
              <input onChange={e => setEmail(e.target.value)} value={email} type="email"
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white/90'
                placeholder='Email' required />
              <input onChange={e => setPassword(e.target.value)} value={password} type="password"
                className='w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white/90'
                placeholder='Password' required />
            </div>

            <div className='w-full flex justify-between text-sm mt-4 text-gray-600'>
              <p onClick={() => { setFpEmail(email); setCurrentState('forgot-email') }}
                 className='cursor-pointer hover:text-orange-500 transition-colors'>
                Forgot your password?
              </p>
              {currentState === 'Login'
                ? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer hover:text-green-600 transition-colors font-medium'>Create account</p>
                : <p onClick={() => setCurrentState('Login')} className='cursor-pointer hover:text-green-600 transition-colors font-medium'>Login Here</p>
              }
            </div>

            <button className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-8 py-4 mt-6 rounded-xl
                             hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300
                             relative overflow-hidden group'>
              <span className='relative z-10'>{currentState === 'Login' ? 'Sign In' : 'Sign Up'}</span>
              <div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
            </button>
          </form>
        )}

        <div className='absolute -top-4 -right-4 text-4xl animate-bounce-slow'>🌱</div>
        <div className='absolute -bottom-4 -left-4 text-4xl animate-bounce-slow' style={{ animationDelay: '1s' }}>♻️</div>
      </div>
    </div>
  )
}

export default Login
