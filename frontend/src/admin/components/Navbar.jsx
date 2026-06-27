import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  return (
    <div className='flex items-center py-3 px-[4%] justify-between bg-white/80 dark:bg-gray-900/85 backdrop-blur-sm border-b border-green-100 dark:border-emerald-900/60 shadow-sm'>
      <div className='flex items-center gap-3'>
        <img className='w-[max(10%,80px)]' src={assets.logo} alt="EcoCycleHub" />
        <span className='hidden sm:block text-sm font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent'>
          Admin Panel
        </span>
      </div>

      <button
        onClick={handleLogout}
        className='flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white
                   px-5 py-2 rounded-full text-xs sm:text-sm font-medium
                   hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all duration-300 shadow-md shadow-green-500/30'
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </div>
  )
}

export default Navbar
