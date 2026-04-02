import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { newsletterService } from '../../api/services';
import toast from 'react-hot-toast';
import { 
    PaperAirplaneIcon, 
    UserGroupIcon, 
    TrashIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    EnvelopeIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

/**
 * ADMIN COMPONENT: Newsletter Management
 * ---------------------------------------------------------
 * Handles mailing list subscriptions and bulk email campaigns.
 * 
 * Features:
 * 1. Subscriber List: View and moderate active/inactive subscribers.
 * 2. Newsletter Composer: Integrated HTML-supported editor with preview.
 * 3. Marketing Templates: Quick-apply predefined styles for sale events.
 */
export default function AdminNewsletters() {
    // --- STATE ---
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // Tabs: 'list' (History) or 'send' (Composer)
    const [newsletterContent, setNewsletterContent] = useState({
        subject: '',
        content: ''
    });

    // Load subscribers on mount
    useEffect(() => {
        loadSubscribers();
    }, []);

    // --- DATA ACTIONS ---

    /**
     * loadSubscribers: Fetches all mail-list subcribers from backend.
     */
    const loadSubscribers = async () => {
        setLoading(true);
        try {
            const res = await newsletterService.getAll();
            setSubscribers(res.data || []);
        } catch (err) {
            toast.error('Không thể tải danh sách đăng ký');
        } finally {
            setLoading(false);
        }
    };

    /**
     * applyTemplate: Helper to inject marketing text into the editor.
     */
    const applyTemplate = (template) => {
        setNewsletterContent({
            subject: template.subject,
            content: template.content
        });
        toast.success('Đã áp dụng mẫu bản tin');
    };

    /**
     * PREDEFINED TEMPLATES:
     * High-conversion marketing copy for quick usage.
     */
    const NEWSLETTER_TEMPLATES = [
        { 
            name: 'Siêu Ưu Đãi 50%', 
            subject: '🔥 [SIÊU ƯU ĐÃI] Giảm giá 50% tất cả nông sản hữu cơ cuối tuần!',
            content: 'Chào những người bạn của FreshFood,<br><br>Chúng tôi mang tới cơ hội tuyệt vời để làm mới tủ lạnh nhà mình với thực phẩm sạch chất lượng cao nhất...<br><br>Ghé thăm ngay tại đây nhé!'
        },
        { 
            name: 'Hàng Mới Về', 
            subject: '🥗 [HÀNG MỚI VỀ] Rau củ từ Đà Lạt vừa cập bến sáng nay!',
            content: 'Những món quà tươi ngon từ mảnh đất cao nguyên vừa được FreshFood thu hoạch và đóng gói...<br><br>Đừng bỏ lỡ nhé mọi người!'
        }
    ];

    /**
     * handleDelete: Removes a subscriber account.
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người đăng ký này?')) return;
        try {
            await newsletterService.delete(id); // Corrected service name
            toast.success('Đã xóa người đăng ký');
            loadSubscribers();
        } catch (err) {
            toast.error('Không thể xóa');
        }
    };

    /**
     * handleSend: Collects form data and triggers bulk email blast.
     */
    const handleSend = async (e) => {
        e.preventDefault();
        if (!newsletterContent.subject || !newsletterContent.content) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }

        setSending(true);
        try {
            await newsletterService.send(newsletterContent); // Corrected service name
            toast.success('Bản tin đã được gửi tới toàn bộ người đăng ký!');
            setNewsletterContent({ subject: '', content: '' });
            setActiveTab('list');
        } catch (err) {
            toast.error('Gửi bản tin thất bại');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-white shadow-xl shadow-green-900/10 rotate-3">
                        <EnvelopeIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Quản lý bản tin</h1>
                        <p className="text-sm text-gray-500 font-medium italic">Kết nối và gửi thông điệp tới cộng đồng FreshFood.</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-white shadow-md text-green-600' : 'text-gray-500'}`}
                    >
                        Người đăng ký
                    </button>
                    <button 
                        onClick={() => setActiveTab('send')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'send' ? 'bg-white shadow-md text-green-600' : 'text-gray-500'}`}
                    >
                        Soạn bản tin
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            ) : activeTab === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                <UserGroupIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-black text-gray-900 uppercase italic">Danh sách đăng ký</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{subscribers.length} Emails đang hoạt động</p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Email người nhận</th>
                                    <th className="px-6 py-4 text-left">Trạng thái</th>
                                    <th className="px-6 py-4 text-left">Ngày tham gia</th>
                                    <th className="px-6 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-5 font-bold text-gray-700">{sub.email}</td>
                                        <td className="px-8 py-5">
                                            {sub.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase italic">
                                                    <CheckCircleIcon className="w-5 h-5" /> Đang nhận tin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase italic">
                                                    <XCircleIcon className="w-5 h-5" /> Đã hủy
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-gray-400 italic">
                                            {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-black italic uppercase tracking-widest">
                                            Chưa có ai đăng ký nhận bản tin
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : activeTab === 'send' ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">
                            <div className="flex flex-wrap gap-2">
                                {NEWSLETTER_TEMPLATES.map(t => (
                                    <button
                                        key={t.name}
                                        onClick={() => applyTemplate(t)}
                                        className="px-4 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-100 transition-all flex items-center gap-2"
                                    >
                                        <SparklesIcon className="w-3.5 h-3.5" />
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between px-3 py-4 bg-green-50 rounded-2xl border border-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-black italic">
                                        {subscribers.filter(s => s.isActive).length}
                                    </div>
                                    <p className="text-sm font-black text-green-800 uppercase italic">Người nhận đang hoạt động</p>
                                </div>
                                <p className="text-[10px] font-black text-green-600 bg-white px-3 py-1 rounded-lg uppercase">System Ready</p>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Tiêu đề email</label>
                                <input 
                                    type="text"
                                    value={newsletterContent.subject}
                                    onChange={(e) => setNewsletterContent({...newsletterContent, subject: e.target.value})}
                                    placeholder="Ví dụ: Ưu đãi cuối tuần lên đến 50%..."
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-green-600 rounded-xl px-6 py-4 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300"
                                />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nội dung (Hỗ trợ HTML)</label>
                                    <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md uppercase italic">Preview mode active</span>
                                </div>
                                <textarea 
                                    rows="12"
                                    value={newsletterContent.content}
                                    onChange={(e) => setNewsletterContent({...newsletterContent, content: e.target.value})}
                                    placeholder="Nội dung gửi tới khách hàng..."
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-green-600 rounded-xl px-6 py-4 font-bold text-gray-700 outline-none transition-all placeholder:text-gray-300 resize-none leading-relaxed"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setNewsletterContent({ subject: '', content: '' })}
                                    className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold py-4 rounded-xl border border-gray-100 transition-all uppercase tracking-widest text-[10px]"
                                >
                                    Làm trống
                                </button>
                                <button 
                                    onClick={handleSend}
                                    disabled={sending}
                                    className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-2xl flex items-center justify-center gap-4 transition-all uppercase tracking-widest disabled:opacity-50 active:scale-95"
                                >
                                    {sending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Đang xử lý gửi...
                                        </>
                                    ) : (
                                        <>
                                            <PaperAirplaneIcon className="w-6 h-6" />
                                            Gửi bản tin ngay
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-emerald-900 rounded-xl p-6 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">Mẹo gửi tin</h3>
                                <ul className="space-y-4 text-sm font-medium text-emerald-100">
                                    <li className="flex gap-3">
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">1</span>
                                        Sử dụng các thẻ HTML như &lt;strong&gt;, &lt;b&gt; để làm nổi bật.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">2</span>
                                        Tránh sử dụng quá nhiều hình ảnh lớn.
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">3</span>
                                        Tiêu đề ngắn gọn sẽ tăng tỷ lệ mở email.
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-10">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-6 italic flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Chế độ xem trước (Actual Email Layout)
                            </h4>
                            <div className="bg-gray-100 rounded-3xl p-4 overflow-hidden shadow-inner">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden scale-[0.85] origin-top -mb-20">
                                    {/* Mock Email Layout Header */}
                                    <div className="bg-green-600 text-white p-6 text-center font-black uppercase italic tracking-widest text-lg">
                                        FreshFood
                                    </div>
                                    <div className="p-10 font-sans">
                                        {newsletterContent.content ? (
                                            <div className="prose prose-sm max-w-none text-gray-700 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: newsletterContent.content }} />
                                        ) : (
                                            <div className="text-gray-300 italic text-sm text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                                                Nội dung bản tin sẽ hiển thị tại đây...
                                            </div>
                                        )}
                                        
                                        <div className="mt-10 pt-10 border-t border-gray-100 text-center">
                                            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg pointer-events-none">
                                                Xem ngay các sản phẩm mới nhất
                                            </button>
                                        </div>
                                    </div>
                                    {/* Mock Email Layout Footer */}
                                    <div className="bg-gray-50 p-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t border-gray-100">
                                        © 2026 FreshFood Ecosystem. Tất cả quyền được bảo lưu.
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100 italic text-[11px] text-amber-700 font-medium">
                                <b>Lưu ý:</b> Hệ thống sẽ tự động bọc nội dung của bạn vào khung giao diện FreshFood trước khi gửi tới khách hàng.
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </AdminLayout>
    );
}
