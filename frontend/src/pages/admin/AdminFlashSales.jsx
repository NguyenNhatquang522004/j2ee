import { useEffect, useState, useCallback } from 'react';
import { flashSaleService, productService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    PlusIcon, 
    TrashIcon, 
    BoltIcon,
    CalendarIcon,
    TagIcon,
    XMarkIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const EMPTY_FS = { name: '', startTime: '', endTime: '', description: '', items: [] };
const EMPTY_ITEM = { productId: '', flashSalePrice: '', quantityLimit: 0 };

export default function AdminFlashSales() {
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FS);
    const [saving, setSaving] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            // Backend currently only provides active/upcoming, but for admin let's assume we want a full list
            // For now, let's just get upcoming as a placeholder for "all management"
            const res = await flashSaleService.getAll();
            setFlashSales(res.data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
        productService.getAll({ page: 0, size: 1000 }).then(res => {
            setProducts(res.data.content || res.data || []);
        });
    }, [fetchAll]);

    const handleAddItem = () => {
        setForm({ ...form, items: [...form.items, { ...EMPTY_ITEM }] });
    };

    const handleRemoveItem = (idx) => {
        const newItems = [...form.items];
        newItems.splice(idx, 1);
        setForm({ ...form, items: newItems });
    };

    const updateItem = (idx, field, val) => {
        const newItems = [...form.items];
        newItems[idx][field] = val;
        setForm({ ...form, items: newItems });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Basic validation
            if (form.items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm');
            
            // Format for backend: ensure products are sent as objects with id if necessary, 
            // but our entity expected FlashSaleItem with product.id
            const payload = {
                ...form,
                items: form.items.map(it => ({
                    product: { id: it.productId },
                    flashSalePrice: it.flashSalePrice,
                    quantityLimit: it.quantityLimit
                }))
            };

            await flashSaleService.create(payload);
            toast.success('Đã tạo Flash Sale mới');
            setShowModal(false);
            setForm(EMPTY_FS);
            fetchAll();
        } catch (err) {
            toast.error(err.message || 'Lỗi khi lưu Flash Sale');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xoá Flash Sale này?')) return;
        try {
            await flashSaleService.delete(id);
            toast.success('Đã xoá');
            fetchAll();
        } catch {
            toast.error('Lỗi khi xoá');
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <BoltIcon className="w-8 h-8 text-yellow-500" />
                        Flash Sale
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">Quản lý các chương trình giảm giá chớp nhoáng.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-yellow-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-yellow-100 hover:bg-yellow-600 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" /> Tạo chương trình
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {flashSales.map(fs => (
                    <div key={fs.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <BoltIcon className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase tracking-tight">{fs.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">ID: #{fs.id}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(fs.id)}
                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Bắt đầu</span>
                                    <div className="flex items-center gap-2 text-gray-700 font-bold text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <CalendarIcon className="w-4 h-4 text-blue-500" />
                                        {new Date(fs.startTime).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Kết thúc</span>
                                    <div className="flex items-center gap-2 text-gray-700 font-bold text-xs bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <CalendarIcon className="w-4 h-4 text-red-500" />
                                        {new Date(fs.endTime).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Sản phẩm tham gia ({fs.items?.length})</span>
                                <div className="flex flex-wrap gap-2">
                                    {fs.items?.slice(0, 3).map(it => (
                                        <div key={it.id} className="bg-white border border-gray-100 px-3 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                                            <div className="w-6 h-6 bg-gray-50 rounded-lg overflow-hidden border border-gray-50">
                                                <img src={it.product?.imageUrl} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-600 line-clamp-1 max-w-[100px]">{it.product?.name}</span>
                                            <span className="text-[10px] font-black text-red-600">{it.flashSalePrice?.toLocaleString()}đ</span>
                                        </div>
                                    ))}
                                    {fs.items?.length > 3 && (
                                        <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-[10px] font-black text-gray-400">+{fs.items.length - 3}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {flashSales.length === 0 && !loading && (
                    <div className="lg:col-span-2 py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
                        <BoltIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Chưa có chương trình Flash Sale nào</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Tạo Flash Sale Mới</h2>
                                <p className="text-[11px] text-gray-500 font-medium leading-none mt-1">Lên kế hoạch và chọn sản phẩm giảm giá chớp nhoáng.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <XMarkIcon className="w-6 h-6 stroke-[3]" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Tên chương trình *</label>
                                    <input 
                                        required 
                                        placeholder="Vd: Săn deal cuối tuần"
                                        value={form.name} 
                                        onChange={(e) => setForm({...form, name: e.target.value})} 
                                        className="w-full px-6 py-3.5 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-yellow-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-yellow-500 text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Thời gian bắt đầu *</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={form.startTime} 
                                        onChange={(e) => setForm({...form, startTime: e.target.value})} 
                                        className="w-full px-6 py-3.5 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-yellow-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-yellow-500 text-sm" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Thời gian kết thúc *</label>
                                    <input 
                                        type="datetime-local" 
                                        required 
                                        value={form.endTime} 
                                        onChange={(e) => setForm({...form, endTime: e.target.value})} 
                                        className="w-full px-6 py-3.5 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-yellow-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-yellow-500 text-sm" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Danh sách sản phẩm ({form.items.length})</label>
                                    <button 
                                        type="button"
                                        onClick={handleAddItem}
                                        className="text-[10px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-3.4 h-3.5 stroke-[4]" /> Thêm dòng
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {form.items.map((it, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 flex items-center gap-4 animate-in slide-in-from-left-2 duration-300">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 text-[10px]">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <select 
                                                    value={it.productId} 
                                                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                                                    className="w-full bg-transparent font-bold text-gray-700 outline-none border-b-2 border-gray-100 focus:border-yellow-500 transition-all text-xs"
                                                >
                                                    <option value="">-- Chọn sản phẩm --</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price?.toLocaleString()}đ)</option>)}
                                                </select>
                                            </div>
                                            <div className="w-32">
                                                <input 
                                                    type="number"
                                                    placeholder="Giá Sale"
                                                    value={it.flashSalePrice}
                                                    onChange={(e) => updateItem(idx, 'flashSalePrice', e.target.value)}
                                                    className="w-full bg-transparent font-black text-red-600 outline-none border-b-2 border-gray-100 focus:border-yellow-500 transition-all text-xs text-center"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input 
                                                    type="number"
                                                    placeholder="Số lượng"
                                                    value={it.quantityLimit}
                                                    onChange={(e) => updateItem(idx, 'quantityLimit', e.target.value)}
                                                    className="w-full bg-transparent font-black text-gray-700 outline-none border-b-2 border-gray-100 focus:border-yellow-500 transition-all text-xs text-center"
                                                />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveItem(idx)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)} 
                                className="flex-1 px-8 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all text-sm"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                onClick={handleSave}
                                disabled={saving} 
                                className="flex-1 px-8 py-4 bg-yellow-500 text-white rounded-2xl font-black shadow-xl shadow-yellow-100 hover:bg-yellow-600 transition-all active:scale-95 disabled:opacity-50 text-sm"
                            >
                                {saving ? 'Đang tạo...' : 'Kích hoạt Flash Sale'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
