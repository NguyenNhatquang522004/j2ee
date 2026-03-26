import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { ArchiveBoxIcon, MapPinIcon, ChevronRightIcon, ChevronDownIcon, XCircleIcon, ClockIcon, CheckBadgeIcon, TruckIcon, HomeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const STATUS_MAP = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckBadgeIcon },
    PACKAGING: { label: 'Đang đóng gói', color: 'bg-purple-100 text-purple-800', icon: ArchiveBoxIcon },
    SHIPPING: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800', icon: TruckIcon },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
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
                prev.map((o) => o.id === orderId ? { ...o, status: 'CANCELLED', cancelledAt: new Date().toISOString() } : o)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const fmtFullDate = (s) => {
        if(!s) return null;
        const d = new Date(s);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử đơn hàng</h1>
            {loading ? (
                <div className="text-center py-20 text-gray-400 animate-pulse">Đang tải...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="p-6 bg-gray-50 rounded-full">
                            <ArchiveBoxIcon className="w-16 h-16 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">Bạn chưa có đơn hàng nào</p>
                    <Link to="/products" className="mt-4 inline-block btn-primary">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800', icon: ClockIcon };
                        const isExpanded = expandedId === order.id;

                        const timeline = [
                            { label: 'Đặt hàng thành công', time: order.createdAt, active: true, icon: ClockIcon },
                            { label: 'Shop đã xác nhận', time: order.confirmedAt, active: !!order.confirmedAt, icon: CheckBadgeIcon },
                            { label: 'Đang đóng gói', time: order.confirmedAt ? (order.shippedAt || order.updatedAt) : null, active: !!order.confirmedAt, icon: ArchiveBoxIcon },
                            { label: 'Đang giao hàng', time: order.shippedAt, active: !!order.shippedAt, icon: TruckIcon },
                            { label: 'Giao hàng thành công', time: order.deliveredAt, active: !!order.deliveredAt, icon: HomeIcon },
                        ].filter(t => t.active || (order.status !== 'CANCELLED'));

                        if (order.status === 'CANCELLED') {
                            timeline.push({ label: 'Đã hủy đơn', time: order.cancelledAt || order.updatedAt, active: true, icon: XCircleIcon, error: true });
                        }

                        return (
                            <div key={order.id} className="card overflow-hidden">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">Đơn #{order.id}</span>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono uppercase tracking-widest">{order.orderCode}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {fmtFullDate(order.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Tổng thanh toán</p>
                                            <p className="font-black text-green-700 text-lg">
                                                {order.finalAmount?.toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 ${statusInfo.color}`}>
                                            <statusInfo.icon className="w-4 h-4" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 flex items-start gap-2">
                                            <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                            <span>
                                                <span className="font-bold text-gray-700">Giao tới:</span> {order.shippingAddress}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <ArchiveBoxIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                            <span>
                                                <span className="font-bold text-gray-700">SĐT:</span> {order.phone}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span>
                                                <span className="font-bold text-gray-700">Thanh toán:</span> {order.paymentMethod} ({order.isPaid ? 'Đã trả' : 'Chưa trả'})
                                            </span>
                                        </p>
                                        {order.note && (
                                            <p className="text-xs text-gray-500 italic">
                                                <span className="font-bold text-gray-700 not-italic">Ghi chú:</span> "{order.note}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-2"
                                    >
                                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                                        {isExpanded ? 'Ẩn bớt' : `Xem chi tiết & ${order.orderItems?.length || 0} sản phẩm`}
                                    </button>
                                    {order.status === 'PENDING' && (
                                        <button 
                                            onClick={() => handleCancel(order.id)} 
                                            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                                        >
                                            <XCircleIcon className="w-4 h-4" />
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>

                                {isExpanded && (
                                    <div className="mt-6 space-y-8 animate-in slide-in-from-top-2 duration-300">
                                        {/* Timeline Section */}
                                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                            <h3 className="text-sm font-black text-gray-900 mb-6 flex items-center gap-2">
                                                <ClockIcon className="w-5 h-5 text-green-600" />
                                                Tiến trình đơn hàng
                                            </h3>
                                            <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                                {timeline.map((step, idx) => (
                                                    <div key={idx} className="relative">
                                                        <div className={`absolute -left-8 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                                                            step.active ? (step.error ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-200'
                                                        }`}>
                                                            <step.icon className="w-3 h-3 text-white" />
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                            <p className={`text-sm font-bold ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                                            {step.time && (
                                                                <p className="text-[10px] font-black text-gray-400 uppercase">{fmtFullDate(step.time)}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Product List */}
                                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                                            <div className="space-y-4">
                                                {order.orderItems?.map((item) => (
                                                    <div key={item.orderItemId} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                                                            {item.productImageUrl ? (
                                                                <img src={item.productImageUrl} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                                    <ArchiveBoxIcon className="w-8 h-8" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-800 text-sm truncate">{item.productName}</p>
                                                            <p className="text-xs text-gray-500">{item.unitPrice?.toLocaleString('vi-VN')}đ x {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-gray-900 text-sm">{item.subtotal?.toLocaleString('vi-VN')}đ</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Tạm tính</span>
                                                    <span>{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                                {order.discountAmount > 0 && (
                                                    <div className="flex justify-between text-xs text-green-600 font-bold">
                                                        <span>Giảm giá</span>
                                                        <span>-{order.discountAmount?.toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-base font-black text-gray-900 pt-2">
                                                    <span>Tổng cộng</span>
                                                    <span>{order.finalAmount?.toLocaleString('vi-VN')}đ</span>
                                                </div>
                                            </div>
                                        </div>
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
