import React, { useEffect, useState, useCallback } from 'react';
import { orderService } from '../../api/services';
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
    TagIcon
} from '@heroicons/react/24/outline';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PACKAGING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    CONFIRMED: { label: 'Đã xác nhận', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    PACKAGING: { label: 'Đang đóng gói', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    SHIPPING: { label: 'Đang giao', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    DELIVERED: { label: 'Đã giao', cls: 'bg-green-100 text-green-700 border-green-200' },
    CANCELLED: { label: 'Đã huỷ', cls: 'bg-red-100 text-red-700 border-red-200' },
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [direction, setDirection] = useState('desc');
    const [expanded, setExpanded] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

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

    useEffect(() => { 
        fetchOrders(page, search, statusFilter, sortBy, direction); 
    }, [page, search, statusFilter, sortBy, direction, fetchOrders]);

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
    const fmtDate = (s) => s ? new Date(s).toLocaleString('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }) : '';

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Đơn hàng</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Theo dõi và cập nhật trạng thái đơn hàng của khách.</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 flex-1 max-w-3xl lg:justify-end">
                    <div className="relative flex-1 group">
                        <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Mã đơn, tên khách, số điện thoại..."
                            className="w-full pl-10 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:flex gap-2">
                        <select
                            value={statusFilter}
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
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã đơn</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-wider">Tổng tiền</th>
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
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Chưa có đơn hàng nào</td>
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
                                                        <p className="font-black text-gray-900 leading-none text-sm">#{o.id}</p>
                                                        <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase leading-none">{fmtDate(o.createdAt)}</p>
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
                                                        value={o.status}
                                                        disabled={updatingId === o.id || o.status === 'DELIVERED' || o.status === 'CANCELLED'}
                                                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                        className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer outline-none focus:ring-4 focus:ring-current/10 transition-all ${st.cls}`}
                                                    >
                                                        {ORDER_STATUSES.map((s) => {
                                                            // Logic: Cannot move back to PENDING/CONFIRMED if already SHIPPING/DELIVERED
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
                                                <button
                                                    onClick={() => setExpanded(isExp ? null : o.id)}
                                                    className={`p-1.5 rounded-lg transition-all ${isExp ? 'bg-green-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
                                                >
                                                    {isExp ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 bg-white/50 border-y border-gray-100 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-black text-gray-900 border-l-4 border-green-500 pl-2">Thông tin nhận hàng</h3>
                                                            {o.shippingAddress ? (
                                                                <div className="bg-gray-50 rounded-xl p-3 flex gap-2.5">
                                                                    <MapPinIcon className="w-5 h-5 text-green-600 shrink-0" />
                                                                    <p className="text-xs text-gray-600 font-medium leading-relaxed">{o.shippingAddress}</p>
                                                                </div>
                                                            ) : <p className="text-xs text-gray-400 italic">Không có địa chỉ</p>}
                                                            <div className="flex gap-3">
                                                                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Thanh toán {o.isPaid ? '✅' : '❌'}</p>
                                                                    <p className={`text-xs font-black ${o.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {o.paymentMethod === 'COD' ? 'Khi nhận hàng (COD)' : 
                                                                         o.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                                                                         o.paymentMethod === 'MOMO' ? 'Ví MoMo' : 'VNPay'}
                                                                        {o.isPaid ? ' (Đã trả)' : ' (Chưa trả)'}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-gray-50 rounded-xl p-3 flex-1">
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-0.5">Liên hệ</p>
                                                                    <p className="text-xs text-gray-800 font-black">{o.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-black text-gray-900 border-l-4 border-green-500 pl-2">Chi tiết sản phẩm</h3>
                                                            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                                                <table className="w-full">
                                                                    <thead className="bg-gray-100/50">
                                                                        <tr className="text-[9px] text-gray-500 font-black uppercase tracking-tight">
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
                                                                            <td colSpan={3} className="px-4 py-2 text-right text-[9px] font-black uppercase text-gray-500">Tạm tính</td>
                                                                            <td className="px-4 py-2 text-right font-black text-green-700 text-xs">{fmt(o.totalAmount)}₫</td>
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
        </AdminLayout>
    );
}

