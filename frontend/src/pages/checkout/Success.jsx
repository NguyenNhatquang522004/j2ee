import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { 
    CheckCircleIcon, 
    ShoppingBagIcon, 
    ArrowRightIcon,
    TicketIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import confetti from 'canvas-confetti';

export default function Success() {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get('orderCode');
    const paymentMethod = searchParams.get('method') || 'COD';
    const isCOD = paymentMethod === 'COD';

    useEffect(() => {
        // Hiệu ứng pháo hoa chúc mừng
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <div className="max-w-3xl mx-auto py-24 px-4 text-center">
                <div className="relative inline-block mb-12">
                    <div className="absolute inset-0 bg-green-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                    <div className="relative z-10 p-10 bg-white border border-gray-100 rounded-[4rem] shadow-2xl shadow-green-100/50">
                        <CheckCircleIcon className="w-24 h-24 text-green-600 mb-6 mx-auto" />
                        <h1 className="text-5xl font-black text-gray-900 leading-none italic uppercase tracking-tighter mb-4">
                            {isCOD ? 'Đặt hàng' : 'Thanh toán'} <span className="text-green-600">thành công!</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-bold uppercase tracking-widest italic leading-none">Cảm ơn bạn đã tin tưởng FreshFood</p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-gray-100/50 mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Mã đơn hàng của bạn</p>
                            <span className="px-6 py-2 bg-gray-50 border border-gray-100 rounded-2xl font-black text-gray-800 text-xl tracking-widest uppercase">{orderCode || 'FRESHFOOD-00000'}</span>
                        </div>
                        
                        <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto">
                            {isCOD 
                                ? 'Đơn hàng của bạn đã được tạo thành công. Bạn sẽ thanh toán khi nhận hàng. Chúng tôi sẽ sớm liên hệ xác nhận và giao nông sản tươi sạch đến tay bạn.' 
                                : 'Đơn hàng của bạn đang được hệ thống xử lý. Chúng tôi sẽ sớm liên hệ xác nhận và giao nông sản tươi sạch đến tay bạn trong thời gian sớm nhất.'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                            <Link to="/orders" className="flex items-center justify-center gap-3 px-8 py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-100">
                                <ShoppingBagIcon className="w-5 h-5" />
                                Theo dõi đơn hàng
                            </Link>
                            <Link to="/products" className="flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-green-600 text-green-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-50 transition-all">
                                <SparklesIcon className="w-5 h-5" />
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-green-50 rounded-[2.5rem] border border-green-100 flex flex-col md:flex-row items-center justify-between gap-6 group">
                   <div className="flex items-center gap-4 text-left">
                       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                           <TicketIcon className="w-7 h-7" />
                       </div>
                       <div>
                           <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Quà tặng bất ngờ!</h3>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Bạn vừa nhận được voucher giảm 10% cho đơn sau</p>
                       </div>
                   </div>
                   <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-200">Lưu mã ngay</button>
                </div>
            </div>
        </Layout>
    );
}
