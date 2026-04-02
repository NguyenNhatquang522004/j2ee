import Layout from '../../components/Layout';
import AdminLayout from '../../components/AdminLayout';
import { 
    ExclamationTriangleIcon, 
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    SparklesIcon,
    HomeIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
    const { user } = useAuth();
    const location = useLocation();
    const isAdminPath = location.pathname.startsWith('/admin');
    const isAdmin = isAdminPath || (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF'));

    const content = (
        <div className={`max-w-7xl mx-auto ${isAdmin ? 'py-16' : 'py-32'} px-4 text-center`}>
            <div className="relative inline-block mb-10">
                <div className={`absolute inset-0 ${isAdmin ? 'bg-red-500' : 'bg-green-500'} rounded-full blur-[100px] opacity-20 animate-pulse`}></div>
                <div className="relative z-10 p-10 bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl shadow-gray-100/50">
                    <ExclamationTriangleIcon className={`w-24 h-24 ${isAdmin ? 'text-red-600' : 'text-green-600'} mb-6 mx-auto animate-bounce`} />
                    <h1 className="text-9xl font-black text-gray-900 leading-none italic uppercase tracking-tighter mb-4">404</h1>
                    <p className="text-xl text-gray-400 font-bold uppercase tracking-widest italic leading-none">Trang này không khả dụng</p>
                </div>
            </div>

            <div className="max-w-md mx-auto space-y-8">
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                    {isAdmin 
                        ? "Có vẻ như bạn đã đi lạc vào khu vực quản trị chưa được khai phá! Đừng lo, hãy quay lại trung tâm điều khiển để tiếp tục nhiệm vụ." 
                        : "Có vẻ như bạn đã đi lạc vào nông trại của hàng xóm rồi! Đừng lo, chúng tôi sẽ giúp bạn quay lại đúng chỗ."}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link 
                        to={isAdmin ? "/admin" : "/"} 
                        className={`flex items-center justify-center gap-3 px-8 py-4 ${isAdmin ? 'bg-gray-900 shadow-gray-200' : 'bg-green-600 shadow-green-100'} text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl italic`}
                    >
                        {isAdmin ? <CommandLineIcon className="w-4 h-4" /> : <ArrowLeftIcon className="w-4 h-4" />}
                        {isAdmin ? 'Về Dashboard' : 'Về trang chủ'}
                    </Link>
                    <Link 
                        to={isAdmin ? "/admin/settings" : "/products"} 
                        className={`flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 ${isAdmin ? 'border-gray-900 text-gray-900' : 'border-green-600 text-green-600'} rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all italic`}
                    >
                        {isAdmin ? <HomeIcon className="w-4 h-4" /> : <MagnifyingGlassIcon className="w-4 h-4" />}
                        {isAdmin ? 'Cài đặt hệ thống' : 'Tìm sản phẩm'}
                    </Link>
                </div>

                <div className="pt-10 flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <SparklesIcon className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">Gợi ý thông minh</span>
                    </div>
                    {isAdmin && (
                         <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-red-600 transition-colors underline decoration-2 underline-offset-4">Báo cáo sự cố</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isAdmin) {
        return <AdminLayout>{content}</AdminLayout>;
    }

    return <Layout>{content}</Layout>;
}
