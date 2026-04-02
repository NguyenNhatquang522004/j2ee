import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationCircleIcon, TicketIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../api/services';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

export default function NotificationDropdown() {
    const { confirm } = useConfirm();
    const { isManagement } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const countRes = await notificationService.getUnreadCount();
            setUnreadCount(countRes.data);
            
            const listRes = await notificationService.getAll({ page: 0, size: 5 });
            setNotifications(listRes.data.content || []);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Listen for real-time notifications
        const handleNewNotification = (event) => {
            const newNotif = event.detail;
            setNotifications(prev => [newNotif, ...prev].slice(0, 10)); // Keep latest 10
            setUnreadCount(prev => prev + 1);
        };

        window.addEventListener('notification-received', handleNewNotification);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            window.removeEventListener('notification-received', handleNewNotification);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications();
        }
    };

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            setNotifications(notifications.filter(n => n.id !== id));
            // Reload count to be sure
            const countRes = await notificationService.getUnreadCount();
            setUnreadCount(countRes.data);
            toast.success('Đã xóa thông báo');
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
            toast.success('Đã xóa tất cả thông báo');
        } catch (error) {
            toast.error('Không thể xóa tất cả thông báo');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
            case 'COUPON': return <TicketIcon className="w-5 h-5 text-purple-500" />;
            case 'LOGIN': return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
            default: return <InformationCircleIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-600 hover:text-green-600 transition-colors group"
                title="Thông báo"
            >
                <BellIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center border border-white px-0.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-gray-800 text-sm">Thông báo</h3>
                            {notifications.length > 0 && (
                                <button 
                                    onClick={clearAll}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Xóa tất cả"
                                >
                                    <TrashIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button 
                                onClick={async () => {
                                    await notificationService.markAllAsRead();
                                    fetchNotifications();
                                }}
                                className="text-[10px] font-bold text-green-600 hover:underline"
                            >
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.isRead && markAsRead(n.id)}
                                    className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-green-50/30' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-sm leading-snug ${!n.isRead ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                            {!n.isRead && (
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            )}
                                            <button 
                                                onClick={(e) => deleteNotification(e, n.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                                                title="Xóa"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {n.link && (
                                        <Link 
                                            to={n.link} 
                                            className="mt-2 text-[10px] font-black text-green-600 flex items-center gap-1 hover:underline"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Xem chi tiết →
                                        </Link>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <BellIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                <p className="text-sm font-bold text-gray-400">Không có thông báo nào</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <Link
                            to={isManagement ? "/admin/notifications" : "/notifications"}
                            className="block p-3 text-center text-xs font-black text-gray-500 hover:bg-gray-50 border-t border-gray-50 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Xem tất cả thông báo
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
