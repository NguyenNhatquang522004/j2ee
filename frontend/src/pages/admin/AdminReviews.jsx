import { useEffect, useState, useCallback } from 'react';
import { reviewService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import { useConfirm } from '../../context/ModalContext';
import toast from 'react-hot-toast';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    TrashIcon, 
    ChatBubbleLeftRightIcon,
    StarIcon,
    UserCircleIcon,
    PhotoIcon,
    VideoCameraIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function AdminReviews() {
    const { confirm } = useConfirm();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showReplyModal, setShowReplyModal] = useState(null); // stores the review being replied to
    const [replyText, setReplyText] = useState('');
    const [replyStatus, setReplyStatus] = useState('APPROVED');
    const [submitting, setSubmitting] = useState(false);
    const [expandedReview, setExpandedReview] = useState(null);

    const fetchReviews = useCallback(async (p = 0) => {
        setLoading(true);
        try {
            const res = await reviewService.getAll({ page: p, size: 10 });
            setReviews(res.data.content || []);
            setTotalPages(res.data.totalPages || 1);
        } catch {
            toast.error('Không thể tải danh sách đánh giá');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews(page);
    }, [page, fetchReviews]);

    const handleModerate = async (e) => {
        e.preventDefault();
        if (!showReplyModal) return;
        
        setSubmitting(true);
        try {
            await reviewService.moderate(showReplyModal.id, {
                status: replyStatus,
                adminReply: replyText
            });
            toast.success('Đã cập nhật đánh giá');
            setShowReplyModal(null);
            fetchReviews(page);
        } catch {
            toast.error('Thao tác thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Xóa đánh giá',
            message: 'Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này? Hành động này không thể hoàn tác.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await reviewService.delete(id);
            toast.success('Đã xóa');
            fetchReviews(page);
        } catch {
            toast.error('Không thể xóa');
        }
    };

    const openReply = (r) => {
        setReplyStatus(r.status || 'APPROVED');
        setReplyText(r.adminReply || '');
        setShowReplyModal(r);
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                    s <= rating ? 
                    <StarIconSolid key={s} className="w-4 h-4 text-yellow-400" /> : 
                    <StarIcon key={s} className="w-4 h-4 text-gray-200" />
                ))}
            </div>
        );
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quản lý Đánh giá</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Duyệt và phản hồi ý kiến từ khách hàng.</p>
                </div>
                <button 
                    onClick={() => fetchReviews(page)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm text-sm"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-bold">Làm mới</span>
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Khách hàng / Sản phẩm</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Nội dung / Sao</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-6 py-8"><div className="h-20 bg-gray-100 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 font-bold italic">Chưa có đánh giá nào.</td>
                                </tr>
                            ) : reviews.map((r) => (
                                <tr key={r.id} className="hover:bg-green-50/30 transition-colors group">
                                    <td className="px-5 py-4 border-b-0">
                                        <div className="flex items-start gap-4">
                                            <div className="shrink-0">
                                                {r.userAvatarUrl ? (
                                                    <img src={r.userAvatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                                                        <UserCircleIcon className="w-7 h-7" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 leading-tight text-sm">{r.userFullName || r.username}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Sản phẩm: <span className="text-green-600">{r.productName}</span></p>
                                                <p className="text-[9px] text-gray-300 mt-0.5">{new Date(r.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 border-b-0 max-w-md">
                                        {renderStars(r.rating)}
                                        <div className="mt-1.5 text-[13px] text-gray-600 font-medium line-clamp-2">
                                            {r.comment}
                                        </div>
                                        {r.mediaUrls && r.mediaUrls.length > 0 && (
                                            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1.5">
                                                {r.mediaUrls.map((url, i) => (
                                                    <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                                        {url.includes('/video/') ? (
                                                              <div className="w-full h-full flex items-center justify-center text-gray-400 scale-75"><VideoCameraIcon className="w-6 h-6" /></div>
                                                        ) : (
                                                            <img src={url} className="w-full h-full object-cover" alt="" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {r.adminReply && (
                                            <div className="mt-2.5 p-2.5 bg-blue-50/50 border border-blue-100/50 rounded-lg text-[10px] text-blue-700 italic">
                                                <span className="font-black not-italic text-blue-800 mr-2 uppercase tracking-tighter text-[9px]">Phản hồi của Admin:</span>
                                                {r.adminReply}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 border-b-0 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                            r.status === 'APPROVED' ? 'bg-green-100 text-green-700 border-green-200' :
                                            r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                        }`}>
                                            {r.status === 'APPROVED' ? 'Đã duyệt' : r.status === 'PENDING' ? 'Chờ duyệt' : 'Đã ẩn'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 border-b-0 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button 
                                                onClick={() => openReply(r)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                title="Trả lời / Duyệt"
                                            >
                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(r.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-500">Trang {page + 1} / {totalPages}</p>
                        <div className="flex gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                                        page === i 
                                        ? 'bg-green-600 text-white shadow-sm' 
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

            {/* Moderation Modal */}
            {showReplyModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Duyệt & Phản hồi</h2>
                                <p className="text-[11px] text-gray-500 font-medium leading-none">Bạn đang phản hồi đánh giá của {showReplyModal.userFullName || showReplyModal.username}.</p>
                            </div>
                            <button onClick={() => setShowReplyModal(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all">
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleModerate} className="p-6 space-y-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Trạng thái hiển thị</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setReplyStatus('APPROVED')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-black text-sm ${replyStatus === 'APPROVED' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <CheckCircleIcon className="w-5 h-5" /> Duyệt hiển thị
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setReplyStatus('REJECTED')}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-black text-sm ${replyStatus === 'REJECTED' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        <XCircleIcon className="w-5 h-5" /> Ẩn bình luận
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Nội dung phản hồi</label>
                                <textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={3}
                                    placeholder="Lời cảm ơn hoặc phản hồi về đánh giá..."
                                    className="w-full px-5 py-3 bg-gray-50 rounded-xl font-medium focus:ring-4 focus:ring-green-500/10 focus:bg-white transition-all outline-none border border-transparent focus:border-green-500 resize-none text-sm"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setShowReplyModal(null)}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-500 font-black rounded-xl hover:bg-gray-200 transition-all text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    {submitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
