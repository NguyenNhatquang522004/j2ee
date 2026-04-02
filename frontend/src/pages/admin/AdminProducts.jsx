import { useEffect, useState, useCallback } from 'react';
import { productService, categoryService, farmService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ModalContext';
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
    XMarkIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import AdminMediaLibrary from './AdminMediaLibrary';

const EMPTY = {
    name: '', description: '', price: '', unit: '', imageUrl: '',
    categoryId: '', farmId: '', stockQuantity: '', isActive: true,
    isNew: true, originalPrice: ''
};

export default function AdminProducts() {
    const { confirm } = useConfirm();
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
    const [categoryId, setCategoryId] = useState('');
    const [farmId, setFarmId] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [direction, setDirection] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false);

    const fetchProducts = useCallback(async (p = 0, q = '', catId = '', fId = '', minP = '', maxP = '', sort = 'id', dir = 'desc', active = '') => {
        setLoading(true);
        try {
            const params = { 
                page: p, 
                size: 10,
                sortBy: sort,
                direction: dir
            };
            if (catId) params.categoryId = catId;
            if (fId) params.farmId = fId;
            if (minP) params.minPrice = minP;
            if (maxP) params.maxPrice = maxP;
            if (active !== '') params.isActive = active === 'true';

            const res = await productService.search(q, params);
            setProducts(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(page, search, categoryId, farmId, minPrice, maxPrice, sortBy, direction, statusFilter);
    }, [page, search, categoryId, farmId, minPrice, maxPrice, sortBy, direction, statusFilter, fetchProducts]);

    useEffect(() => {
        Promise.all([
            categoryService.getAll({ page: 0, size: 100 }),
            farmService.getAll({ page: 0, size: 100 }),
        ]).then(([catRes, farmRes]) => {
            setCategories(catRes.data.content || catRes.data || []);
            setFarms(farmRes.data.content || farmRes.data || []);
        });
    }, []);

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setFarmId('');
        setMinPrice('');
        setMaxPrice('');
        setStatusFilter('');
        setSortBy('id');
        setDirection('desc');
        setPage(0);
    };

    const openCreate = () => { setIsViewOnly(false); setEditing(null); setForm(EMPTY); setShowModal(true); };
    const openEdit = (p) => {
        setIsViewOnly(false);
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

    const openView = (p) => {
        setIsViewOnly(true);
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
                name: form.name.trim(),
                description: form.description,
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
                unit: form.unit,
                imageUrl: form.imageUrl,
                categoryId: form.categoryId ? Number(form.categoryId) : null,
                farmId: form.farmId ? Number(form.farmId) : null,
                isActive: form.isActive,
                isNew: form.isNew
            };

            if (editing) {
                await productService.update(editing.id, payload);
                toast.success('Đã cập nhật sản phẩm');
            } else {
                await productService.create(payload);
                toast.success('Đã thêm sản phẩm');
            }
            setShowModal(false);
            fetchProducts(page, search, categoryId, farmId, minPrice, maxPrice, sortBy, direction, statusFilter);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Xoá sản phẩm',
            message: 'Bạn có chắc chắn muốn xoá vĩnh viễn sản phẩm này khỏi hệ thống? Dữ liệu đơn hàng có liên quan sẽ không bị ảnh hưởng.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await productService.delete(id);
            toast.success('Đã xoá sản phẩm');
            fetchProducts(page, search, categoryId, farmId, minPrice, maxPrice, sortBy, direction, statusFilter);
        } catch {
            toast.error('Không thể xoá');
        }
    };

    const handleToggle = async (id) => {
        try {
            await productService.toggleStatus(id);
            toast.success('Đã cập nhật trạng thái');
            fetchProducts(page, search, categoryId, farmId, minPrice, maxPrice, sortBy, direction, statusFilter);
        } catch {
            toast.error('Không thể cập nhật');
        }
    };

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-tight">Sản phẩm</h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium tracking-tight">Quản lý kho hàng và danh mục của bạn.</p>
                </div>
                <button 
                    onClick={openCreate} 
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-black px-5 py-3 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95 text-sm"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Thêm sản phẩm</span>
                </button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            placeholder="Tìm kiếm sản phẩm theo tên..."
                            className="w-full pl-10 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-sm"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-2">
                    <select 
                        value={categoryId}
                        onChange={(e) => { setCategoryId(e.target.value); setPage(0); }}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                    >
                        <option value="">DM: Tất cả</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select 
                        value={farmId}
                        onChange={(e) => { setFarmId(e.target.value); setPage(0); }}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                    >
                        <option value="">Trang trại: All</option>
                        {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>

                    <select 
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                    >
                        <option value="">Status: All</option>
                        <option value="true">Đang bán</option>
                        <option value="false">Đã ẩn</option>
                    </select>

                    <div className="flex gap-1 items-center bg-white border border-gray-100 rounded-xl px-2">
                        <span className="text-[10px] font-black text-gray-400">₫</span>
                        <input 
                            type="number"
                            placeholder="Min"
                            value={minPrice}
                            onChange={(e) => { setMinPrice(e.target.value); setPage(0); }}
                            className="w-full outline-none text-[10px] font-bold"
                        />
                    </div>

                    <div className="flex gap-1 items-center bg-white border border-gray-100 rounded-xl px-2">
                        <span className="text-[10px] font-black text-gray-400">₫</span>
                        <input 
                            type="number"
                            placeholder="Max"
                            value={maxPrice}
                            onChange={(e) => { setMaxPrice(e.target.value); setPage(0); }}
                            className="w-full outline-none text-[10px] font-bold"
                        />
                    </div>

                    <select 
                        value={`${sortBy}-${direction}`}
                        onChange={(e) => {
                            const [sort, dir] = e.target.value.split('-');
                            setSortBy(sort);
                            setDirection(dir);
                            setPage(0);
                        }}
                        className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                    >
                        <option value="id-desc">Mới nhất</option>
                        <option value="price-asc">Giá: ↑</option>
                        <option value="price-desc">Giá: ↓</option>
                        <option value="stockQuantity-desc">Kho: ↓</option>
                        <option value="stockQuantity-asc">Kho: ↑</option>
                        <option value="name-asc">Tên: A-Z</option>
                    </select>

                    <button 
                        onClick={resetFilters}
                        className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:bg-gray-100 transition-all"
                    >
                        Xóa lọc
                    </button>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-5 py-3 text-[10px] font-black text-gray-600 uppercase tracking-wider">Sản phẩm</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-600 uppercase tracking-wider">Giá & Đơn vị</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Tồn kho</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
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
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <PhotoIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 group-hover:text-green-600 transition-colors leading-tight text-sm capitalize">{p.name}</p>
                                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">{p.categoryName}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <p className="font-black text-green-700 text-sm leading-none">{fmt(p.price)}₫</p>
                                            {p.originalPrice > p.price && (
                                                <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-lg font-black">
                                                    -{Math.round((p.originalPrice - p.price) / p.originalPrice * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        {p.originalPrice > p.price && (
                                            <p className="text-[9px] text-gray-300 line-through mt-0.5">{fmt(p.originalPrice)}₫</p>
                                        )}
                                        <p className="text-[9px] text-gray-600 font-bold mt-0.5 uppercase italic leading-none">mỗi {p.unit}</p>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black border ${
                                            p.totalStock > 20 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                            {p.totalStock}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                            p.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                                        }`}>
                                            {p.isActive ? 'Đang bán' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button 
                                                onClick={() => openView(p)} 
                                                className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                title="Xem chi tiết"
                                            >
                                                <InformationCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggle(p.id)} 
                                                className={`p-1 rounded-lg transition-all ${p.isActive ? 'text-gray-400 hover:bg-gray-50' : 'text-green-600 hover:bg-green-50'}`}
                                                title={p.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                                            >
                                                {p.isActive ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                onClick={() => openEdit(p)} 
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Sửa sản phẩm"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id)} 
                                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPage(i)}
                                    className={`w-9 h-9 rounded-lg text-sm font-black transition-all ${
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">{isViewOnly ? 'Chi tiết sản phẩm' : editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                                <p className="text-[11px] text-gray-500 font-medium">{isViewOnly ? 'Thông tin đầy đủ về sản phẩm của bạn.' : 'Cập nhật đầy đủ thông tin để thu hút khách hàng.'}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-5 h-5 stroke-[3]" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <TagIcon className="w-5 h-5" /> Tên sản phẩm
                                    </label>
                                    <input 
                                        required 
                                        value={form.name} 
                                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                        placeholder="Ví dụ: Táo hữu cơ, Rau muống..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <CurrencyDollarIcon className="w-5 h-5" /> Giá khuyến mãi (₫)
                                    </label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        value={form.price} 
                                        onChange={(e) => setForm({ ...form, price: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <CurrencyDollarIcon className="w-5 h-5" /> Giá gốc (nếu có giảm giá)
                                    </label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        value={form.originalPrice} 
                                        onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                        placeholder="Để trống nếu không giảm giá"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <ArchiveBoxIcon className="w-5 h-5" /> Đơn vị tính
                                    </label>
                                    <input 
                                        required 
                                        value={form.unit} 
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })} 
                                        disabled={isViewOnly}
                                        placeholder="kg, hộp, bó..." 
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <TagIcon className="w-5 h-5" /> Danh mục
                                    </label>
                                    <select 
                                        required 
                                        value={form.categoryId} 
                                        onChange={(e) => setForm({ ...form, categoryId: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <HomeModernIcon className="w-5 h-5" /> Trang trại
                                    </label>
                                    <select 
                                        required 
                                        value={form.farmId} 
                                        onChange={(e) => setForm({ ...form, farmId: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                    >
                                        <option value="">-- Chọn trang trại --</option>
                                        {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        <PhotoIcon className="w-5 h-5" /> Hình ảnh sản phẩm
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <input 
                                                value={form.imageUrl} 
                                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                                                disabled={isViewOnly}
                                                className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-black text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 text-sm disabled:opacity-75"
                                                placeholder="Chọn từ thư viện hoặc dán URL..." 
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setShowMediaLibrary(true)}
                                            disabled={isViewOnly}
                                            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl transition-all text-sm disabled:hidden"
                                        >
                                            Thư viện
                                        </button>
                                    </div>
                                    {form.imageUrl && (
                                        <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border">
                                            <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">
                                        Mô tả chi tiết
                                    </label>
                                    <textarea 
                                        rows={3} 
                                        value={form.description} 
                                        onChange={(e) => setForm({ ...form, description: e.target.value })} 
                                        disabled={isViewOnly}
                                        className="w-full px-5 py-3 bg-gray-50 border-none rounded-xl font-medium text-gray-900 focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 resize-none text-sm disabled:opacity-75" 
                                        placeholder="Nhập mô tả sản phẩm của bạn tại đây..."
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100">
                                    <input 
                                        type="checkbox" 
                                        id="isActive" 
                                        checked={form.isActive} 
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
                                        disabled={isViewOnly}
                                        className="w-5 h-5 rounded-lg text-green-600 focus:ring-green-500 border-none disabled:opacity-50" 
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-green-800">Hiển thị trên cửa hàng</label>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <input 
                                        type="checkbox" 
                                        id="isNew" 
                                        checked={form.isNew} 
                                        onChange={(e) => setForm({ ...form, isNew: e.target.checked })} 
                                        disabled={isViewOnly}
                                        className="w-5 h-5 rounded-lg text-blue-600 focus:ring-blue-500 border-none disabled:opacity-50" 
                                    />
                                    <label htmlFor="isNew" className="text-sm font-bold text-blue-800">Sản phẩm mới (Gắn nhãn New)</label>
                                </div>
                            </div>
                        </form>

                        <div className="p-5 border-t border-gray-50 flex gap-4 bg-gray-50/30">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)} 
                                className="flex-1 px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-all text-sm"
                            >
                                {isViewOnly ? 'Đóng' : 'Hủy bỏ'}
                            </button>
                            {!isViewOnly && (
                                <button 
                                    type="submit" 
                                    onClick={handleSave}
                                    disabled={saving} 
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 text-sm"
                                >
                                    {saving ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang lưu...</span>
                                        </div>
                                    ) : 'Lưu sản phẩm'}
                                </button>
                            )}
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

