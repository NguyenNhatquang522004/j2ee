import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { flashSaleService } from '../api/services';
import { 
    BoltIcon, 
    ChevronRightIcon, 
    ArrowRightIcon, 
    CubeIcon 
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function FlashSaleSection() {
    const [flashSale, setFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        flashSaleService.getActive()
            .then(res => {
                if (res.data) setFlashSale(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!flashSale) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(flashSale.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                clearInterval(timer);
                setFlashSale(null);
                return;
            }

            setTimeLeft({
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    if (loading || !flashSale) return null;

    return (
        <section className="mb-16 bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <BoltIcon className="w-64 h-64 text-yellow-500" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 animate-pulse">
                        <BoltIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic translate-y-1">Flash Sale</h2>
                        <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest pl-1 leading-none">Kết thúc sau</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {[
                        { val: timeLeft.hours, label: 'Giờ' },
                        { val: timeLeft.minutes, label: 'Phút' },
                        { val: timeLeft.seconds, label: 'Giây' }
                    ].map((t, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl">
                                    {t.val.toString().padStart(2, '0')}
                                </div>
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest mt-1">{t.label}</span>
                            </div>
                            {idx < 2 && <span className="text-white/40 font-black text-2xl mb-5">:</span>}
                        </div>
                    ))}
                </div>

                <Link 
                    to="/flash-sale" 
                    className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black px-8 py-4 rounded-2xl hover:bg-white hover:text-orange-600 transition-all flex items-center gap-2 group shadow-xl"
                >
                    Xem tất cả <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Products */}
            <div className="p-4 sm:p-8">
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8">
                    {flashSale.items.slice(0, 4).map((item) => (
                        <FlashSaleCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FlashSaleCard({ item }) {
    const saleProgress = Math.round((item.soldQuantity / item.quantityLimit) * 100);
    const p = item.product;

    return (
        <Link to={`/products/${p.id}`} className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative group/card">
            <div className="h-32 sm:h-44 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                ) : (
                    <CubeIcon className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200" />
                )}
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 z-10 transition-transform group-hover/card:translate-x-1 group-hover/card:translate-y-1 duration-500">
                    <span className="bg-red-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded sm:rounded-lg shadow-xl uppercase tracking-widest border border-white/20">
                        -{Math.round(((p?.price || 0) - (item?.flashSalePrice || 0)) / (p?.price || 1) * 100)}%
                    </span>
                </div>
            </div>

            <div className="p-2 sm:p-5 flex flex-col flex-1">
                <h3 className="font-black text-gray-800 text-[10px] sm:text-sm mb-2 sm:mb-4 line-clamp-1 group-hover/card:text-orange-600 transition-colors uppercase tracking-tight">{p?.name}</h3>
                
                <div className="mb-2 sm:mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                        <span className="text-xs sm:text-xl font-black text-red-600 whitespace-nowrap">
                            {(item?.flashSalePrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-gray-300 line-through text-[8px] sm:text-xs font-bold italic">
                            {(p?.price || 0).toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                </div>

                <div className="mt-auto space-y-1 sm:space-y-2">
                    <div className="flex items-center justify-between text-[7px] sm:text-[10px] uppercase font-black tracking-widest">
                        <span className={saleProgress > 80 ? 'text-orange-600 animate-pulse' : 'text-gray-400'}>
                             {saleProgress >= 100 ? 'Hết' : `${item.soldQuantity} đã bán`}
                        </span>
                        <span className="hidden sm:block text-gray-300">Target: {item.quantityLimit}</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50 flex shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 shadow-lg ${saleProgress > 80 ? 'bg-gradient-to-r from-orange-400 to-red-600' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}
                            style={{ width: `${Math.min(saleProgress, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
