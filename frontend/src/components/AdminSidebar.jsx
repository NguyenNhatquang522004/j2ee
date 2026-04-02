import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contactService } from '../api/services';
import { useEffect, useState } from 'react';
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
    ClockIcon,
    ChatBubbleLeftRightIcon,
    InformationCircleIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

const MENU_ITEMS = [
    { name: 'Tổng quan', path: '/admin', icon: ChartBarIcon, permission: 'view:reports' },
    { name: 'Người dùng', path: '/admin/users', icon: UserGroupIcon, permission: 'manage:users' },
    { name: 'Sản phẩm', path: '/admin/products', icon: ShoppingBagIcon, permission: 'manage:products' },
    { name: 'Danh mục', path: '/admin/categories', icon: TagIcon, permission: 'manage:categories' },
    { name: 'Lô hàng', path: '/admin/batches', icon: PuzzlePieceIcon, permission: 'manage:batches' },
    { name: 'Trang trại', path: '/admin/farms', icon: HomeIcon, permission: 'manage:farms' },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ClipboardDocumentListIcon, permission: 'manage:orders' },
    { name: 'Hoàn hàng', path: '/admin/refunds', icon: TruckIcon, permission: 'manage:orders' },
    { name: 'Mã giảm giá', path: '/admin/coupons', icon: TicketIcon, permission: 'manage:promotions' },
    { name: 'Flash Sale', path: '/admin/flash-sales', icon: BoltIcon, permission: 'manage:promotions' },
    { name: 'Đánh giá', path: '/admin/reviews', icon: UserIcon, permission: 'manage:reviews' },
    { name: 'Nhân sự', path: '/admin/staff', icon: ShieldCheckIcon, permission: 'manage:users' },
    { name: 'Nhật ký', path: '/admin/audit-logs', icon: ClockIcon, permission: 'view:reports' },
    { name: 'Thư viện', path: '/admin/media', icon: PhotoIcon, permission: 'manage:products' },
    { name: 'Bản tin', path: '/admin/newsletters', icon: NewspaperIcon, permission: 'manage:newsletters' },
    { name: 'Thông báo', path: '/admin/notifications', icon: BellIcon, permission: 'view:reports' },
    { name: 'Cài đặt', path: '/admin/settings', icon: Cog8ToothIcon, permission: 'manage:settings' },
    { name: 'Hộp thư', path: '/admin/contacts', icon: ChatBubbleLeftRightIcon, permission: 'manage:users' },
    { name: 'Hướng dẫn', path: '/admin/guide', icon: InformationCircleIcon, permission: 'view:reports' },
];

export default function AdminSidebar({ onClose }) {
    const { pathname } = useLocation();
    const { logout, hasPermission } = useAuth();
    const navigate = useNavigate();
    const [unreadContacts, setUnreadContacts] = useState(0);

    const handleItemClick = () => {
        if (onClose) onClose();
    };

    useEffect(() => {
        if (hasPermission('manage:users')) {
            fetchUnreadCount();
        }
    }, [pathname]);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await contactService.getUnreadCount();
            setUnreadContacts(data);
        } catch (err) {
            console.error("Failed to fetch unread contacts", err);
        }
    };

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/login');
    };

    const filteredMenu = MENU_ITEMS.filter(item => {
        if (item.path === '/admin') return true; // Everyone in management can see Dashboard
        if (item.path === '/admin/settings') return true; // Settings for profile/security
        
        // Handle combined permission check (allow view OR manage)
        if (item.permission && item.permission.includes(':')) {
            const domain = item.permission.split(':')[1];
            return hasPermission(`view:${domain}`) || hasPermission(`manage:${domain}`);
        }

        return hasPermission(item.permission);
    });

    return (
        <aside className="h-full bg-white/90 backdrop-blur-xl border-r border-gray-100 flex flex-col shadow-[rgba(0,0,0,0.02)_10px_0px_30px] relative z-20">
            <div className="p-5 border-b">
                <Link to="/" onClick={handleItemClick} className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110 border border-gray-100 p-0">
                        <img src="/logo.png" alt="FreshFood" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500 uppercase">
                        Admin <span className="text-xs text-gray-400 font-normal">Panel</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {filteredMenu.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            onClick={handleItemClick}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                                isActive 
                                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-100 scale-[1.02]' 
                                : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                            }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                            )}
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-green-600 font-bold'}`} />
                            <span className="font-semibold text-sm flex-1">{item.name}</span>
                            {item.path === '/admin/contacts' && unreadContacts > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    isActive ? 'bg-white text-green-600' : 'bg-red-500 text-white animate-pulse'
                                }`}>
                                    {unreadContacts > 99 ? '99+' : unreadContacts}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-3 border-t">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3.5 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl cursor-pointer"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-sm">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
