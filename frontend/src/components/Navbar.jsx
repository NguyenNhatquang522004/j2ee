import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{ backgroundColor: '#166534' }} className="text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    🌿 Thực Phẩm Sạch
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/products" className="hover:text-green-200 transition-colors">Sản phẩm</Link>
                    <Link to="/farms" className="hover:text-green-200 transition-colors">Trang trại</Link>

                    {user ? (
                        <>
                            <Link to="/cart" className="relative hover:text-green-200 transition-colors">
                                🛒 Giỏ hàng
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                            <Link to="/orders" className="hover:text-green-200 transition-colors">Đơn hàng</Link>
                            {isAdmin && (
                                <Link to="/admin" className="bg-yellow-500 text-gray-900 font-semibold px-3 py-1 rounded-lg hover:bg-yellow-400 transition-colors">
                                    Admin
                                </Link>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="text-green-200 text-sm">{user.fullName || user.username}</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-green-800 font-semibold text-sm px-3 py-1 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="hover:text-green-200 transition-colors">Đăng nhập</Link>
                            <Link to="/register" className="bg-white text-green-800 font-semibold px-3 py-1 rounded-lg hover:bg-green-100 transition-colors">
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
