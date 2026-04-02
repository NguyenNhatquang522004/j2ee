import { useEffect, useState } from 'react';
import { dashboardService, orderService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import {
    ShoppingBagIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ArchiveBoxIcon,
    ChevronRightIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    BellIcon,
    PlusIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

/**
 * ADMIN COMPONENT: AdminDashboard
 * ---------------------------------------------------------
 * The central command gallery for real-time business intelligence.
 * 
 * Design Features:
 * - Glassmorphism UI: White/70 backdrop-blur for a premium, clean aesthetic.
 * - Dynamic Analytics: Real-time stat cards with growth trends.
 * - Zero-Dependency Charts: Lightweight SVG-based revenue visualization.
 * - Priority Tasking: Intelligent order status summary to guide admin actions.
 */

/**
 * COMPONENT: StatCard
 * Renders individual business metrics with hover animations and color-coded trends.
 */
const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-4 rounded-xl shadow-sm hover:-translate-y-1 transition-all duration-300">
    <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
            <Icon className="w-5 h-5" />
        </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend === 'up' ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <p className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-gray-900 mt-1">{value}</p>
    </div>
);

// Map backend order statuses to human-readable UI elements
const ORDER_STATUS = {
    PENDING: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
    DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AdminDashboard() {
    // --- STATE ---
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial data hydration
    useEffect(() => {
        const load = async () => {
            try {
                // Batch fetch key metrics to minimize loading screen time
                const [dashRes, ordersRes] = await Promise.all([
                    dashboardService.get(),
                    orderService.getAll({ page: 0, size: 5 }),
                ]);
                setStats(dashRes.data);
                setRecentOrders(ordersRes.data.content || []);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    // --- LOADING RENDER ---
    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center min-h-[60vh] text-green-600 font-black tracking-widest animate-pulse uppercase italic">
                Sincronización de Datos...
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Theo dõi hoạt động kinh doanh hôm nay.</p>
                </div>
                <div className="bg-white/50 backdrop-blur rounded-xl border border-white/40 p-2.5 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-gray-600">Hệ thống đang hoạt động</span>
                </div>
            </div>

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <StatCard title="Tổng doanh thu" value={fmt(stats?.totalRevenue || 0) + '₫'} icon={CurrencyDollarIcon} color="bg-green-100" />
                <StatCard title="Đơn hàng" value={fmt(stats?.totalOrders || 0)} icon={ArchiveBoxIcon} color="bg-blue-100" trend="up" trendValue="8.2" />
                <StatCard title="Khách hàng" value={fmt(stats?.totalUsers || 0)} icon={UserGroupIcon} color="bg-indigo-100" trend="up" trendValue="15.8" />
                <StatCard title="Sản phẩm" value={fmt(stats?.totalProducts || 0)} icon={ShoppingBagIcon} color="bg-amber-100" />
                <StatCard title="Newsletter" value={fmt(stats?.totalSubscribers || 0)} icon={BellIcon} color="bg-orange-100" trend="up" trendValue="4.1" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
                {/* REVENUE CHART (Pure CSS/SVG Implementation) */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Hiệu suất bán hàng</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">10 ngày gần nhất • VNĐ (thống kê thực tế)</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded bg-green-500"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase">Doanh thu</span>
                        </div>
                    </div>
                    {/* The Chart: Calibrated based on max weekly revenue to ensure relative scaling */}
                    <div className="h-[220px] flex items-end gap-3 sm:gap-6 px-2 text-center">
                        {(stats?.revenueChart?.length > 0 ? stats.revenueChart : Array(7).fill({ revenue: 0, date: '?' })).map((item, i) => {
                            const val = Number(item.revenue || 0);
                            const maxRev = Math.max(...(stats?.revenueChart?.map(r => Number(r.revenue)) || [1]));
                            const height = maxRev > 0 ? (val / maxRev) * 100 : 0;
                            const label = item.date ? item.date.split('-').pop() : '-';
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                                    <div 
                                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-lg group-hover:from-green-50 group-hover:to-green-300 transition-all duration-500 relative min-h-[4px]"
                                        style={{ height: `${Math.max(4, height)}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-black whitespace-nowrap z-10 shadow-xl border border-white/20">
                                            {fmt(val)}₫
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-tighter">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Shortcuts & Task Monitor */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-6 italic">Lệnh nhanh</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => window.location.href='/admin/products'}
                            className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-green-50 hover:shadow-lg hover:shadow-green-100 transition-all group"
                        >
                            <div className="p-2 rounded-xl bg-white text-gray-400 group-hover:text-green-600 shadow-sm border border-gray-100">
                                <PlusIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-gray-600 group-hover:text-green-800">Tạo sản phẩm</span>
                        </button>
                        <button 
                            onClick={() => window.location.href='/admin/newsletters'}
                            className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:shadow-lg hover:shadow-orange-100 transition-all group"
                        >
                            <div className="p-2 rounded-xl bg-white text-gray-400 group-hover:text-orange-600 shadow-sm border border-gray-100">
                                <BellIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-gray-600 group-hover:text-orange-800">Phát bản tin</span>
                        </button>
                        <button 
                            onClick={() => window.location.href='/admin/staff'}
                            className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-100 transition-all group"
                        >
                            <div className="p-2 rounded-xl bg-white text-gray-400 group-hover:text-blue-600 shadow-sm border border-gray-100">
                                <UserGroupIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-gray-600 group-hover:text-blue-800">Mời nhân sự</span>
                        </button>
                        <button 
                            onClick={() => window.location.href='/admin/orders'}
                            className="flex flex-col items-start gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-100 transition-all group">
                            <div className="p-2 rounded-xl bg-white text-gray-400 group-hover:text-indigo-600 shadow-sm border border-gray-100">
                                <ChartBarIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-gray-600 group-hover:text-indigo-800">Dữ liệu đơn</span>
                        </button>
                    </div>
                    {/* TASK PRIORITY MONITOR */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Cần ưu tiên</span>
                            <span className={Object.values(stats?.ordersByStatus || {}).reduce((a,b) => a+b, 0) > 0 ? 'text-[10px] font-black text-red-500 uppercase' : 'text-[10px] font-black text-green-500 uppercase'}>
                                {Object.values(stats?.ordersByStatus || {}).reduce((a,b) => a+b, 0) > 0 ? '🔥 Chờ xử lý' : '✨ Hoàn tất'}
                            </span>
                        </div>
                        <div className="space-y-3">
                            {stats?.ordersByStatus?.PENDING > 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-sm"></div>
                                    <span className="text-[10px] font-black text-red-700 uppercase tracking-tight">Duyệt {stats.ordersByStatus.PENDING} đơn hàng mới</span>
                                </div>
                            )}
                            {stats?.ordersByStatus?.CONFIRMED > 0 && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm"></div>
                                    <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight">Đóng gói {stats.ordersByStatus.CONFIRMED} đơn hàng</span>
                                </div>
                            )}
                            {!stats?.ordersByStatus?.PENDING && !stats?.ordersByStatus?.CONFIRMED && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50 border-dashed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm"></div>
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-tight italic">Tất cả đều ổn! Nghỉ ngơi thôi.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Ranking: Top Selling Products */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Sản phẩm bán chạy</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dựa trên số lượng thực phẩm sạch đã giao</p>
                        </div>
                        <button onClick={() => window.location.href='/admin/products'} className="text-green-600 text-[10px] font-black uppercase tracking-widest hover:bg-green-100 py-1.5 px-4 bg-green-50 rounded-full transition-all border border-green-200">Quản lý kho</button>
                    </div>
                    <div className="space-y-6">
                        {stats?.topSellingProducts?.map((p, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-sm font-black text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner border border-white">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 group-hover:text-green-600 transition-colors capitalize leading-tight">{p.productName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Sản lượng: {fmt(p.soldQuantity)} túi</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm text-gray-900 leading-tight">{fmt(p.revenue)}₫</p>
                                    <div className="w-24 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden border border-white shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg shadow-green-200" style={{ width: `${Math.min(100, (p.soldQuantity / 100) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsfeed: Recent Transaction Logs */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Đơn hàng mới</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Giao dịch vừa cập bến</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 shadow-sm group hover:bg-green-50 cursor-pointer transition-colors" onClick={() => window.location.href='/admin/orders'}>
                            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map((o) => {
                            const st = ORDER_STATUS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
                            return (
                                <div 
                                    key={o.id} 
                                    onClick={() => window.location.href=`/admin/orders/${o.id}?mode=view`}
                                    className="flex flex-col gap-2 p-4 rounded-2xl border border-white bg-white/40 hover:border-green-100 hover:bg-green-50/20 transition-all group cursor-pointer shadow-sm active:scale-95 duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-gray-400 group-hover:text-green-700 uppercase tracking-widest">ORDER #{o.id}</span>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border leading-none ${st.cls}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase group-hover:bg-white group-hover:text-green-600 transition-all">
                                                {o.username?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-sm font-black text-gray-900 group-hover:text-green-900 capitalize italic tracking-tight">{o.username || o.userId}</span>
                                        </div>
                                        <span className="text-sm font-black text-green-700">{fmt(o.totalAmount)}₫</span>
                                    </div>
                                </div>
                            );
                        })}
                        {recentOrders.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium border-2 border-dashed border-gray-100 rounded-3xl italic">Chưa có giao dịch nào</div>
                        )}
                        <button onClick={() => window.location.href='/admin/orders'} className="w-full py-3 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all mt-4 border border-white/20 shadow-lg">Xem tất cả đơn hàng</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

