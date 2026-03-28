import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { 
    ClockIcon, 
    UserIcon, 
    CubeIcon, 
    InformationCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminLayout from '../../components/AdminLayout';

export default function AdminAudit() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/audit/logs?page=${page}&size=20`);
            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Fetch logs error:', error);
            toast.error(error.response?.data?.message || 'Không thể tải nhật ký hệ thống: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-50 ring-green-100';
        if (action.includes('UPDATE')) return 'text-amber-600 bg-amber-50 ring-amber-100';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 ring-red-100';
        if (action.includes('LOGIN')) return 'text-indigo-600 bg-indigo-50 ring-indigo-100';
        return 'text-gray-600 bg-gray-50 ring-gray-100';
    };

    const filteredLogs = logs.filter(log => 
        log.adminUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Nhật Ký Hệ Thống</h1>
                        <p className="mt-1.5 text-sm text-gray-500 font-medium">Giám sát mọi hoạt động quản trị trên nền tảng</p>
                    </div>
                    <button 
                        onClick={() => { setPage(0); fetchLogs(); }}
                        className="p-3 bg-white text-gray-500 hover:text-green-600 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-95"
                    >
                        <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-white/50 backdrop-blur-sm">
                        <div className="relative flex-1 max-w-md group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Tìm kiếm hành động, admin, tài nguyên..."
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                             <span className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100">
                                Total: {logs.length} hiển thị
                             </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Quản trị viên</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hành động</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tài nguyên</th>
                                    <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-medium whitespace-pre">
                                            <div className="animate-pulse space-y-4">
                                                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
                                                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <InformationCircleIcon className="w-12 h-12 text-gray-200" />
                                                <p className="text-gray-400 font-medium">Không có dữ liệu nhật ký phù hợp</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <ClockIcon className="w-5 h-5 text-gray-300" />
                                                    <div className="text-sm font-bold text-gray-700">
                                                        {format(new Date(log.createdAt), 'HH:mm:ss', { locale: vi })}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                        {format(new Date(log.createdAt), 'dd MMM yyyy', { locale: vi })}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <UserIcon className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">@{log.adminUsername}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider ring-1 ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                    <CubeIcon className="w-5 h-5 text-gray-400" />
                                                    {log.resourceType}
                                                    <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">#{log.resourceId}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-xs text-gray-500 font-medium line-clamp-1 italic">
                                                    "{log.details}"
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-5 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                            Trang {page + 1} / {totalPages || 1}
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Trước
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
