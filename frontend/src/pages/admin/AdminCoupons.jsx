import { useEffect, useState, useCallback } from 'react';
import { couponService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    TicketIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    CalendarDaysIcon,
    CurrencyDollarIcon,
    HashtagIcon
} from '@heroicons/react/24/outline';

const EMPTY = { 
    code: '', 
    description: '', 
    discountPercent: 0, 
    maxDiscountAmount: null, 
    minOrderAmount: 0, 
    expiryDate: new Date().toISOString().split('T')[0], 
    usageLimit: null, 
    isActive: true 
};

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        try {
            const res = await couponService.getAll();
            setCoupons(res.data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (c) => {
        setEditing(c);
        setForm({
            code: c.code || '',
            description: c.description || '',
            discountPercent: c.discountPercent || 0,
            maxDiscountAmount: c.maxDiscountAmount || null,
            minOrderAmount: c.minOrderAmount || 0,
            expiryDate: c.expiryDate || new Date().toISOString().split('T')[0],
            usageLimit: c.usageLimit || null,
            isActive: c.isActive ?? true
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await couponService.update(editing.id, form);
                toast.success('Đã cập nhật mã giảm giá');
            } else {
                await couponService.create(form);
                toast.success('Đã thêm mã giảm giá');
            }
            setShowModal(false);
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xoá mã giảm giá này? Bạn chắc chắn chứ?')) return;
        try {
            await couponService.delete(id);
            toast.success('Đã xoá mã giảm giá');
            fetchCoupons();
        } catch {
            toast.error('Không thể xoá');
        }
    };

    const formatCurrency = (val) => {
        if (!val) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Mã giảm giá</h1>
                    <p className="text-gray-500 font-medium">Quản lý các chương trình khuyến mãi và voucher.</p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Tạo Voucher</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider pl-8">Mã / Mô tả</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center font-vietnam">% Giảm</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Hạn dùng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Lượt dùng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center pr-8 font-vietnam">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-12 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : coupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest">Chưa có mã giảm giá nào</td>
                                </tr>
                            ) : coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                                <TicketIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight uppercase tracking-wider">{c.code}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-1 line-clamp-1 italic">{c.description || 'Không có mô tả'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-lg font-black text-indigo-600">{c.discountPercent}%</span>
                                            {c.maxDiscountAmount && (
                                                <span className="text-[10px] text-gray-400 font-bold italic">Tối đa {formatCurrency(c.maxDiscountAmount)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${new Date(c.expiryDate) < new Date() ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
                                            {c.expiryDate}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-gray-900">{c.usedCount} / {c.usageLimit || '∞'}</span>
                                            <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-500 rounded-full" 
                                                    style={{ width: c.usageLimit ? `${(c.usedCount / c.usageLimit) * 100}%` : '0%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center pr-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openEdit(c)} 
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(c.id)} 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editing ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}</h2>
                                <p className="text-sm text-gray-500 font-medium font-vietnam">Thiết lập mã giảm giá cho khách hàng.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        <HashtagIcon className="w-4 h-4" /> Mã Voucher
                                    </label>
                                    <input 
                                        required 
                                        value={form.code} 
                                        onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="VÍ DỤ: GIAM50K"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        % Giảm giá
                                    </label>
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        required 
                                        value={form.discountPercent ?? 0} 
                                        onChange={(e) => setForm({ ...form, discountPercent: e.target.value === '' ? '' : parseInt(e.target.value) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        <CurrencyDollarIcon className="w-4 h-4" /> Giảm tối đa (VNĐ)
                                    </label>
                                    <input 
                                        type="number"
                                        value={form.maxDiscountAmount ?? ''} 
                                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value === '' ? null : parseFloat(e.target.value) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="Để trống nếu không giới hạn"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        Đơn tối thiểu (VNĐ)
                                    </label>
                                    <input 
                                        type="number"
                                        value={form.minOrderAmount ?? 0} 
                                        onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value === '' ? '' : parseFloat(e.target.value) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        <CalendarDaysIcon className="w-4 h-4" /> Ngày hết hạn
                                    </label>
                                    <input 
                                        type="date"
                                        required 
                                        value={form.expiryDate} 
                                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                        Giới hạn lượt dùng
                                    </label>
                                    <input 
                                        type="number"
                                        value={form.usageLimit ?? ''} 
                                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value === '' ? null : parseInt(e.target.value) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        placeholder="Để trống nếu không giới hạn"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                    Mô tả chương trình
                                </label>
                                <textarea 
                                    rows={2} 
                                    value={form.description} 
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none font-vietnam" 
                                    placeholder="Ví dụ: Giảm 10% tối đa 50k cho đơn từ 200k..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                <input 
                                    type="checkbox" 
                                    id="isActiveCoupon" 
                                    checked={form.isActive} 
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
                                    className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500 border-none" 
                                />
                                <label htmlFor="isActiveCoupon" className="text-sm font-bold text-indigo-800 font-vietnam">Kích hoạt mã giảm giá này ngay bây giờ</label>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all font-vietnam"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 font-vietnam"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu lại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
