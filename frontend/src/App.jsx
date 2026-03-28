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
import FlashSalePage from './pages/home/FlashSalePage';

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
import AdminStaff from './pages/admin/AdminStaff';
import AdminAudit from './pages/admin/AdminAudit';
import Maintenance from './pages/other/Maintenance';
import Legal from './pages/other/Legal';
import CouponList from './pages/coupons/CouponList';
import Notifications from './pages/notifications/Notifications';
import Contact from './pages/other/Contact';
import FAQ from './pages/other/FAQ';
import NotFound from './pages/other/NotFound';
import Success from './pages/checkout/Success';
import BuyingGuide from './pages/guide/BuyingGuide';
import About from './pages/other/About';
import AdminContact from './pages/admin/AdminContact';
import AdminBuyingGuide from './pages/admin/AdminBuyingGuide';
import AdminFlashSales from './pages/admin/AdminFlashSales';

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
            <Route path="/flash-sale" element={<FlashSalePage />} />
            <Route path="/coupons" element={<CouponList />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/buying-guide" element={<BuyingGuide />} />

            {/* Protected user routes */}
            <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
            <Route path="/success" element={<PrivateRoute><Success /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
            <Route path="/ai-scan" element={<PrivateRoute><AiScan /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute permission="manage:products"><AdminProducts /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute permission="manage:categories"><AdminCategories /></AdminRoute>} />
            <Route path="/admin/batches" element={<AdminRoute permission="manage:batches"><AdminBatches /></AdminRoute>} />
            <Route path="/admin/farms" element={<AdminRoute permission="manage:farms"><AdminFarms /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute permission="manage:orders"><AdminOrders /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute permission="manage:users"><AdminUsers /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute permission="manage:promotions"><AdminCoupons /></AdminRoute>} />
            <Route path="/admin/newsletters" element={<AdminRoute permission="manage:newsletters"><AdminNewsletters /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute permission="manage:products"><AdminMediaLibrary /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute permission="manage:reviews"><AdminReviews /></AdminRoute>} />
            <Route path="/admin/staff" element={<AdminRoute permission="manage:users"><AdminStaff /></AdminRoute>} />
            <Route path="/admin/audit" element={<AdminRoute permission="view:reports"><AdminAudit /></AdminRoute>} />
            <Route path="/admin/contacts" element={<AdminRoute><AdminContact /></AdminRoute>} />
            <Route path="/admin/flash-sales" element={<AdminRoute permission="manage:promotions"><AdminFlashSales /></AdminRoute>} />
            <Route path="/admin/guide" element={<AdminRoute><AdminBuyingGuide /></AdminRoute>} />
            <Route path="/admin/2fa" element={<AdminRoute><Navigate to="/admin/settings?tab=security" replace /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><Navigate to="/admin/settings?tab=profile" replace /></AdminRoute>} />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
