import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { 
    StarIcon, 
    CheckBadgeIcon, 
    GiftIcon, 
    TicketIcon, 
    TruckIcon, 
    UserIcon,
    ArrowRightIcon,
    SparklesIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, CheckBadgeIcon as CheckBadgeIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const TIERS = {
    BRONZE: {
        name: 'THÀNH VIÊN ĐỒNG',
        color: 'from-orange-800 via-orange-900 to-black',
        text: 'text-orange-200',
        badge: 'bg-orange-100 text-orange-700',
        tick: 'text-orange-600',
        min: 0,
        benefits: [
            'Tích lũy 1% điểm cho mỗi đơn hàng',
            'Voucher chào mừng thành viên mới',
            'Nhận bản tin khuyến mãi sớm nhất'
        ]
    },
    SILVER: {
        name: 'THÀNH VIÊN BẠC',
        color: 'from-gray-400 via-gray-600 to-gray-900',
        text: 'text-gray-100',
        badge: 'bg-gray-100 text-gray-700',
        tick: 'text-gray-400',
        min: 1000,
        benefits: [
            'Tích lũy 2% điểm cho mỗi đơn hàng',
            'Voucher giảm 5% cho đơn sinh nhật',
            'Ưu tiên xử lý đơn hàng',
            'Giảm 10% phí vận chuyển'
        ]
    },
    GOLD: {
        name: 'THÀNH VIÊN VÀNG',
        color: 'from-yellow-400 via-yellow-600 to-yellow-900',
        text: 'text-yellow-100',
        badge: 'bg-yellow-50 text-yellow-700',
        tick: 'text-yellow-500',
        min: 5000,
        benefits: [
            'Tích lũy 3% điểm cho mỗi đơn hàng',
            'Voucher giảm 10% cho đơn sinh nhật',
            'Miễn phí vận chuyển (tối đa 20k/đơn)',
            'Quà tặng bất ngờ khi lên hạng',
            'Hỗ trợ khách hàng VIP 24/7'
        ]
    },
    PLATINUM: {
        name: 'THÀNH VIÊN KIM CƯƠNG',
        color: 'from-blue-600 via-blue-900 to-black',
        text: 'text-blue-100',
        badge: 'bg-blue-100 text-blue-800',
        tick: 'text-blue-400',
        min: 15000,
        benefits: [
            'Tích lũy 5% điểm cho mỗi đơn hàng',
            'Voucher giảm 20% cho đơn sinh nhật',
            'Miễn phí vận chuyển cho mọi đơn hàng',
            'Trải nghiệm sản phẩm mới trước cộng đồng',
            'Lời mời tham gia sự kiện offline FreshFood',
            'Quà tri ân đặc biệt hằng năm'
        ]
    }
};

export default function Membership() {
    const { user } = useAuth();
    const tierKey = user?.membershipTier || 'BRONZE';
    const tier = TIERS[tierKey];
    
    // Calculate next tier
    const tierKeys = Object.keys(TIERS);
    const currentIndex = tierKeys.indexOf(tierKey);
    const nextTierKey = currentIndex < tierKeys.length - 1 ? tierKeys[currentIndex + 1] : null;
    const nextTier = nextTierKey ? TIERS[nextTierKey] : null;

    const points = user?.points || 0;
    const progress = nextTier ? Math.min(100, (points / nextTier.min) * 100) : 100;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-gray-900 leading-tight uppercase italic tracking-tighter">Hạng Thành Viên</h1>
                            <CheckBadgeIconSolid className={`w-8 h-8 ${tier.tick}`} />
                        </div>
                        <p className="text-gray-500 font-medium">Khám phá các đặc quyền và quyền lợi dành riêng cho bạn tại FreshFood.</p>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-green-600">
                            {user?.fullName?.substring(0, 1)}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Điểm tích lũy</p>
                            <p className="text-lg font-black text-gray-900 leading-none mt-1">{points.toLocaleString()} <span className="text-xs text-gray-400 italic">Punts</span></p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Tier Card & Progress */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={`aspect-[1.6/1] bg-gradient-to-br ${tier.color} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border-4 border-white/20`}>
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/20 rounded-full blur-3xl group-hover:bg-white/5 transition-all duration-700"></div>
                            
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
                                        <span className="text-[10px] font-black tracking-[0.2em] uppercase italic opacity-70">Privilege Card</span>
                                    </div>
                                    <span className="text-[9px] font-black tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase italic border border-white/10">PREMIUM MEMBER</span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Current Status</p>
                                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{tier.name}</h2>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-green-300">Verified Identity</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                    <div className="flex -space-x-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-green-800 bg-green-900 flex items-center justify-center overflow-hidden">
                                                <UserIcon className="w-4 h-4 text-white/50" />
                                            </div>
                                        ))}
                                        <div className="w-8 h-8 rounded-full border-2 border-green-800 bg-white/10 backdrop-blur-sm flex items-center justify-center text-[8px] font-black">+99k</div>
                                    </div>
                                    <img src="/logo.png" alt="" className="h-6 opacity-30 grayscale brightness-200" />
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" /> Tiến trình hạng
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase italic">Tháng này</span>
                            </div>

                            <div className="space-y-4">
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 flex p-0.5">
                                    <div 
                                        className={`h-full rounded-full bg-gradient-to-r ${tier.color.replace('from-', 'to-').replace('via-', 'from-')} shadow-sm transition-all duration-1000 ease-out`}
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[11px] font-black tracking-tight">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 uppercase text-[8px]">Hiện tại</span>
                                        <span className="text-gray-900">{points.toLocaleString()} PTS</span>
                                    </div>
                                    {nextTier ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-400 uppercase text-[8px]">Mục tiêu {nextTier.name.split(' ')[0]}</span>
                                            <span className="text-green-600">{nextTier.min.toLocaleString()} PTS</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className="text-gray-400 uppercase text-[8px]">Tối đa</span>
                                            <span className="text-blue-600">MAX LEVEL</span>
                                        </div>
                                    )}
                                </div>
                                {nextTier && (
                                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                                        <p className="text-[10px] font-bold text-green-800 leading-relaxed italic">
                                            Bạn chỉ cần tích lũy thêm <span className="font-black text-green-700">{(nextTier.min - points).toLocaleString()} điểm</span> nữa để trở thành <span className="font-black uppercase">{nextTier.name}</span>!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right: Benefits & Tiers comparison */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Current Tier Benefits */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <SparklesIcon className="w-24 h-24 text-yellow-500/5 absolute -right-6 -top-6" />
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <GiftIcon className="w-5 h-5 text-green-600" /> Đặc quyền của bạn
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {tier.benefits.map((benefit, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                            {i % 4 === 0 ? <StarIconSolid className="w-5 h-5 text-yellow-400" /> : 
                                             i % 4 === 1 ? <TicketIcon className="w-5 h-5 text-red-400" /> :
                                             i % 4 === 2 ? <TruckIcon className="w-5 h-5 text-blue-400" /> :
                                             <ShieldCheckIcon className="w-5 h-5 text-green-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-green-900 transition-colors">{benefit}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">Áp dụng cho mọi giao dịch</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All Tiers Comparison */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-blue-600" /> Lộ trình thăng hạng FreshFood
                            </h3>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(TIERS).map(([key, t], idx) => {
                                    const isReached = points >= t.min || currentIndex >= idx;
                                    return (
                                        <div 
                                            key={key} 
                                            className={`p-5 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group ${
                                                tierKey === key 
                                                ? 'bg-gradient-to-br from-green-50 to-white border-green-200 ring-2 ring-green-100 shadow-md scale-[1.02]' 
                                                : isReached
                                                ? 'bg-white border-green-100 opacity-90'
                                                : 'bg-white border-gray-100 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="absolute top-3 right-3 flex gap-1">
                                                {isReached && (
                                                    <CheckBadgeIconSolid className={`w-5 h-5 ${key === tierKey ? 'text-green-500 animate-bounce' : 'text-green-400 opacity-70'}`} />
                                                )}
                                                {tierKey === key && (
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-ping mt-1.5"></div>
                                                )}
                                            </div>
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-lg group-hover:rotate-12 transition-transform`}>
                                                <StarIconSolid className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{t.min.toLocaleString()} PTS</p>
                                            <h4 className="text-sm font-black text-gray-900 mt-2 uppercase italic">{t.name.split(' ')[2] || t.name.split(' ')[0]}</h4>
                                            <p className="text-[10px] text-gray-500 mt-2 font-medium line-clamp-2">
                                                {isReached ? 'Đã đạt được' : `Cần ${t.min.toLocaleString()} điểm` }
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Help */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-[2rem] text-white overflow-hidden relative">
                             <img src="/logo.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 opacity-5 pointer-events-none" />
                             <div className="relative z-10">
                                <h4 className="text-lg font-black uppercase italic tracking-tighter">Bạn có câu hỏi?</h4>
                                <p className="text-xs text-white/60 font-medium mt-1">Tìm hiểu thêm về chính sách tích điểm của chúng tôi.</p>
                             </div>
                             <Link to="/faq" className="relative z-10 px-6 py-3 bg-white text-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-50 transition-all flex items-center gap-2 group">
                                Xem chi tiết FAQ
                                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                             </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
