import { useEffect, useState, useCallback } from 'react';
import { batchService, productService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ModalContext';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    ExclamationTriangleIcon,
    CalendarIcon,
    ArchiveBoxIcon,
    TagIcon,
    XMarkIcon,
    ClipboardDocumentCheckIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const TODAY = new Date().toISOString().split('T')[0];
const EMPTY = { batchCode: '', productId: '', quantity: '', importDate: TODAY, productionDate: '', expiryDate: '', note: '' };

export default function AdminBatches() {
    const { confirm } = useConfirm();
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [nearExpiry, setNearExpiry] = useState(false);
    const [search, setSearch] = useState('');
    const [isViewOnly, setIsViewOnly] = useState(false);

    const fetchBatches = useCallback(async (q = '') => {
        setLoading(true);
        try {
            const params = { page: 0, size: 100 };
            if (q) params.query = q;

            const res = nearExpiry
                ? await batchService.nearExpiry(7)
                : await batchService.getAll(params);
            
            // Robust data access
            const data = res.data?.content || res.data || [];
            setBatches(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch batches error:', err);
            toast.error('Không thể tải danh sách lô hàng');
        } finally {
            setLoading(false);
        }
    }, [nearExpiry]);

    useEffect(() => { fetchBatches(search); }, [fetchBatches, search]);

    useEffect(() => {
        productService.getAll({ page: 0, size: 500 }).then((res) => {
            const data = res.data?.content || res.data || [];
            setProducts(Array.isArray(data) ? data : []);
        });
    }, []);

    const formatDate = (dateInput) => {
        if (!dateInput) return '';
        if (Array.isArray(dateInput)) {
            // Handle [2024, 3, 25] array format from Jackson
            const [y, m, d] = dateInput;
            return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        }
        return typeof dateInput === 'string' ? dateInput.substring(0, 10) : '';
    };

    const openCreate = () => { setIsViewOnly(false); setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (b) => {
        setIsViewOnly(false);
        setEditing(b);
        setForm({
            batchCode: b.batchCode || '',
            productId: b.productId ?? '',
            quantity: b.quantity ?? '',
            importDate: formatDate(b.importDate),
            productionDate: formatDate(b.productionDate),
            expiryDate: formatDate(b.expiryDate),
            note: b.note || '',
        });
        setShowModal(true);
    };

    const openView = (b) => {
        setIsViewOnly(true);
        setEditing(b);
        setForm({
            batchCode: b.batchCode || '',
            productId: b.productId ?? '',
            quantity: b.quantity ?? '',
            importDate: formatDate(b.importDate),
            productionDate: formatDate(b.productionDate),
            expiryDate: formatDate(b.expiryDate),
            note: b.note || '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation logic
        if (form.productionDate && form.productionDate > TODAY) {
            toast.error('Ngày sản xuất không được ở tương lai');
            return;
        }
        if (form.productionDate && form.importDate < form.productionDate) {
            toast.error('Ngày nhập hàng không được trước ngày sản xuất');
            return;
        }
        if (form.expiryDate <= form.importDate) {
            toast.error('Ngày hết hạn phải sau ngày nhập hàng');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...form, productId: Number(form.productId), quantity: Number(form.quantity) };
            editing ? await batchService.update(editing.id, payload) : await batchService.create(payload);
            toast.success(editing ? 'Đã cập nhật lô hàng' : 'Đã thêm lô hàng');
            setShowModal(false);
            fetchBatches();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Xoá lô hàng',
            message: 'Bạn có chắc chắn muốn xoá vĩnh viễn lô hàng này? Dữ liệu về hạn sử dụng và tồn kho liên quan sẽ bị loại bỏ.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await batchService.delete(id);
            toast.success('Đã xoá lô hàng');
            fetchBatches();
        } catch { toast.error('Không thể xoá'); }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <AdminLayout>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Lô hàng</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Quản lý nhập kho và theo dõi hạn sử dụng sản phẩm.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-1 lg:max-w-3xl lg:justify-end">
                    <div className="relative flex-1 group min-w-[200px]">
                        <ArchiveBoxIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm mã lô, tên sản phẩm..."
                            className="w-full pl-10 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-xs"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setNearExpiry((v) => !v)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black transition-all shadow-sm text-xs border ${
                                nearExpiry 
                                ? 'bg-white text-gray-900 border-amber-300 ring-4 ring-amber-500/10 shadow-lg shadow-amber-500/10' 
                                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100'
                            }`}
                        >
                            <ExclamationTriangleIcon className={`w-5 h-5 ${nearExpiry ? 'text-amber-500' : 'text-gray-400'}`} />
                            <span>Sắp hết hạn</span>
                        </button>
                        <button 
                            onClick={openCreate} 
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-5 py-2.5 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 text-xs"
                        >
                            <PlusIcon className="w-5 h-5 stroke-[3]" />
                            <span>Thêm lô</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Mã lô & Sản phẩm</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Số lượng</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Ngày SX</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Hạn sử dụng</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-10 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : batches.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Không có dữ liệu lô hàng</td></tr>
                            ) : batches.map((b) => {
                                const days = b.daysUntilExpiry;
                                const isExpiring = days != null && days <= 7;
                                const isCritical = days != null && days <= 3;
                                const isExpired = days != null && days < 0;

                                return (
                                    <tr key={b.id} className={`group hover:bg-green-50/50 transition-all duration-300 border-b border-gray-50/50 last:border-0 ${isExpired ? 'bg-red-50/20' : isCritical ? 'bg-amber-50/20' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                                                    isExpired ? 'bg-red-100 text-red-600 border-red-200' : 
                                                    isCritical ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                                                    'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                    <ArchiveBoxIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-green-700 transition-all text-sm uppercase tracking-tight">{b.productName}</p>
                                                    <p className="text-[10px] text-gray-400 font-black uppercase mt-0.5 tracking-[0.15em] flex items-center gap-1.5 whitespace-nowrap">
                                                        <TagIcon className="w-3 h-3" />
                                                        Mã lô: <span className="text-gray-600">{b.batchCode}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-black text-gray-900 leading-none">{fmt(b.quantity)}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Đơn vị: {b.unit || 'Kg'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm whitespace-nowrap">
                                                {formatDate(b.productionDate)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl border shadow-sm transition-all duration-500 whitespace-nowrap ${
                                                isExpired ? 'bg-red-600 text-white border-red-700' : 
                                                isCritical ? 'bg-amber-500 text-white border-amber-600' : 
                                                'bg-white text-green-700 border-green-200 shadow-green-100/50'
                                            }`}>
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {formatDate(b.expiryDate)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {days != null && (() => {
                                                let label = '';
                                                let style = '';
                                                
                                                if (days < 0) {
                                                    label = `HẾT HẠN ${Math.abs(days)} NGÀY`;
                                                    style = 'bg-red-600 text-white shadow-red-200 border-red-700 animate-pulse-slow';
                                                } else if (days === 0) {
                                                    label = 'HẾT HẠN HÔM NAY';
                                                    style = 'bg-rose-600 text-white shadow-rose-200 border-rose-700 animate-bounce';
                                                } else if (days <= 3) {
                                                    label = `GẤP: CÒN ${days} NGÀY`;
                                                    style = 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse-slow';
                                                } else if (days <= 7) {
                                                    label = `LƯU Ý: ${days} NGÀY`;
                                                    style = 'bg-yellow-50 text-yellow-700 border-yellow-300';
                                                } else {
                                                    label = `AN TOÀN: ${days} NGÀY`;
                                                    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                }

                                                return (
                                                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-lg transition-all duration-700 group-hover:scale-105 whitespace-nowrap ${style}`}>
                                                        {label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openView(b)} className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-green-100 active:scale-90" title="Xem chi tiết"><EyeIcon className="w-5 h-5" /></button>
                                                <button onClick={() => openEdit(b)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100 active:scale-90" title="Sửa lô hàng"><PencilSquareIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-100 active:scale-90" title="Xóa lô hàng"><TrashIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{isViewOnly ? 'Chi tiết lô hàng' : editing ? 'Chỉnh sửa lô hàng' : 'Thêm lô hàng mới'}</h2>
                                <p className="text-[11px] text-gray-500 font-medium leading-none">{isViewOnly ? 'Thông tin chi tiết về sản phẩm nhập kho.' : 'Nhập mã lô và thông tin sản phẩm nhập kho.'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mã lô hàng *</label>
                                    <input required type="text" placeholder="VD: LOT-2024-001" value={form.batchCode} onChange={(e) => setForm({ ...form, batchCode: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Sản phẩm *</label>
                                    <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-70">
                                        <option value="">-- Chọn --</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Số lượng *</label>
                                    <input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ngày nhập kho *</label>
                                    <input required type="date" value={form.importDate} onChange={(e) => setForm({ ...form, importDate: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-70" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ngày SX</label>
                                    <input type="date" value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-800 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-70" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Hạn sử dụng *</label>
                                    <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-red-600 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-red-500 text-sm disabled:opacity-70" />
                                </div>
                            </div>
                             <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-all text-sm">{isViewOnly ? 'Đóng' : 'Hủy'}</button>
                                {!isViewOnly && (
                                    <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 text-sm">
                                        {saving ? '...' : 'Lưu lô hàng'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

