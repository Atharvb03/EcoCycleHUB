import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {

  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);

  useEffect(() => {

    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            })
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 pt-14 pb-20 relative overflow-hidden'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='max-w-6xl mx-auto px-4 relative z-10'>
        <div className='text-2xl mb-8 animate-fade-in-up'>
          <Title text1={'YOUR'} text2={'CART'} />
        </div>

        {cartData.length === 0 ? (
          <div className='text-center py-20 animate-fade-in-up'>
            <div className='text-6xl mb-4'>🛒</div>
            <p className='text-xl text-gray-600 dark:text-gray-300'>Your cart is empty</p>
            <button 
              onClick={() => navigate('/collection')}
              className='mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl
                       hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300'
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className='space-y-4'>
              {
                cartData.map((item, index) => {
                  const productData = products.find((product) => product._id === item._id);

                  return (
                    <div 
                      key={index} 
                      className='backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-4 shadow-xl
                               hover:shadow-2xl hover:scale-[1.02] transition-all duration-300
                               grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4
                               animate-fade-in-up'
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className='flex items-start gap-6'>
                        <div className='relative group overflow-hidden rounded-xl'>
                          <img 
                            className='w-16 sm:w-20 transform group-hover:scale-110 transition-transform duration-500' 
                            src={productData.image[0]} 
                            alt="" 
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                        </div>
                        <div>
                          <p className='text-xs sm:text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent'>
                            {productData.name}
                          </p>
                          <div className='flex items-center gap-5 mt-2'>
                            <p className='font-bold text-green-600'>{currency}{productData.price}</p>
                            <p className='px-2 sm:px-3 sm:py-1 border-2 border-green-500/30 bg-green-50 rounded-lg text-sm font-medium'>
                              {item.size}
                            </p>
                          </div>
                        </div>
                      </div>
                      <input 
                        onChange={(e) => e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.size, Number(e.target.value))} 
                        className='border-2 border-gray-300 dark:border-gray-700 rounded-lg max-w-10 sm:max-w-20 px-1 sm:px-2 py-1 text-center
                                 focus:border-green-500 focus:outline-none transition-colors' 
                        type="number" 
                        min={1} 
                        defaultValue={item.quantity} 
                      />
                      <button
                        onClick={() => updateQuantity(item._id, item.size, 0)}
                        className='w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full
                                 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white
                                 transform hover:scale-110 hover:rotate-12 transition-all duration-300 mr-4'
                      >
                        <img className='w-4 sm:w-5' src={assets.bin_icon} alt="" />
                      </button>
                    </div>
                  )
                })
              }
            </div>

            <div className='flex justify-end my-12 animate-fade-in-up' style={{ animationDelay: '0.3s' }}>
              <div className='w-full sm:w-[450px] backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl p-6 shadow-xl'>
                <CartTotal />
                <div className='w-full text-end mt-6'>
                  <button 
                    onClick={() => navigate('/place-order')} 
                    className='w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold py-4 rounded-xl
                             hover:shadow-lg hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300
                             relative overflow-hidden group'
                  >
                    <span className='relative z-10'>PROCEED TO CHECKOUT →</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500' />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
