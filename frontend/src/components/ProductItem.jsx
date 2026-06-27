import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import {Link} from 'react-router-dom'

const ProductItem = ({id,image,name,price}) => {
    
    const {currency} = useContext(ShopContext);

  return (
    <Link onClick={()=>scrollTo(0,0)} to={`/product/${id}`}>
      <div className='group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 dark:border-gray-800 shadow-lg
                      hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20
                      transition-all duration-500 ease-out hover:rotate-1'>
        
        {/* Animated Gradient Border on Hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 
                        opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
        
        {/* Product Image */}
        <div className='overflow-hidden rounded-t-2xl'>
          <img className='w-full h-64 object-cover transform group-hover:scale-110 group-hover:rotate-2 
                         transition-all duration-700' 
               src={image[0]} 
               alt={name} />
        </div>
        
        {/* Product Info */}
        <div className='p-4 relative z-10'>
          <p className='text-sm text-gray-700 dark:text-gray-200 dark:text-gray-200 font-medium mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 
                       transition-colors duration-300'>
            {name}
          </p>
          <div className='flex items-center justify-between'>
            <p className='text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 
                         bg-clip-text text-transparent'>
              {currency}{price}
            </p>
            <div className='opacity-0 group-hover:opacity-100 transform translate-x-2 
                           group-hover:translate-x-0 transition-all duration-300'>
              <span className='text-green-600 text-sm font-semibold'>View →</span>
            </div>
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <div className='absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                       rounded-2xl pointer-events-none' />
      </div>
    </Link>
  )
}

export default ProductItem
