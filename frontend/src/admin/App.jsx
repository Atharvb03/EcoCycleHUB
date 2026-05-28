import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import List from './pages/List';
import Orders from './pages/Orders';
import Users from './pages/Users';
import SellerKYC from './pages/SellerKYC';
import Login from './components/Login';

// Backend and currency constants
export const backendUrl = import.meta.env.VITE_BACKEND_URL;
export const currency = '₹';

const AdminApp = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('adminRole') === 'admin');

  const handleSetToken = (newToken, role = 'seller') => {
    setToken(newToken);
    setIsAdmin(role === 'admin');
    if (newToken) {
      localStorage.setItem('adminToken', newToken);
      localStorage.setItem('adminRole', role);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
    }
  };

  useEffect(() => {
    if (!token) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRole');
    }
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {token === '' ? (
        <Login setToken={handleSetToken} />
      ) : (
        <>
          <Navbar setToken={() => handleSetToken('', 'seller')} />
          <hr />
          <div className="flex w-full">
            <Sidebar />
            <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
              <Routes>
                <Route path="list" element={<List token={token} />} />
                <Route path="orders" element={<Orders token={token} />} />
                <Route path="users" element={<Users token={token} />} />
                <Route path="kyc" element={<SellerKYC token={token} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminApp;
