import { useEffect, useState, useCallback } from 'react';
import { productService, categoryService, farmService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    PhotoIcon,
    CurrencyDollarIcon,
    ArchiveBoxIcon,
    TagIcon,
    HomeModernIcon,
    EyeIcon,
    EyeSlashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import AdminMediaLibrary from './AdminMediaLibrary';

const EMPTY = {
    name: '', description: '', price: '', unit: '', imageUrl: '',
    categoryId: '', farmId: '', stockQuantity: '', isActive: true,
    isNew: true, originalPrice: ''
};

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

    const fetchProducts = useCallback(async (p = 0, q = '') => {
        setLoading(true);
        try {
            const res = await productService.search(q, { page: p, size: 10 });
            setProducts(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(page, search);
    }, [page, search, fetchProducts]);

    useEffect(() => {
        Promise.all([
            categoryService.getAll({ page: 0, size: 100 }),
            farmService.getAll({ page: 0, size: 100 }),
        ]).then(([catRes, farmRes]) => {
            setCategories(catRes.data.content || catRes.data || []);
            setFarms(farmRes.data.content || farmRes.data || []);
        });
    }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (p) => {
        setEditing(p);
        setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price ?? '',
            unit: p.unit || '',
            imageUrl: p.imageUrl || '',
            categoryId: p.categoryId ?? '',
            farmId: p.farmId ?? '',
            stockQuantity: p.stockQuantity ?? '',
            isActive: p.isActive ?? true,
            isNew: p.isNew ?? true,
            originalPrice: p.originalPrice ?? '',
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
                categoryId: Number(form.categoryId),
                farmId: Number(form.farmId),
                stockQuantity: Number(form.stockQuantity),
            };
            if (editing) {
                await productService.update(editing.id, payload);
                toast.success('Đã cập nhật sản phẩm');
            } else {
                await productService.create(payload);
                toast.success('Đã thêm sản phẩm');
            }
            setShowModal(false);
            fetchProducts(page, search);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xoá sản phẩm này?')) return;
        try {
            await productService.delete(id);
            toast.success('Đã xoá sản phẩm');
            fetchProducts(page, search);
        } catch {
            toast.error('Không thể xoá');
        }
    };

    const handleToggle = async (id) => {
        try {
            await productService.toggleStatus(id);
            toast.success('Đã cập nhật trạng thái');
            fetchProducts(page, search);
        } catch {
            toast.error('Không thể cập nhật');
        }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sản phẩm</h1>
                    <p className="text-gray-500 font-medium">Quản lý kho hàng và danh mục sản phẩm của bạn.</p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Thêm sản phẩm</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="bg-white border border-gray-100 rounded-2xl px-4 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10">
                        <option>Tất cả danh mục</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Sản phẩm</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Giá & Đơn vị</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Tồn kho</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-5"><div className="h-12 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.map((p) => (
                                <tr key={p.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <PhotoIcon className="w-6 h-6" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 group-hover:text-green-600 transition-colors leading-tight">{p.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{p.categoryName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-green-700 text-lg leading-none">{fmt(p.price)}₫</p>
                                            {p.originalPrice > p.price && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-lg font-black">
                                                    -{Math.round((p.originalPrice - p.price) / p.originalPrice * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        {p.originalPrice > p.price && (
                                            <p className="text-xs text-gray-300 line-through mt-1">{fmt(p.originalPrice)}₫</p>
                                        )}
                                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase italic">mỗi {p.unit}</p>
                                        {p.isNew && <span className="inline-block mt-2 bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Mới</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-black border ${
                                            p.totalStock > 20 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {p.totalStock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                            p.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleToggle(p.id)} 
                                                className={`p-2 rounded-xl transition-all ${p.isActive ? 'text-gray-400 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={p.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                            >
                                                {p.isActive ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                onClick={() => openEdit(p)} 
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Sửa sản phẩm"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)} 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Xóa sản phẩm"
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

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                        <p className="text-sm font-bold text-gray-500">Trang {page + 1} / {totalPages}</p>
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPage(i)}
                                    className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                                        page === i 
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
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

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                                <p className="text-sm text-gray-500 font-medium">Cập nhật đầy đủ thông tin để thu hút khách hàng.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4 md:col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <TagIcon className="w-4 h-4" /> Tên sản phẩm
                                    </label>
                                    <input 
                                        required 
                                        value={form.name} 
                                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                        placeholder="Ví dụ: Táo hữu cơ, Rau muống..."
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <CurrencyDollarIcon className="w-4 h-4" /> Giá khuyến mãi (₫)
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        value={form.price} 
                                        onChange={(e) => setForm({ ...form, price: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <CurrencyDollarIcon className="w-4 h-4" /> Giá gốc (nếu có giảm giá)
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        value={form.originalPrice} 
                                        onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                        placeholder="Để trống nếu không giảm giá"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <ArchiveBoxIcon className="w-4 h-4" /> Đơn vị tính
                                    </label>
                                    <input 
                                        required 
                                        value={form.unit} 
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                                        placeholder="kg, hộp, bó..." 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <TagIcon className="w-4 h-4" /> Danh mục
                                    </label>
                                    <select 
                                        required 
                                        value={form.categoryId} 
                                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <HomeModernIcon className="w-4 h-4" /> Trang trại
                                    </label>
                                    <select 
                                        required 
                                        value={form.farmId} 
                                        onChange={(e) => setForm({ ...form, farmId: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                    >
                                        <option value="">-- Chọn trang trại --</option>
                                        {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <PhotoIcon className="w-4 h-4" /> Hình ảnh sản phẩm
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input 
                                                value={form.imageUrl} 
                                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500"
                                                placeholder="Chọn từ thư viện hoặc dán URL..." 
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowMediaLibrary(true)}
                                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-2xl transition-all"
                                        >
                                            Thư viện
                                        </button>
                                    </div>
                                    {form.imageUrl && (
                                        <div className="mt-4 w-32 h-32 rounded-2xl overflow-hidden border">
                                            <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 md:col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
                                        Mô tả chi tiết
                                    </label>
                                    <textarea 
                                        rows={4} 
                                        value={form.description} 
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 resize-none" 
                                        placeholder="Nhập mô tả sản phẩm của bạn tại đây..."
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                    <input 
                                        type="checkbox" 
                                        id="isActive" 
                                        checked={form.isActive} 
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
                                        className="w-6 h-6 rounded-lg text-green-600 focus:ring-green-500 border-none" 
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-green-800">Hiển thị trên cửa hàng</label>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                    <input 
                                        type="checkbox" 
                                        id="isNew" 
                                        checked={form.isNew} 
                                        onChange={(e) => setForm({ ...form, isNew: e.target.checked })} 
                                        className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 border-none" 
                                    />
                                    <label htmlFor="isNew" className="text-sm font-bold text-blue-800">Sản phẩm mới (Gắn nhãn New)</label>
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)} 
                                className="flex-1 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleSave}
                                disabled={saving} 
                                className="flex-1 px-8 py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang lưu...</span>
                                    </div>
                                ) : 'Lưu sản phẩm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMediaLibrary && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col">
                        <AdminMediaLibrary 
                            isModal 
                            onClose={() => setShowMediaLibrary(false)} 
                            onSelect={(m) => {
                                setForm({ ...form, imageUrl: m.url });
                                setShowMediaLibrary(false);
                                toast.success('Đã chọn ảnh');
                            }} 
                        />
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

