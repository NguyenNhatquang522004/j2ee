import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { 
    HeartIcon, 
    ShieldCheckIcon, 
    GlobeAltIcon, 
    UserGroupIcon,
    ArrowRightIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { farmService } from '../../api/services';

const stats = [
    { label: 'Nông trại đối tác', value: '50+' },
    { label: 'Khách hàng tin dùng', value: '10K+' },
    { label: 'Sản phẩm đạt chuẩn', value: '500+' },
    { label: 'Tỉ lệ hài lòng', value: '98%' }
];

export default function About() {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        farmService.getAll({ page: 0, size: 40 }).then(res => {
            const data = res.data?.content || res.data;
            setFarms(Array.isArray(data) ? data : []);
        }).catch(() => {
            setFarms([]);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    return (
        <Layout title="Về FreshFood | Hệ sinh thái nông sản sạch">
            <div className="bg-white">
                {/* Hero Section */}
                <section className="relative py-28 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 tracking-tighter italic">
                                Sứ mệnh <span className="text-green-600">FreshFood</span>
                            </h1>
                            <p className="text-2xl text-gray-600 font-medium leading-relaxed italic">
                                "Chúng tôi không chỉ bán nông sản, chúng tôi mang tới niềm tin 
                                về một cuộc sống khỏe mạnh và bền vững cho mọi gia đình Việt."
                            </p>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/50 -skew-x-12 translate-x-1/4 -z-10"></div>
                </section>

                {/* Our Story */}
                <section className="py-24 container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 relative">
                            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl skew-y-2 hover:skew-y-0 transition-transform duration-700">
                                <img 
                                    src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1000" 
                                    alt="Nông trại sạch" 
                                    className="w-full h-[600px] object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-400 rounded-[3rem] -z-10 animate-pulse"></div>
                        </div>
                        <div className="flex-1 space-y-8">
                            <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">Câu chuyện của chúng tôi</div>
                            <h2 className="text-5xl font-black text-gray-900 tracking-tight">Từ mảnh vườn nhỏ đến <br/><span className="text-green-600">hệ sinh thái nông nghiệp 4.0</span></h2>
                            <p className="text-gray-500 font-medium leading-relaxed italic text-lg">
                                Khởi đầu từ năm 2020, FreshFood ra đời với trăn trở về thực phẩm không rõ nguồn gốc 
                                đang tràn lan trên thị trường. Chúng tôi đã đi khắp các vùng miền, từ những cánh đồng rau 
                                Đà Lạt đến những vườn trái cây miền Tây, để kết nối những người nông dân tâm huyết 
                                với bàn ăn của mỗi gia đình.
                            </p>
                            <p className="text-gray-500 font-medium leading-relaxed italic">
                                Ngày nay, FreshFood tự hào là nền tảng tiên phong ứng dụng công nghệ AI để kiểm soát chất lượng 
                                và minh bạch hóa quy trình cung ứng nông sản tại Việt Nam.
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-8">
                                {stats.map((stat, i) => (
                                    <div key={i} className="border-l-4 border-green-600 pl-6">
                                        <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-24 bg-black text-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-4xl font-black mb-6 tracking-tight">Giá trị cốt lõi</h2>
                            <p className="text-gray-400 font-medium italic">
                                Đặt sự tử tế và trách nhiệm lên hàng đầu trong mọi hoạt động kinh doanh.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {[
                                { title: 'Chất lượng tuyệt đối', desc: 'Mọi sản phẩm đều được kiểm định nghiêm ngặt qua 3 giai đoạn trước khi tới tay khách hàng.', icon: ShieldCheckIcon },
                                { title: 'Cộng đồng bền vững', desc: 'Hỗ trợ nông dân áp dụng công nghệ xanh, đảm bảo thu nhập công bằng và ổn định.', icon: UserGroupIcon },
                                { title: 'Thân thiện môi trường', desc: 'Sử dụng bao bì tái chế và tối ưu quy trình vận chuyển để giảm thiểu rác thải nhựa.', icon: GlobeAltIcon }
                            ].map((v, i) => (
                                <div key={i} className="p-10 border border-white/10 rounded-[3rem] hover:bg-white hover:text-black transition-all duration-500 group">
                                    <v.icon className="w-12 h-12 text-green-500 mb-8 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{v.title}</h3>
                                    <p className="text-gray-400 group-hover:text-gray-600 font-medium leading-relaxed italic">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Real Farms from System */}
                <section className="py-24 container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black text-gray-900 mb-16 tracking-tight uppercase italic">Đồng hành cùng <span className="text-green-600">FreshFood</span></h2>
                    
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : farms.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {farms.map((farm, i) => (
                                <Link key={farm.id} to={`/products?farmId=${farm.id}`} className="group">
                                    <div className="relative overflow-hidden rounded-[2.5rem] mb-6 shadow-xl aspect-square">
                                        {farm.imageUrl ? (
                                            <img src={farm.imageUrl} alt={farm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-green-50 flex items-center justify-center text-green-600">
                                                <GlobeAltIcon className="w-20 h-20 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-white">
                                            <MapPinIcon className="w-10 h-10 mb-4" />
                                            <p className="text-xs font-black uppercase tracking-widest text-center">{farm.address}</p>
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-black text-gray-900 group-hover:text-green-600 transition-colors">{farm.name}</h4>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">Đối tác chính thức</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-bold uppercase tracking-widest italic">Đang cập nhật danh sách trang trại đối tác...</p>
                        </div>
                    )}
                </section>

                {/* CTA */}
                <section className="py-20 bg-green-600">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-white max-w-2xl">
                            <h2 className="text-5xl font-black tracking-tighter italic mb-4">Trở thành một phần của FreshFood</h2>
                            <p className="text-green-100 font-bold text-lg italic">Khám phá thế giới nông sản sạch và bắt đầu hành trình ăn uống khỏe mạnh ngay hôm nay.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link to="/products" className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 shadow-2xl flex items-center gap-3">
                                MUA SẮM NGAY
                                <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
