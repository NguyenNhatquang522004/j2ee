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
    ArrowDownIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
    <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                <Icon className="w-8 h-8" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                    {trend === 'up' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                    {trendValue}%
                </div>
            )}
        </div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
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
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Tổng quan hệ thống</h1>
                    <p className="text-gray-500 font-medium">Theo dõi hoạt động kinh doanh của bạn hôm nay.</p>
                </div>
                <div className="bg-white/50 backdrop-blur rounded-2xl border border-white/40 p-3 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-bold text-gray-600">Hệ thống đang hoạt động</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Tổng đơn hàng" value={fmt(stats?.totalOrders || 0)} icon={ArchiveBoxIcon} color="bg-blue-100" trend="up" trendValue="12" />
                <StatCard title="Doanh thu tháng (VNĐ)" value={fmt(stats?.revenueThisMonth || 0)} icon={CurrencyDollarIcon} color="bg-emerald-100" trend="up" trendValue="8" />
                <StatCard title="Người dùng" value={fmt(stats?.totalUsers || 0)} icon={UserGroupIcon} color="bg-violet-100" trend="up" trendValue="15" />
                <StatCard title="Sản phẩm" value={fmt(stats?.totalProducts || 0)} icon={ShoppingBagIcon} color="bg-amber-100" trend="down" trendValue="2" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Top Selling Products */}
                <div className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sản phẩm bán chạy</h2>
                        <button className="text-green-600 font-bold hover:underline py-1 px-3 bg-green-50 rounded-full transition-all">Xem tất cả</button>
                    </div>
                    <div className="space-y-6">
                        {stats?.topSellingProducts?.map((p, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-green-600 transition-colors capitalize">{p.productName}</p>
                                        <p className="text-sm text-gray-400 font-medium">Đã bán: {fmt(p.soldQuantity)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-900">{fmt(p.revenue)}₫</p>
                                    <div className="w-24 h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min(100, (p.soldQuantity / 100) * 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Đơn hàng mới</h2>
                        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-6">
                        {recentOrders.map((o) => {
                            const st = ORDER_STATUS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={o.id} className="flex flex-col gap-2 p-4 rounded-2xl border border-gray-50 hover:border-green-100 hover:bg-green-50/20 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-gray-600 group-hover:text-green-700">#{o.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border mb-1 ${st.cls}`}>{st.label}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-green-600">{o.username || o.userId}</span>
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

