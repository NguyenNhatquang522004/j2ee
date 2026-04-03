import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { contactService } from '../../api/services';
import toast from 'react-hot-toast';
import { 
    ChatBubbleLeftRightIcon, 
    TrashIcon, 
    EnvelopeIcon, 
    EyeIcon,
    CheckCircleIcon,
    ClockIcon,
    InboxIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';

export default function AdminContact() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await contactService.getAll();
            setMessages(res.data.content || res.data);
        } catch (error) {
            toast.error('Không thể tải danh sách lời nhắn');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await contactService.markAsRead(id);
            setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
            if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, read: true });
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id) => {
        const ok = await confirm({
            title: 'Xóa lời nhắn',
            message: 'Bạn có chắc chắn muốn xóa vĩnh viễn lời nhắn này? Hành động này sẽ loại bỏ thông tin khách hàng khỏi hộp thư quản trị.',
            type: 'danger'
        });
        if (!ok) return;
        try {
            await contactService.delete(id);
            setMessages(messages.filter(m => m.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
            toast.success('Đã xoá tin nhắn');
        } catch (error) {
            toast.error('Không thể xoá tin nhắn');
        }
    };

    const [search, setSearch] = useState('');

    const filteredMessages = messages.filter(m => {
        const s = search.toLowerCase();
        return (m.name || '').toLowerCase().includes(s) ||
               (m.email || '').toLowerCase().includes(s) ||
               (m.subject || '').toLowerCase().includes(s) ||
               (m.content || '').toLowerCase().includes(s);
    });

    return (
        <AdminLayout title="Hộp thư FRESHFOOD | Admin">
            <div className="space-y-8 animate-fade-in pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-4">
                            <div className="w-2.5 h-10 bg-emerald-600 rounded-full"></div>
                            Hộp thư <span className="text-emerald-600">FRESHFOOD</span>
                        </h2>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Theo dõi và phản hồi ý kiến khách hàng từ cộng đồng.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-full sm:w-64 group">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm theo tên, email, nội dung..."
                                className="w-full pl-5 pr-5 py-2.5 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <InboxIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Tổng tin</p>
                                <p className="text-lg font-black text-gray-900 mt-1">{filteredMessages.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* List Side */}
                    <div className="lg:col-span-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 py-16 text-center">
                                <EnvelopeIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Không tìm thấy thư</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1.5 custom-scrollbar">
                                {filteredMessages.map(msg => (
                                    <div 
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (!msg.read) handleMarkAsRead(msg.id);
                                        }}
                                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                                            selectedMessage?.id === msg.id 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/10' 
                                            : msg.read 
                                                ? 'bg-white border-gray-100 hover:border-blue-100' 
                                                : 'bg-blue-50/50 border-blue-200 shadow-sm'
                                        }`}
                                    >
                                        {!msg.read && (
                                            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden ${
                                                selectedMessage?.id === msg.id ? 'bg-white/20' : 'bg-gray-50'
                                            }`}>
                                                <UserIconPlaceholder name={msg.name} avatarUrl={msg.userAvatarUrl || msg.avatarUrl || msg.user?.avatarUrl} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-black truncate uppercase text-xs tracking-tighter ${selectedMessage?.id === msg.id ? 'text-white' : 'text-gray-900'}`}>{msg.name}</h4>
                                                <p className={`text-[9px] font-bold truncate ${selectedMessage?.id === msg.id ? 'text-blue-100' : 'text-gray-400'}`}>{msg.subject}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detail Side */}
                    <div className="lg:col-span-8">
                        {selectedMessage ? (
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden sticky top-24">
                                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 overflow-hidden">
                                                <UserIconPlaceholder name={selectedMessage.name} avatarUrl={selectedMessage.userAvatarUrl || selectedMessage.avatarUrl || selectedMessage.user?.avatarUrl} size="lg" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase italic truncate max-w-[200px] md:max-w-md">{selectedMessage.subject}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                        {selectedMessage.read ? 'Đã đọc' : 'Mới'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                                                        <ClockIcon className="w-3 h-3" />
                                                        {new Date(selectedMessage.createdAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleDelete(selectedMessage.id)}
                                                className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Người gửi</p>
                                            <p className="text-sm font-black text-gray-900 italic truncate">{selectedMessage.name}</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-1 overflow-hidden">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ Email</p>
                                            <a href={`mailto:${selectedMessage.email}`} className="text-sm font-black text-blue-600 hover:underline break-all block truncate">{selectedMessage.email}</a>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-3">Nội dung tin nhắn</p>
                                        <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 italic text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                                            {selectedMessage.content}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                                        <a 
                                            href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                            className="px-6 py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                        >
                                            <PaperAirplaneIcon className="w-4 h-4 -rotate-12" />
                                            Phản hồi qua Email
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-center px-8">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-gray-200 mb-6">
                                    <ChatBubbleLeftRightIcon className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-black text-gray-400 uppercase tracking-tighter italic">Chọn một tin nhắn</h3>
                                <p className="text-xs text-gray-300 font-medium mt-1.5 max-w-xs">Phản hồi nhanh chóng ý kiến từ khách hàng.</p>
                            </div>
                        ) || ''}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function UserIconPlaceholder({ name, avatarUrl, size = 'sm' }) {
    if (avatarUrl) {
        return <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />;
    }
    const initial = name?.charAt(0).toUpperCase() || '?';
    return <span className={`${size === 'lg' ? 'text-xl' : 'text-lg'} font-black italic text-blue-600`}>{initial}</span>;
}
