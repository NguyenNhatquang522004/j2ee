import React, { useEffect, useState, useCallback } from 'react';
import { orderService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    ClipboardDocumentListIcon, 
    ChevronDownIcon, 
    ChevronUpIcon,
    CurrencyDollarIcon,
    TagIcon,
    ClockIcon,
    UserIcon,
    PhotoIcon,
    TruckIcon,
    XCircleIcon 
} from '@heroicons/react/24/outline';
import ConfirmModal from '../../components/ConfirmModal';

const STATUS_CONFIG = {
    RETURN_REQUESTED: { label: 'Chờ duyệt trả', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    RETURNED: { label: 'Đã nhận hàng', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    RETURN_REJECTED: { label: 'Từ chối trả hàng', cls: 'bg-red-100 text-red-700 border-red-200' },
    CANCELLED: { label: 'Chờ hoàn tiền', cls: 'bg-red-100 text-red-700 border-red-200' },
    DELIVERED: { label: 'Hoàn tất', cls: 'bg-green-100 text-green-700 border-green-200' },
};

export default function AdminRefunds() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {} });

    const fetchRequests = useCallback(async (p = 0, q = '') => {
        setLoading(true);
        try {
            const res = await orderService.getRefundRequests({ 
                page: p, 
                size: 10,
                query: q
            });
            setRequests(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            toast.error('Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchRequests(page, search); 
    }, [page, search, fetchRequests]);

    const handleRefund = (id) => {
        setModal({
            isOpen: true,
            title: 'Hoàn trả tiền',
            message: 'Xác nhận đã chuyển khoản hoàn tiền thành công cho khách hàng?',
            type: 'warning',
            onConfirm: async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(id);
                try {
                    await orderService.refund(id);
                    toast.success('Đã xác nhận hoàn tiền thành công');
                    fetchRequests(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Xác nhận thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    const handleConfirmReturn = (id) => {
        setModal({
            isOpen: true,
            title: 'Duyệt trả hàng',
            message: 'Xác nhận đã nhận được hàng trả lại từ khách hàng?',
            type: 'info',
            onConfirm: async () => {
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(id);
                try {
                    await orderService.confirmReturn(id);
                    toast.success('Đã xác nhận trả hàng');
                    fetchRequests(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Thao tác thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    const handleRejectReturn = (id) => {
        setModal({
            isOpen: true,
            title: 'Từ chối trả hàng',
            message: 'Lý do từ chối yêu cầu trả hàng:',
            type: 'prompt',
            placeholder: 'Nhập lý do cụ thể...',
            onConfirm: async (reason) => {
                if (!reason || !reason.trim()) return toast.error('Vui lòng nhập lý do');
                setModal(prev => ({ ...prev, isOpen: false }));
                setUpdatingId(id);
                try {
                    await orderService.rejectReturn(id, reason);
                    toast.success('Đã từ chối yêu cầu');
                    fetchRequests(page);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Thao tác thất bại');
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
    const fmtDate = (s) => s ? new Date(s).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Quản lý Hoàn tiền / Trả hàng</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Xử lý các yêu cầu khiếu nại và hoàn trả tài chính.</p>
                </div>
                <div className="flex-1 max-w-md">
                    <div className="relative group">
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Tìm mã đơn, tên khách..."
                            className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-8 focus:ring-green-500/5 focus:border-green-500 transition-all font-black text-xs uppercase tracking-tight"
                        />
                        <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ID / Ngày tạo</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Khách hàng</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Đơn hàng</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Lý do & Ảnh</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Số tiền</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-8 py-10"><div className="h-12 bg-gray-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <ClipboardDocumentListIcon className="w-16 h-16" />
                                            <p className="font-black uppercase tracking-widest text-sm">Không có yêu cầu nào cần xử lý</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.map((o) => {
                                const st = STATUS_CONFIG[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600' };
                                const isExp = expanded === o.id;
                                return (
                                    <React.Fragment key={o.id}>
                                        <tr className={`hover:bg-gray-50/50 transition-all ${isExp ? 'bg-green-50/30' : ''}`}>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 text-sm mb-1">#{o.id}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                                                    <ClockIcon className="w-3 h-3" /> {fmtDate(o.createdAt)}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm leading-none mb-1">{o.username}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold">{o.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-green-600 text-xs tracking-tighter hover:underline cursor-pointer italic">#{o.orderCode}</p>
                                            </td>
                                            <td className="px-8 py-6 max-w-[200px]">
                                                <div className="flex items-center gap-3 group/img">
                                                    <p className="text-xs font-bold text-gray-600 truncate italic">
                                                        "{o.returnReason || 'Không có lý do chi tiết'}"
                                                    </p>
                                                    {o.returnMedia ? (
                                                        <div 
                                                            onClick={() => window.open(o.returnMedia, '_blank')}
                                                            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-orange-100 shadow-sm transition-all hover:scale-125 hover:shadow-lg cursor-zoom-in shrink-0 bg-black flex items-center justify-center"
                                                        >
                                                            {o.returnMedia.match(/\.(mp4|webm|ogg|mov)$|^https:\/\/res.cloudinary.com\/.*\/video\/upload\//i) ? (
                                                                <VideoCameraIcon className="w-5 h-5 text-orange-500" />
                                                            ) : (
                                                                <img src={o.returnMedia} className="w-full h-full object-cover" alt="Detail" />
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 border border-dashed border-gray-200 shrink-0">
                                                            <PhotoIcon className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-black text-gray-900 tabular-nums leading-none">{fmt(o.finalAmount)}₫</p>
                                                <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase leading-none">{o.paymentMethod || 'COD'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center whitespace-nowrap">
                                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${st.cls} shadow-sm inline-block`}>
                                                    {o.isRefunded ? 'ĐÃ HOÀN TIỀN' : st.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className="flex flex-col gap-2 min-w-[120px]">
                                                    {o.status === 'RETURN_REQUESTED' && (
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={() => handleConfirmReturn(o.id)}
                                                                disabled={updatingId === o.id}
                                                                className="flex-1 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 text-[10px] font-black uppercase rounded-lg border border-orange-200 transition-colors"
                                                            >Duyệt</button>
                                                            <button 
                                                                onClick={() => handleRejectReturn(o.id)}
                                                                disabled={updatingId === o.id}
                                                                className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100 transition-colors"
                                                            >X</button>
                                                        </div>
                                                    )}
                                                    {(o.status === 'RETURNED' || (o.status === 'CANCELLED' && o.isPaid)) && !o.isRefunded && (
                                                        <button 
                                                            onClick={() => handleRefund(o.id)}
                                                            disabled={updatingId === o.id}
                                                            className="w-full px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-[10px] font-black uppercase rounded-lg border border-green-200 transition-colors"
                                                        >Hoàn tiền</button>
                                                    )}
                                                    <button
                                                        onClick={() => setExpanded(isExp ? null : o.id)}
                                                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                            isExp 
                                                            ? 'bg-gray-900 text-white shadow-lg' 
                                                            : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300 shadow-sm'
                                                        }`}
                                                    >
                                                        {isExp ? 'Đóng lại' : 'Xem chi tiết'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={7} className="px-8 py-8 bg-gray-50/50 border-y border-gray-50 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start">
                                                        <div className="flex-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                                            <h4 className="text-xs font-black text-gray-900 border-l-4 border-green-500 pl-3 mb-6 uppercase tracking-wider">Thông tin yêu cầu</h4>
                                                            <div className="space-y-4">
                                                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                                                    <p className="text-[9px] text-orange-400 font-black uppercase mb-2 tracking-widest">Lý do từ khách hàng</p>
                                                                    <p className="text-gray-800 font-bold text-sm leading-relaxed italic">"{o.returnReason || 'Hệ thống tự động ghi nhận'}"</p>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                                                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Thanh toán</p>
                                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{o.paymentMethod} • {o.isPaid ? 'Đã thu tiền' : 'Chưa thu'}</p>
                                                                    </div>
                                                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                                                        <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Mã vận chuyển</p>
                                                                        <p className="text-xs font-black text-gray-900 uppercase tracking-tighter">{o.trackingNumber || 'CHƯA CÓ'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="w-full md:w-80 space-y-4">
                                                            <h4 className="text-xs font-black text-gray-900 border-l-4 border-blue-500 pl-3 mb-6 uppercase tracking-wider">Thao tác xử lý</h4>
                                                            
                                                            {o.status === 'RETURN_REQUESTED' && (
                                                                <button 
                                                                    onClick={() => handleConfirmReturn(o.id)}
                                                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                                                                >
                                                                    <TruckIcon className="w-5 h-5" />
                                                                    Xác nhận đã nhận hàng
                                                                </button>
                                                            )}

                                                            {((o.status === 'CANCELLED' && o.isPaid) || o.status === 'RETURNED') && !o.isRefunded && (
                                                                <button 
                                                                    onClick={() => handleRefund(o.id)}
                                                                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                                                                >
                                                                    <CurrencyDollarIcon className="w-5 h-5" />
                                                                    Xác nhận hoàn tiền
                                                                </button>
                                                            )}

                                                            {(o.isRefunded || o.status === 'DELIVERED') && (
                                                                <div className="p-6 bg-green-50 border border-green-100 rounded-3xl text-center">
                                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-100">
                                                                        <TagIcon className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <p className="text-[11px] font-black text-green-700 uppercase tracking-widest">Yêu cầu đã hoàn tất xử lý</p>
                                                                </div>
                                                            )}
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
                    <div className="px-8 py-6 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trang {page + 1} / {totalPages}</p>
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPage(i)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                        page === i 
                                        ? 'bg-green-600 text-white shadow-lg' 
                                        : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-300 shadow-sm'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <p className="text-center mt-12 text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] opacity-50">
                FreshFood Finance & Returns Management System • Secure Encryption
            </p>

            <ConfirmModal 
                {...modal} 
                onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))} 
            />
        </AdminLayout>
    );
}
