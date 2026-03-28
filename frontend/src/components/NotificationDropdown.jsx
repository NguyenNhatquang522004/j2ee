import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, CheckCircleIcon, InformationCircleIcon, ExclamationCircleIcon, TicketIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../api/services';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function NotificationDropdown() {
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
        // Cập nhật sau mỗi 30s
        const interval = setInterval(fetchNotifications, 30000);
        
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            clearInterval(interval);
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
                        <h3 className="font-black text-gray-800 text-sm">Thông báo</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={async () => {
                                    await notificationService.markAllAsRead();
                                    fetchNotifications();
                                }}
                                className="text-[10px] font-bold text-green-600 hover:underline"
                            >
                                Đánh dấu tất cả đã đọc
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
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                                        )}
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
                            to="/notifications"
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
