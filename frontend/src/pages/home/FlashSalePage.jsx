import { useEffect, useState } from 'react';
import { flashSaleService } from '../../api/services';
import Layout from '../../components/Layout';
import { BoltIcon, ChevronRightIcon, ArrowRightIcon, CubeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function FlashSalePage() {
    const [flashSale, setFlashSale] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        Promise.all([flashSaleService.getActive(), flashSaleService.getUpcoming()])
            .then(([active, up]) => {
                if (active.data) setFlashSale(active.data);
                setUpcoming(up.data || []);
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

    return (
        <Layout>
            <div className="py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-red-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-200 rotate-3 animate-pulse">
                            <BoltIcon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-2">Đại tiệc <span className="text-red-600">Flash Sale</span></h1>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] pl-1">Săn deal giá sốc mỗi ngày</p>
                        </div>
                    </div>

                    {flashSale && (
                        <div className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-gray-100 shadow-xl group">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mr-2">Kết thúc trong:</span>
                            {[
                                { val: timeLeft.hours, label: 'Giờ' },
                                { val: timeLeft.minutes, label: 'Phút' },
                                { val: timeLeft.seconds, label: 'Giây' }
                            ].map((t, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="bg-gray-50 border border-gray-100 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-red-600 shadow-inner group-hover:scale-110 transition-transform">
                                        {t.val.toString().padStart(2, '0')}
                                    </div>
                                    {idx < 2 && <span className="text-gray-200 font-black text-xl mb-1">:</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!loading && !flashSale && (
                    <div className="bg-amber-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-amber-200 mb-16 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 p-10 opacity-5 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000">
                            <BoltIcon className="w-64 h-64 text-amber-500" />
                        </div>
                        <h2 className="text-3xl font-black text-amber-800 mb-4 tracking-tight">Hiện không có Flash Sale nào đang diễn ra</h2>
                        <p className="text-amber-600 font-bold mb-8 max-w-md mx-auto leading-relaxed">Đừng lo lắng, hãy xem các chương trình sắp tới bên dưới hoặc tiếp tục mua sắm các sản phẩm tuyệt vời của chúng tôi!</p>
                        <Link to="/products" className="inline-flex items-center gap-2 bg-amber-600 text-white font-black px-10 py-4 rounded-3xl hover:bg-amber-700 hover:shadow-2xl transition-all">
                             Khám phá cửa hàng <ArrowRightIcon className="w-5 h-5" />
                        </Link>
                    </div>
                )}

                {flashSale && (
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {flashSale.items.map((item) => (
                            <FlashSaleItemLarge key={item.id} item={item} />
                        ))}
                    </div>
                )}

                {upcoming.length > 0 && (
                    <section className="animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
                        <div className="flex items-center gap-4 mb-10">
                            <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic translate-y-1">Chương trình sắp tới</h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcoming.map(fs => (
                                <div key={fs.id} className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white hover:shadow-2xl hover:border-blue-100 transition-all duration-500">
                                    <div>
                                        <h3 className="font-black text-gray-800 text-xl tracking-tight mb-2 uppercase italic">{fs.name}</h3>
                                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest pl-1 leading-none">Bắt đầu lúc</p>
                                        <p className="text-blue-600 font-black text-lg mt-1 tracking-tight">
                                            {new Date(fs.startTime).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all shadow-sm">
                                        <BoltIcon className="w-8 h-8 text-gray-300 group-hover:text-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
}

function FlashSaleItemLarge({ item }) {
    const saleProgress = Math.round((item.soldQuantity / item.quantityLimit) * 100);
    const p = item.product;

    return (
        <Link to={`/products/${p.id}`} className="flex flex-col bg-white rounded-xl sm:rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] hover:-translate-y-4 transition-all duration-700 relative group">
            <div className="h-32 sm:h-64 bg-gray-50 relative overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" />
                ) : (
                    <CubeIcon className="w-10 h-10 sm:w-20 sm:h-20 text-gray-200" />
                )}
                <div className="absolute top-2 left-2 sm:top-5 sm:left-5 z-10">
                    <span className="bg-red-600 text-white text-[7px] sm:text-[10px] font-black px-1.5 py-1 sm:px-4 sm:py-2 rounded sm:rounded-2xl shadow-2xl uppercase tracking-[0.1em] sm:tracking-[0.2em] border border-white/20">
                        -{Math.round(((p.price || 0) - (item.flashSalePrice || 0)) / (p.price || 1) * 100)}%
                    </span>
                </div>
            </div>

            <div className="p-2 sm:p-8 flex flex-col flex-1">
                <p className="text-[7px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1 sm:mb-2 leading-none truncate">{p.farmName || 'Fresh Food Farm'}</p>
                <h3 className="font-black text-gray-800 text-[10px] sm:text-lg mb-2 sm:mb-6 line-clamp-1 group-hover:text-red-600 transition-colors uppercase tracking-tight leading-7">{p.name}</h3>
                
                <div className="mb-2 sm:mb-8 p-1 sm:p-4 bg-gray-50/50 rounded-xl sm:rounded-3xl border border-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3">
                        <span className="text-xs sm:text-3xl font-black text-red-600 tracking-tighter whitespace-nowrap">
                            {(item.flashSalePrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-[8px] sm:text-sm text-gray-300 line-through font-black italic tracking-tighter">
                            {(p.price || 0).toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                </div>

                <div className="mt-auto space-y-1 sm:space-y-3">
                    <div className="flex items-center justify-between text-[7px] sm:text-[11px] uppercase font-bold tracking-[0.1em] sm:tracking-[0.15em]">
                        <span className={saleProgress > 80 ? 'text-red-600 animate-pulse font-black' : 'text-gray-400'}>
                             {saleProgress >= 100 ? 'Hết' : `Đã bán ${item.soldQuantity}`}
                        </span>
                        <span className="hidden sm:block text-gray-300 font-bold">Tổng: {item.quantityLimit}</span>
                    </div>
                    <div className="w-full h-1.5 sm:h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100 p-0.5 shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.3)] ${saleProgress > 80 ? 'bg-gradient-to-r from-red-600 to-orange-400' : 'bg-gradient-to-r from-orange-400 via-red-500 to-red-600'}`}
                            style={{ width: `${Math.min(saleProgress, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
