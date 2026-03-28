import { useEffect, useState, useCallback } from 'react';
import { farmService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    MapPinIcon,
    UserCircleIcon,
    ShieldCheckIcon,
    PhotoIcon,
    PhoneIcon,
    EnvelopeIcon,
    XMarkIcon,
    HomeModernIcon
} from '@heroicons/react/24/outline';

const CERTS = ['VIETGAP', 'GLOBALGAP', 'ORGANIC', 'HACCP'];

const EMPTY = {
    name: '', address: '', province: '', ownerName: '',
    contactPhone: '', contactEmail: '', description: '', imageUrl: '',
    certification: '', certificationCode: '',
};

export default function AdminFarms() {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');
    const [certFilter, setCertFilter] = useState('');

    const fetchFarms = useCallback(async () => {
        setLoading(true);
        try {
            // Simplified: Fetch all and filter client-side for this small subset
            const res = await farmService.getAll({ page: 0, size: 1000 });
            setFarms(res.data.content || res.data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFarms(); }, [fetchFarms]);

    const filteredFarms = farms.filter(f => {
        const matchesSearch = f.name?.toLowerCase().includes(search.toLowerCase()) || 
                             f.province?.toLowerCase().includes(search.toLowerCase());
        const matchesCert = certFilter === '' || f.certification === certFilter;
        return matchesSearch && matchesCert;
    });

    const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (f) => {
        setEditing(f);
        setForm({
            name: f.name || '',
            address: f.address || '',
            province: f.province || '',
            ownerName: f.ownerName || '',
            contactPhone: f.contactPhone || '',
            contactEmail: f.contactEmail || '',
            description: f.description || '',
            imageUrl: f.imageUrl || '',
            certification: f.certification || '',
            certificationCode: f.certificationCode || '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            editing ? await farmService.update(editing.id, form) : await farmService.create(form);
            toast.success(editing ? 'Đã cập nhật trang trại' : 'Đã thêm trang trại');
            setShowModal(false);
            fetchFarms();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xoá trang trại này?')) return;
        try {
            await farmService.delete(id);
            toast.success('Đã xoá trang trại');
            fetchFarms();
        } catch { toast.error('Không thể xoá'); }
    };

    const CERT_STYLES = {
        VIETGAP: 'bg-green-100 text-green-700 border-green-200',
        GLOBALGAP: 'bg-blue-100 text-blue-700 border-blue-200',
        ORGANIC: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        HACCP: 'bg-orange-100 text-orange-700 border-orange-200',
    };

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Trang trại</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Quản lý mạng lưới các đối tác cung ứng nông sản.</p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-5 py-3 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 text-sm"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Thêm trang trại</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1 group">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên hoặc tỉnh thành..."
                        className="w-full pl-5 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-sm"
                    />
                </div>
                <select 
                    value={certFilter}
                    onChange={(e) => setCertFilter(e.target.value)}
                    className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-xs"
                >
                    <option value="">Tất cả chứng nhận</option>
                    {CERTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Trang trại & Vị trí</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Chủ sở hữu</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Chứng nhận</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Sản phẩm</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredFarms.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Chưa có dữ liệu trang trại</td></tr>
                            ) : filteredFarms.map((f) => (
                                <tr key={f.id} className="group hover:bg-green-50/30 transition-colors">
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                {f.imageUrl ? (
                                                    <img src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <HomeModernIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 group-hover:text-green-600 transition-colors leading-tight text-sm">{f.name}</p>
                                                <p className="flex items-center gap-1 text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                                                    <MapPinIcon className="w-5 h-5" /> {f.province}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <p className="text-sm font-bold text-gray-700 leading-none">{f.ownerName}</p>
                                        <p className="text-[9px] text-gray-400 italic font-medium mt-1">{f.contactPhone || 'N/A'}</p>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        {f.certification ? (
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider border ${CERT_STYLES[f.certification] || 'bg-gray-100 text-gray-600'}`}>
                                                {f.certification}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-gray-300 italic font-black">CHƯA CÓ</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5 text-center font-black text-gray-900 text-sm">
                                        {f.productCount}
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(f)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(f.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"><TrashIcon className="w-5 h-5" /></button>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{editing ? 'Chỉnh sửa trang trại' : 'Thêm trang trại'}</h2>
                                <p className="text-[11px] text-gray-500 font-medium leading-none">Nhập thông tin chi tiết và chứng nhận liên quan.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tên trang trại *</label>
                                    <input required value={form.name} onChange={set('name')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tỉnh/Thành *</label>
                                    <input required value={form.province} onChange={set('province')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Chủ sở hữu</label>
                                    <input value={form.ownerName} onChange={set('ownerName')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Điện thoại</label>
                                    <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email</label>
                                    <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Chứng nhận</label>
                                    <select value={form.certification} onChange={set('certification')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm">
                                        <option value="">-- Không có --</option>
                                        {CERTS.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mã chứng nhận</label>
                                    <input value={form.certificationCode} onChange={set('certificationCode')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">URL hình ảnh</label>
                                    <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Mô tả</label>
                                    <textarea rows={2} value={form.description} onChange={set('description')} className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 resize-none text-sm" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-all text-sm">Hủy</button>
                                <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 text-sm">
                                    {saving ? '...' : 'Lưu trang trại'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

