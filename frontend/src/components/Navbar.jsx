import React, { useContext, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Award,
  BriefcaseBusiness,
  Building2,
  LogOut,
  Menu,
  Moon,
  Package,
  Recycle,
  Search,
  ShoppingCart,
  Sun,
  User,
  X,
} from 'lucide-react'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ isDark, toggleTheme, mobile = false }) => (
  <button
    type='button'
    onClick={toggleTheme}
    className={
      mobile
        ? 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 transition-colors'
        : 'w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors'
    }
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? (
      <>
        <Sun className='w-5 h-5 text-yellow-400' />
        {mobile && <span>Light Mode</span>}
      </>
    ) : (
      <>
        <Moon className='w-5 h-5 text-gray-600 dark:text-gray-100 dark:text-gray-100' />
        {mobile && <span>Dark Mode</span>}
      </>
    )}
  </button>
)

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { isDark, toggleTheme } = useTheme()

  const {
    setShowSearch,
    getCartCount,
    navigate,
    token,
    setToken,
    setCartItems,
    rewardPoints = 0,
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
        : 'text-gray-600 dark:text-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white'
    }`

  const accountLinks = [
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Package, label: 'My Orders', path: '/orders' },
    { icon: Recycle, label: 'My Submissions', path: '/recycle-history' },
    { icon: Award, label: 'Rewards', path: '/rewards' },
  ]

  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
    { to: '/centers', label: 'Centers Near Me' },
    { to: '/rewards', label: `Rewards${token && rewardPoints > 0 ? ` (${rewardPoints} pts)` : ''}` },
  ]

  return (
    <>
      <nav className='sticky top-0 z-40 bg-white/80 dark:bg-gray-900/85 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/30 dark:border-gray-700/50 shadow-sm transition-colors duration-300'>
        <div className='max-w-7xl mx-auto px-4 flex items-center justify-between h-16'>
          <Link to='/' className='shrink-0 flex items-center gap-1'>
            <img src={assets.logo} className='w-15 h-10 object-contain' alt='EcoCycleHub' />
            <span className='text-xl font-bold leading-none'>
              <span className='text-black dark:text-white'>EcoCycle</span>
              <span style={{ background: 'linear-gradient(to right, #78e08f, #38d996, #00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HUB</span>
            </span>
          </Link>

          <ul className='hidden lg:flex items-center gap-6'>
            <li><NavLink to='/' className={navLinkClass}>HOME</NavLink></li>
            <li><NavLink to='/about' className={navLinkClass}>ABOUT</NavLink></li>
            <li><NavLink to='/contact' className={navLinkClass}>CONTACT</NavLink></li>
            <li><NavLink to='/centers' className={navLinkClass}>CENTERS</NavLink></li>
            <li>
              <button
                type='button'
                onClick={() => token ? navigate('/rewards') : navigate('/login')}
                className='relative text-sm font-medium text-gray-600 dark:text-gray-100 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white transition-colors pb-1'
              >
                REWARDS
                {token && rewardPoints > 0 && (
                  <span className='ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold'>
                    {rewardPoints}
                  </span>
                )}
              </button>
            </li>
          </ul>

          <div className='hidden lg:flex items-center gap-2'>
            <button
              type='button'
              onClick={() => navigate('/buyer')}
              className='px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:opacity-90 transition-all text-sm'
            >
              Buyers Portal
            </button>
            <button
              type='button'
              onClick={() => navigate('/seller')}
              className='px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md hover:opacity-90 transition-all text-sm'
            >
              Seller Portal
            </button>
            <button
              type='button'
              onClick={() => navigate('/admin')}
              className='px-4 py-1 bg-black dark:bg-white text-white dark:text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 dark:bg-gray-800 transition-all text-sm'
            >
              Admin Panel
            </button>
          </div>

          <div className='flex items-center gap-1'>
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

            <button
              type='button'
              onClick={() => setSearchOpen((open) => !open)}
              className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group'
              aria-label='Search'
              title='Search'
            >
              <Search className='w-5 h-5 text-gray-500 dark:text-gray-100 group-hover:text-green-600 transition-colors' />
            </button>

            <div className='group relative'>
              <button
                type='button'
                onClick={() => !token && navigate('/login')}
                className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group/btn'
                aria-label='Profile'
                title='Profile'
              >
                {token ? (
                  <div className='w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white shadow-sm'>
                    <User className='w-4 h-4' />
                  </div>
                ) : (
                  <User className='w-5 h-5 text-gray-500 dark:text-gray-100 group-hover/btn:text-green-600 transition-colors' />
                )}
              </button>

              {token && (
                <div className='group-hover:block hidden absolute right-0 top-full pt-2 z-50 min-w-[200px]'>
                  <div className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden'>
                    <div className='bg-gradient-to-r from-green-500 to-blue-600 px-4 py-3'>
                      <p className='text-white font-semibold text-sm'>My Account</p>
                      {rewardPoints > 0 && (
                        <p className='text-green-100 text-xs mt-0.5'>{rewardPoints} eco points</p>
                      )}
                    </div>
                    <div className='py-1'>
                      {accountLinks.map(({ icon: Icon, label, path }) => (
                        <button
                          key={path}
                          type='button'
                          onClick={() => navigate(path)}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-green-50 dark:hover:bg-green-900/20 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors text-left'
                        >
                          <Icon className='w-4 h-4' />
                          <span>{label}</span>
                        </button>
                      ))}
                      <div className='border-t border-gray-100 dark:border-gray-800 dark:border-gray-700 mt-1 pt-1'>
                        <button
                          type='button'
                          onClick={logout}
                          className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left'
                        >
                          <LogOut className='w-4 h-4' />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link to='/cart' className='relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group' aria-label='Cart' title='Cart'>
              <ShoppingCart className='w-5 h-5 text-gray-500 dark:text-gray-100 group-hover:text-green-600 transition-colors' />
              {getCartCount() > 0 && (
                <span className='absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm'>
                  {getCartCount()}
                </span>
              )}
            </Link>

            <button
              type='button'
              onClick={() => setVisible(true)}
              className='w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors lg:hidden'
              aria-label='Open menu'
            >
              <Menu className='w-5 h-5 text-gray-600 dark:text-gray-100 dark:text-gray-100' />
            </button>
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'max-h-20 border-t border-gray-100 dark:border-gray-800 dark:border-gray-700' : 'max-h-0'}`}>
          <form onSubmit={handleSearch} className='max-w-2xl mx-auto px-4 py-3'>
            <div className='flex items-center gap-2 bg-gray-50 dark:bg-gray-900 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 dark:border-gray-600 focus-within:border-green-400 rounded-xl px-4 py-2 transition-all'>
              <Search className='w-4 h-4 text-gray-400 dark:text-gray-100 shrink-0' />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search products...'
                className='flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-200'
              />
              {searchQuery && (
                <button type='button' onClick={() => setSearchQuery('')} className='text-gray-400 dark:text-gray-100 hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-200' aria-label='Clear search'>
                  <X className='w-4 h-4' />
                </button>
              )}
              <button type='submit' className='px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all'>
                Search
              </button>
            </div>
          </form>
        </div>
      </nav>

      <div className={`fixed inset-0 z-50 transition-all duration-300 ${visible ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setVisible(false)}
        />
        <div className={`absolute top-0 right-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className='flex items-center justify-between p-4 border-b dark:border-gray-700'>
            <div className='flex items-center gap-1'>
              <img src={assets.logo} className='w-8 h-8 object-contain' alt='' />
              <span className='text-base font-bold leading-none'>
                <span className='text-black dark:text-white'>EcoCycle</span>
                <span style={{ background: 'linear-gradient(to right, #78e08f, #38d996, #00b894)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>HUB</span>
              </span>
            </div>
            <button
              type='button'
              onClick={() => setVisible(false)}
              className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-100 dark:text-gray-100'
              aria-label='Close menu'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
          <div className='p-4 flex flex-col gap-1'>
            {mobileLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setVisible(false)}
                className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800'}`}
              >
                {item.label}
              </NavLink>
            ))}

            <div className='border-t border-gray-100 dark:border-gray-800 dark:border-gray-700 my-2' />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} mobile />
            <div className='border-t border-gray-100 dark:border-gray-800 dark:border-gray-700 my-2' />

            <button
              type='button'
              onClick={() => { setVisible(false); navigate('/buyer') }}
              className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-left'
            >
              <BriefcaseBusiness className='w-4 h-4' />
              Buyers Portal
            </button>
            <button
              type='button'
              onClick={() => { setVisible(false); navigate('/seller') }}
              className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-left'
            >
              <Recycle className='w-4 h-4' />
              Seller Portal
            </button>
            <button
              type='button'
              onClick={() => { setVisible(false); navigate('/admin') }}
              className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left'
            >
              <Building2 className='w-4 h-4' />
              Admin Panel
            </button>

            {token && (
              <>
                <div className='border-t border-gray-100 dark:border-gray-800 dark:border-gray-700 my-2' />
                <button
                  type='button'
                  onClick={() => { setVisible(false); logout() }}
                  className='flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-left'
                >
                  <LogOut className='w-4 h-4' />
                  Logout
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
