import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    HomeIcon, 
    UserGroupIcon, 
    ShoppingBagIcon, 
    ClipboardDocumentListIcon, 
    TruckIcon,
    PuzzlePieceIcon,
    ArrowLeftOnRectangleIcon,
    ChartBarIcon,
    TagIcon,
    UserIcon,
    ShieldCheckIcon, 
    Cog8ToothIcon,
    BellIcon,
    PhotoIcon,
    TicketIcon,
    NewspaperIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const MENU_ITEMS = [
    { name: 'Tổng quan', path: '/admin', icon: ChartBarIcon, permission: 'view:reports' },
    { name: 'Người dùng', path: '/admin/users', icon: UserGroupIcon, permission: 'manage:users' },
    { name: 'Sản phẩm', path: '/admin/products', icon: ShoppingBagIcon, permission: 'manage:products' },
    { name: 'Danh mục', path: '/admin/categories', icon: TagIcon, permission: 'manage:categories' },
    { name: 'Lô hàng', path: '/admin/batches', icon: PuzzlePieceIcon, permission: 'manage:batches' },
    { name: 'Trang trại', path: '/admin/farms', icon: HomeIcon, permission: 'manage:farms' },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ClipboardDocumentListIcon, permission: 'manage:orders' },
    { name: 'Mã giảm giá', path: '/admin/coupons', icon: TicketIcon, permission: 'manage:promotions' },
    { name: 'Đánh giá', path: '/admin/reviews', icon: UserIcon, permission: 'manage:reviews' },
    { name: 'Nhân sự', path: '/admin/staff', icon: ShieldCheckIcon, permission: 'manage:users' },
    { name: 'Nhật ký', path: '/admin/audit', icon: ClockIcon, permission: 'view:reports' },
    { name: 'Thư viện', path: '/admin/media', icon: PhotoIcon, permission: 'manage:products' },
    { name: 'Bản tin', path: '/admin/newsletters', icon: NewspaperIcon, permission: 'manage:newsletters' },
    { name: 'Cài đặt', path: '/admin/settings', icon: Cog8ToothIcon, permission: 'manage:settings' },
];

export default function AdminSidebar() {
    const { pathname } = useLocation();
    const { logout, hasPermission } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/login');
    };

    const filteredMenu = MENU_ITEMS.filter(item => {
        if (item.path === '/admin') return true; // Everyone in management can see Dashboard
        if (item.path === '/admin/settings') return true; // Settings for profile/security
        return hasPermission(item.permission);
    });

    return (
        <aside className="w-64 bg-white border-r h-screen sticky top-0 flex flex-col shadow-[rgba(0,0,0,0.05)_5px_0px_15px]">
            <div className="p-6 border-b">
                <Link to="/" className="flex items-center gap-2 group">
                    <span className="text-green-600 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    </span>
                    <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500 uppercase">
                        Admin <span className="text-xs text-gray-400 font-normal">Panel</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredMenu.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                                : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-600 font-bold'}`} />
                            <span className="font-semibold text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl cursor-pointer"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span className="font-semibold text-sm">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
