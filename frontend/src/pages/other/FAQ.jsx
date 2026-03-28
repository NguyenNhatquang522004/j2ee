import { useState } from 'react';
import Layout from '../../components/Layout';
import { 
    QuestionMarkCircleIcon, 
    ChevronDownIcon,
    MagnifyingGlassIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        category: 'Thanh toán & Giao hàng',
        questions: [
            {
                q: 'FreshFood có hỗ trợ thanh toán khi nhận hàng (COD) không?',
                a: 'Có, chúng tôi hỗ trợ COD cho mọi đơn hàng nội thành. Ngoài ra bạn có thể thanh toán qua Chuyển khoản ngân hàng (VietQR) để được xử lý nhanh hơn.'
            },
            {
                q: 'Thời gian giao hàng mất bao lâu?',
                a: 'Đối với khu vực nội thành Hà Nội, chúng tôi cam kết giao trong vòng 2-4 tiếng. Các khu vực khác sẽ mất từ 1-2 ngày làm việc.'
            },
            {
                q: 'Phí vận chuyển được tính như thế nào?',
                a: 'Phí vận chuyển mặc định là 25.000đ. Với đơn hàng trên 500.000đ, chúng tôi sẽ miễn phí vận chuyển hoàn toàn.'
            }
        ]
    },
    {
        category: 'Sản phẩm & Chất lượng',
        questions: [
            {
                q: 'Làm sao để biết sản phẩm là hữu cơ thật sự?',
                a: 'Mỗi sản phẩm trên FreshFood đều có mã truy xuất nguồn gốc từ trang trại đối tác. Bạn có thể sử dụng tính năng AI Scan trên ứng dụng để kiểm tra độ tươi và thông tin chứng chỉ của sản phẩm.'
            },
            {
                q: 'Tôi có thể đổi trả hàng không?',
                a: 'Đối với thực phẩm tươi sống, chúng tôi hỗ trợ đổi trả hoặc hoàn tiền 100% trong vòng 24h nếu sản phẩm không đảm bảo chất lượng như mô tả.'
            }
        ]
    },
    {
        category: 'Tài khoản & Ưu đãi',
        questions: [
            {
                q: 'Làm thế nào để nhận mã giảm giá?',
                a: 'Bạn có thể theo dõi trang "Khuyến mãi" hoặc đăng ký nhận Bản tin (Newsletter) để nhận các voucher độc quyền định kỳ.'
            },
            {
                q: 'Tại sao tôi không đăng nhập được mặc dù đúng mật khẩu?',
                a: 'Có thể tài khoản của bạn đang yêu cầu Xác thực 2 lớp (2FA). Vui lòng kiểm tra ứng dụng Authenticator hoặc Email để lấy mã OTP.'
            }
        ]
    }
];

export default function FAQ() {
    const [searchTerm, setSearchTerm] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    const filteredFaqs = FAQS.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q => 
            q.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
            q.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-20 px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-green-100">
                        <QuestionMarkCircleIcon className="w-4 h-4" />
                        Trung tâm hỗ trợ
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-6">Câu hỏi <span className="text-green-600">thường gặp</span></h1>
                    <p className="text-lg text-gray-400 font-medium max-w-lg mx-auto leading-relaxed">Mọi giải đáp bạn cần đều nằm ở đây. Nếu vẫn còn thắc mắc, đừng ngần ngại <Link to="/contact" className="text-green-600 font-bold hover:underline">liên hệ</Link> với chúng tôi.</p>
                </div>

                <div className="relative mb-16">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm vấn đề bạn quan tâm..." 
                        className="w-full bg-white border border-gray-100 rounded-[2rem] px-14 py-5 font-bold text-gray-800 outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all shadow-xl shadow-gray-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>

                <div className="space-y-12">
                    {filteredFaqs.map((cat, catIdx) => (
                        <div key={catIdx}>
                            <div className="flex items-center gap-3 mb-6 pl-4">
                                <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{cat.category}</h2>
                            </div>
                            
                            <div className="space-y-4">
                                {cat.questions.map((item, qIdx) => {
                                    const globalIdx = `${catIdx}-${qIdx}`;
                                    const isOpen = openIndex === globalIdx;
                                    return (
                                        <div key={qIdx} className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isOpen ? 'border-green-500 ring-4 ring-green-500/5' : 'border-gray-50 hover:border-gray-200 shadow-sm'}`}>
                                            <button 
                                                onClick={() => toggle(globalIdx)}
                                                className="w-full px-8 py-5 flex items-center justify-between text-left group"
                                            >
                                                <span className={`text-base font-black transition-colors ${isOpen ? 'text-green-600' : 'text-gray-800'}`}>
                                                    {item.q}
                                                </span>
                                                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-green-600' : 'text-gray-300 group-hover:text-gray-500'}`} />
                                            </button>
                                            
                                            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="px-8 pb-6 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                           <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                           <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Không tìm thấy câu hỏi phù hợp với "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                <div className="mt-20 p-10 bg-green-600 rounded-[3rem] text-center text-white shadow-2xl shadow-green-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/30 transition-colors"></div>
                    <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">Vẫn còn thắc mắc?</h3>
                    <p className="text-green-100 mb-8 font-medium">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giải đáp mọi vấn đề của bạn.</p>
                    <Link to="/contact" className="inline-block px-10 py-4 bg-white text-green-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black hover:text-white transition-all">Gửi yêu cầu hỗ trợ ngay</Link>
                </div>
            </div>
        </Layout>
    );
}
