import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import {toast} from 'react-toastify'
import axios from 'axios'

const Verify = () => {

    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams, setSearchParams] = useSearchParams()
    
    const success = searchParams.get('success')
    const orderId = searchParams.get('orderId')

    const verifyPayment = async () => {
        try {

            if (!token) {
                return null
            }

            const response = await axios.post(backendUrl + '/api/order/verifyStripe', { success, orderId }, { headers: { token } })

            if (response.data.success) {
                setCartItems({})
                navigate('/orders')
            } else {
                navigate('/cart')
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 flex items-center justify-center relative overflow-hidden'>
            {/* Animated Background Circles */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className='relative z-10 text-center backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-3xl p-12 shadow-2xl animate-scale-in'>
                <div className='text-6xl mb-4 animate-spin-slow'>⏳</div>
                <h2 className='text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2'>
                    Verifying Payment
                </h2>
                <p className='text-gray-600 dark:text-gray-300'>Please wait while we confirm your order...</p>
                
                {/* Loading Animation */}
                <div className='mt-6 flex justify-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-bounce' />
                    <div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }} />
                    <div className='w-3 h-3 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        </div>
    )
}

export default Verify