import React, { useEffect } from 'react';
import Layout from '../../components/Layout';
import { useLocation } from 'react-router-dom';
import { 
    ShieldCheckIcon, 
    DocumentTextIcon, 
    InformationCircleIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Legal() {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const getContent = () => {
        switch (pathname) {
            case '/about':
                return {
                    title: 'Về chúng tôi',
                    subtitle: 'Câu chuyện về FreshFood Eco-System',
                    icon: <InformationCircleIcon className="w-12 h-12 text-green-600" />,
                    content: (
                        <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                            <p className="text-lg">FreshFood Eco-System không chỉ là một nền tảng thương mại điện tử. Chúng tôi là cầu nối trực tiếp giữa những người nông dân tâm huyết và bàn ăn của mọi gia đình Việt.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">Sứ mệnh của chúng tôi</h3>
                            <p>Chúng tôi cam kết mang đến những sản phẩm nông sản sạch, có nguồn gốc rõ ràng, được kiểm chứng bằng công nghệ AI và quy trình kiểm định nghiêm ngặt. FreshFood hướng tới một nền nông nghiệp bền vững, nơi giá trị của sự tử tế được lan tỏa.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">Giá trị cốt lõi</h3>
                            <ul className="list-disc pl-6 space-y-3">
                                <li><b>Minh bạch:</b> Mọi sản phẩm đều có thể truy xuất nguồn gốc trang trại.</li>
                                <li><b>Chất lượng:</b> Kiểm định khắt khe bằng công nghệ hiện đại.</li>
                                <li><b>Bền vững:</b> Hỗ trợ nông dân và bảo vệ môi trường.</li>
                            </ul>
                        </div>
                    )
                };
            case '/privacy':
                return {
                    title: 'Chính sách bảo mật',
                    subtitle: 'Bảo vệ quyền lợi và dữ liệu người dùng',
                    icon: <ShieldCheckIcon className="w-12 h-12 text-blue-600" />,
                    content: (
                        <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                            <p>Tại FreshFood, sự riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Chúng tôi chỉ thu thập các thông tin cần thiết để xử lý đơn hàng và cải thiện trải nghiệm mua sắm của bạn.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">Thông tin chúng tôi thu thập</h3>
                            <p>Thông tin cá nhân: Tên, địa chỉ, số điện thoại, email phục vụ việc giao hàng và thông báo trạng thái đơn hàng.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">Cam kết bảo mật</h3>
                            <p>Dữ liệu của bạn được mã hóa và bảo vệ bằng các lớp bảo mật tiên tiến nhất. Chúng tôi tuyệt đối không chia sẻ thông tin của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.</p>
                        </div>
                    )
                };
            case '/terms':
                return {
                    title: 'Điều khoản sử dụng',
                    subtitle: 'Quy định và cam kết khi mua hàng tại FreshFood',
                    icon: <DocumentTextIcon className="w-12 h-12 text-purple-600" />,
                    content: (
                        <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                            <h3 className="text-xl font-bold text-gray-900">1. Chấp nhận điều khoản</h3>
                            <p>Bằng việc truy cập và sử dụng dịch vụ tại FreshFood, bạn đồng ý tuân thủ các quy định về mua hàng, thanh toán và đổi trả được niêm yết công khai trên hệ thống.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">2. Trách nhiệm người dùng</h3>
                            <p>Người dùng có trách nhiệm bảo mật tài khoản và cung cấp thông tin giao hàng chính xác để đảm bảo quyền lợi khi xảy ra sự cố.</p>
                            <h3 className="text-xl font-bold text-gray-900 mt-8">3. Quy định thanh toán</h3>
                            <p>FreshFood hỗ trợ các hình thức thanh toán COD, Chuyển khoản qua SePay. Mọi giao dịch đều được ghi nhận và có hóa đơn điện tử đi kèm.</p>
                        </div>
                    )
                };
            case '/cookies':
                return {
                    title: 'Chính sách Cookie',
                    subtitle: 'Tối ưu hóa trải nghiệm lướt web của bạn',
                    icon: <InformationCircleIcon className="w-12 h-12 text-orange-600" />,
                    content: (
                        <div className="space-y-6 text-gray-600 leading-relaxed font-medium">
                            <p>Cookie giúp chúng tôi hiểu rõ hơn nhu cầu của bạn, từ đó gợi ý các sản phẩm phù hợp hơn.</p>
                            <h3 className="text-xl font-bold text-gray-900">Chúng tôi dùng Cookie làm gì?</h3>
                            <p>- Ghi nhớ trạng thái đăng nhập và giỏ hàng của bạn.</p>
                            <p>- Phân tích hành vi duyệt web để cải thiện giao diện hệ thống.</p>
                            <p>- Gợi ý các mã giảm giá cá nhân hóa dựa trên lịch sử xem hàng.</p>
                        </div>
                    )
                };
            default:
                return { title: 'Legal', subtitle: '', icon: null, content: null };
        }
    };

    const data = getContent();

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-16 px-4">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 font-black uppercase text-[10px] tracking-widest mb-10 transition-all group">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Quay lại trang chủ
                </Link>

                <div className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
                    {/* Header Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                    
                    <div className="p-12 md:p-20 relative z-10">
                        <div className="mb-12">
                            <div className="mb-6">{data.icon}</div>
                            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4 italic uppercase">{data.title}</h1>
                            <p className="text-xl text-gray-400 font-bold uppercase tracking-widest italic">{data.subtitle}</p>
                        </div>

                        <div className="prose prose-lg max-w-none">
                            {data.content}
                        </div>

                        <div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center italic">
                            <p className="text-gray-400 text-sm font-medium">Cập nhật lần cuối: 26/03/2026</p>
                            <div className="flex gap-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
