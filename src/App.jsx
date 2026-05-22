import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/store';
import { productAPI, brandAPI } from './api/client';
import * as dataService from './services/dataService';
import { isStaffRole } from './utils/roles';
import './App.css';

import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import RequireStaff from './components/routes/RequireStaff';
import RequireAdmin from './components/routes/RequireAdmin';
import RequireCustomer from './components/routes/RequireCustomer';
import AdminRoot from './components/routes/AdminRoot';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import AdminProducts from './pages/admin/Products';
import AdminBrands from './pages/admin/Brands';
import AdminOrders from './pages/admin/Orders';
import AdminStaff from './pages/admin/Staff';
import Login from './pages/Login';
import About from './pages/About';
import TrackOrder from './pages/TrackOrder';

function AppRoutes() {
  const { isStaff, isAdmin, products } = useStore();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootstrapped(true), 300);
    return () => clearTimeout(t);
  }, [products]);

  if (!bootstrapped) {
    return (
      <div className="app-loading">
        <p>Loading Elyoo Mobile…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireStaff />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminRoot />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/brands" element={<AdminBrands />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
          </Route>
        </Route>
      </Route>

      <Route element={<RequireCustomer />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<TrackOrder />} />
        <Route path="/track" element={<Navigate to="/orders" replace />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isStaff ? (isAdmin ? '/admin' : '/admin/orders') : '/'} replace />
        }
      />
    </Routes>
  );
}

function App({ supabaseBoot = {} }) {
  const { setProducts, setBrands, setUser, isStaff, setSupabaseStatus } = useStore();

  useEffect(() => {
    setSupabaseStatus(
      Boolean(supabaseBoot.connected && supabaseBoot.verified),
      supabaseBoot.source,
      supabaseBoot.verifyError
    );
  }, [supabaseBoot, setSupabaseStatus]);

  useEffect(() => {
    const initAuth = async () => {
      const user = await dataService.restoreSession();
      if (user && isStaffRole(user.role)) {
        setUser(user);
      }
    };
    initAuth();
  }, [setUser]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, brandsRes] = await Promise.all([
          productAPI.getAll(),
          brandAPI.getAll(),
        ]);
        setProducts(Array.isArray(productsRes.data.data) ? productsRes.data.data : []);
        setBrands(Array.isArray(brandsRes.data.data) ? brandsRes.data.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [setProducts, setBrands]);

  return (
    <Router>
      <div className={`app${isStaff ? ' app--admin' : ''}`}>
        {!isStaff && <Header />}
        <main className="main-content">
          <AppRoutes />
        </main>
        {!isStaff && <Footer />}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fffdf9',
              color: '#3a3228',
              border: '1px solid #cfc4b5',
              borderRadius: '10px',
              boxShadow: '0 8px 24px rgba(58, 50, 40, 0.12)',
            },
            success: { iconTheme: { primary: '#4a7c59', secondary: '#3a3228' } },
            error: { iconTheme: { primary: '#b83c3c', secondary: '#3a3228' } },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
