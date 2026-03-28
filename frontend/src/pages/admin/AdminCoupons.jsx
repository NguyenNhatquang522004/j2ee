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
    CalendarDaysIcon,
    CurrencyDollarIcon,
    HashtagIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const EMPTY = { 
    code: '', 
    description: '', 
    discountPercent: 0, 
    maxDiscountAmount: null, 
    minOrderAmount: 0, 
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
    usageLimit: null, 
    isActive: true,
    isPrivate: false,
    recipientEmail: ''
};

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, PUBLIC, PRIVATE
    
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [giftForm, setGiftForm] = useState({ email: '', ...EMPTY });
    const [gifting, setGifting] = useState(false);

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
            ...c,
            code: c.code || '',
            description: c.description || '',
            discountPercent: c.discountPercent || 0,
            maxDiscountAmount: c.maxDiscountAmount || null,
            minOrderAmount: c.minOrderAmount || 0,
            expiryDate: c.expiryDate || new Date().toISOString().split('T')[0],
            usageLimit: c.usageLimit || null,
            isActive: c.isActive ?? c.is_active ?? true,
            isPrivate: c.isPrivate ?? c.is_private ?? false,
            recipientEmail: '' // Reset recipient email on edit
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // Validation logic
        const todayStr = new Date().toISOString().split('T')[0];
        if (form.expiryDate < todayStr) {
            toast.error('Ngày hết hạn không được ở quá khứ');
            return;
        }
        if (form.discountPercent < 0 || form.discountPercent > 100) {
            toast.error('Phần trăm giảm giá phải từ 0 đến 100');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                discountPercent: Number(form.discountPercent),
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
                minOrderAmount: Number(form.minOrderAmount),
                usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
                // Ensure both naming conventions are sent to support various backend mappings
                is_private: !!form.isPrivate,
                isPrivate: !!form.isPrivate,
                is_active: !!form.isActive,
                isActive: !!form.isActive
            };
            const result = editing ? await couponService.update(editing.id, payload) : await couponService.create(payload);
            
            // If it's a private voucher and a recipient email is provided, call gift service automatically
            if (form.isPrivate && form.recipientEmail) {
                const savedCoupon = result.data || result;
                await couponService.gift({ 
                    email: form.recipientEmail, 
                    coupon: savedCoupon 
                });
                toast.success(`Đã tạo và gửi voucher cho ${form.recipientEmail}`);
            } else {
                toast.success(editing ? 'Đã cập nhật mã giảm giá' : 'Đã tạo mã giảm giá');
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

    const filteredCoupons = coupons.filter(c => {
        const isPrivate = c.isPrivate ?? c.is_private ?? false;
        if (activeTab === 'PUBLIC') return !isPrivate;
        if (activeTab === 'PRIVATE') return isPrivate;
        return true;
    });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Voucher & Khuyến mãi</h1>
                    <p className="text-gray-500 font-medium">Hệ thống quản lý mã giảm giá công khai và cá nhân.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => { 
                            const giftCode = 'GIFT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                            setForm({ ...EMPTY, code: giftCode, isPrivate: true }); 
                            setShowModal(true); 
                        }} 
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        <EnvelopeIcon className="w-5 h-5 stroke-[3]" />
                        <span>Tặng Voucher</span>
                    </button>
                    <button 
                        onClick={openCreate} 
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5 stroke-[3]" />
                        <span>Tạo Voucher</span>
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-100 backdrop-blur-sm">
                {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'PUBLIC', label: 'Công khai' },
                    { id: 'PRIVATE', label: 'Cá nhân (Quà tặng)' }
                ].map(tab => {
                    const count = tab.id === 'ALL' 
                        ? coupons.length 
                        : (tab.id === 'PUBLIC' 
                            ? coupons.filter(c => !(c.isPrivate ?? c.is_private)).length 
                            : coupons.filter(c => (c.isPrivate ?? c.is_private)).length
                        );
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider pl-8">Mã / Loại</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center font-vietnam">% Giảm</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Hạn dùng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Lượt dùng</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center pr-8">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-12 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredCoupons.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest leading-loose">
                                        Chưa có mã giảm giá nào thuộc mục này
                                    </td>
                                </tr>
                            ) : filteredCoupons.map((c) => (
                                <tr key={c.id} className="hover:bg-emerald-50/30 transition-colors group">
                                    <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${(c.isPrivate ?? c.is_private) ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                <TicketIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-gray-900 leading-tight uppercase tracking-wider">{c.code}</p>
                                                    {(c.isPrivate ?? c.is_private) ? (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[9px] font-black uppercase tracking-tighter">Cá nhân</span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-black uppercase tracking-tighter">Công khai</span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-bold mt-1 line-clamp-1 italic">{c.description || 'Không có mô tả'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className="text-lg font-black text-emerald-600">{c.discountPercent}%</span>
                                            {c.maxDiscountAmount && (
                                                <span className="text-[10px] text-gray-400 font-bold">Tối đa {formatCurrency(c.maxDiscountAmount)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[11px] font-black ${new Date(c.expiryDate) < new Date() ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-50 text-gray-600'}`}>
                                            {c.expiryDate}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-gray-900">{c.usedCount} / {c.usageLimit || '∞'}</span>
                                            <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full bg-emerald-500 rounded-full" 
                                                    style={{ width: c.usageLimit ? `${Math.min((c.usedCount / c.usageLimit) * 100, 100)}%` : '0%' }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center pr-8">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {(c.isPrivate ?? c.is_private) && (
                                                <button 
                                                    onClick={() => { 
                                                        setGiftForm({ email: '', ...c, code: c.code }); 
                                                        setShowGiftModal(true); 
                                                    }} 
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Gửi tặng mã này"
                                                >
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => openEdit(c)} 
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                title="Sửa"
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
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editing ? 'Chi tiết Voucher' : 'Tạo Voucher mới'}</h2>
                                <p className="text-sm text-gray-500 font-medium font-vietnam">Cấu hình tham số cho chương trình khuyến mãi.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto">
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                    <HashtagIcon className="w-4 h-4" /> Mã Voucher
                                </label>
                                <input 
                                    required 
                                    value={form.code} 
                                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 uppercase focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                                    placeholder="VÍ DỤ: GIAM50K"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                    Mô tả chương trình
                                </label>
                                <textarea 
                                    rows={2}
                                    value={form.description} 
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none font-vietnam"
                                    placeholder="Vd: Giảm 50% cho đơn hàng thực phẩm sạch đầu tiên..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">Phần trăm giảm (%)</label>
                                    <input 
                                        type="number" min="0" max="100" required 
                                        value={form.discountPercent ?? 0} 
                                        onChange={(e) => setForm({ ...form, discountPercent: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">Giảm tối đa (đ)</label>
                                    <input 
                                        type="number" min="0"
                                        value={form.maxDiscountAmount ?? ''} 
                                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value)) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none"
                                        placeholder="Không giới hạn"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">Đơn tối thiểu (đ)</label>
                                    <input 
                                        type="number" min="0" required 
                                        value={form.minOrderAmount ?? 0} 
                                        onChange={(e) => setForm({ ...form, minOrderAmount: Math.max(0, parseFloat(e.target.value) || 0) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none font-vietnam"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">Ngày hết hạn</label>
                                    <input 
                                        type="date" required 
                                        value={form.expiryDate} 
                                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex-1 space-y-3">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">Giới hạn lượt dùng</label>
                                    <input 
                                        type="number" min="1"
                                        value={form.usageLimit ?? ''} 
                                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value === '' ? null : Math.max(1, parseInt(e.target.value)) })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 outline-none font-vietnam"
                                        placeholder="Vô hạn"
                                    />
                                </div>
                            </div>

                            {form.isPrivate && (
                                <div className="space-y-3 p-6 bg-purple-50/50 rounded-3xl border border-purple-100/50 animate-in slide-in-from-top-2 duration-300">
                                    <label className="flex items-center gap-2 text-[11px] font-black text-purple-600 uppercase tracking-widest pl-1 font-vietnam">
                                        <EnvelopeIcon className="w-4 h-4" /> Gửi trực tiếp cho khách hàng (Email)
                                    </label>
                                    <input 
                                        type="email"
                                        value={form.recipientEmail} 
                                        onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} 
                                        className="w-full px-6 py-4 bg-white border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none font-vietnam"
                                        placeholder="customer@example.com (Nếu muốn gửi ngay)"
                                    />
                                    <p className="text-[10px] text-purple-400 font-bold px-2 uppercase tracking-wide">Để trống nếu bạn chỉ muốn tạo mã mà chưa gán cho ai.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                    className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-all ${form.isActive ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</span>
                                        <span className={`text-xs font-black uppercase ${form.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {form.isActive ? 'Đang kích hoạt' : 'Đang tạm dừng'}
                                        </span>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </div>

                                <div 
                                    onClick={() => setForm({ ...form, isPrivate: !form.isPrivate })}
                                    className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-all ${form.isPrivate ? 'bg-purple-50/50 border-purple-100' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loại Voucher</span>
                                        <span className={`text-xs font-black uppercase ${form.isPrivate ? 'text-purple-600' : 'text-gray-400'}`}>
                                            {form.isPrivate ? 'Cá nhân (Quà)' : 'Công khai'}
                                        </span>
                                    </div>
                                    <div className={`w-10 h-6 rounded-full relative transition-all ${form.isPrivate ? 'bg-purple-600' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isPrivate ? 'left-5' : 'left-1'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-8 py-5 bg-gray-100 rounded-3xl font-black text-gray-500 hover:bg-gray-200 transition-all font-vietnam">Hủy</button>
                                <button type="submit" disabled={saving} className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-3xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 font-vietnam">
                                    {saving ? 'Đang lưu...' : 'Lưu Voucher'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gift Modal */}
            {showGiftModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
                        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-blue-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-blue-900 tracking-tight">Gửi Tặng Voucher</h2>
                                <p className="text-sm text-blue-600 font-medium font-vietnam">Gán mã giảm giá cá nhân cho người dùng.</p>
                            </div>
                            <button onClick={() => setShowGiftModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form className="p-8 space-y-6" onSubmit={async (e) => {
                            e.preventDefault();
                            setGifting(true);
                            try {
                                const { email, ...coupon } = giftForm;
                                await couponService.gift({ email, coupon });
                                toast.success(`Đã gán voucher ${coupon.code} cho ${email}`);
                                setShowGiftModal(false);
                                fetchCoupons();
                            } catch (err) {
                                toast.error(err.response?.data?.message || 'Lỗi khi tặng voucher');
                            } finally {
                                setGifting(false);
                            }
                        }}>
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-blue-400 uppercase tracking-widest pl-1 font-vietnam">Email Người Nhận</label>
                                <input 
                                    type="email" required 
                                    value={giftForm.email} 
                                    onChange={(e) => setGiftForm({ ...giftForm, email: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none font-vietnam"
                                    placeholder="customer@example.com"
                                />
                            </div>

                            <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-400 font-bold uppercase text-[10px] font-vietnam">Mã áp dụng:</span>
                                    <span className="font-black text-blue-900">{giftForm.code}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-400 font-bold uppercase text-[10px] font-vietnam">Ưu đãi:</span>
                                    <span className="font-black text-blue-900">{giftForm.discountPercent}% OFF</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-blue-400 font-bold uppercase text-[10px] font-vietnam">Loại:</span>
                                    <span className={`font-black uppercase text-[10px] ${giftForm.isPrivate ? 'text-purple-600' : 'text-blue-600'}`}>
                                        {giftForm.isPrivate ? 'Cá nhân (Gán danh sách)' : 'Bản sao riêng tư'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowGiftModal(false)} className="flex-1 px-8 py-5 bg-gray-100 rounded-3xl font-black text-gray-500 hover:bg-gray-200 transition-all font-vietnam">Hủy</button>
                                <button type="submit" disabled={gifting} className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-3xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 font-vietnam">
                                    {gifting ? 'Đang gán...' : 'Xác nhận Gửi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
