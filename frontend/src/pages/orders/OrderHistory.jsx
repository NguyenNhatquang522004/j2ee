import { useEffect, useState } from 'react';
import { orderService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const STATUS_MAP = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
    PROCESSING: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-800' },
    SHIPPED: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800' },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        orderService.myOrders({ page: 0, size: 20 })
            .then((r) => setOrders(r.data.content || r.data))
            .catch(() => toast.error('Không thể tải đơn hàng'))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (orderId) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        try {
            await orderService.cancel(orderId);
            toast.success('Đã hủy đơn hàng');
            setOrders((prev) =>
                prev.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED' } : o)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>
            {loading ? (
                <div className="text-center py-20 text-gray-400">Đang tải...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                        const isExpanded = expandedId === order.id;
                        return (
                            <div key={order.id} className="card">
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <div>
                                        <span className="font-bold text-gray-800">Đơn #{order.id}</span>
                                        <span className="ml-3 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </span>
                                        <span className="font-bold text-green-700">
                                            {order.finalAmount?.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">📍 {order.shippingAddress}</p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="text-sm text-green-700 hover:underline"
                                    >
                                        {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                                    </button>
                                    {order.status === 'PENDING' && (
                                        <button onClick={() => handleCancel(order.id)} className="text-sm text-red-600 hover:underline">
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>

                                {isExpanded && (
                                    <div className="mt-4 border-t pt-4 space-y-2">
                                        {order.orderItems?.map((item) => (
                                            <div key={item.orderItemId} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700">{item.productName}</span>
                                                <span className="text-gray-500">x{item.quantity}</span>
                                                <span className="font-medium">{item.subtotal?.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        ))}
                                        {order.discountAmount > 0 && (
                                            <div className="flex justify-between text-sm text-green-600 font-medium border-t pt-2">
                                                <span>Giảm giá</span>
                                                <span>-{order.discountAmount?.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}
