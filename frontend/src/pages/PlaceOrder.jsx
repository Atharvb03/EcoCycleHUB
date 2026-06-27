import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    // Razorpay Payment
    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Order Payment',
            description: 'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        backendUrl + '/api/order/verifyRazorpay',
                        response,
                        { headers: { token } } // ✅ pass token for auth
                    )
                    if (data.success) {
                        toast.success('Payment Successful!')
                        setCartItems({})
                        navigate('/orders')
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.response?.data?.message || "Payment failed")
                }
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    // On Submit Handler
    // On Submit Handler
const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {

        let orderItems = []

        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                if (cartItems[items][item] > 0) {
                    const itemInfo = structuredClone(products.find(product => product._id === items))
                    if (itemInfo) {
                        itemInfo.size = item
                        itemInfo.quantity = cartItems[items][item]
                        orderItems.push(itemInfo)
                    }
                }
            }
        }

        let orderData = {
            address: formData,
            items: orderItems,
            amount: getCartAmount() + delivery_fee
        }

        switch (method) {

            // Cash on Delivery
            case 'cod':
                const response = await axios.post(
                    backendUrl + '/api/order/place',
                    orderData,
                    { headers: { token } } // ✅ pass token
                )
                if (response.data.success) {
                    toast.success('Order placed successfully!')
                    setCartItems({})
                    navigate('/orders')
                } else {
                    toast.error(response.data.message)
                }
                break;

            // Stripe
            case 'stripe':
                const responseStripe = await axios.post(
                    backendUrl + '/api/order/stripe',
                    orderData,
                    { headers: { token } }
                )
                if (responseStripe.data.success) {
                    const { session_url } = responseStripe.data
                    window.location.replace(session_url)
                } else {
                    toast.error(responseStripe.data.message)
                }
                break;

            // Razorpay
            case 'razorpay':
                const responseRazorpay = await axios.post(
                    backendUrl + '/api/order/razorpay',
                    orderData,
                    { headers: { token } }
                )
                if (responseRazorpay.data.success) {
                    initPay(responseRazorpay.data.order)
                }
                break;

            default:
                break;
        }

    } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || error.message)
    }
}

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 relative overflow-hidden'>
            {/* Animated Background Circles */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <form onSubmit={onSubmitHandler} className='relative z-10 flex flex-col sm:flex-row justify-between gap-8 pt-5 sm:pt-14 min-h-[80vh] max-w-7xl mx-auto px-4 pb-20'>
            {/* Left Side - Delivery Info */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px] animate-fade-in-up'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>

                <div className='backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl space-y-4'>
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='firstName' 
                            value={formData.firstName} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="text" 
                            placeholder='First name' 
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='lastName' 
                            value={formData.lastName} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="text" 
                            placeholder='Last name' 
                        />
                    </div>

                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='email' 
                        value={formData.email} 
                        className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                        type="email" 
                        placeholder='Email address' 
                    />
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='street' 
                        value={formData.street} 
                        className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                        type="text" 
                        placeholder='Street' 
                    />

                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='city' 
                            value={formData.city} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="text" 
                            placeholder='City' 
                        />
                        <input 
                            onChange={onChangeHandler} 
                            name='state' 
                            value={formData.state} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="text" 
                            placeholder='State' 
                        />
                    </div>

                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='zipcode' 
                            value={formData.zipcode} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="number" 
                            placeholder='Zipcode' 
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='country' 
                            value={formData.country} 
                            className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                            type="text" 
                            placeholder='Country' 
                        />
                    </div>

                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='phone' 
                        value={formData.phone} 
                        className='border-2 border-gray-300 dark:border-gray-700 rounded-xl py-3 px-4 w-full focus:border-green-500 focus:outline-none transition-all' 
                        type="number" 
                        placeholder='Phone' 
                    />
                </div>
            </div>

            {/* Right Side - Payment Info */}
            <div className='mt-8 animate-fade-in-up' style={{ animationDelay: '0.1s' }}>
                <div className='mt-8 min-w-80 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl'>
                    <CartTotal />
                </div>

                <div className='mt-8 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl'>
                    <div className='mb-6'>
                        <Title text1={'PAYMENT'} text2={'METHOD'} />
                    </div>

                    <div className='flex gap-4 flex-col lg:flex-row'>
                        <div 
                            onClick={() => setMethod('stripe')} 
                            className={`flex items-center gap-3 border-2 p-4 px-5 rounded-xl cursor-pointer transition-all duration-300
                                      hover:scale-105 hover:shadow-lg ${method === 'stripe' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        >
                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all
                                          ${method === 'stripe' ? 'border-green-500' : 'border-gray-400'}`}>
                                {method === 'stripe' && <div className='w-3 h-3 bg-green-500 rounded-full animate-scale-in' />}
                            </div>
                            <img className='h-5 mx-2' src={assets.stripe_logo} alt="" />
                        </div>
                        <div 
                            onClick={() => setMethod('razorpay')} 
                            className={`flex items-center gap-3 border-2 p-4 px-5 rounded-xl cursor-pointer transition-all duration-300
                                      hover:scale-105 hover:shadow-lg ${method === 'razorpay' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        >
                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all
                                          ${method === 'razorpay' ? 'border-green-500' : 'border-gray-400'}`}>
                                {method === 'razorpay' && <div className='w-3 h-3 bg-green-500 rounded-full animate-scale-in' />}
                            </div>
                            <img className='h-5 mx-2' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div 
                            onClick={() => setMethod('cod')} 
                            className={`flex items-center gap-3 border-2 p-4 px-5 rounded-xl cursor-pointer transition-all duration-300
                                      hover:scale-105 hover:shadow-lg ${method === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                        >
                            <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all
                                          ${method === 'cod' ? 'border-green-500' : 'border-gray-400'}`}>
                                {method === 'cod' && <div className='w-3 h-3 bg-green-500 rounded-full animate-scale-in' />}
                            </div>
                            <p className='text-gray-700 dark:text-gray-200 text-sm font-semibold mx-2'>💵 CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button 
                            type='submit' 
                            className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-16 py-4 text-sm font-semibold rounded-xl
                                     hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300
                                     relative overflow-hidden group'
                        >
                            <span className='relative z-10'>PLACE ORDER 🚀</span>
                            <div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
                        </button>
                    </div>

                </div>
            </div>
        </form>
        </div>
    )
}

export default PlaceOrder
