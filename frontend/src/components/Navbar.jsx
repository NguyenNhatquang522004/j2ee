import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { wishlistService } from '../api/services';
import { useState, useEffect } from 'react';
import { 
    ShoppingBagIcon, 
    HeartIcon, 
    UserIcon, 
    ArrowRightOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
    AcademicCapIcon,
    BeakerIcon,
    ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const updateCount = () => {
            if (user) {
                wishlistService.count().then(res => setWishlistCount(res.data)).catch(() => {});
            }
        };
        updateCount();
        window.addEventListener('wishlist-updated', updateCount);
        return () => window.removeEventListener('wishlist-updated', updateCount);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 glass-header">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="text-green-600 group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </span>
                            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500">
                                FreshFood <span className="text-[10px] text-green-400">v2.0</span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link to="/products" className="nav-link">Sản phẩm</Link>
                            <Link to="/farms" className="nav-link">Trang trại</Link>
                            <Link to="/ai-scan" className="nav-link flex items-center gap-1.5">
                                <BeakerIcon className="w-4 h-4" />
                                <span>AI Scan</span>
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="nav-link text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100 hover:bg-green-100 transition-all flex items-center gap-1.5">
                                    <AcademicCapIcon className="w-4 h-4" />
                                    <span>Quản trị</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right Side Icons/Buttons */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-red-500 transition-colors group">
                                    {wishlistCount > 0 ? (
                                        <HeartIconSolid className="w-6 h-6 text-red-500 transition-transform group-hover:scale-110" />
                                    ) : (
                                        <HeartIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    )}
                                    {wishlistCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors group">
                                    <ShoppingBagIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    {itemCount > 0 && (
                                        <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white shadow-sm animate-pulse">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>

                                <div className="h-8 w-px bg-gray-200"></div>

                                <div className="flex items-center gap-3">
                                    <Link to="/orders" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors group" title="Đơn hàng của tôi">
                                        <ArchiveBoxIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    </Link>

                                    <Link to="/profile" className="flex items-center gap-2 group">
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div className="hidden lg:block text-left leading-none">
                                            <p className="text-xs font-bold text-gray-800">{user.fullName || user.username}</p>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{isAdmin ? 'Admin' : 'Member'}</p>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Đăng xuất"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-green-600 transition-colors">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="bg-green-600 text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
                                    Bắt đầu ngay
                                </Link>
                            </div>
                        )}
                        
                        {/* Mobile Menu Toggle */}
                        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3 shadow-xl">
                    <Link to="/products" className="block font-bold text-gray-800 hover:text-green-600">Sản phẩm</Link>
                    <Link to="/farms" className="block font-bold text-gray-800 hover:text-green-600">Trang trại</Link>
                    <Link to="/ai-scan" className="block font-bold text-gray-800 hover:text-green-600">AI Scan</Link>
                    {user && <Link to="/orders" className="block font-bold text-gray-800 hover:text-green-600">Đơn hàng của tôi</Link>}
                    {isAdmin && <Link to="/admin" className="block font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl">Quản trị Hệ thống</Link>}
                </div>
            )}
        </header>
    );
}
