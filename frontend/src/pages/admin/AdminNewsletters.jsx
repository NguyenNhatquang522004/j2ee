import { useState, useEffect } from 'react';
import { newsletterService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    EnvelopeIcon, 
    UserGroupIcon, 
    PaperAirplaneIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminNewsletters() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'send'

    const [newsletterContent, setNewsletterContent] = useState({
        subject: 'Chào mừng bạn đến với Bản tin FreshFood Ecosystem 🌿',
        content: `<h3>Xin chào các khách hàng thân mến!</h3>
        <p>Chúng tôi rất vui mừng thông báo những cập nhật mới nhất từ FreshFood:</p>
        <ul>
            <li><strong>Sản phẩm mới:</strong> Các loại rau củ hữu cơ vừa được thu hoạch sáng nay!</li>
            <li><strong>Ưu đãi:</strong> Nhập mã <b>FRESH2026</b> để được giảm ngay 10% đơn hàng.</li>
        </ul>
        <p>Chúc bạn một ngày tràn đầy năng lượng và sức khỏe!</p>`
    });

    const loadSubscribers = async () => {
        setLoading(true);
        try {
            const res = await newsletterService.getAll();
            setSubscribers(res.data || []);
        } catch (err) {
            toast.error('Không thể tải danh sách người đăng ký');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscribers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa người đăng ký này?')) return;
        try {
            await newsletterService.delete(id);
            toast.success('Đã xóa thành công');
            loadSubscribers();
        } catch (err) {
            toast.error('Lỗi khi xóa');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newsletterContent.subject || !newsletterContent.content) {
            toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
            return;
        }

        setSending(true);
        try {
            await newsletterService.send(newsletterContent);
            toast.success('Bản tin đang được gửi tới hàng đợi hệ thống!');
            setNewsletterContent({ subject: '', content: '' });
            setActiveTab('list');
        } catch (err) {
            toast.error('Lỗi khi gửi bản tin');
        } finally {
            setSending(false);
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quản lý Bản tin</h1>
                    <p className="text-gray-500 font-medium">Giao diện quản trị và gửi nội dung tới khách hàng.</p>
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
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                                <UserGroupIcon className="w-6 h-6" />
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
                                    <th className="px-8 py-5 text-left">Email người nhận</th>
                                    <th className="px-8 py-5 text-left">Trạng thái</th>
                                    <th className="px-8 py-5 text-left">Ngày tham gia</th>
                                    <th className="px-8 py-5 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {subscribers.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-5 font-bold text-gray-700">{sub.email}</td>
                                        <td className="px-8 py-5">
                                            {sub.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 uppercase italic">
                                                    <CheckCircleIcon className="w-3 h-3" /> Đang nhận tin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase italic">
                                                    <XCircleIcon className="w-3 h-3" /> Đã hủy
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
            ) : (
                <div className="grid lg:grid-cols-5 gap-8">
                    <form onSubmit={handleSend} className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
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
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-green-600 rounded-3xl px-8 py-5 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300"
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
                                    className="w-full bg-gray-50/50 border-2 border-transparent focus:border-green-600 rounded-[2.5rem] px-8 py-6 font-bold text-gray-700 outline-none transition-all placeholder:text-gray-300 resize-none leading-relaxed"
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full bg-black hover:bg-green-600 text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 transition-all uppercase tracking-widest disabled:opacity-50 active:scale-95"
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
                    </form>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
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

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm sticky top-10">
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] mb-6 italic flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                Chế độ xem trước (Actual Email Layout)
                            </h4>
                            <div className="bg-gray-100 rounded-3xl p-4 overflow-hidden shadow-inner">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden scale-[0.85] origin-top -mb-20">
                                    {/* Mock Email Layout Header */}
                                    <div className="bg-[#1a3c31] text-white p-6 text-center font-black uppercase italic tracking-widest text-lg">
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
            )}
        </AdminLayout>
    );
}
