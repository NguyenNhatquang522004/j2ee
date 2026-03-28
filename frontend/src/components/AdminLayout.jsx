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
            <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
                {/* Admin Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 leading-none">Hệ thống quản lý</p>
                        <h2 className="text-sm font-black text-gray-900 border-l-2 border-green-500 pl-3 leading-none">FreshFood Admin Panel</h2>
                    </div>

                    <div className="flex-1 flex justify-center max-w-lg px-8">
                        <div className="relative group w-full">
                            <input
                                type="text"
                                placeholder="Tìm nhanh: sản phẩm, đơn hàng, khách hàng..."
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50/50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-300"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const q = e.target.value.trim();
                                        if (q) window.location.href = `/admin/products?search=${encodeURIComponent(q)}`;
                                    }
                                }}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <NotificationDropdown />
                        
                        <div className="h-8 w-px bg-gray-100"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-900 leading-none">{user?.username}</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase tracking-tighter mt-1">Administrator</p>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-green-600 to-green-400 p-0.5 shadow-lg shadow-green-100 ring-2 ring-white overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-green-600">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" />
        </div>
    );
}
