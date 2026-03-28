import React from 'react';
import Layout from '../../components/Layout';
import { 
    ShoppingBagIcon, 
    UserPlusIcon, 
    CursorArrowRaysIcon, 
    CreditCardIcon, 
    TruckIcon, 
    CheckBadgeIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const steps = [
    {
        title: 'Tạo tài khoản',
        description: 'Đăng ký nhanh chóng bằng Email để tận hưởng ưu đãi VIP và tích lũy điểm thưởng từ đơn hàng đầu tiên.',
        icon: UserPlusIcon,
        color: 'blue'
    },
    {
        title: 'Tìm kiếm sản phẩm',
        description: 'Sử dụng thanh tìm kiếm hoặc bộ lọc theo danh mục, nông trại để tìm thấy thực phẩm sạch ưng ý nhất.',
        icon: CursorArrowRaysIcon,
        color: 'green'
    },
    {
        title: 'Thêm vào giỏ hàng',
        description: 'Chọn số lượng và nhấn "Thêm vào giỏ". Bạn có thể xem lại và điều chỉnh giỏ hàng bất cứ lúc nào.',
        icon: ShoppingBagIcon,
        color: 'orange'
    },
    {
        title: 'Thanh toán an toàn',
        description: 'Chọn hình thức COD hoặc chuyển mã QR SePay tự động. Thông tin của bạn luôn được bảo mật tuyệt đối.',
        icon: CreditCardIcon,
        color: 'purple'
    },
    {
        title: 'Xác nhận & Giao hàng',
        description: 'Hệ thống sẽ gửi thông báo xác nhận. Nông sản tươi sẽ được đóng gói và giao đến bạn trong 2h-24h.',
        icon: TruckIcon,
        color: 'emerald'
    },
    {
        title: 'Nhận hàng & Đánh giá',
        description: 'Kiểm tra hàng và nhấn xác nhận. Đừng quên gửi đánh giá để nhận thêm điểm thưởng mua sắm.',
        icon: CheckBadgeIcon,
        color: 'yellow'
    }
];

export default function BuyingGuide() {
    return (
        <Layout title="Hướng dẫn mua hàng | FreshFood">
            <div className="bg-white min-h-screen">
                {/* Hero section */}
                <section className="relative py-20 overflow-hidden bg-gray-50">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    </div>
                    
                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                        <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">Trợ giúp khách hàng</span>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tighter">
                            Mua sắm thực phẩm sạch <br/>
                            <span className="text-green-600">thật dễ dàng tại FreshFood</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10">
                            Chỉ với vài bước đơn giản, bạn đã có thể mang cả nông trại tươi sạch về gian bếp nhà mình. 
                            Hãy theo dõi hướng dẫn chi tiết bên dưới nhé!
                        </p>
                    </div>
                </section>

                {/* Steps Section */}
                <section className="py-24 container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 relative">
                        {/* Decorative line for desktop */}
                        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                        
                        {steps.map((step, idx) => (
                            <div key={idx} className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative">
                                <div className="absolute -top-6 -left-6 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-xl italic shadow-xl z-20 group-hover:scale-110 transition-transform">
                                    0{idx + 1}
                                </div>
                                <div className={`w-20 h-20 rounded-[2rem] mb-8 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500
                                    ${step.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                                      step.color === 'green' ? 'bg-green-50 text-green-600' : 
                                      step.color === 'orange' ? 'bg-orange-50 text-orange-600' : 
                                      step.color === 'purple' ? 'bg-purple-50 text-purple-600' : 
                                      step.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                                      'bg-yellow-50 text-yellow-600'}`}>
                                    <step.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed italic text-sm">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQs Call to Action */}
                <section className="py-20 bg-black text-white text-center">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-4xl font-black mb-6 tracking-tight">Vẫn còn thắc mắc?</h2>
                        <p className="text-gray-400 text-lg mb-10 italic">
                            Nếu bạn gặp bất kỳ khó khăn nào trong quá trình đặt hàng, 
                            đội ngũ hỗ trợ của FreshFood luôn sẵn lòng giúp đỡ bạn 24/7.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link to="/contact" className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-600 hover:text-white transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3">
                                <ArrowRightIcon className="w-4 h-4" />
                                LIÊN HỆ NGAY
                            </Link>
                            <Link to="/faq" className="px-10 py-5 border-2 border-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                                XEM CÂU HỎI THƯỜNG GẶP
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-24 container mx-auto px-4">
                    <div className="bg-green-50 rounded-[4rem] p-12 md:p-20 overflow-hidden relative">
                        <div className="flex flex-col md:flex-row items-center gap-16 relative z-10">
                            <div className="flex-1">
                                <h2 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter italic">Tại sao nên chọn FreshFood?</h2>
                                <ul className="space-y-6">
                                    {[
                                        'Hợp tác trực tiếp với các nông trại đạt chuẩn VietGAP & GlobalGAP.',
                                        'Giao hàng hỏa tốc trong khu vực nội thành, đảm bảo tươi ngon.',
                                        'Chính sách đổi trả minh bạch nếu sản phẩm không đúng cam kết.',
                                        'Hệ thống tích điểm cực lớn cho mọi đơn hàng khách hàng thực hiện.'
                                    ].map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="mt-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-700 font-bold">{benefit}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 w-full flex justify-center">
                                <div className="w-72 h-72 bg-white rounded-full shadow-2xl flex items-center justify-center animate-bounce duration-[3000ms]">
                                    <ShoppingBagIcon className="w-32 h-32 text-green-600" />
                                </div>
                            </div>
                        </div>
                        {/* Decorative background shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full -mr-32 -mt-32 mix-blend-multiply blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full -ml-32 -mb-32 mix-blend-multiply blur-2xl"></div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
