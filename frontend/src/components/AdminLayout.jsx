import AdminSidebar from './AdminSidebar';
import { Toaster } from 'react-hot-toast';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            <div className="flex-1 flex flex-col max-h-screen">
                {/* Admin Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Hệ thống quản lý</p>
                        <h2 className="text-sm font-black text-gray-900 border-l-2 border-green-500 pl-3">FreshFood Admin Panel</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationDropdown />
                        
                        <div className="h-8 w-px bg-gray-100"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-900 leading-none">{user?.username}</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase tracking-tighter mt-1">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-green-600 to-green-400 p-0.5 shadow-lg shadow-green-100 ring-2 ring-white">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-[0.9rem]" />
                                ) : (
                                    <div className="w-full h-full rounded-[0.9rem] bg-white flex items-center justify-center text-green-600">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
