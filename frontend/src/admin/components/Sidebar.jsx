import React from 'react'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
        : 'text-gray-600 dark:text-gray-100 hover:bg-white/80 dark:hover:bg-gray-800 dark:bg-gray-900/85 hover:text-gray-900 dark:hover:text-white dark:text-gray-100 hover:shadow-md'
    }`

  return (
    <div className='w-[220px] min-h-screen border-r border-white/30 dark:border-gray-700/60 bg-white/40 dark:bg-gray-900/70 backdrop-blur-sm pt-8 px-4'>
      <p className='text-xs font-bold text-gray-400 dark:text-gray-100 uppercase tracking-widest mb-4 px-2'>Admin Panel</p>
      <div className='flex flex-col gap-2'>

        <NavLink className={linkClass} to="list">
          <span className='text-xl'>🛍️</span>
          <span className='hidden md:block'>All Collections</span>
        </NavLink>

        <NavLink className={linkClass} to="orders">
          <span className='text-xl'>📦</span>
          <span className='hidden md:block'>Orders</span>
        </NavLink>

        <NavLink className={linkClass} to="users">
          <span className='text-xl'>👥</span>
          <span className='hidden md:block'>Users & Points</span>
        </NavLink>

        <NavLink className={linkClass} to="kyc">
          <span className='text-xl'>🪪</span>
          <span className='hidden md:block'>Seller KYC</span>
        </NavLink>

      </div>
    </div>
  )
}

export default Sidebar
