import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Orders = ({ token, isSeller = false }) => {

  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')

  const statuses = ['All', 'Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered']

  const fetchAllOrders = async () => {
    if (!token) return null;
    try {
      const url = isSeller
        ? backendUrl + '/api/order/seller/list'
        : backendUrl + '/api/order/list';
      const response = await axios.post(url, {}, { headers: { token } })
      if (response.data.success) {
        setOrders(response.data.orders.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (newStatus, orderId) => {
    try {
      const response = await axios.post(backendUrl + '/api/order/status', { orderId, status: newStatus }, { headers: { token } })
      if (response.data.success) {
        await fetchAllOrders()
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to update status')
    }
  }

  const filteredOrders = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter)

  const statusColor = (s) => {
    if (s === 'Delivered') return 'bg-green-100 text-green-700 border-green-300'
    if (s === 'Shipped' || s === 'Out for delivery') return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 border-blue-300'
    if (s === 'Packing') return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-100 border-gray-300 dark:border-gray-700'
  }

  useEffect(() => {
    fetchAllOrders();
  }, [token])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 p-6 relative overflow-hidden'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-7xl mx-auto'>
        <h1 className='mb-6 text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up'>
          Order Management
        </h1>

        {/* Status Filter */}
        <div className='flex flex-wrap items-center gap-3 mb-6 animate-fade-in-up' style={{ animationDelay: '0.1s' }}>
          <span className='text-sm font-semibold text-gray-600 dark:text-gray-100'>Filter by status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2 font-semibold border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white dark:bg-gray-900 shadow-sm'
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className='text-sm text-gray-400 dark:text-gray-100'>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
        </div>

        <div className='space-y-4'>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <div 
                key={index} 
                className='backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300
                         grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-4 items-start p-6
                         animate-fade-in-up'
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className='flex justify-center'>
                  <div className='w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg'>
                    <img className='w-10' src={assets.parcel_icon} alt="" />
                  </div>
                </div>
                
                <div>
                  <div className='mb-3'>
                    {order.items.map((item, index) => {
                      if (index === order.items.length - 1) {
                        return <p className='py-0.5 text-gray-700 dark:text-gray-100' key={index}> {item.name} x {item.quantity} <span className='px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-500/30 rounded text-xs'> {item.size} </span> </p>
                      } else {
                        return <p className='py-0.5 text-gray-700 dark:text-gray-100' key={index}> {item.name} x {item.quantity} <span className='px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-500/30 rounded text-xs'> {item.size} </span> ,</p>
                      }
                    })}
                  </div>
                  <p className='mt-3 mb-2 font-semibold text-gray-800 dark:text-gray-100'>{order.address.firstName + " " + order.address.lastName}</p>
                  <div className='text-sm text-gray-600 dark:text-gray-100'>
                    <p>{order.address.street + ","}</p>
                    <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                  </div>
                  <p className='mt-2 text-sm text-gray-600 dark:text-gray-100'>📞 {order.address.phone}</p>
                </div>
                
                <div className='text-sm'>
                  <p className='mb-2'><span className='font-medium'>Items:</span> {order.items.length}</p>
                  <p className='mb-2'><span className='font-medium'>Method:</span> {order.paymentMethod}</p>
                  <p className='mb-2'>
                    <span className='font-medium'>Payment:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${order.payment ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.payment ? '✓ Done' : '⏳ Pending'}
                    </span>
                  </p>
                  <p><span className='font-medium'>Date:</span> {new Date(order.date).toLocaleDateString()}</p>
                </div>
                
                <p className='text-xl font-bold text-green-600'>{currency}{order.amount}</p>

                {/* Status badge + update dropdown */}
                <div className='flex flex-col gap-2'>
                  <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <select
                    onChange={e => statusHandler(e.target.value, order._id)}
                    value={order.status}
                    className='p-2 text-sm font-semibold border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:border-green-500 focus:outline-none transition-all bg-white'
                  >
                    {statuses.filter(s => s !== 'All').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl shadow-xl animate-fade-in-up'>
              <div className='text-6xl mb-4'>📦</div>
              <p className='text-xl text-gray-600 dark:text-gray-100'>No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Orders