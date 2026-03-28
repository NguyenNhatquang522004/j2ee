import Layout from '../../components/Layout';
import { 
    ExclamationTriangleIcon, 
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-32 px-4 text-center">
                <div className="relative inline-block mb-10">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="relative z-10 p-10 bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl shadow-gray-100/50">
                        <ExclamationTriangleIcon className="w-24 h-24 text-green-600 mb-6 mx-auto animate-bounce" />
                        <h1 className="text-9xl font-black text-gray-900 leading-none italic uppercase tracking-tighter mb-4">404</h1>
                        <p className="text-xl text-gray-400 font-bold uppercase tracking-widest italic leading-none">Trang này không khả dụng</p>
                    </div>
                </div>

                <div className="max-w-md mx-auto space-y-8">
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">Có vẻ như bạn đã đi lạc vào nông trại của hàng xóm rồi! Đừng lo, chúng tôi sẽ giúp bạn quay lại đúng chỗ.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/" className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-green-100 italic">
                            <ArrowLeftIcon className="w-4 h-4" />
                            Về trang chủ
                        </Link>
                        <Link to="/products" className="flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-green-600 text-green-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-50 transition-all italic">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            Tìm sản phẩm
                        </Link>
                    </div>

                    <div className="pt-10 flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <SparklesIcon className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors">Gợi ý thông minh</span>
                        </div>
                        <div className="flex items-center gap-2 group cursor-pointer border-l border-gray-100 pl-8">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-green-600 transition-colors underline decoration-2 underline-offset-4">Yêu cầu hỗ trợ</span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
