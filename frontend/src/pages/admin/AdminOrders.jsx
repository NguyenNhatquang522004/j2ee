import { useEffect, useState, useCallback } from 'react';
import { orderService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-800' },
    SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-800' },
    DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-800' },
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [expanded, setExpanded] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchOrders = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const res = await orderService.getAll({ page: p, size: 10 });
            setOrders(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(page); }, [page, fetchOrders]);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success('Đã cập nhật trạng thái');
            fetchOrders(page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
    const fmtDate = (s) => s ? new Date(s).toLocaleString('vi-VN') : '';

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn hàng</h1>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-gray-500">
                            <th className="pb-3 text-left">Mã đơn</th>
                            <th className="pb-3 text-left">Khách hàng</th>
                            <th className="pb-3 text-right">Tổng tiền</th>
                            <th className="pb-3 text-center">Ngày đặt</th>
                            <th className="pb-3 text-center">Trạng thái</th>
                            <th className="pb-3 text-center">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-400">Đang tải...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={6} className="py-8 text-center text-gray-400">Không có đơn hàng</td></tr>
                        ) : orders.map((o) => {
                            const st = STATUS_CONFIG[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                            return (
                                <>
                                    <tr key={o.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 font-mono text-gray-600">#{o.id}</td>
                                        <td className="py-3">{o.username || o.userId}</td>
                                        <td className="py-3 text-right font-semibold">{fmt(o.totalAmount)}₫</td>
                                        <td className="py-3 text-center text-gray-500">{fmtDate(o.createdAt)}</td>
                                        <td className="py-3 text-center">
                                            <select
                                                value={o.status}
                                                disabled={updatingId === o.id}
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${st.cls}`}
                                            >
                                                {ORDER_STATUSES.map((s) => (
                                                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 text-center">
                                            <button
                                                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                {expanded === o.id ? 'Thu gọn ▲' : 'Xem ▼'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expanded === o.id && o.items?.length > 0 && (
                                        <tr key={`${o.id}-detail`} className="bg-gray-50 border-b">
                                            <td colSpan={6} className="px-4 py-3">
                                                <div className="text-xs text-gray-500 mb-2 font-semibold">Chi tiết đơn hàng #{o.id}</div>
                                                {o.shippingAddress && (
                                                    <p className="text-xs text-gray-500 mb-2">📍 {o.shippingAddress}</p>
                                                )}
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="text-gray-400">
                                                            <th className="text-left pb-1">Sản phẩm</th>
                                                            <th className="text-right pb-1">Đơn giá</th>
                                                            <th className="text-center pb-1">SL</th>
                                                            <th className="text-right pb-1">Thành tiền</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {o.items.map((item, idx) => (
                                                            <tr key={idx} className="border-t border-gray-200">
                                                                <td className="py-1">{item.productName}</td>
                                                                <td className="py-1 text-right">{fmt(item.price)}₫</td>
                                                                <td className="py-1 text-center">{item.quantity}</td>
                                                                <td className="py-1 text-right font-medium">{fmt(item.price * item.quantity)}₫</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i)}
                                className={`px-3 py-1 rounded text-sm ${page === i ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
