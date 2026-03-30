import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { useConfirm } from '../../context/ModalContext';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    XMarkIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const ALL_PERMISSIONS = [
    { key: 'view:products', name: 'Xem sản phẩm', group: 'Sản phẩm' },
    { key: 'manage:products', name: 'Quản lý sản phẩm', group: 'Sản phẩm' },
    { key: 'view:categories', name: 'Xem danh mục', group: 'Danh mục' },
    { key: 'manage:categories', name: 'Quản lý danh mục', group: 'Danh mục' },
    { key: 'view:batches', name: 'Xem lô hàng', group: 'Lô hàng' },
    { key: 'manage:batches', name: 'Quản lý lô hàng', group: 'Lô hàng' },
    { key: 'view:farms', name: 'Xem trang trại', group: 'Trang trại' },
    { key: 'manage:farms', name: 'Quản lý trang trại', group: 'Trang trại' },
    { key: 'manage:orders', name: 'Quản lý đơn hàng', group: 'Bán hàng' },
    { key: 'manage:refunds', name: 'Quản lý hoàn trả', group: 'Bán hàng' },
    { key: 'manage:users', name: 'Quản lý người dùng', group: 'Hệ thống' },
    { key: 'manage:reviews', name: 'Quản lý đánh giá', group: 'Hệ thống' },
    { key: 'view:reports', name: 'Xem báo cáo', group: 'Báo cáo' },
    { key: 'manage:newsletters', name: 'Quản lý bản tin', group: 'Bản tin' },
];

const ROLES = [
    { value: 'ROLE_ADMIN', name: 'Quản trị viên' },
    { value: 'ROLE_STAFF', name: 'Nhân viên' }
];

export default function AdminStaff() {
    const { confirm } = useConfirm();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'ROLE_STAFF',
        customPermissions: [],
        isActive: true
    });

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/users/staff');
            setStaff(res.data.content || []);
        } catch (error) {
            console.error('Fetch staff error:', error);
            toast.error(error.response?.data?.message || 'Không thể tải danh sách nhân sự: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            fullName: '',
            role: 'ROLE_STAFF',
            customPermissions: [],
            isActive: true
        });
        setSelectedUser(null);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName || '',
            role: user.role,
            customPermissions: user.permissions || [],
            isActive: user.isActive
        });
        setIsEditModalOpen(true);
    };

    const handleTogglePermission = (perm) => {
        setFormData(prev => {
            const current = [...prev.customPermissions];
            if (current.includes(perm)) {
                return { ...prev, customPermissions: current.filter(p => p !== perm) };
            } else {
                return { ...prev, customPermissions: [...current, perm] };
            }
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/users/staff/create?role=' + formData.role, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName
            });
            toast.success('Thêm nhân sự mới thành công');
            setIsAddModalOpen(false);
            fetchStaff();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thêm thất bại');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/users/${selectedUser.id}/admin`, {
                fullName: formData.fullName,
                role: formData.role,
                customPermissions: formData.customPermissions,
                isActive: formData.isActive
            });
            toast.success('Cập nhật nhân sự thành công');
            setIsEditModalOpen(false);
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleDelete = async (user) => {
        const ok = await confirm({
            title: 'Xoá nhân sự',
            message: `Bạn có chắc muốn xoá nhân sự ${user.fullName}? Hành động này không thể hoàn tác.`,
            type: 'danger'
        });
        if (!ok) return;

        try {
            await axios.delete(`/users/${user.id}`);
            toast.success('Đã xoá nhân sự');
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể xoá nhân sự');
        }
    };

    const filteredStaff = staff.filter(u => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;
        return (u.fullName || '').toLowerCase().includes(search) ||
               (u.username || '').toLowerCase().includes(search) ||
               (u.email || '').toLowerCase().includes(search);
    });

    return (
        <AdminLayout>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight italic uppercase leading-tight">Nhân sự</h1>
                    <p className="mt-0.5 text-xs sm:text-sm text-gray-500 font-medium">Điều hành và phân quyền cho đội ngũ của bạn.</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 font-black text-sm active:scale-95"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3]" />
                    <span>Thêm nhân sự</span>
                </button>
            </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-white/50 backdrop-blur-sm">
                        <div className="relative flex-1 max-w-md group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm theo tên, username, email..."
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={fetchStaff}
                            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Thành viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Quyền hạn</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium">Không tìm thấy nhân sự phù hợp</td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-green-600 overflow-hidden shadow-inner border border-green-200/50">
                                                        {user.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShieldCheckIcon className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors">{user.fullName}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                                                    user.role === 'ROLE_ADMIN' 
                                                    ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' 
                                                    : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100'
                                                }`}>
                                                    {user.role === 'ROLE_ADMIN' ? 'QUẢN TRỊ' : 'NHÂN VIÊN'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.permissions?.slice(0, 3).map(p => (
                                                        <span key={p} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isActive ? (
                                                    <span className="flex items-center gap-1.5 text-green-500 font-bold text-[10px]">
                                                        <CheckCircleIcon className="w-5 h-5" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-red-500 font-bold text-[10px]">
                                                        <XCircleIcon className="w-5 h-5" /> Locked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(user)}
                                                        className="p-2 text-gray-400 hover:text-red-50 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Xoá"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                        <form onSubmit={handleAddSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Thêm Nhân Sự Mới</h2>
                                    <p className="text-gray-500 font-medium">Đăng ký tài khoản cho thành viên mới của đội ngũ</p>
                                </div>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tên đăng nhập</label>
                                        <input 
                                            type="text"
                                            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            required
                                            placeholder="ví dụ: nva_staff"
                                        />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                        <input 
                                            type="email"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                            placeholder="email@freshfood.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                                        <input 
                                            type="password"
                                            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Tên đầy đủ</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Vai trò chính</label>
                                    <select 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none appearance-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-100 transition-all active:scale-95"
                                >
                                    Tạo tài khoản
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Cấu Hình Phân Quyền</h2>
                                    <p className="text-gray-500 font-medium">Thiết lập quyền hạn cụ thể cho {selectedUser?.fullName}</p>
                                </div>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Tên đầy đủ</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Vai trò chính</label>
                                    <select 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none appearance-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-10">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Phân quyền chi tiết (Custom Permissions)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(ALL_PERMISSIONS.reduce((acc, curr) => {
                                        if(!acc[curr.group]) acc[curr.group] = [];
                                        acc[curr.group].push(curr);
                                        return acc;
                                    }, {})).map(([group, perms]) => (
                                        <div key={group} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                            <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-4">{group}</h4>
                                            <div className="space-y-4">
                                                {perms.map(p => (
                                                    <label key={p.key} className="flex items-center gap-3 group cursor-pointer">
                                                        <input 
                                                            type="checkbox"
                                                            className="w-5 h-5 rounded-lg border-gray-200 text-green-600 focus:ring-green-500/20 transition-all cursor-pointer"
                                                            checked={formData.customPermissions.includes(p.key)}
                                                            onChange={() => handleTogglePermission(p.key)}
                                                        />
                                                        <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{p.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl mb-10 border border-gray-100">
                                <div>
                                    <div className="font-bold text-gray-900">Trạng thái tài khoản</div>
                                    <div className="text-xs text-gray-500 font-medium">Khoá tài khoản nếu nhân viên nghỉ việc hoặc có dấu hiệu bất thường</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-xl shadow-green-100 transition-all active:scale-95"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
