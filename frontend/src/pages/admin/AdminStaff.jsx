import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { useConfirm } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    ShieldCheckIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    XMarkIcon,
    TrashIcon,
    EyeIcon
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
    { key: 'manage:promotions', name: 'Quản lý khuyến mãi', group: 'Hệ thống' },
    { key: 'view:media', name: 'Xem thư viện Media', group: 'Media' },
    { key: 'manage:media', name: 'Quản lý Media', group: 'Media' },
];

const ROLES = [
    { 
        value: 'ROLE_ADMIN', 
        name: 'Quản trị viên',
        permissions: [
            "view:products", "manage:products", 
            "view:categories", "manage:categories", 
            "view:batches", "manage:batches", 
            "view:farms", "manage:farms", 
            "manage:orders", "manage:refunds", 
            "manage:users", "manage:reviews", 
            "view:reports", "manage:newsletters",
            "manage:promotions", "manage:settings"
        ]
    },
    { 
        value: 'ROLE_STAFF', 
        name: 'Nhân viên',
        permissions: ["view:products", "view:categories", "view:farms", "view:batches", "manage:orders", "manage:newsletters", "manage:profile"]
    }
];

export default function AdminStaff() {
    const { confirm } = useConfirm();
    const { user: currentUser, hasPermission } = useAuth();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'ROLE_STAFF',
        customPermissions: ROLES.find(r => r.value === 'ROLE_STAFF')?.permissions || [],
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
            toast.error(error.response?.data?.message || 'Không thể tải danh sách nhân sự');
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
            phone: '',
            role: 'ROLE_STAFF',
            customPermissions: ROLES.find(r => r.value === 'ROLE_STAFF')?.permissions || [],
            isActive: true
        });
        setSelectedUser(null);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            username: user.username || '',
            email: user.email || '',
            password: '',
            fullName: user.fullName || '',
            phone: user.phone || '',
            role: user.role,
            customPermissions: user.customPermissions || [],
            isActive: user.isActive !== false
        });
        setIsEditModalOpen(true);
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (user) => {
        // Prevent locking self
        if (user.username === currentUser?.username) {
            toast.error("Bạn không thể tự khóa tài khoản của chính mình");
            return;
        }

        const action = user.isActive === false ? 'mở khóa' : 'khóa';
        const ok = await confirm({
            title: `Xác nhận ${action}`,
            message: `Bạn có chắc muốn ${action} tài khoản ${user.username}?`,
            type: user.isActive === false ? 'info' : 'warning'
        });
        if (!ok) return;

        try {
            await axios.put(`/users/${user.id}/admin`, {
                ...user,
                isActive: !(user.isActive !== false)
            });
            toast.success(`Đã ${action} tài khoản`);
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || `Thao tác ${action} thất bại`);
        }
    };

    const handleTogglePermission = (perm) => {
        // Prevent editing self perms
        if (selectedUser?.username === currentUser?.username) return;

        setFormData(prev => {
            const current = [...prev.customPermissions];
            if (current.includes(perm)) {
                return { ...prev, customPermissions: current.filter(p => p !== perm) };
            }
            return { ...prev, customPermissions: [...current, perm] };
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/users/staff/create?role=${formData.role}`, {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                phone: formData.phone
            });
            toast.success('Thêm nhân sự thành công');
            setIsAddModalOpen(false);
            resetForm();
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thêm nhân sự thất bại');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        // Final guard against self-edit submitting
        if (selectedUser?.username === currentUser?.username) {
            toast.error("Vui lòng sử dụng trang Hồ Sơ để chỉnh sửa thông tin bản thân");
            setIsEditModalOpen(false);
            return;
        }

        try {
            await axios.put(`/users/${selectedUser.id}/admin`, {
                username: formData.username,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
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
        if (user.username === currentUser?.username) {
            toast.error("Bạn không thể tự xóa tài khoản của chính mình");
            return;
        }

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
            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase italic">Nhân Sự Hệ Thống</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Quản trị và phân quyền cho đội ngũ vận hành FreshFood</p>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <PlusIcon className="w-6 h-6" /> Thêm nhân sự
                    </button>
                </div>

                <div className="bg-white rounded-[32px] shadow-[rgba(0,0,0,0.02)_0px_20px_50px] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm nhân sự..."
                                className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-500/10 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4 text-left">Thành viên</th>
                                    <th className="px-6 py-4 text-left">Vai trò</th>
                                    <th className="px-6 py-4 text-left">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-gray-400 font-medium">Đang tải...</td></tr>
                                ) : filteredStaff.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <EyeIcon className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors uppercase">{user.fullName}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium tracking-tight">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${user.role === 'ROLE_ADMIN' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {user.role === 'ROLE_ADMIN' ? 'QUẢN TRỊ' : 'NHÂN VIÊN'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                disabled={user.username === currentUser?.username}
                                                onClick={() => handleToggleStatus(user)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                                                    user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                } ${user.username === currentUser?.username ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                                            >
                                                {user.isActive !== false ? 'ACTIVE' : 'LOCKED'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleView(user)} className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all"><EyeIcon className="w-5 h-5" /></button>
                                                {user.username !== currentUser?.username && (
                                                    <>
                                                        <button onClick={() => handleEdit(user)} className="p-2 text-gray-400 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                                                        <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"><TrashIcon className="w-5 h-5" /></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                            <h2 className="text-2xl font-black italic tracking-tighter">Thông tin nhân sự</h2>
                            <button onClick={() => setIsViewModalOpen(false)}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-2xl"><div className="text-[10px] font-bold text-gray-400 uppercase">Họ tên</div><div className="font-bold">{selectedUser.fullName}</div></div>
                                <div className="p-4 bg-gray-50 rounded-2xl"><div className="text-[10px] font-bold text-gray-400 uppercase">Username</div><div className="font-bold">@{selectedUser.username}</div></div>
                                <div className="p-4 bg-gray-50 rounded-2xl"><div className="text-[10px] font-bold text-gray-400 uppercase">Email</div><div className="font-bold">{selectedUser.email}</div></div>
                                <div className="p-4 bg-gray-50 rounded-2xl"><div className="text-[10px] font-bold text-gray-400 uppercase">Role</div><div className="font-bold">{selectedUser.role}</div></div>
                            </div>
                            <div className="flex gap-4">
                                {selectedUser.username !== currentUser?.username && (
                                    <button onClick={() => { setIsViewModalOpen(false); handleEdit(selectedUser); }} className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl">Chỉnh sửa</button>
                                )}
                                <button onClick={() => setIsViewModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[32px] w-full max-w-2xl my-auto shadow-2xl">
                        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="p-8 sm:p-10">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">{isAddModalOpen ? 'Thêm nhân sự' : 'Cấu hình nhân sự'}</h2>
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Username</label>
                                    <input 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2 disabled:opacity-50" 
                                        value={formData.username} 
                                        onChange={e => setFormData({...formData, username: e.target.value})} 
                                        required 
                                        disabled={isEditModalOpen && selectedUser?.username === currentUser?.username}
                                        placeholder="User đăng nhập" 
                                    />
                                    {isEditModalOpen && selectedUser?.username === currentUser?.username && (
                                        <p className="text-[9px] text-amber-600 font-bold ml-2 mt-1 italic">* Sử dụng trang Hồ Sơ để đổi Username cá nhân</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Họ và tên</label>
                                    <input className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required placeholder="Họ tên thật" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Email</label>
                                    <input type="email" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Số điện thoại</label>
                                    <input className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                                {isAddModalOpen && (
                                    <div className="sm:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Mật khẩu ban đầu</label>
                                        <input type="password" className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                                    </div>
                                )}
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block">Vai trò hệ thống</label>
                                    <select 
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 font-bold outline-none ring-green-600/10 focus:ring-2 appearance-none"
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value, customPermissions: ROLES.find(r => r.value === e.target.value)?.permissions || []})}
                                    >
                                        <option value="ROLE_STAFF">NHÂN VIÊN</option>
                                        <option value="ROLE_ADMIN">QUẢN TRỊ VIÊN</option>
                                    </select>
                                </div>
                            </div>

                            {/* Self-edit shield for permissions */}
                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-4 block">Đặc quyền chi tiết</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_PERMISSIONS.map(p => (
                                        <label key={p.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded border-gray-200 text-green-600"
                                                checked={formData.customPermissions.includes(p.key)}
                                                onChange={() => handleTogglePermission(p.key)}
                                                disabled={selectedUser?.username === currentUser?.username}
                                            />
                                            <span className="text-xs font-bold text-gray-600">{p.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="flex-1 py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl">Hủy</button>
                                {(!isEditModalOpen || selectedUser?.username !== currentUser?.username) && (
                                    <button type="submit" className="flex-[2] py-4 bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-100">{isAddModalOpen ? 'Tạo mới' : 'Lưu thay đổi'}</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
