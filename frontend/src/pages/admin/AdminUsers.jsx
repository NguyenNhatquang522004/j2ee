import { useEffect, useState, useCallback } from 'react';
import { userService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassIcon, 
    UserIcon, 
    LockClosedIcon, 
    LockOpenIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [direction, setDirection] = useState('desc');

    const fetchUsers = useCallback(async (p = 0, q = '', role = '', active = '', sort = 'createdAt', dir = 'desc') => {
        setLoading(true);
        try {
            const params = { 
                page: p, 
                size: 10,
                sortBy: sort,
                direction: dir
            };
            if (q) params.query = q;
            if (role) params.role = role;
            if (active !== '') params.isActive = active === 'true';

            const res = await userService.getAll(params);
            setUsers(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchUsers(page, search, roleFilter, statusFilter, sortBy, direction); 
    }, [page, search, roleFilter, statusFilter, sortBy, direction, fetchUsers]);

    const handleToggle = async (id) => {
        setTogglingId(id);
        try {
            await userService.toggleActive(id);
            toast.success('Đã cập nhật trạng thái tài khoản');
            fetchUsers(page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setTogglingId(null);
        }
    };

    const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { 
        year: 'numeric', month: 'short', day: 'numeric' 
    }) : '';

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Người dùng</h1>
                    <p className="text-gray-500 font-medium text-sm tracking-tight">Quản lý tài khoản khách hàng và phân quyền.</p>
                </div>
                <div className="flex flex-col lg:flex-row gap-2 flex-1 max-w-5xl lg:justify-end">
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Tìm kiếm tên, email, username..."
                            className="bg-white border border-gray-100 rounded-xl px-10 py-2.5 font-medium text-xs outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 w-full transition-all"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:flex gap-2">
                        <select 
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                            className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase min-w-[120px]"
                        >
                            <option value="">Role: All</option>
                            <option value="ROLE_USER">Khách hàng</option>
                            <option value="ROLE_ADMIN">Admin</option>
                            <option value="ROLE_STAFF">Staff</option>
                        </select>
                        <select 
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                            className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase min-w-[120px]"
                        >
                            <option value="">Status: All</option>
                            <option value="true">Active</option>
                            <option value="false">Locked</option>
                        </select>
                        <select 
                            value={`${sortBy}-${direction}`}
                            onChange={(e) => {
                                const [s, d] = e.target.value.split('-');
                                setSortBy(s);
                                setDirection(d);
                                setPage(0);
                            }}
                            className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 font-bold text-gray-600 outline-none focus:ring-4 focus:ring-green-500/10 text-[10px] uppercase"
                        >
                            <option value="createdAt-desc">Mới nhất</option>
                            <option value="createdAt-asc">Cũ nhất</option>
                            <option value="fullName-asc">Tên: A-Z</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                    <th className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Thông tin</th>
                                    <th className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider">Liên hệ</th>
                                    <th className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Vai trò</th>
                                    <th className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="px-5 py-3 text-xs font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-12 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">Không tìm thấy người dùng nào</td>
                                </tr>
                            ) : users.map((u) => (
                                <tr key={u.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 font-bold group-hover:scale-110 transition-transform overflow-hidden border border-green-100 shadow-inner">
                                                {u.avatarUrl ? (
                                                    <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover" />
                                                ) : (
                                                    (u.fullName?.charAt(0) || "").toUpperCase() || <UserIcon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight capitalize text-sm">{u.fullName}</p>
                                                <p className="text-[10px] text-gray-500 font-bold tracking-tight">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                                <EnvelopeIcon className="w-5 h-5" /> {u.email}
                                            </div>
                                            {u.phone && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
                                                    <PhoneIcon className="w-5 h-5" /> {u.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                            u.role?.includes('ADMIN') ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                        }`}>
                                            {u.role?.includes('ADMIN') && <ShieldCheckIcon className="w-5 h-5" />}
                                            {u.role?.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                            u.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                            {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <button
                                            disabled={togglingId === u.id || u.role?.includes('ADMIN')}
                                            onClick={() => handleToggle(u.id)}
                                            className={`p-1.5 rounded-lg transition-all ${
                                                u.role?.includes('ADMIN')
                                                ? 'text-gray-100 cursor-not-allowed' 
                                                : u.isActive 
                                                    ? 'text-red-500 hover:bg-red-50 bg-red-50/30' 
                                                    : 'text-green-600 hover:bg-green-50 bg-green-50/30'
                                            }`}
                                            title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                        >
                                            {togglingId === u.id ? (
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : u.isActive ? (
                                                <LockClosedIcon className="w-5 h-5" />
                                            ) : (
                                                <LockOpenIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between">
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
        </AdminLayout>
    );
}

