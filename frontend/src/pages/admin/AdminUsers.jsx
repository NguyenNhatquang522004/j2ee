import { useEffect, useState, useCallback } from 'react';
import { userService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const res = await userService.getAll({ page: p, size: 15 });
            setUsers(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(page); }, [page, fetchUsers]);

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

    const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN') : '';

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b text-gray-500">
                            <th className="pb-3 text-left">Người dùng</th>
                            <th className="pb-3 text-left">Email</th>
                            <th className="pb-3 text-left">Số điện thoại</th>
                            <th className="pb-3 text-center">Vai trò</th>
                            <th className="pb-3 text-center">Ngày đăng ký</th>
                            <th className="pb-3 text-center">Trạng thái</th>
                            <th className="pb-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-400">Đang tải...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={7} className="py-8 text-center text-gray-400">Không có người dùng</td></tr>
                        ) : users.map((u) => (
                            <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3">
                                    <div>
                                        <p className="font-medium text-gray-800">{u.fullName}</p>
                                        <p className="text-xs text-gray-400">@{u.username}</p>
                                    </div>
                                </td>
                                <td className="py-3 text-gray-600">{u.email}</td>
                                <td className="py-3 text-gray-600">{u.phone}</td>
                                <td className="py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="py-3 text-center text-gray-500">{fmtDate(u.createdAt)}</td>
                                <td className="py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                        {u.active ? 'Hoạt động' : 'Bị khoá'}
                                    </span>
                                </td>
                                <td className="py-3 text-center">
                                    <button
                                        disabled={togglingId === u.id || u.role === 'ADMIN'}
                                        onClick={() => handleToggle(u.id)}
                                        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${u.role === 'ADMIN'
                                                ? 'text-gray-300 cursor-not-allowed'
                                                : u.active
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                            }`}
                                    >
                                        {togglingId === u.id ? '...' : u.active ? 'Khoá' : 'Mở khoá'}
                                    </button>
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
        </Layout>
    );
}
