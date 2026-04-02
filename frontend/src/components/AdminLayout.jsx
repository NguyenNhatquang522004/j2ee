import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from '@heroicons/react/24/outline';

export default function AdminLayout({ children }) {
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:static inset-y-0 left-0 z-[60] lg:z-auto w-72 bg-transparent transform ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none shrink-0 overflow-hidden`}
            >
                <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Admin Header */}
                <header className="h-16 bg-white/95 sm:bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            className="lg:hidden p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all active:scale-90 shadow-sm border border-gray-50"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <div className="flex flex-col">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 leading-none hidden xs:block">Hệ thống quản lý</p>
                            <h2 className="text-xs sm:text-sm font-black text-gray-900 border-l-2 border-green-500 pl-3 leading-none italic uppercase tracking-tighter">FreshFood Admin</h2>
                        </div>
                    </div>

                    <div className="flex-1 flex justify-center max-w-lg px-6 hidden xl:flex">
                        <div className="relative group w-full">
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhanh hệ thống..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-300"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const q = e.target.value.trim();
                                        if (q) window.location.href = `/admin/products?search=${encodeURIComponent(q)}`;
                                    }
                                }}
                            />
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-5">
                        <NotificationDropdown />
                        
                        <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-900 leading-none">{user?.username}</p>
                                <p className="text-[9px] font-bold text-green-600 uppercase tracking-tighter mt-1">Quản trị viên</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-600 to-green-400 p-0.5 shadow-lg shadow-green-100 ring-2 ring-white overflow-hidden shrink-0 group cursor-pointer hover:rotate-6 transition-transform">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center text-green-600">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1280px] mx-auto min-h-full">
                        {children}
                    </div>
                </main>
                <footer className="h-10 bg-white/95 sm:bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between px-6 shrink-0 z-40">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">© 2026 RawFood Eco-System</p>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest italic">Hệ thống quản trị thông minh</p>
                </footer>
            </div>
        </div>
    );
}
