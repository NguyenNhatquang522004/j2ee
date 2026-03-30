import { useEffect, useState } from 'react';
import { couponService } from '../../api/services';
import Layout from '../../components/Layout';
import { 
    TicketIcon, 
    CalendarDaysIcon, 
    ScaleIcon, 
    ArrowRightIcon, 
    InformationCircleIcon,
    ClipboardIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CouponList() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await couponService.getAll();
                console.log("Coupon API response:", res);
                const data = res?.data || [];
                const finalData = Array.isArray(data) ? data : (data.content || []);
                // Filter only active, public and not expired
                const validOnes = finalData.filter(c => {
                    const isActive = c.isActive ?? c.is_active ?? true;
                    const isPrivate = c.isPrivate ?? c.is_private ?? false;
                    const isExpired = new Date(c.expiryDate).getTime() < new Date().setHours(0,0,0,0);
                    return isActive && !isPrivate && !isExpired;
                });
                setCoupons(validOnes);
            } catch (err) {
                console.error("Failed to load coupons", err);
                toast.error("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success(`Đã sao chép mã: ${code}`);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-vietnam">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">
                            Mã giảm giá
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-1 bg-emerald-500 rounded-full"></span>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                Ưu đãi đặc biệt dành cho khách hàng của FreshFood
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-gray-50 animate-pulse rounded-[2.5rem] h-64 border border-gray-100"></div>
                        ))}
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                        <TicketIcon className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                        <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Hiện tại chưa có mã giảm giá nào</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <div 
                                key={coupon.id} 
                                className="group relative bg-white rounded-3xl border border-gray-100 flex overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                {/* Left part (Discount Info) */}
                                <div className="w-32 bg-emerald-50/50 flex flex-col items-center justify-center p-4 border-r border-dashed border-gray-200 relative">
                                    <div className="text-3xl font-black text-emerald-600 tracking-tighter leading-none mb-1">
                                        {coupon.discountPercent}%
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest whitespace-nowrap">Giảm giá</span>
                                    
                                    {/* Scallop icons for ticket look */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border border-gray-100 rounded-full shadow-inner"></div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border border-gray-100 rounded-full shadow-inner"></div>
                                </div>

                                {/* Right part (Details) */}
                                <div className="flex-1 p-6 relative">
                                    <div className="absolute top-4 right-6 w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                        <TicketIcon className="w-5 h-5" />
                                    </div>

                                    <h3 className="text-base font-black text-gray-900 mb-4 pr-10 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                        {coupon.description || `Ưu đãi ${coupon.discountPercent}% cho mọi đơn hàng`}
                                    </h3>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                            <ScaleIcon className="w-4 h-4 text-emerald-500/50" />
                                            <span>Đơn tối thiểu: <span className="text-gray-900 font-black">{(coupon.minOrderAmount || 0).toLocaleString('vi-VN')}đ</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                            <CalendarDaysIcon className="w-4 h-4 text-emerald-500/50" />
                                            <span>Hết hạn: <span className="text-gray-900 font-black">{new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}</span></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl border border-gray-100 p-3 group-hover:border-emerald-200 group-hover:bg-emerald-50/30 transition-all">
                                        <span className="flex-1 text-sm font-black tracking-widest text-gray-400 group-hover:text-emerald-700 transition-colors uppercase pl-2">
                                            {coupon.code}
                                        </span>
                                        <button 
                                            onClick={() => copyToClipboard(coupon.code)}
                                            className={`p-2 rounded-xl transition-all ${copiedCode === coupon.code ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100'}`}
                                            title="Sao chép"
                                        >
                                            {copiedCode === coupon.code ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
