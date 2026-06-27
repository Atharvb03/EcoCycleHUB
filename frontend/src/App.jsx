import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './context/ThemeContext'

// Main frontend pages & components
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Certificate from './pages/Certificate'
import Badge from './pages/Badge'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Verify from './pages/Verify'
import Centers from "./pages/Centers"
import Rewards from './pages/Rewards'
import RecycleHistory from './pages/RecycleHistory'

// Admin App
import AdminApp from './admin/App'
import SellerApp from './seller/App'
import BuyerApp from './buyer/App'

// Toast notifications
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isSellerRoute = location.pathname.startsWith('/seller')
  const isBuyerRoute = location.pathname.startsWith('/buyer')
  const isPortalRoute = isAdminRoute || isSellerRoute || isBuyerRoute

  return (
    <div className={`${isPortalRoute ? '' : 'px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'} min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <ToastContainer theme={isDark ? 'dark' : 'light'} />

      {!isPortalRoute && <Navbar />}
      {!isPortalRoute && <SearchBar />}
      {isPortalRoute && (
        <button
          type='button'
          onClick={toggleTheme}
          className='fixed top-4 right-4 z-50 w-11 h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-100 hover:scale-105 transition-all'
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className='w-5 h-5 text-yellow-400' /> : <Moon className='w-5 h-5' />}
        </button>
      )}

      <Routes>
        {/* User-facing frontend routes */}
        <Route path='/' element={<Home />} />
        <Route path='/collection' element={<Collection />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/certificate' element={<Certificate />} />
        <Route path='/badge' element={<Badge />} />
        <Route path='/verify' element={<Verify />} />
        <Route path='/centers' element={<Centers />} />
        <Route path='/rewards' element={<Rewards />} />
        <Route path='/recycle-history' element={<RecycleHistory />} />

        {/* Admin routes */}
        <Route path='/admin/*' element={<AdminApp />} />
        {/* Seller routes */}
        <Route path='/seller/*' element={<SellerApp />} />
        {/* Buyer routes */}
        <Route path='/buyer/*' element={<BuyerApp />} />
      </Routes>

      {!isPortalRoute && <Footer />}
    </div>
  )
}

export default App
