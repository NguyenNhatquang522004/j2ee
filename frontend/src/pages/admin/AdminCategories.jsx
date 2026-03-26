import { useEffect, useState, useCallback } from 'react';
import { categoryService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    PhotoIcon,
    TagIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

const EMPTY = { name: '', description: '', imageUrl: '', isActive: true };

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await categoryService.getAllAdmin();
            setCategories(res.data.content || res.data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (c) => {
        setEditing(c);
        setForm({
            name: c.name || '',
            description: c.description || '',
            imageUrl: c.imageUrl || '',
            isActive: c.isActive ?? true
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await categoryService.update(editing.id, form);
                toast.success('Đã cập nhật danh mục');
            } else {
                await categoryService.create(form);
                toast.success('Đã thêm danh mục');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xoá danh mục này? Các sản phẩm thuộc danh mục này sẽ bị mồ côi (không còn danh mục) nhưng không bị xoá. Bạn chắc chắn chứ?')) return;
        try {
            await categoryService.delete(id);
            toast.success('Đã xoá danh mục');
            fetchCategories();
        } catch {
            toast.error('Không thể xoá');
        }
    };

    const handleToggle = async (id) => {
        try {
            await categoryService.toggleStatus(id);
            toast.success('Đã cập nhật trạng thái');
            fetchCategories();
        } catch {
            toast.error('Không thể cập nhật');
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Danh mục</h1>
                    <p className="text-gray-500 font-medium">Phân loại sản phẩm của cửa hàng.</p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Thêm danh mục</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider pl-8">Danh mục</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Số sản phẩm</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center pr-8">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8"><div className="h-12 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest">Chưa có danh mục nào</td>
                                </tr>
                            ) : categories.map((c) => (
                                <tr key={c.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm group-hover:scale-105 transition-all">
                                                {c.imageUrl ? (
                                                    <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <TagIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight">{c.name}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-1 line-clamp-1">{c.description || 'Không có mô tả'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-black bg-blue-50 text-blue-700 border border-blue-100">
                                            {c.productCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                            c.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {c.isActive ? 'Hoạt động' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center pr-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleToggle(c.id)} 
                                                className={`p-2 rounded-xl transition-all ${c.isActive ? 'text-gray-400 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={c.isActive ? 'Ẩn danh mục' : 'Hiện danh mục'}
                                            >
                                                {c.isActive ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                onClick={() => openEdit(c)} 
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
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
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                                <p className="text-sm text-gray-500 font-medium font-vietnam">Thông tin phân loại sản phẩm.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                    <TagIcon className="w-4 h-4" /> Tên danh mục
                                </label>
                                <input 
                                    required 
                                    value={form.name} 
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 transition-all outline-none border border-transparent focus:border-green-500"
                                    placeholder="Ví dụ: Rau sạch, Trái cây tươi..."
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                    <PhotoIcon className="w-4 h-4" /> URL hình ảnh
                                </label>
                                <input 
                                    value={form.imageUrl} 
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 transition-all outline-none border border-transparent focus:border-green-500"
                                    placeholder="https://..." 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1 font-vietnam">
                                    Mô tả
                                </label>
                                <textarea 
                                    rows={3} 
                                    value={form.description} 
                                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-green-500/10 transition-all outline-none border border-transparent focus:border-green-500 resize-none font-vietnam" 
                                    placeholder="Mô tả ngắn về danh mục..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                <input 
                                    type="checkbox" 
                                    id="isActiveCat" 
                                    checked={form.isActive} 
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
                                    className="w-6 h-6 rounded-lg text-green-600 focus:ring-green-500 border-none" 
                                />
                                <label htmlFor="isActiveCat" className="text-sm font-bold text-green-800 font-vietnam">Cho phép hiển thị danh mục này</label>
                            </div>

                            <div className="flex gap-4 pt-4">
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
                                    className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 font-vietnam"
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
