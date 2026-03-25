import { useEffect, useState, useCallback } from 'react';
import { productService, categoryService, farmService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const EMPTY = {
    name: '', description: '', price: '', unit: '', imageUrl: '',
    categoryId: '', farmId: '', stockQuantity: '', isActive: true,
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

    const fetchProducts = useCallback(async (p = 0, q = '') => {
        setLoading(true);
        try {
            const res = q
                ? await productService.search(q, { page: p, size: 10 })
                : await productService.getAll({ page: p, size: 10 });
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

    const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
                <button onClick={openCreate} className="btn-primary">+ Thêm sản phẩm</button>
            </div>

            <div className="mb-4">
                <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="input-field max-w-sm"
                />
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-gray-500">
                            <th className="pb-3 text-left">Sản phẩm</th>
                            <th className="pb-3 text-right">Giá</th>
                            <th className="pb-3 text-center">Tồn kho</th>
                            <th className="pb-3 text-center">Trạng thái</th>
                            <th className="pb-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-400">Đang tải...</td></tr>
                        ) : products.map((p) => (
                            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />}
                                        <div>
                                            <p className="font-medium text-gray-800">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.categoryName}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 text-right font-semibold">{fmt(p.price)}₫/{p.unit}</td>
                                <td className="py-3 text-center">{p.totalStock}</td>
                                <td className="py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {p.isActive ? 'Đang bán' : 'Ẩn'}
                                    </span>
                                </td>
                                <td className="py-3 text-center">
                                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline mr-3">Sửa</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i)}
                                className={`px-3 py-1 rounded text-sm ${page === i ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-bold">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (₫) *</label>
                                    <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                                    <input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, hộp, bó..." className="input-field" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                                    <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                                        <option value="">-- Chọn danh mục --</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trang trại *</label>
                                    <select required value={form.farmId} onChange={(e) => setForm({ ...form, farmId: e.target.value })} className="input-field">
                                        <option value="">-- Chọn trang trại --</option>
                                        {farms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                                <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input-field" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-green-600" />
                                <label htmlFor="isActive" className="text-sm text-gray-700">Đang bán</label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Huỷ</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Đang lưu...' : 'Lưu'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
