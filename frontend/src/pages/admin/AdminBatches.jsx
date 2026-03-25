import { useEffect, useState, useCallback } from 'react';
import { batchService, productService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const EMPTY = { productId: '', quantity: '', productionDate: '', expiryDate: '', note: '' };

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
        ? await batchService.nearExpiry({ page: 0, size: 50 })
        : await batchService.getAll({ page: 0, size: 50 });
      setBatches(res.data.content || res.data || []);
    } finally {
      setLoading(false);
    }
  }, [nearExpiry]);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  useEffect(() => {
    productService.getAll({ page: 0, size: 200 }).then((res) =>
      setProducts(res.data.content || [])
    );
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      productId: b.productId ?? '',
      quantity: b.quantity ?? '',
      productionDate: b.productionDate ? b.productionDate.substring(0, 10) : '',
      expiryDate: b.expiryDate ? b.expiryDate.substring(0, 10) : '',
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
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý lô hàng</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setNearExpiry((v) => !v)}
            className={nearExpiry ? 'btn-danger' : 'btn-secondary'}
          >
            {nearExpiry ? '⚠ Sắp hết hạn' : 'Tất cả lô hàng'}
          </button>
          <button onClick={openCreate} className="btn-primary">+ Thêm lô</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-3 text-left">Sản phẩm</th>
              <th className="pb-3 text-right">Số lượng</th>
              <th className="pb-3 text-center">Ngày sản xuất</th>
              <th className="pb-3 text-center">Hạn sử dụng</th>
              <th className="pb-3 text-center">Còn lại</th>
              <th className="pb-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Không có dữ liệu</td></tr>
            ) : batches.map((b) => (
              <tr key={b.id} className={`border-b last:border-0 hover:bg-gray-50 ${b.daysUntilExpiry != null && b.daysUntilExpiry <= 7 ? 'bg-red-50' : ''}`}>
                <td className="py-3 font-medium text-gray-800">{b.productName}</td>
                <td className="py-3 text-right">{fmt(b.quantity)}</td>
                <td className="py-3 text-center">{b.productionDate?.substring(0, 10)}</td>
                <td className="py-3 text-center">{b.expiryDate?.substring(0, 10)}</td>
                <td className="py-3 text-center">
                  {b.daysUntilExpiry != null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.daysUntilExpiry <= 3 ? 'bg-red-100 text-red-700' : b.daysUntilExpiry <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {b.daysUntilExpiry} ngày
                    </span>
                  )}
                </td>
                <td className="py-3 text-center">
                  <button onClick={() => openEdit(b)} className="text-blue-600 hover:underline mr-3">Sửa</button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Sửa lô hàng' : 'Thêm lô hàng'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm *</label>
                <select required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="input-field">
                  <option value="">-- Chọn sản phẩm --</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng *</label>
                <input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sản xuất *</label>
                  <input required type="date" value={form.productionDate} onChange={(e) => setForm({ ...form, productionDate: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn sử dụng *</label>
                  <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="input-field resize-none" />
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
