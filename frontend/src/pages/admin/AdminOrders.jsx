import React, { useEffect, useState, useCallback } from 'react';
import { orderService } from '../../api/services';
import { useLocation, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    ClipboardDocumentListIcon, 
    ChevronDownIcon, 
    ChevronUpIcon,
    MapPinIcon,
    CalendarIcon,
    UserIcon,
    CurrencyDollarIcon,
    TagIcon,
    PrinterIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from '../../components/ConfirmModal';

/**
 * CONFIGURATION: Order Statuses
 * Standard lifecycle of an order from payment to delivery or return.
 */
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PACKAGING', 'SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED', 'CANCELLED'];

/**
 * UI CONFIG: Status Styling
 * Maps status keys to human labels and premium Tailwind CSS classes.
 */
const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    PACKAGING: { label: 'Đang đóng gói', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-700 border-green-200' },
    RETURN_REQUESTED: { label: 'Yêu cầu trả hàng', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    RETURNED: { label: 'Đã trả hàng', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
    RETURN_REJECTED: { label: 'Từ chối trả hàng', cls: 'bg-red-100 text-red-700 border-red-200' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-700 border-red-200' },
};

/**
 * ADMIN COMPONENT: AdminOrders
 * ---------------------------------------------------------
 * Comprehensive control panel for monitoring and managing customer orders.
 * 
 * Features:
 * 1. Filtered Search: Search by code, name, phone, or status.
 * 2. Status Guard: Business logic prevents invalid status jumps (e.g. Delivered -> Pending).
 * 3. Return Management: Admin confirms or rejects return requests with reasons.
 * 4. Refund Tracking: Manually marking cancelled/returned orders as refunded.
 * 5. High-level Navigation: Direct link to full OrderDetail for deep auditing.
 */
export default function AdminOrders() {
    // --- HOOKS & PARAMETERS ---
    const { search: urlSearch } = useLocation();
    const queryParams = new URLSearchParams(urlSearch);
    const initialStatus = queryParams.get('status') || '';

    // --- STATE ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(handler);
    }, [search]);

    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [sortBy, setSortBy] = useState('createdAt');
    const [direction, setDirection] = useState('desc');
    const [expanded, setExpanded] = useState(null); // In-line expansion ID
    const [updatingId, setUpdatingId] = useState(null); // Loading state for single order action
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

    // Synchronization with URL params
    useEffect(() => {
        if (initialStatus) {
            setStatusFilter(initialStatus);
            setPage(0);
        }
    }, [initialStatus]);

    // --- DATA ACTIONS ---

    /**
     * fetchOrders: Main query logic for the order table.
     */
    const fetchOrders = useCallback(async (p = 0, q = '', status = '', sort = 'createdAt', dir = 'desc') => {
        setLoading(true);
        try {
            const params = { 
                page: p, 
                size: 10,
                sortBy: sort,
                direction: dir
            };
            if (q) params.query = q;
            if (status) params.status = status;
            
            const res = await orderService.getAll(params);
            setOrders(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    // Reactive fetching
    useEffect(() => { 
        fetchOrders(page, debouncedSearch, statusFilter, sortBy, direction); 
    }, [page, debouncedSearch, statusFilter, sortBy, direction, fetchOrders]);

    // --- ADMINISTRATIVE ACTIONS ---

    /**
     * handleStatusChange: Updates individual order status via select dropdown.
     */
    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success('Đã cập nhật trạng thái');
            fetchOrders(page); // Refresh list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setUpdatingId(null);
        }
    };

    /**
     * handleRefund: Mark an order as officially refunded after manual bank transfer.
     */
    const handleRefund = (orderId) => {
        setModal({
            isOpen: true,
            title: 'Xác nhận hoàn tiền',
            message: 'Bạn xác nhận đã chuyển khoản hoàn tiền cho khách hàng thành công?',
            type: 'warning',
            onConfirm: async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(orderId);
                try {
                    await orderService.refund(orderId);
                    toast.success('Đã đánh dấu hoàn tiền thành công!');
                    fetchOrders(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Hoàn tiền thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    /**
     * handleConfirmReturn: Acceptance of returned goods.
     */
    const handleConfirmReturn = (orderId) => {
        setModal({
            isOpen: true,
            title: 'Xác nhận nhận hàng',
            message: 'Xác nhận đã nhận lại hàng và đồng ý hoàn tiền/đổi trả?',
            type: 'info',
            onConfirm: async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(orderId);
                try {
                    await orderService.confirmReturn(orderId);
                    toast.success('Đã xác nhận trả hàng thành công!');
                    fetchOrders(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Xác nhận thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    /**
     * handleRejectReturn: Refusal of a return request with mandatory reason audit.
     */
    const handleRejectReturn = (orderId) => {
        setModal({
            isOpen: true,
            title: 'Từ chối trả hàng',
            message: 'Vui lòng nhập lý do cụ thể để thông báo cho khách hàng:',
            type: 'prompt',
            placeholder: 'Ví dụ: Sản phẩm không có lỗi từ nhà sản xuất...',
            onConfirm: async (reason) => {
                if (!reason || !reason.trim()) return toast.error('Vui lòng nhập lý do từ chối');
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(orderId);
                try {
                    await orderService.rejectReturn(orderId, reason);
                    toast.success('Đã từ chối yêu cầu trả hàng');
                    fetchOrders(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Thao tác thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    // --- RENDERING HELPERS ---

    /**
     * handlePrintInvoice: Direct printing logic for admins.
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
                        <p style="margin: 5px 0; color: #666; font-size: 14px;">Hóa đơn Quản trị - Hệ thống FreshFood</p>
                    </div>

                    <h2 style="text-align: center; color: #333;">HÓA ĐƠN BÁN HÀNG</h2>
                    <div style="margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                        <div>
                            <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
                            <p><strong>Ngày tạo:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                            <p><strong>Trạng thái:</strong> ${STATUS_CONFIG[order.status]?.label || order.status}</p>
                        </div>
                        <div>
                            <p><strong>Khách hàng:</strong> ${order.username || order.userId}</p>
                            <p><strong>Điện thoại:</strong> ${order.phone || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> ${order.shippingAddress || 'N/A'}</p>
                        </div>
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

                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; display: grid; grid-template-columns: 1fr 1fr; text-align: center;">
                        <div>
                            <p><strong>Người lập hóa đơn</strong></p>
                            <p style="margin-top: 60px;">(Ký và ghi rõ họ tên)</p>
                        </div>
                        <div>
                            <p><strong>Người nhận hàng</strong></p>
                            <p style="margin-top: 60px;">(Ký và ghi rõ họ tên)</p>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

    /**
     * fmtDate: Formats date to medium length for table readability.
     */
    const fmtDate = (s) => s ? new Date(s).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }) : '';

    // --- RENDER ---

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase italic flex items-center gap-2">
                        <TagIcon className="w-8 h-8 text-emerald-600" />
                        Đơn hàng <span className="text-emerald-600">FRESHFOOD</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight mt-1">Theo dõi và cập nhật trạng thái đơn hàng từ cộng đồng.</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 flex-1 max-w-3xl lg:justify-end">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Mã đơn, tên khách, số điện thoại..."
                            className="w-full pl-10 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-xs"
                        />
                    </div>
                    {/* Filters */}
                    <div className="grid grid-cols-2 lg:flex gap-2">
                        <select
                            value={statusFilter || ''}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                        >
                            <option value="">Status: All</option>
                            {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                            ))}
                        </select>
                        <select
                            value={`${sortBy}-${direction}`}
                            onChange={(e) => {
                                const [s, d] = e.target.value.split('-');
                                setSortBy(s);
                                setDirection(d);
                                setPage(0);
                            }}
                            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                        >
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="finalAmount-desc">Giá: ↓</option>
                            <option value="finalAmount-asc">Giá: ↑</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-600 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-600 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-600 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">Không tìm thấy đơn hàng nào khớp với bộ lọc</td>
                                </tr>
                            ) : orders.map((o) => {
                                const st = STATUS_CONFIG[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
                                const isExp = expanded === o.id;
                                return (
                                    <React.Fragment key={o.id}>
                                        <tr className={`hover:bg-green-50/30 transition-all group ${isExp ? 'bg-green-50/50' : ''}`}>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                                        <ClipboardDocumentListIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 leading-none text-sm">#{o.orderCode}</p>
                                                        <p className="text-[9px] text-gray-600 font-bold mt-1 uppercase leading-none">{fmtDate(o.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-gray-800 font-black text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                                    {o.username || o.userId}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <p className="text-sm font-black text-green-700 leading-none">{fmt(o.finalAmount)}₫</p>
                                                {o.discountAmount > 0 && (
                                                    <p className="text-[9px] text-red-500 font-bold mt-1 uppercase leading-none italic">Giảm -{fmt(o.discountAmount)}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="inline-block relative">
                                                    <select
                                                        value={o.status || ''}
                                                        disabled={updatingId === o.id || ['DELIVERED', 'CANCELLED', 'RETURNED', 'RETURN_REJECTED'].includes(o.status)}
                                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                        className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border outline-none focus:ring-4 focus:ring-current/10 transition-all ${st.cls} ${['DELIVERED', 'CANCELLED', 'RETURNED', 'RETURN_REJECTED'].includes(o.status) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                                    >
                                                        {ORDER_STATUSES.map((s) => {
                                                            // Guard: Prevent reverse illegal status jumps
                                                            const isPast = (o.status === 'SHIPPING' || o.status === 'DELIVERED') && (s === 'PENDING' || s === 'CONFIRMED');
                                                            return (
                                                                <option 
                                                                    key={s} 
                                                                    value={s}
                                                                    disabled={isPast}
                                                                >
                                                                    {STATUS_CONFIG[s]?.label || s}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                    <ChevronDownIcon className="w-2.5 h-2.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* NEW: Link to Full Premium Detail Page */}
                                                    <Link
                                                        to={`/admin/orders/${o.orderCode}?mode=view`}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-green-100 hover:text-green-600 transition-all"
                                                        title="Xem trang chi tiết Premium"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handlePrintInvoice(o)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-all"
                                                        title="In hóa đơn"
                                                    >
                                                        <PrinterIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setExpanded(isExp ? null : o.id)}
                                                        className={`p-1.5 rounded-lg transition-all ${isExp ? 'bg-green-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                                                        title="Mở rộng xem nhanh"
                                                    >
                                                        {isExp ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 bg-white/50 border-y border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        {/* Column 1: Customer Details */}
                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-black text-gray-900 border-l-4 border-green-500 pl-2">Thông tin nhận hàng</h3>
                                                            <div className="grid grid-cols-1 gap-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest ml-1">Số nhà, tên đường</p>
                                                                    <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[11px] font-bold text-gray-800 italic">
                                                                        {o.shippingAddress?.split(', ')[0] || o.shippingAddress}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest ml-1">Phường/Xã</p>
                                                                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700">
                                                                            {o.shippingAddress?.split(', ')[1] || '---'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest ml-1">Quận/Huyện</p>
                                                                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700">
                                                                            {o.shippingAddress?.split(', ')[2] || '---'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest ml-1">Tỉnh/TP</p>
                                                                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700">
                                                                            {o.shippingAddress?.split(', ')[3] || '---'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {o.returnReason && (
                                                                <div className="space-y-3">
                                                                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl relative overflow-hidden group">
                                                                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                                                            <TagIcon className="w-12 h-12 text-orange-600" />
                                                                        </div>
                                                                        <p className="text-[9px] text-orange-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">Lý do khách hàng hoàn hàng</p>
                                                                        <p className="text-gray-700 font-black text-xs leading-relaxed italic pr-8">"{o.returnReason}"</p>
                                                                    </div>
                                                                    
                                                                    {o.returnMedia && (
                                                                        <div className="space-y-1.5">
                                                                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest ml-1">Hình ảnh/Video minh chứng</p>
                                                                            <div className="w-48 h-32 rounded-2xl overflow-hidden border-2 border-orange-100 shadow-sm transition-transform hover:scale-105 bg-black">
                                                                                {o.returnMedia.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res.cloudinary.com\/.*\/video\/upload\//i) ? (
                                                                                    <video 
                                                                                        src={o.returnMedia} 
                                                                                        className="w-full h-full object-contain cursor-pointer" 
                                                                                        controls
                                                                                    />
                                                                                ) : (
                                                                                    <img 
                                                                                        src={o.returnMedia} 
                                                                                        alt="Evidence" 
                                                                                        className="w-full h-full object-cover cursor-zoom-in"
                                                                                        onClick={() => window.open(o.returnMedia, '_blank')}
                                                                                    />
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div className="flex gap-3">
                                                                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                                                                    <p className="text-[9px] text-gray-600 font-bold uppercase mb-0.5">Thanh toán {o.isPaid ? '✅' : '❌'}</p>
                                                                    <p className={`text-xs font-black mb-2 ${o.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {o.paymentMethod === 'COD' ? 'Khi nhận hàng (COD)' : o.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : o.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'VNPay'}
                                                                        {o.isPaid ? ' (Đã trả)' : ' (Chưa trả)'}
                                                                    </p>
                                                                    
                                                                    {o.status === 'RETURN_REQUESTED' && (
                                                                        <div className="flex gap-2 mb-2">
                                                                            <button 
                                                                                disabled={updatingId === o.id}
                                                                                onClick={() => handleConfirmReturn(o.id)} 
                                                                                className="flex-1 py-1.5 px-3 bg-orange-100 hover:bg-orange-200 text-orange-700 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors border border-orange-200"
                                                                            >Đồng ý</button>
                                                                            <button 
                                                                                disabled={updatingId === o.id}
                                                                                onClick={() => handleRejectReturn(o.id)} 
                                                                                className="px-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors border border-red-100"
                                                                                title="Từ chối yêu cầu"
                                                                            >Từ chối</button>
                                                                        </div>
                                                                    )}

                                                                    {((o.status === 'CANCELLED' && o.isPaid) || o.status === 'RETURNED') && !o.isRefunded && (
                                                                        <button 
                                                                            disabled={updatingId === o.id}
                                                                            onClick={() => handleRefund(o.id)} 
                                                                            className="block w-full py-1.5 px-3 bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors border border-red-200 mb-2"
                                                                        >Xác nhận hoàn tiền</button>
                                                                    )}
                                                                </div>
                                                                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                                                                    <p className="text-[9px] text-gray-600 font-bold uppercase mb-0.5">Liên hệ</p>
                                                                    <p className="text-xs text-gray-800 font-black">{o.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Column 2: Order Items */}
                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-black text-gray-900 border-l-4 border-blue-500 pl-2">Chi tiết sản phẩm</h3>
                                                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                                <table className="w-full">
                                                                    <thead className="bg-gray-100/50">
                                                                        <tr className="text-[9px] text-gray-700 font-black uppercase tracking-tight">
                                                                            <th className="px-4 py-1.5 text-left">Sản phẩm</th>
                                                                            <th className="px-4 py-1.5 text-right">Giá</th>
                                                                            <th className="px-4 py-1.5 text-center">SL</th>
                                                                            <th className="px-4 py-1.5 text-right">Tổng</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {o.orderItems?.map((item, idx) => (
                                                                            <tr key={idx} className="text-[11px]">
                                                                                <td className="px-4 py-2 font-black text-gray-800 truncate max-w-[120px]">{item.productName}</td>
                                                                                <td className="px-4 py-2 text-right text-gray-500">{fmt(item.unitPrice)}</td>
                                                                                <td className="px-4 py-2 text-center font-bold">{item.quantity}</td>
                                                                                <td className="px-4 py-2 text-right font-black text-green-700">{fmt(item.subtotal)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                    <tfoot className="bg-green-50/50">
                                                                        <tr>
                                                                            <td colSpan={3} className="px-4 py-1 text-right text-[8px] font-black uppercase text-gray-600 italic">Phí vận chuyển</td>
                                                                            <td className="px-4 py-1 text-right font-bold text-gray-600 text-[10px]">{fmt(o.shippingFee || 0)}₫</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td colSpan={3} className="px-4 py-2 text-right text-[9px] font-black uppercase text-gray-500">Tổng thanh toán</td>
                                                                            <td className="px-4 py-2 text-right font-black text-green-700 text-xs">{fmt(o.finalAmount)}₫</td>
                                                                        </tr>
                                                                    </tfoot>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500">Trang {page + 1} / {totalPages}</p>
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button key={i} onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                        page === i 
                                        ? 'bg-green-600 text-white shadow-sm' 
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal 
                {...modal} 
                onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))} 
            />
        </AdminLayout>
    );
}

