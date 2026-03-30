import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../api/services';
import { useConfirm } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import AdminLayout from '../../components/AdminLayout';
import { 
    BellIcon, 
    CheckCircleIcon, 
    InformationCircleIcon, 
    ExclamationCircleIcon, 
    TicketIcon, 
    TrashIcon,
    InboxIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 10;

export default function Notifications() {
    const { confirm } = useConfirm();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationService.getAll({ page, size: PAGE_SIZE });
            setNotifications(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
            
            const countRes = await notificationService.getUnreadCount();
            setUnreadCount(countRes.data);
        } catch (error) {
            toast.error('Không thể tải thông báo');
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả là đã đọc');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Đã xóa thông báo');
            if (notifications.length === 1 && page > 0) setPage(page - 1);
            else fetchNotifications();
        } catch (error) {
            toast.error('Không thể xóa thông báo');
        }
    };

    const clearAll = async () => {
        const ok = await confirm({
            title: 'Xóa tất cả thông báo',
            message: 'Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ thông báo trong hộp thư? Hành động này không thể hoàn tác.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await notificationService.deleteAll();
            setNotifications([]);
            setUnreadCount(0);
            setTotalPages(1);
            setPage(0);
            toast.success('Đã xóa tất cả thông báo');
        } catch (error) {
            toast.error('Không thể xóa tất cả thông báo');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            case 'WARNING': return <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />;
            case 'COUPON': return <TicketIcon className="w-6 h-6 text-purple-500" />;
            case 'LOGIN': return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
            default: return <InformationCircleIcon className="w-6 h-6 text-gray-400" />;
        }
    };

    const LayoutComponent = user?.role?.name === 'ROLE_ADMIN' ? AdminLayout : Layout;

    return (
        <LayoutComponent>
            <div className={user?.role?.name === 'ROLE_ADMIN' ? 'py-4' : 'max-w-4xl mx-auto py-10 px-4'}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                                <BellIcon className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Thông báo</h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Bạn có <span className="text-green-600 font-bold">{unreadCount}</span> thông báo chưa đọc.</p>
                    </div>
                    
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 font-black rounded-xl hover:bg-green-100 transition-all text-xs border border-green-100"
                            >
                                <EyeIcon className="w-4 h-4" />
                                Đánh dấu đã đọc tất cả
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button 
                                onClick={clearAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-100 transition-all text-xs border border-red-100"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="divide-y divide-gray-50">
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} className="p-6 animate-pulse flex gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-gray-100 rounded-md w-3/4"></div>
                                        <div className="h-3 bg-gray-50 rounded-md w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id}
                                        className={`p-6 transition-all hover:bg-gray-50 flex gap-5 group relative ${!n.isRead ? 'bg-green-50/20' : ''}`}
                                    >
                                        <div className="shrink-0">
                                            <div className={`p-3 rounded-2xl border ${!n.isRead ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                                                {getIcon(n.type)}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-gray-900 font-black' : 'text-gray-600 font-medium'}`}>
                                                    {n.message}
                                                </p>
                                                <button 
                                                    onClick={() => deleteNotification(n.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all -mt-2 -mr-2"
                                                >
                                                    <TrashIcon className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 mt-3">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                                                </p>
                                                {!n.isRead && (
                                                    <button 
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-[10px] font-black text-green-600 hover:underline uppercase tracking-widest"
                                                    >
                                                        Đánh dấu đã đọc
                                                    </button>
                                                )}
                                                {n.link && (
                                                    <Link 
                                                        to={n.link}
                                                        className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                                                    >
                                                        Xem chi tiết →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {!n.isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-xs font-bold text-gray-400">Trang {page + 1} của {totalPages}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={page === 0}
                                            onClick={() => setPage(page - 1)}
                                            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-600"
                                        >
                                            <ChevronLeftIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            disabled={page === totalPages - 1}
                                            onClick={() => setPage(page + 1)}
                                            className="p-2 bg-white border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-gray-50 transition-all text-gray-600"
                                        >
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <InboxIcon className="w-12 h-12 text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">Trống trơn</h3>
                            <p className="text-sm text-gray-400 font-medium max-w-xs">Bạn hiện không có bất kỳ thông báo nào. Mọi hoạt động mới sẽ xuất hiện tại đây.</p>
                            <Link to="/products" className="mt-8 px-6 py-3 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-black transition-all text-sm uppercase">
                                Khám phá ngay
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </LayoutComponent>
    );
}
