import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService, cartService } from '../../api/services';
import { useConfirm } from '../../context/ModalContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { 
    ArchiveBoxIcon, 
    MapPinIcon, 
    ChevronRightIcon, 
    XCircleIcon, 
    ClockIcon, 
    ArrowPathIcon, 
    PrinterIcon,
    CheckCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * STATIC CONFIG:
 * Maps backend status codes to human-friendly labels and premium UI colors.
 */
const STATUS_MAP = {
    PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
    CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
    PACKAGING: { label: 'Đang đóng gói', color: 'bg-purple-100 text-purple-800', icon: ArchiveBoxIcon },
    SHIPPING: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
    DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', color: 'bg-orange-100 text-orange-800', icon: ClockIcon },
    RETURNED: { label: 'Đã trả hàng', color: 'bg-gray-100 text-gray-800', icon: ArchiveBoxIcon },
    RETURN_REJECTED: { label: 'Từ chối trả hàng', color: 'bg-red-100 text-red-800', icon: XCircleIcon },
};

/**
 * PAGE COMPONENT: OrderHistory
 * ---------------------------------------------------------
 * Displays the user's past and active orders in a clean, card-based layout.
 * 
 * Features:
 * 1. Infinite Scroll/Pagination (Service-side): Fetches user-specific orders.
 * 2. Order Actions: Quick Cancel (for Pending), Buy Again (Cart merge), and Invoice Print.
 * 3. Deep Navigation: Links to detailed order lifecycle views using Numeric IDs.
 */
export default function OrderHistory() {
    // --- STATE ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { confirm } = useConfirm();
    const navigate = useNavigate();

    // --- DATA FETCHING ---
    useEffect(() => {
        // Fetch orders belonging strictly to the authenticated user
        orderService.myOrders({ page: 0, size: 20 })
            .then((r) => setOrders(r.data.content || r.data))
            .catch(() => toast.error('Không thể tải đơn hàng'))
            .finally(() => setLoading(false));
    }, []);

    // --- ACTION HANDLERS ---

    /**
     * handleCancel:
     * Triggers a specific cancellation flow if the order is still PENDING.
     * Uses a global confirm modal for safety.
     */
    const handleCancel = async (orderCode) => {
        const ok = await confirm({
            title: 'Hủy đơn hàng',
            message: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await orderService.cancel(orderCode);
            toast.success('Đã hủy đơn hàng');
            // Optimistic update of local state
            setOrders((prev) =>
                prev.map((o) => o.orderCode === orderCode ? { ...o, status: 'CANCELLED', cancelledAt: new Date().toISOString() } : o)
            );
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    /**
     * handleBuyAgain:
     * Batch adds every item from a previous order into the current active cart.
     */
    const handleBuyAgain = async (order) => {
        const loadingToast = toast.loading('Đang thêm vào giỏ hàng...');
        try {
            await Promise.all(order.orderItems.map(item => 
                cartService.addItem({
                    productId: item.productId,
                    quantity: item.quantity
                })
            ));
            // Trigger global cart counter update icon if any
            window.dispatchEvent(new Event('cart-updated'));
            toast.success('Đã thêm sản phẩm vào giỏ hàng', { id: loadingToast });
            navigate('/cart');
        } catch (err) {
            toast.error('Có lỗi khi thêm sản phẩm vào giỏ hàng', { id: loadingToast });
        }
    };

    /**
     * handlePrintInvoice: 
     * Reuses the OrderDetail invoice template for a quick printout from history.
     */
    const handlePrintInvoice = (order) => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = order.orderItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">${item.productName}</td>
                <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px 0; text-align: right;">${(item.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head><title>Hóa đơn #${order.orderCode}</title></head>
                <body style="padding: 40px; font-family: sans-serif;">
                    <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="margin: 0; color: #166534;">FRESHFOOD</h1>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;">Thực phẩm sạch - Cuộc sống xanh</p>
                    </div>

                    <h2 style="text-align: center; color: #333;">HÓA ĐƠN BÁN HÀNG</h2>
                    <div style="margin-bottom: 30px;">
                        <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
                        <p><strong>Ngày tạo:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
                        <p><strong>Người nhận:</strong> ${order.userId}</p>
                        <p><strong>Địa chỉ:</strong> ${order.shippingAddress}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                                <th style="padding: 12px; text-align: center;">SL</th>
                                <th style="padding: 12px; text-align: right;">Đơn giá</th>
                                <th style="padding: 12px; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <div style="width: 300px; margin-left: auto; border-top: 1px solid #eee; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Tạm tính:</span>
                            <span style="font-weight: bold;">${(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        ${order.discountAmount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626;">
                            <span>Chiết khấu:</span>
                            <span>-${(order.discountAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>` : ''}
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Phí vận chuyển:</span>
                            <span style="font-weight: bold;">${(order.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 2px solid #166534; padding-top: 10px; margin-top: 10px; font-size: 18px;">
                            <span style="font-weight: 800; color: #166534;">TỔNG CỘNG:</span>
                            <span style="font-weight: 800; color: #166534;">${(order.finalAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                        <p>Cảm ơn quý khách đã tin dùng sản phẩm của FreshFood!</p>
                        <p>Mọi thắc mắc vui lòng liên hệ hệ thống chăm sóc khách hàng.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    /**
     * Utility: Standardized Vietnamese date-time formatter.
     */
    const fmtFullDate = (s) => {
        if(!s) return null;
        const d = new Date(s);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // --- RENDER ---

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
                        return (
                            <div key={order.id} className="card overflow-hidden">
                                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900">Đơn hàng #{order.orderCode}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{fmtFullDate(order.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Tổng thanh toán</p>
                                            <p className="font-black text-green-700 text-lg">{order.finalAmount?.toLocaleString('vi-VN')}đ</p>
                                        </div>
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 ${statusInfo.color}`}>
                                            <statusInfo.icon className="w-4 h-4" />
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-50">
                                    {/* CRITICAL: Uses Numeric ID for deep detail view navigation */}
                                    <Link
                                        to={`/orders/${order.orderCode}`}
                                        className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-2"
                                    >
                                        <ChevronRightIcon className="w-4 h-4" />
                                        Xem chi tiết
                                    </Link>
                                    
                                    <button 
                                        onClick={() => handleBuyAgain(order)}
                                        className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                        Mua lại
                                    </button>

                                    <button 
                                        onClick={() => handlePrintInvoice(order)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-xl text-sm transition-all flex items-center gap-2"
                                    >
                                        <PrinterIcon className="w-4 h-4" />
                                        In hóa đơn
                                    </button>

                                    {order.status === 'PENDING' && (
                                        <button 
                                            onClick={() => handleCancel(order.orderCode)} 
                                            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 ml-2"
                                        >
                                            <XCircleIcon className="w-4 h-4" />
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}
