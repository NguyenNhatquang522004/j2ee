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
    BellIcon
} from '@heroicons/react/24/outline';

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

const ORDER_STATUS = {
    PENDING: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
    SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
    DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-800 border-green-200' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
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

    if (loading) return <AdminLayout><div className="flex items-center justify-center min-h-[60vh] text-green-600 font-bold animate-pulse">ĐANG TẢI DỮ LIỆU...</div></AdminLayout>;

    return (
        <AdminLayout>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatCard title="Tổng đơn hàng" value={fmt(stats?.totalOrders || 0)} icon={ArchiveBoxIcon} color="bg-emerald-100" trend="up" trendValue="12" />
                <StatCard title="Doanh thu (VNĐ)" value={fmt(stats?.revenueThisMonth || 0)} icon={CurrencyDollarIcon} color="bg-green-100" trend="up" trendValue="8" />
                <StatCard title="Người dùng" value={fmt(stats?.totalUsers || 0)} icon={UserGroupIcon} color="bg-teal-100" trend="up" trendValue="15" />
                <StatCard title="Sản phẩm" value={fmt(stats?.totalProducts || 0)} icon={ShoppingBagIcon} color="bg-lime-100" trend="down" trendValue="2" />
                <StatCard title="Bản tin" value={fmt(stats?.totalSubscribers || 0)} icon={BellIcon} color="bg-orange-100" trend="up" trendValue="5" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Sản phẩm bán chạy</h2>
                        <button className="text-green-600 text-xs font-black uppercase tracking-widest hover:underline py-1 px-3 bg-green-50 rounded-full transition-all">Tất cả</button>
                    </div>
                    <div className="space-y-5">
                        {stats?.topSellingProducts?.map((p, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-black text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors capitalize">{p.productName}</p>
                                        <p className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Đã bán: {fmt(p.soldQuantity)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm text-gray-900">{fmt(p.revenue)}₫</p>
                                    <div className="w-20 h-1.5 bg-gray-50 rounded-full mt-1.5 overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (p.soldQuantity / 100) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Đơn hàng mới</h2>
                        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {recentOrders.map((o) => {
                            const st = ORDER_STATUS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={o.id} className="flex flex-col gap-1.5 p-3 rounded-xl border border-gray-50 hover:border-green-100 hover:bg-green-50/20 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 group-hover:text-green-700">#{o.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${st.cls}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-green-600 capitalize">{o.username || o.userId}</span>
                                        <span className="text-sm font-black text-green-700">{fmt(o.totalAmount)}₫</span>
                                    </div>
                                </div>
                            );
                        })}
                        {recentOrders.length === 0 && (
                            <div className="text-center py-10 text-gray-400 font-medium">Không có đơn hàng mới</div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

