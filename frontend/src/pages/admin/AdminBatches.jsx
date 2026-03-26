import { useEffect, useState, useCallback } from 'react';
import { batchService, productService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    ExclamationTriangleIcon,
    CalendarIcon,
    ArchiveBoxIcon,
    TagIcon,
    XMarkIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

const TODAY = new Date().toISOString().split('T')[0];
const EMPTY = { batchCode: '', productId: '', quantity: '', importDate: TODAY, productionDate: '', expiryDate: '', note: '' };

export default function AdminBatches() {
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [nearExpiry, setNearExpiry] = useState(false);

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = nearExpiry
                ? await batchService.nearExpiry(7)
                : await batchService.getAll({ page: 0, size: 100 });
            
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

    useEffect(() => { fetchBatches(); }, [fetchBatches]);

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

    const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (b) => {
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
        if (!window.confirm('Xoá lô hàng này?')) return;
        try {
            await batchService.delete(id);
            toast.success('Đã xoá lô hàng');
            fetchBatches();
        } catch { toast.error('Không thể xoá'); }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Lô hàng</h1>
                    <p className="text-gray-500 font-medium">Quản lý nhập kho và theo dõi hạn sử dụng sản phẩm.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setNearExpiry((v) => !v)}
                        className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black transition-all shadow-lg ${
                            nearExpiry 
                            ? 'bg-amber-100 text-amber-700 shadow-amber-100 ring-2 ring-amber-500' 
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
                        }`}
                    >
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        <span>{nearExpiry ? 'Đang lọc: Sắp hết hạn' : 'Lọc sắp hết hạn'}</span>
                    </button>
                    <button 
                        onClick={openCreate} 
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5 stroke-[3]" />
                        <span>Thêm lô</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Mã lô & Sản phẩm</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Số lượng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Ngày sản xuất</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Hạn sử dụng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
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
                                const isExpiring = b.daysUntilExpiry != null && b.daysUntilExpiry <= 7;
                                return (
                                    <tr key={b.id} className={`group hover:bg-green-50/30 transition-colors ${isExpiring ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isExpiring ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-gray-100 text-gray-400 border-gray-200'} group-hover:bg-green-100 group-hover:text-green-600 transition-colors`}>
                                                    <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 group-hover:text-green-600 transition-all leading-tight">{b.batchCode}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tight">{b.productName}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-black text-gray-900">{fmt(b.quantity)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {formatDate(b.productionDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl border ${
                                                isExpiring ? 'bg-amber-100 text-amber-700 border-amber-200 ring-4 ring-amber-500/10' : 'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                {formatDate(b.expiryDate)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {b.daysUntilExpiry != null && (
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                    b.daysUntilExpiry <= 3 ? 'bg-red-100 text-red-700 border-red-200' : 
                                                    b.daysUntilExpiry <= 7 ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                                                    'bg-green-100 text-green-700 border-green-200'
                                                }`}>
                                                    còn {b.daysUntilExpiry} ngày
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
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
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editing ? 'Chỉnh sửa lô hàng' : 'Thêm lô hàng mới'}</h2>
                                <p className="text-sm text-gray-500 font-medium">Nhập mã lô và thông tin sản phẩm nhập kho.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Mã lô hàng *</label>
                                    <input required type="text" placeholder="VD: LOT-2024-001" value={form.batchCode} onChange={(e) => setForm({ ...form, batchCode: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500" />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Sản phẩm *</label>
                                    <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500">
                                        <option value="">-- Chọn --</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Số lượng *</label>
                                    <input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500" />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Ngày nhập kho *</label>
                                    <input required type="date" value={form.importDate} onChange={(e) => setForm({ ...form, importDate: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500" />
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Ngày SX</label>
                                    <input type="date" value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-800 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500" />
                                </div>
                                <div className="space-y-3 col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Hạn sử dụng *</label>
                                    <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-red-600 focus:ring-4 focus:ring-red-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-red-500" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all">Hủy</button>
                                <button type="submit" disabled={saving} className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50">
                                    {saving ? '...' : 'Lưu lô hàng'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

