import { useState } from 'react';
import Layout from '../../components/Layout';
import { 
    PhoneIcon, 
    EnvelopeIcon, 
    MapPinIcon, 
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { contactService } from '../../api/services';

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        subject: 'Hỗ trợ đơn hàng',
        content: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactService.send(form);
            toast.success('Cảm ơn bạn! Chúng tôi đã nhận được lời nhắn.');
            setForm({
                name: '',
                email: '',
                subject: 'Hỗ trợ đơn hàng',
                content: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto py-20 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Info Side */}
                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                                </div>
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">Liên hệ</h1>
                            </div>
                            <p className="text-xl text-gray-500 font-medium">Chúng tôi luôn lắng nghe và sẵn sàng hỗ trợ bạn bất cứ lúc nào.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-center text-green-600 shadow-xl shadow-gray-100 group-hover:scale-110 transition-transform">
                                    <PhoneIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Điện thoại hỗ trợ</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none tracking-tight">1900 6868</p>
                                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">Hỗ trợ tất cả các ngày trong tuần</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-center text-blue-500 shadow-xl shadow-gray-100 group-hover:scale-110 transition-transform">
                                    <EnvelopeIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email liên hệ</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none tracking-tight">support@freshfood.vn</p>
                                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-tighter italic">Vui lòng đính kèm mã đơn hàng (nếu có)</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start group">
                                <div className="w-14 h-14 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-center text-orange-500 shadow-xl shadow-gray-100 group-hover:scale-110 transition-transform">
                                    <MapPinIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Văn phòng chính</p>
                                    <p className="text-2xl font-black text-gray-900 leading-none tracking-tight">Tòa nhà FreshFood</p>
                                    <p className="text-sm text-gray-500 mt-2 font-bold uppercase tracking-tighter">Số 1 Trịnh Văn Bô, Nam Từ Liêm, Hà Nội</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-green-900 rounded-[2.5rem] text-white relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-colors"></div>
                           <h3 className="text-xl font-black uppercase mb-4 tracking-tight">Trở thành đối tác?</h3>
                           <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">Nếu bạn là chủ trang trại hữu cơ và muốn đưa sản phẩm của mình lên FreshFood, đừng ngần ngại gửi thư cho chúng tôi.</p>
                           <button className="px-6 py-3 bg-green-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-500 transition-all shadow-xl shadow-green-900/20">Kết nối ngay</button>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.05)] p-10 md:p-14 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-green-50 rounded-full -ml-32 -mt-32 blur-3xl opacity-50"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-gray-900 italic uppercase mb-10 tracking-tight leading-none">Gửi lời nhắn <span className="text-green-600">tới chúng tôi</span></h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
                                        <input 
                                            required 
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm text-gray-800 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all" 
                                            placeholder="Nguyễn Văn A" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email của bạn</label>
                                        <input 
                                            required 
                                            type="email" 
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm text-gray-800 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all" 
                                            placeholder="email@example.com" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chủ đề</label>
                                    <select 
                                        value={form.subject}
                                        onChange={(e) => setForm({...form, subject: e.target.value})}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-sm text-gray-800 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option>Hỗ trợ đơn hàng</option>
                                        <option>Hợp tác trang trại</option>
                                        <option>Góp ý dịch vụ</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nội dung</label>
                                    <textarea 
                                        required 
                                        rows="5" 
                                        value={form.content}
                                        onChange={(e) => setForm({...form, content: e.target.value})}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl px-5 py-4 font-bold text-sm text-gray-800 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all resize-none" 
                                        placeholder="Hãy cho chúng tôi biết bạn đang cần giúp đỡ điều gì..."
                                    ></textarea>
                                </div>
                                <button 
                                    disabled={loading}
                                    className="w-full py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-2xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none"
                                >
                                    {loading ? 'Đang gửi...' : (
                                        <>
                                            <PaperAirplaneIcon className="w-5 h-5 -rotate-12" />
                                            Gửi tin nhắn ngay
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
