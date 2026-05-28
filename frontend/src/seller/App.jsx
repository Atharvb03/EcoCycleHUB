import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import SellerLogin from './components/SellerLogin';

// Reuse admin pages directly
import Add from '../admin/pages/Add';
import List from '../admin/pages/List';
import Orders from '../admin/pages/Orders';
import Users from '../admin/pages/Users';

export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const SellerApp = () => {
  const [token, setToken] = useState(localStorage.getItem('sellerToken') || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) localStorage.setItem('sellerToken', token);
    else localStorage.removeItem('sellerToken');
  }, [token]);

  const logout = () => {
    setToken('');
    localStorage.removeItem('sellerToken');
    navigate('/seller');
  };

  if (!token) return <SellerLogin setToken={setToken} />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <div className="flex items-center py-3 px-[4%] justify-between bg-white/80 backdrop-blur-sm border-b border-green-100 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♻️</span>
          <span className="font-bold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Seller Dashboard
          </span>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all shadow-md">
          🚪 Logout
        </button>
      </div>
      <hr />

      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-[18%] min-h-screen border-r-2">
          <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">
            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="add">
              <span>➕</span>
              <p className="hidden md:block">Add Items</p>
            </NavLink>
            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="list">
              <span>📋</span>
              <p className="hidden md:block">List Items</p>
            </NavLink>
            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="orders">
              <span>📦</span>
              <p className="hidden md:block">Orders</p>
            </NavLink>
            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="users">
              <span>👥</span>
              <p className="hidden md:block">Users & Points</p>
            </NavLink>
          </div>
        </div>

        {/* Main content */}
        <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
          <Routes>
            <Route path="add"    element={<Add    token={token} isSeller={true} />} />
            <Route path="list"   element={<List   token={token} isSeller={true} />} />
            <Route path="orders" element={<Orders token={token} isSeller={true} />} />
            <Route path="users"  element={<Users  token={token} isAdmin={false} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default SellerApp;
