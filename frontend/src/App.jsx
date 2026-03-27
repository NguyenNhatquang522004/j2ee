import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import { PrivateRoute, AdminRoute } from './components/ProtectedRoute';

import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProductList from './pages/products/ProductList';
import ProductDetail from './pages/products/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import OrderHistory from './pages/orders/OrderHistory';
import Compare from './pages/products/Compare';
import FarmList from './pages/farms/FarmList';
import AiScan from './pages/ai/AiScan';
import Profile from './pages/profile/Profile';
import Wishlist from './pages/wishlist/Wishlist';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminBatches from './pages/admin/AdminBatches';
import AdminFarms from './pages/admin/AdminFarms';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminTwoFactor from './pages/admin/AdminTwoFactor';
import AdminNewsletters from './pages/admin/AdminNewsletters';
import AdminMediaLibrary from './pages/admin/AdminMediaLibrary';
import AdminReviews from './pages/admin/AdminReviews';
import Maintenance from './pages/other/Maintenance';
import Legal from './pages/other/Legal';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', fontSize: '14px' },
              success: { style: { background: '#16a34a', color: '#fff' } },
              error: { style: { background: '#dc2626', color: '#fff' } },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/farms" element={<FarmList />} />
            <Route path="/about" element={<Legal />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
            <Route path="/maintenance" element={<Maintenance />} />

            {/* Protected user routes */}
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
            <Route path="/ai-scan" element={<PrivateRoute><AiScan /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/batches" element={<AdminRoute><AdminBatches /></AdminRoute>} />
            <Route path="/admin/farms" element={<AdminRoute><AdminFarms /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/newsletters" element={<AdminRoute><AdminNewsletters /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute><AdminMediaLibrary /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
            <Route path="/admin/2fa" element={<AdminRoute><Navigate to="/admin/settings?tab=security" replace /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><Navigate to="/admin/settings?tab=profile" replace /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
