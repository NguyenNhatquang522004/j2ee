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
    EyeIcon,
    EyeSlashIcon
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
    { key: 'manage:settings', name: 'Cài đặt hệ thống', group: 'Hệ thống' },
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
    const { hasPermission, isAdmin } = useAuth();
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
            password: '', // Password stays empty on edit
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
        const action = user.isActive === false ? 'mở khóa' : 'khóa';
        const ok = await confirm({
            title: `Xác nhận ${action}`,
            message: `Bạn có chắc muốn ${action} tài khoản ${user.username}?`,
            type: user.isActive === false ? 'info' : 'warning'
        });
        if (!ok) return;

        try {
            await axios.put(`/users/${user.id}/admin`, {
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                customPermissions: user.customPermissions,
                isActive: !(user.isActive !== false)
            });
            toast.success(`Đã ${action} tài khoản`);
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || `Thao tác ${action} thất bại`);
        }
    };

    const handleTogglePermission = (perm) => {
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
        try {
            await axios.put(`/users/${selectedUser.id}/admin`, {
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
               (u.phone || '').includes(search) ||
               (u.email || '').toLowerCase().includes(search);
    });

    return (
        <AdminLayout>
            <div className="p-4 sm:p-8 max-w-[1440px] mx-auto">
                <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">QUẢN TRỊ NHÂN SỰ</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Quản lý đội ngũ quản trị viên và nhân viên hỗ trợ hệ thống</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <PlusIcon className="w-6 h-6" /> Thêm nhân sự mới
                    </button>
                </div>

                <div className="bg-white rounded-[32px] shadow-[rgba(0,0,0,0.02)_0px_20px_50px] border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Tìm theo tên, username hoặc email..."
                                className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green-500/10 transition-all outline-none"
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
                                                    <div className="whitespace-nowrap min-w-[200px]">
                                                        <div className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition-colors uppercase tracking-tight">{user.fullName}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium tracking-tight">@{user.username} • {user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap inline-block ${
                                                    user.role === 'ROLE_ADMIN' 
                                                    ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' 
                                                    : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100'
                                                }`}>
                                                    {user.role === 'ROLE_ADMIN' ? 'QUẢN TRỊ' : 'NHÂN VIÊN'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="flex flex-wrap items-center gap-1 min-w-[180px]">
                                                    {user.permissions?.slice(0, 2).map(p => (
                                                        <span key={p} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold whitespace-nowrap">{p}</span>
                                                    ))}
                                                    {(user.permissions?.length || 0) > 2 && (
                                                        <span className="text-[9px] text-gray-300 font-bold whitespace-nowrap">+{user.permissions.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => user.role !== 'ROLE_ADMIN' && handleToggleStatus(user)}
                                                    disabled={user.role === 'ROLE_ADMIN'}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black transition-all whitespace-nowrap ${
                                                        user.isActive !== false 
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                                                    } ${user.role === 'ROLE_ADMIN' ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                                                >
                                                    {user.isActive !== false ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                                    {user.isActive !== false ? 'ACTIVE' : 'LOCKED'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 text-gray-400 whitespace-nowrap">
                                                    <button 
                                                        onClick={() => handleView(user)}
                                                        className="p-2 hover:text-blue-500 hover:bg-blue-50 transition-all rounded-xl"
                                                        title="Xem chi tiết"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <PencilSquareIcon className="w-5 h-5" />
                                                    </button>
                                                    {user.role !== 'ROLE_ADMIN' && (
                                                        <button 
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Xoá"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center text-green-600 overflow-hidden shadow-inner border border-green-200/50">
                                        {selectedUser.avatarUrl ? (
                                            <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <ShieldCheckIcon className="w-10 h-10" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{selectedUser.fullName}</h2>
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">@{selectedUser.username} • {selectedUser.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Nhân viên'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</div>
                                    <div className="text-gray-900 font-bold">{selectedUser.email}</div>
                                </div>
                                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</div>
                                    <div className="text-gray-900 font-bold">{selectedUser.phone || 'Chưa cập nhật'}</div>
                                </div>
                                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày tham gia</div>
                                    <div className="text-gray-900 font-bold">{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</div>
                                </div>
                                <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Trạng thái</div>
                                    <div className={`font-bold flex items-center gap-1.5 ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedUser.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                                        {selectedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Danh sách quyền hạn</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {selectedUser.permissions?.map(p => (
                                        <div key={p} className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-xl border border-green-100 italic font-medium text-xs">
                                            <ShieldCheckIcon className="w-3 h-3" /> {p}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button 
                                    onClick={() => { setIsViewModalOpen(false); handleEdit(selectedUser); }}
                                    className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <PencilSquareIcon className="w-5 h-5" /> Chỉnh sửa
                                </button>
                                <button 
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <form onSubmit={handleAddSubmit} className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Thêm Nhân Sự Mới</h2>
                                    <p className="text-gray-500 font-medium tracking-tight">Đăng ký tài khoản hệ thống cho thành viên mới</p>
                                </div>
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="md:col-span-2">
                                    <label htmlFor="add_username" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Tên đăng nhập</label>
                                    <input 
                                        id="add_username"
                                        name="username"
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                        placeholder="Ví dụ: nva_staff"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="add_fullName" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Họ tên đầy đủ</label>
                                    <input 
                                        id="add_fullName"
                                        name="fullName"
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="add_phone" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Số điện thoại</label>
                                    <input 
                                        id="add_phone"
                                        name="phone"
                                        type="tel"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                        placeholder="0xxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="add_email" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Email</label>
                                    <input 
                                        id="add_email"
                                        name="email"
                                        type="email"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                        placeholder="email@freshfood.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="add_password" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Mật khẩu</label>
                                    <input 
                                        id="add_password"
                                        name="password"
                                        type="password"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="add_role" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Vai trò hệ thống</label>
                                    <select 
                                        id="add_role"
                                        name="role"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none appearance-none"
                                        value={formData.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            const roleDefaults = ROLES.find(r => r.value === newRole)?.permissions || [];
                                            setFormData({
                                                ...formData, 
                                                role: newRole,
                                                customPermissions: roleDefaults // Template logic for new staff
                                            });
                                        }}
                                    >
                                        {ROLES.filter(r => r.value !== 'ROLE_ADMIN').map(r => <option key={r.value} value={r.value}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95"
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
                    <div className="relative bg-white rounded-[32px] w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <form onSubmit={handleEditSubmit} className="p-8 sm:p-12">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Cấu Hình Nhân Sự</h2>
                                    <p className="text-gray-500 font-medium tracking-tight">Thiết lập thông tin và quyền hạn cụ thể cho {selectedUser?.fullName}</p>
                                </div>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div>
                                    <label htmlFor="edit_fullName" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Họ tên đầy đủ</label>
                                    <input 
                                        id="edit_fullName"
                                        name="fullName"
                                        type="text"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit_phone" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Số điện thoại</label>
                                    <input 
                                        id="edit_phone"
                                        name="phone"
                                        type="tel"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit_email" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Email</label>
                                    <input 
                                        id="edit_email"
                                        name="email"
                                        type="email"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit_role" className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Vai trò chính</label>
                                    <select 
                                        id="edit_role"
                                        name="role"
                                        className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500/20 focus:bg-white text-gray-900 font-bold transition-all outline-none appearance-none"
                                        value={formData.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            const roleDefaults = ROLES.find(r => r.value === newRole)?.permissions || [];
                                            setFormData({
                                                ...formData, 
                                                role: newRole,
                                                customPermissions: roleDefaults // Suggest perms based on template
                                            });
                                        }}
                                    >
                                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {hasPermission('manage:users') && (
                                <div className="mb-12">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Phân quyền chi tiết (Custom Permissions)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(ALL_PERMISSIONS.reduce((acc, curr) => {
                                            if(!acc[curr.group]) acc[curr.group] = [];
                                            acc[curr.group].push(curr);
                                            return acc;
                                        }, {})).map(([group, perms]) => (
                                            <div key={group} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                                <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-5">{group}</h4>
                                                <div className="space-y-4">
                                                    {perms.map(p => {
                                                        const isRoleDefault = ROLES.find(r => r.value === formData.role)?.permissions?.includes(p.key);
                                                        const isChecked = formData.customPermissions.includes(p.key);
                                                        
                                                        return (
                                                            <label key={p.key} className="flex items-center gap-3 group cursor-pointer">
                                                                <input 
                                                                    type="checkbox"
                                                                    className="w-5 h-5 rounded-lg border-gray-200 text-green-600 focus:ring-green-500/20 transition-all cursor-pointer"
                                                                    checked={!!isChecked}
                                                                    onChange={() => handleTogglePermission(p.key)}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                                        {p.name}
                                                                    </span>
                                                                    {isRoleDefault && (
                                                                        <span className="text-[9px] text-green-500 font-bold uppercase tracking-tighter opacity-60">Nên có cho {ROLES.find(r => r.value === formData.role)?.name}</span>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {formData.role === 'ROLE_STAFF' && (
                                <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[28px] mb-12 border border-gray-100">
                                    <div>
                                        <div className="font-bold text-lg text-gray-900">Trạng thái tài khoản</div>
                                        <div className="text-xs text-gray-500 font-medium">Khóa tài khoản nếu nhân viên nghỉ việc hoặc có dấu hiệu bất thường</div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer scale-110">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                        />
                                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                                    </label>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-100 transition-all active:scale-95"
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
