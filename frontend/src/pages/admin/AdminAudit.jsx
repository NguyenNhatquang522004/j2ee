import { useState, useEffect } from 'react';
import { auditService, securityLogService } from '../../api/services';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    ClockIcon, 
    UserIcon, 
    CubeIcon, 
    InformationCircleIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ShieldExclamationIcon,
    FingerPrintIcon,
    ArrowTopRightOnSquareIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminLayout from '../../components/AdminLayout';

export default function AdminAudit() {
    // --- STATE ---
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'security'
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    // Fetch logs on mount, tab change, and page change
    useEffect(() => {
        setPage(0);
    }, [activeTab]);

    useEffect(() => {
        fetchLogs();
    }, [page, activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = activeTab === 'audit' 
                ? await auditService.getAll({ page, size: 20 })
                : await securityLogService.getAll({ page, size: 20 });

            setLogs(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Fetch logs error:', error);
            toast.error(error.response?.data?.message || 'Không thể tải nhật ký: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (!action) return 'text-gray-600 bg-gray-50';
        const act = action.toUpperCase();
        if (act.includes('CREATE') || act.includes('SUCCESS')) return 'text-green-600 bg-green-50 ring-green-100';
        if (act.includes('UPDATE') || act.includes('MEDIUM')) return 'text-amber-600 bg-amber-50 ring-amber-100';
        if (act.includes('DELETE') || act.includes('FAILED') || act.includes('HIGH') || act.includes('LOCKED')) return 'text-red-600 bg-red-50 ring-red-100';
        if (act.includes('LOGIN')) return 'text-indigo-600 bg-indigo-50 ring-indigo-100';
        return 'text-gray-600 bg-gray-50 ring-gray-100';
    };

    /**
     * filteredLogs:
     * Frontend-side searching across multiple fields (username, action, resource, details).
     */
    const filteredLogs = logs.filter(log => 
        log.adminUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER ---

    const getResourceLink = (log) => {
        if (!log || !log.resourceType || !log.resourceId) return null;
        switch (log.resourceType.toUpperCase()) {
            case 'ORDER': return `/admin/orders/${log.resourceId}`;
            case 'PRODUCT': return `/admin/products?id=${log.resourceId}`;
            case 'USER': return `/admin/users?id=${log.resourceId}`;
            case 'CATEGORY': return `/admin/categories?id=${log.resourceId}`;
            case 'BATCH': return `/admin/batches?id=${log.resourceId}`;
            default: return null;
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight italic">Nhật Ký Hệ Thống</h1>
                        <p className="mt-1.5 text-sm text-gray-500 font-medium">Giám sát toàn bộ lịch sử hoạt động và sự kiện bảo mật từ backend.</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-2xl">
                        <button 
                            onClick={() => setActiveTab('audit')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Hoạt động
                        </button>
                        <button 
                            onClick={() => setActiveTab('security')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Bảo mật
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-white/50 backdrop-blur-sm">
                        <div className="relative flex-1 max-w-md group">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder={`Tìm kiếm trong nhật ký ${activeTab === 'audit' ? 'nghiệp vụ' : 'bảo mật'}...`}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none text-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => fetchLogs()}
                            className="p-2.5 bg-white text-gray-500 hover:text-green-600 rounded-xl shadow-sm border border-gray-100 transition-all active:scale-95"
                        >
                            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Thời gian</th>
                                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {activeTab === 'audit' ? 'Quản trị viên' : 'Người dùng / IP'}
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sự kiện</th>
                                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        {activeTab === 'audit' ? 'Tài nguyên' : 'Mức độ'}
                                    </th>
                                    <th className="px-5 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Nội dung</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                                                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <InformationCircleIcon className="w-12 h-12 text-gray-400" />
                                                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Không có dữ liệu</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <tr 
                                            key={log.id} 
                                            className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <ClockIcon className="w-5 h-5 text-gray-300" />
                                                    <div>
                                                        <div className="text-sm font-black text-gray-700 leading-tight">
                                                            {format(new Date(log.createdAt), 'HH:mm:ss', { locale: vi })}
                                                        </div>
                                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">
                                                            {format(new Date(log.createdAt), 'dd/MM/yyyy', { locale: vi })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center border border-white shadow-sm">
                                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-gray-900 block leading-tight">
                                                            {activeTab === 'audit' ? `@${log.adminUsername}` : (log.username || 'Khách/Ẩn danh')}
                                                        </span>
                                                        {activeTab === 'security' && (
                                                            <span className="text-[9px] text-gray-400 font-mono tracking-tighter">{log.ipAddress}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-widest ring-1 uppercase ${getActionColor(activeTab === 'audit' ? log.action : log.eventType)}`}>
                                                    {activeTab === 'audit' ? log.action : log.eventType}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {activeTab === 'audit' ? (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                        <CubeIcon className="w-4 h-4 text-gray-400" />
                                                        <span className="capitalize">{log.resourceType}</span>
                                                        <span className="text-[9px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">#{log.resourceId}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-xs font-bold">
                                                        <ShieldExclamationIcon className={`w-4 h-4 ${log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'text-red-500' : 'text-gray-400'}`} />
                                                        <span className={log.severity === 'HIGH' || log.severity === 'CRITICAL' ? 'text-red-600' : 'text-gray-600'}>{log.severity}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] text-gray-500 font-medium line-clamp-1 italic max-w-[200px]">
                                                        "{log.details}"
                                                    </p>
                                                    <ChevronRightIcon className="w-4 h-4 text-gray-200 group-hover:text-green-500 transform group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                            Trang {page + 1} / {totalPages || 1}
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                            >
                                Trước
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                            >
                                Tiếp theo
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- DETAIL MODAL --- */}
                {selectedLog && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden ring-4 ring-white/20">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gradient-to-br from-gray-50 to-white">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-4 py-1 rounded-xl text-[10px] font-black tracking-widest ring-1 ${getActionColor(selectedLog.action)}`}>
                                            {selectedLog.action}
                                        </span>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">ID: #{selectedLog.id}</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none">Chi tiết nhật ký vận hành</h3>
                                    <p className="text-gray-400 text-xs font-medium mt-3 italic">Bản ghi lịch sử trung thực và không thể chỉnh sửa từ hệ thống.</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedLog(null)}
                                    className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Người thực hiện</label>
                                         <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50">
                                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                                 <UserIcon className="w-5 h-5 text-green-600" />
                                             </div>
                                             <div>
                                                 <p className="text-sm font-black text-gray-900 leading-none">
                                                     {activeTab === 'audit' ? `@${selectedLog.adminUsername}` : (selectedLog.username || 'N/A')}
                                                 </p>
                                                 <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                                                     {activeTab === 'audit' ? 'Nhân viên hệ thống' : (selectedLog.ipAddress || 'IP: Unknown')}
                                                 </p>
                                             </div>
                                         </div>
                                     </div>
                                     <div className="space-y-1.5">
                                         <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Thời gian ghi nhận</label>
                                         <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100/50">
                                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                                                 <ClockIcon className="w-5 h-5" />
                                             </div>
                                             <div>
                                                 <p className="text-sm font-black text-gray-900 leading-none">
                                                     {format(new Date(selectedLog.createdAt), 'HH:mm:ss', { locale: vi })}
                                                 </p>
                                                 <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                                                     {format(new Date(selectedLog.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                                                 </p>
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                 <div className="space-y-4">
                                     <div className="flex items-center gap-3">
                                         <InformationCircleIcon className="w-5 h-5 text-green-600" />
                                         <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Dữ liệu tài nguyên & Nội dung thay đổi</h4>
                                     </div>
                                     <div className="bg-white rounded-[2rem] p-8 shadow-[rgba(0,0,0,0.02)_0px_20px_50px] relative overflow-hidden border border-gray-100 group">
                                         <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                         <div className="relative z-10 space-y-4 shadow-inner bg-gray-50/30 p-6 rounded-[1.5rem] border border-gray-100/50">
                                             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab === 'audit' ? 'Loại tài nguyên' : 'Loại sự kiện'}</span>
                                                 <span className="text-sm font-black text-green-600 uppercase tracking-tight">
                                                     {activeTab === 'audit' ? (
                                                         selectedLog.resourceType === 'USER' ? 'Người dùng' : 
                                                         selectedLog.resourceType === 'PRODUCT' ? 'Sản phẩm' :
                                                         selectedLog.resourceType === 'ORDER' ? 'Đơn hàng' :
                                                         selectedLog.resourceType === 'CATEGORY' ? 'Danh mục' :
                                                         selectedLog.resourceType === 'BATCH' ? 'Lô hàng' :
                                                         selectedLog.resourceType === 'FARM' ? 'Trang trại' :
                                                         selectedLog.resourceType === 'REVIEW' ? 'Đánh giá' :
                                                         selectedLog.resourceType === 'COUPON' ? 'Khuyến mãi' :
                                                         selectedLog.resourceType
                                                     ) : selectedLog.eventType}
                                                 </span>
                                             </div>
                                             <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab === 'audit' ? 'Mã định danh (ID)' : 'Mức độ (Severity)'}</span>
                                                 <span className={`text-sm font-bold bg-white px-3 py-1 rounded-lg border shadow-sm ${activeTab === 'security' && (selectedLog.severity === 'HIGH' || selectedLog.severity === 'CRITICAL') ? 'text-red-600 border-red-100' : 'text-gray-900'}`}>
                                                     {activeTab === 'audit' ? `#${selectedLog.resourceId}` : selectedLog.severity}
                                                 </span>
                                             </div>
                                             <div className="pt-2">
                                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Mô tả hành động thực tế</span>
                                                 <div className="text-sm font-bold text-gray-600 leading-relaxed italic bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden min-h-[100px]">
                                                     <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === 'audit' ? 'bg-green-500' : (selectedLog.severity === 'HIGH' || selectedLog.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500')}`}></div>
                                                     <span className="text-green-600 mr-2">"</span>
                                                     {selectedLog.details}
                                                     <span className="text-green-600 ml-2">"</span>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 flex gap-4 justify-center">
                                {activeTab === 'audit' && getResourceLink(selectedLog) && (
                                    <Link
                                        to={getResourceLink(selectedLog)}
                                        className="flex-1 max-w-[240px] px-8 py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                        TRUY CẬP TRANG QUẢN LÝ
                                    </Link>
                                )}
                                <button 
                                    onClick={() => setSelectedLog(null)}
                                    className={`flex-1 max-w-[200px] px-8 py-4 ${getResourceLink(selectedLog) ? 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50' : 'bg-green-600 text-white hover:bg-green-700'} rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95`}
                                >
                                    {getResourceLink(selectedLog) ? 'ĐÓNG' : 'XÁC NHẬN & ĐÓNG'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
