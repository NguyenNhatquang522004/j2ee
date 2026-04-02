import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
    ShoppingBagIcon, 
    UserPlusIcon, 
    CursorArrowRaysIcon, 
    CreditCardIcon, 
    TruckIcon, 
    CheckBadgeIcon,
    ArrowTopRightOnSquareIcon,
    HomeModernIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const steps = [
    {
        title: 'Tạo tài khoản',
        description: 'Khách hàng đăng ký bằng Email để nhận ưu đãi VIP và tích lũy điểm thưởng.',
        icon: UserPlusIcon,
        color: 'blue'
    },
    {
        title: 'Tìm kiếm sản phẩm',
        description: 'Duyệt qua danh mục hoặc tìm kiếm theo tên, nông trại cung cấp.',
        icon: CursorArrowRaysIcon,
        color: 'green'
    },
    {
        title: 'Thêm vào giỏ hàng',
        description: 'Chọn số lượng và thêm vào giỏ. Hỗ trợ so sánh giá giữa các nông sản.',
        icon: ShoppingBagIcon,
        color: 'orange'
    },
    {
        title: 'Thanh toán an toàn',
        description: 'Hỗ trợ COD, Chuyển khoản QR SePay (tự động) và các ví điện tử.',
        icon: CreditCardIcon,
        color: 'purple'
    },
    {
        title: 'Xác nhận & Giao hàng',
        description: 'Admin xác nhận đơn, kho đóng gói và giao hàng trong 2h-24h.',
        icon: TruckIcon,
        color: 'emerald'
    },
    {
        title: 'Nhận hàng & Đánh giá',
        description: 'Khách hàng xác nhận nhận hàng và để lại đánh giá chất lượng.',
        icon: CheckBadgeIcon,
        color: 'yellow'
    }
];

export default function AdminBuyingGuide() {
    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic uppercase">Hướng dẫn mua hàng</h1>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">Quy trình vận hành từ lúc đặt hàng đến khi nhận hàng thành công.</p>
                </div>
                <Link 
                    to="/buying-guide" 
                    target="_blank"
                    className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-green-700 transition-all active:scale-95"
                >
                    <span>Xem bản Công khai</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Process Steps */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-sm p-8 space-y-8">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                        Quy trình 6 bước chuẩn
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="bg-gray-50/50 border border-gray-100 p-6 rounded-2xl group hover:bg-white hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300">
                                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center
                                    ${step.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
                                      step.color === 'green' ? 'bg-green-100 text-green-600' : 
                                      step.color === 'orange' ? 'bg-orange-100 text-orange-600' : 
                                      step.color === 'purple' ? 'bg-purple-100 text-purple-600' : 
                                      step.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                                      'bg-yellow-100 text-yellow-600'}`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-black text-gray-900 mb-2 leading-tight">
                                    <span className="text-gray-300 mr-2">0{idx + 1}</span>
                                    {step.title}
                                </h3>
                                <p className="text-[11px] text-gray-500 font-bold leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Farm Connection & Assurance */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-[#1a3c31] to-[#0d1f19] text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                <HomeModernIcon className="w-8 h-8 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-3 tracking-tight italic uppercase">Kết nối Nông trại</h3>
                                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                    FreshFood làm việc trực tiếp với hơn 50 nông trại đạt chuẩn VietGAP & GlobalGAP trên toàn quốc. 
                                    Mọi sản phẩm đều có mã lô hàng (Batch Code) để truy xuất nguồn gốc.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-2xl font-black text-green-400">100%</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Sạch & Tươi</p>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                    <p className="text-2xl font-black text-blue-400">24/7</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Giao hàng hỏa tốc</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                            Cam kết Chất lượng
                        </h3>
                        <div className="space-y-4">
                            {[
                                'Kiểm định đầu vào nghiêm ngặt từ các nông trại.',
                                'Bảo quản trong hệ thống kho lạnh chuyên dụng.',
                                'Giao hàng bằng thùng chuyên dụng giữ nhiệt.',
                                'Chính sách đổi trả 100% nếu sản phẩm lỗi từ nhà cung cấp.'
                            ].map((text, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 italic">"{text}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
