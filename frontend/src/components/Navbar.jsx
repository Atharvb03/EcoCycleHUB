import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { Link, NavLink } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    rewardPoints = 0
  } = useContext(ShopContext)

  const logout = () => {
    navigate('/login')
    localStorage.removeItem('token')
    setToken('')
    setCartItems({})
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearch(true)
      navigate('/collection')
      setSearchOpen(false)
    }
  }

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-all duration-200 pb-1 ${
      isActive
        ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-green-500 after:to-blue-500 after:rounded-full'
        : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <>
      <nav className='sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 flex items-center justify-between h-16'>

          {/* Logo + Brand Name */}
          <Link to='/' className='shrink-0 flex items-center gap-2'>
            <img src={assets.logo} className='w-10 h-10 object-contain' alt="EcoCycleHub" />
            <span className='text-xl font-bold leading-none'>
              <span className='text-black'>EcoCycle</span>
              <span className='bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>HUB</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <ul className='hidden lg:flex items-center gap-6'>
            <li><NavLink to='/' className={navLinkClass}>HOME</NavLink></li>
            <li><NavLink to='/about' className={navLinkClass}>ABOUT</NavLink></li>
            <li><NavLink to='/contact' className={navLinkClass}>CONTACT</NavLink></li>
            <li><NavLink to='/centers' className={navLinkClass}>CENTERS</NavLink></li>
            <li>
              <button onClick={() => token ? navigate('/rewards') : navigate('/login')}
                className='relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors pb-1'>
                REWARDS
                {token && rewardPoints > 0 && (
                  <span className='ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold'>
                    {rewardPoints}
                  </span>
                )}
              </button>
            </li>
          </ul>

          {/* Portal Buttons */}
          <div className='hidden lg:flex items-center gap-2'>
            <button onClick={() => navigate('/buyer')}
              className='px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:opacity-90 transition-all text-sm'>
              Buyers Portal
            </button>
            <button onClick={() => navigate('/seller')}
              className='px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:opacity-90 transition-all text-sm'>
              Seller Portal
            </button>
            <button onClick={() => navigate('/admin')}
              className='px-4 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-all text-sm'>
              Admin Panel
            </button>
          </div>

          {/* Right Icons */}
          <div className='flex items-center gap-1'>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(s => !s)}
              className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group'
              aria-label="Search"
            >
              <svg className='w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
              </svg>
            </button>

            {/* Profile */}
            <div className='group relative'>
              <button
                onClick={() => !token && navigate('/login')}
                className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group/btn'
                aria-label="Profile"
              >
                {token ? (
                  <div className='w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm'>
                    👤
                  </div>
                ) : (
                  <svg className='w-5 h-5 text-gray-500 group-hover/btn:text-green-600 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z' />
                  </svg>
                )}
              </button>

              {token && (
                <div className='group-hover:block hidden absolute right-0 top-full pt-2 z-50 min-w-[200px]'>
                  <div className='bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl overflow-hidden'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-green-500 to-blue-600 px-4 py-3'>
                      <p className='text-white font-semibold text-sm'>My Account</p>
                      {rewardPoints > 0 && (
                        <p className='text-green-100 text-xs mt-0.5'>🌟 {rewardPoints} eco points</p>
                      )}
                    </div>
                    {/* Menu Items */}
                    <div className='py-1'>
                      {[
                        { icon: '👤', label: 'My Profile', path: '/profile' },
                        { icon: '📦', label: 'My Orders', path: '/orders' },
                        { icon: '♻️', label: 'My Submissions', path: '/recycle-history' },
                        { icon: '🏅', label: 'Rewards', path: '/rewards' },
                      ].map(item => (
                        <button key={item.path} onClick={() => navigate(item.path)}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors text-left'>
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                      <div className='border-t border-gray-100 mt-1 pt-1'>
                        <button onClick={logout}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left'>
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to='/cart' className='relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors group' aria-label="Cart">
              <svg className='w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m5-9l2 9' />
              </svg>
              {getCartCount() > 0 && (
                <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm'>
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button onClick={() => setVisible(true)}
              className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors lg:hidden'>
              <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-20 border-t border-gray-100' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className='max-w-2xl mx-auto px-4 py-3'>
            <div className='flex items-center gap-2 bg-gray-50 border-2 border-gray-200 focus-within:border-green-400 rounded-xl px-4 py-2 transition-all'>
              <svg className='w-4 h-4 text-gray-400 shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z' />
              </svg>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search products...'
                className='flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400'
              />
              {searchQuery && (
                <button type='button' onClick={() => setSearchQuery('')} className='text-gray-400 hover:text-gray-600'>✕</button>
              )}
              <button type='submit'
                className='px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all'>
                Search
              </button>
            </div>
          </form>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
             onClick={() => setVisible(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex items-center justify-between p-4 border-b'>
            <div className='flex items-center gap-2'>
              <img src={assets.logo} className='w-8 h-8 object-contain' alt="" />
              <span className='text-base font-bold leading-none'>
                <span className='text-black'>EcoCycle</span>
                <span className='bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent'>HUB</span>
              </span>
            </div>
            <button onClick={() => setVisible(false)}
              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500'>✕</button>
          </div>
          <div className='p-4 flex flex-col gap-1'>
            {[
              { to: '/', label: '🏠 Home' },
              { to: '/about', label: 'ℹ️ About' },
              { to: '/contact', label: '📞 Contact' },
              { to: '/centers', label: '📍 Centers Near Me' },
              { to: '/rewards', label: `🏅 Rewards${token && rewardPoints > 0 ? ` (${rewardPoints} pts)` : ''}` },
            ].map(item => (
              <NavLink key={item.to} to={item.to} onClick={() => setVisible(false)}
                className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                {item.label}
              </NavLink>
            ))}
            <div className='border-t border-gray-100 my-2' />
            <button onClick={() => { setVisible(false); navigate('/buyer') }}
              className='px-4 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors text-left'>
              Buyers Portal
            </button>
            <button onClick={() => { setVisible(false); navigate('/seller') }}
              className='px-4 py-3 rounded-xl text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors text-left'>
              Seller Portal
            </button>
            <button onClick={() => { setVisible(false); navigate('/admin') }}
              className='px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-left'>
              Admin Panel
            </button>
            {token && (
              <>
                <div className='border-t border-gray-100 my-2' />
                <button onClick={() => { setVisible(false); logout() }}
                  className='px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors text-left'>
                  🚪 Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
