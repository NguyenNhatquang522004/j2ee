import { useEffect, useState, useCallback } from 'react';
import { farmService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

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

  const fetchFarms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await farmService.getAll({ page: 0, size: 100 });
      setFarms(res.data.content || res.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFarms(); }, [fetchFarms]);

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

  const CERT_COLORS = {
    VIETGAP: 'bg-green-100 text-green-800',
    GLOBALGAP: 'bg-blue-100 text-blue-800',
    ORGANIC: 'bg-emerald-100 text-emerald-800',
    HACCP: 'bg-orange-100 text-orange-800',
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý trang trại</h1>
        <button onClick={openCreate} className="btn-primary">+ Thêm trang trại</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-3 text-left">Trang trại</th>
              <th className="pb-3 text-left">Tỉnh/Thành</th>
              <th className="pb-3 text-left">Chủ trang trại</th>
              <th className="pb-3 text-center">Chứng nhận</th>
              <th className="pb-3 text-center">Sản phẩm</th>
              <th className="pb-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Đang tải...</td></tr>
            ) : farms.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">Chưa có trang trại</td></tr>
            ) : farms.map((f) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-800">{f.name}</td>
                <td className="py-3 text-gray-600">{f.province}</td>
                <td className="py-3 text-gray-600">{f.ownerName}</td>
                <td className="py-3 text-center">
                  {f.certification && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CERT_COLORS[f.certification] || 'bg-gray-100 text-gray-600'}`}>
                      {f.certification}
                    </span>
                  )}
                </td>
                <td className="py-3 text-center">{f.productCount}</td>
                <td className="py-3 text-center">
                  <button onClick={() => openEdit(f)} className="text-blue-600 hover:underline mr-3">Sửa</button>
                  <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:underline">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">{editing ? 'Sửa trang trại' : 'Thêm trang trại'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên trang trại *</label>
                <input required value={form.name} onChange={set('name')} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành *</label>
                  <input required value={form.province} onChange={set('province')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chủ trang trại</label>
                  <input value={form.ownerName} onChange={set('ownerName')} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input value={form.address} onChange={set('address')} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                  <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.contactEmail} onChange={set('contactEmail')} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chứng nhận</label>
                  <select value={form.certification} onChange={set('certification')} className="input-field">
                    <option value="">-- Không có --</option>
                    {CERTS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã chứng nhận</label>
                  <input value={form.certificationCode} onChange={set('certificationCode')} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL hình ảnh</label>
                <input value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea rows={2} value={form.description} onChange={set('description')} className="input-field resize-none" />
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
