import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { wishlistService, categoryService, farmService } from '../api/services';
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
    HomeIcon,
    ArchiveBoxIcon,
    ChevronDownIcon,
    Bars4Icon,
    TicketIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const { user, logout, isAdmin, isManagement } = useAuth();
    const { itemCount } = useCart();
    const [wishlistCount, setWishlistCount] = useState(0);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [farms, setFarms] = useState([]);

    useEffect(() => {
        categoryService.getAll().then(res => setCategories(res.data)).catch(() => {});
        farmService.getAll({ size: 100 }).then(res => {
            const data = res.data?.content || res.data;
            setFarms(Array.isArray(data) ? data : []);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const updateCount = () => {
            if (user) {
                wishlistService.count().then(res => setWishlistCount(res.data)).catch(() => { });
            }
        };
        updateCount();
        window.addEventListener('wishlist-updated', updateCount);
        return () => window.removeEventListener('wishlist-updated', updateCount);
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Redirect management to dashboard if they accidentally hit the home page
    useEffect(() => {
        if (isManagement && window.location.pathname === '/') {
            navigate('/admin');
        }
    }, [isManagement, navigate]);

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
                                FreshFood <span className="text-[10px] text-green-400"></span>
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            {!isManagement ? (
                                <>
                                    <Link to="/products" className="nav-link">Sản phẩm</Link>
                                    
                                    {/* Categories Dropdown */}
                                    <div className="relative group/cat h-full flex items-center">
                                        <button className="nav-link flex items-center gap-1 group-hover/cat:text-green-600">
                                            <span>Danh mục</span>
                                            <ChevronDownIcon className="w-3.5 h-3.5 transition-transform group-hover/cat:rotate-180" />
                                        </button>
                                        
                                        <div className="absolute top-full left-0 w-64 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/cat:opacity-100 group-hover/cat:translate-y-0 group-hover/cat:pointer-events-auto transition-all duration-300 z-[100]">
                                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-3 ring-1 ring-black/5">
                                                <Link to="/products" className="flex items-center gap-3 px-5 py-3 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all font-bold text-sm">
                                                    <Bars4Icon className="w-5 h-5 text-gray-400" />
                                                    Tất cả sản phẩm
                                                </Link>
                                                <div className="h-px bg-gray-50 my-1 mx-5"></div>
                                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                    {categories.map((cat) => (
                                                        <Link 
                                                            key={cat.id} 
                                                            to={`/products?categoryId=${cat.id}`} 
                                                            className="flex items-center justify-between px-5 py-3 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all group/item"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black group-hover/item:bg-white transition-colors uppercase italic overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                                                                    {cat.imageUrl ? (
                                                                        <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        cat.name.substring(0, 2)
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-bold">{cat.name}</span>
                                                            </div>
                                                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-400 group-hover/item:bg-green-100 group-hover/item:text-green-600 transition-colors">→</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Farms Dropdown */}
                                    <div className="relative group/farm h-full flex items-center">
                                        <button className="nav-link flex items-center gap-1 group-hover/farm:text-green-600">
                                            <span>Trang trại</span>
                                            <ChevronDownIcon className="w-3.5 h-3.5 transition-transform group-hover/farm:rotate-180" />
                                        </button>
                                        
                                        <div className="absolute top-full left-0 w-72 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/farm:opacity-100 group-hover/farm:translate-y-0 group-hover/farm:pointer-events-auto transition-all duration-300 z-[100]">
                                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-3 ring-1 ring-black/5">
                                                <Link to="/" className="flex items-center gap-3 px-5 py-3 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all font-bold text-sm">
                                                    <HomeIcon className="w-5 h-5 text-gray-400" />
                                                    Trang trại tự nhiên
                                                </Link>
                                                <div className="h-px bg-gray-50 my-1 mx-5"></div>
                                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                                    {farms.map((farm) => (
                                                        <Link 
                                                            key={farm.id} 
                                                            to={`/products?farmId=${farm.id}`} 
                                                            className="flex items-center gap-4 px-5 py-3 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all group/item"
                                                        >
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100">
                                                                {farm.imageUrl ? (
                                                                    <img src={farm.imageUrl} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] bg-green-50 text-green-600 font-black uppercase italic">Farm</div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold truncate max-w-[150px]">{farm.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">{farm.address}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/ai-scan" className="nav-link flex items-center gap-1.5">
                                        <BeakerIcon className="w-4 h-4" />
                                        <span>AI Scan</span>
                                    </Link>
                                    <Link to="/coupons" className="nav-link flex items-center gap-1.5">
                                        <TicketIcon className="w-4 h-4" />
                                        <span>Khuyến mãi</span>
                                    </Link>
                                </>
                            ) : (
                                <Link to="/admin" className="nav-link text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100 hover:bg-green-100 transition-all flex items-center gap-1.5">
                                    <AcademicCapIcon className="w-4 h-4" />
                                    <span>Bảng điều khiển Quản trị</span>
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right Side Icons/Buttons */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <NotificationDropdown />
                                {!isManagement && (
                                    <>
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
                                    </>
                                )}

                                <div className="h-8 w-px bg-gray-200"></div>

                                <div className="flex items-center gap-3">
                                    {!isManagement && (
                                        <Link to="/orders" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors group" title="Đơn hàng của tôi">
                                            <ArchiveBoxIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        </Link>
                                    )}

                                    <Link to="/profile" className="flex items-center gap-2 group ml-2">
                                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5" />
                                            )}
                                        </div>
                                    </Link>

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
                    {!isManagement ? (
                        <>
                            <Link to="/products" className="block font-bold text-gray-800 hover:text-green-600">Sản phẩm</Link>
                            <div className="pl-4 space-y-2 border-l-2 border-green-100">
                                {categories.map(cat => (
                                    <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="flex items-center gap-3 p-1 hover:bg-green-50 rounded-lg">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 shadow-sm">
                                            {cat.imageUrl ? (
                                                <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] font-black uppercase">{cat.name.substring(0, 2)}</div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-500 hover:text-green-600">{cat.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <Link to="/" className="block font-bold text-gray-800 hover:text-green-600">Trang trại tự nhiên</Link>
                            <div className="pl-4 space-y-2 border-l-2 border-green-100">
                                {farms.map(farm => (
                                    <Link key={farm.id} to={`/products?farmId=${farm.id}`} className="block text-sm font-medium text-gray-500 hover:text-green-600">
                                        • {farm.name}
                                    </Link>
                                ))}
                            </div>
                            <Link to="/ai-scan" className="block font-bold text-gray-800 hover:text-green-600">AI Scan</Link>
                            <Link to="/coupons" className="block font-bold text-gray-800 hover:text-green-600">Khuyến mãi</Link>
                            {user && <Link to="/orders" className="block font-bold text-gray-800 hover:text-green-600">Đơn hàng của tôi</Link>}
                        </>
                    ) : (
                        <Link to="/admin" className="block font-bold text-green-700 bg-green-50 px-3 py-2 rounded-xl">Bảng điều khiển Quản trị</Link>
                    )}
                </div>
            )}
        </header>
    );
}
