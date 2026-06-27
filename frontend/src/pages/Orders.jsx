import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {

  const { backendUrl, token , currency} = useContext(ShopContext);

  const [orderData,setorderData] = useState([])

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders',{},{headers:{token}})
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            allOrdersItem.push(item)
          })
        })
        setorderData(allOrdersItem.reverse())
      }
      
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    loadOrderData()
  },[token])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 pt-16 pb-20 relative overflow-hidden'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='max-w-6xl mx-auto px-4 relative z-10'>
        <div className='text-2xl mb-8 animate-fade-in-up'>
            <Title text1={'MY'} text2={'ORDERS'}/>
        </div>

        {orderData.length === 0 ? (
          <div className='text-center py-20 animate-fade-in-up'>
            <div className='text-6xl mb-4'>📦</div>
            <p className='text-xl text-gray-600 dark:text-gray-300'>No orders yet</p>
            <button 
              onClick={() => navigate('/collection')}
              className='mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl
                       hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300'
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className='space-y-6'>
              {
                orderData.map((item,index) => (
                  <div 
                    key={index} 
                    className='backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl
                             hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
                             flex flex-col md:flex-row md:items-center md:justify-between gap-6
                             animate-fade-in-up'
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                      <div className='flex items-start gap-6 text-sm flex-1'>
                          <div className='relative group overflow-hidden rounded-xl'>
                            <img 
                              className='w-16 sm:w-20 transform group-hover:scale-110 transition-transform duration-500' 
                              src={item.image[0]} 
                              alt="" 
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                          </div>
                          <div className='flex-1'>
                            <p className='sm:text-base font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
                              {item.name}
                            </p>
                            <div className='flex items-center gap-3 mt-2 text-base text-gray-700 dark:text-gray-200 flex-wrap'>
                              <span className='font-bold text-green-600'>{currency}{item.price}</span>
                              <span className='px-3 py-1 bg-blue-50 border-2 border-blue-500/30 rounded-lg'>Qty: {item.quantity}</span>
                              <span className='px-3 py-1 bg-purple-50 border-2 border-purple-500/30 rounded-lg'>Size: {item.size}</span>
                            </div>
                            <p className='mt-2 text-gray-600 dark:text-gray-300'>
                              <span className='font-medium'>Date:</span> {new Date(item.date).toDateString()}
                            </p>
                            <p className='mt-1 text-gray-600 dark:text-gray-300'>
                              <span className='font-medium'>Payment:</span> {item.paymentMethod}
                            </p>
                          </div>
                      </div>
                      <div className='md:w-1/3 flex justify-between md:justify-end'>
                          <div className='flex items-center gap-3 px-4 py-2 rounded-xl bg-green-50 border-2 border-green-500/30'>
                              <div className='w-3 h-3 rounded-full bg-green-500 animate-pulse'></div>
                              <p className='text-sm md:text-base font-medium text-green-700'>{item.status}</p>
                          </div>
                      </div>
                  </div>
                ))
              }
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
