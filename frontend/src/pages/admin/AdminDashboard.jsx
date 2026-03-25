import { useEffect, useState } from 'react';
import { dashboardService, orderService } from '../../api/services';
import Layout from '../../components/Layout';

const StatCard = ({ title, value, icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ORDER_STATUS = {
  PENDING: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800' },
  SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-800' },
  DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-800' },
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

  if (loading) return <Layout><div className="text-center py-20 text-gray-400">Đang tải...</div></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan hệ thống</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng đơn hàng" value={fmt(stats?.totalOrders || 0)} icon="🛒" color="bg-blue-50" />
        <StatCard title="Doanh thu (VNĐ)" value={fmt(stats?.totalRevenue || 0)} icon="💰" color="bg-green-50" />
        <StatCard title="Người dùng" value={fmt(stats?.totalUsers || 0)} icon="👤" color="bg-purple-50" />
        <StatCard title="Sản phẩm" value={fmt(stats?.totalProducts || 0)} icon="📦" color="bg-orange-50" />
      </div>

      {stats?.topSellingProducts?.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Sản phẩm bán chạy</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 text-left">Sản phẩm</th>
                  <th className="pb-2 text-right">Đã bán</th>
                  <th className="pb-2 text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {stats.topSellingProducts.map((p, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium text-gray-800">{p.productName}</td>
                    <td className="py-2 text-right">{fmt(p.totalQuantity)}</td>
                    <td className="py-2 text-right text-green-700">{fmt(p.totalRevenue)}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Đơn hàng gần đây</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="pb-2 text-left">Mã đơn</th>
                <th className="pb-2 text-left">Khách hàng</th>
                <th className="pb-2 text-right">Tổng tiền</th>
                <th className="pb-2 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => {
                const st = ORDER_STATUS[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 font-mono text-gray-600">#{o.id}</td>
                    <td className="py-2">{o.username || o.userId}</td>
                    <td className="py-2 text-right font-semibold">{fmt(o.totalAmount)}₫</td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-gray-400">Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
