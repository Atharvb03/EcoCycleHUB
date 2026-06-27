import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token, isSeller = false }) => {
  const [list, setList] = useState([])

  const fetchList = async () => {
    try {
      const url = isSeller
        ? `${backendUrl}/api/product/seller/list`
        : `${backendUrl}/api/product/list`;
      const response = await axios.get(url, { headers: token ? { token } : {} })

      if (response.data.success) {
        // Ensure products exist
        setList(response.data.products.reverse())
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const url = isSeller
        ? `${backendUrl}/api/product/seller/remove`
        : `${backendUrl}/api/product/remove`;
      const response = await axios.post(url, { id }, { headers: token ? { token } : {} })

      if (response.data.success) {
        toast.success(response.data.message)
        fetchList() // refresh list
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-emerald-950 dark:to-slate-950 p-6 relative overflow-hidden'>
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className='relative z-10 max-w-7xl mx-auto'>
        <h1 className='mb-6 text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up'>
          All Collections
        </h1>

        {/* Product Cards Grid */}
        {list.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {list.map((item, index) => (
              <div
                key={index}
                className='backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up flex flex-col'
                style={{ animationDelay: `${index * 0.04}s` }}
              >
                {/* Image */}
                <div className='relative group overflow-hidden aspect-square'>
                  <img
                    className='w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500'
                    src={item.image && item.image.length > 0 ? item.image[0] : "/placeholder.png"}
                    alt={item.name || "Product"}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                </div>

                {/* Info */}
                <div className='p-3 flex flex-col gap-1 flex-1'>
                  <p className='font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight line-clamp-2'>{item.name || "-"}</p>
                  <span className='self-start px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 rounded-full text-xs text-blue-700 font-medium'>
                    {item.category || "-"}
                  </span>
                  <p className='font-bold text-green-600 text-sm mt-auto pt-1'>{currency}{item.price?.toFixed(2) || "0.00"}</p>
                  {item.sellerName && (
                    <p className='text-[10px] text-gray-400 dark:text-gray-100 truncate'>🏪 {item.sellerName}</p>
                  )}
                </div>

                {/* Action */}
                <div className='px-3 pb-3'>
                  <button
                    onClick={() => removeProduct(item._id)}
                    className='w-full py-1.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-sm font-semibold
                             transition-all duration-300 hover:shadow-md hover:shadow-red-500/30'
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-20 backdrop-blur-xl bg-white/80 dark:bg-gray-900/85 border border-white/20 dark:border-gray-700/60 rounded-2xl shadow-xl animate-fade-in-up'>
            <div className='text-6xl mb-4'>📦</div>
            <p className='text-xl text-gray-600 dark:text-gray-100'>No products found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default List
