import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService, wishlistService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Layout from '../../components/Layout';
import { 
    SparklesIcon, 
    TruckIcon, 
    ShieldCheckIcon, 
    BeakerIcon,
    HeartIcon,
    ShoppingBagIcon,
    ArrowRightIcon,
    TagIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid';

export default function Home() {
    const [topProducts, setTopProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([productService.topSelling(), categoryService.getAll()])
            .then(([pRes, cRes]) => {
                const products = pRes?.data?.content || pRes?.data || [];
                setTopProducts(Array.isArray(products) ? products.slice(0, 8) : []);
                const cats = cRes?.data || [];
                setCategories(Array.isArray(cats) ? cats.slice(0, 6) : []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <Layout>
            {/* Hero */}
            <section
                className="rounded-[2.5rem] text-white text-center py-20 px-4 mb-12 shadow-2xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
            >
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <CubeIcon className="w-64 h-64 rotate-12" />
                </div>
                <h1 className="text-5xl font-black mb-6 tracking-tight">Thực Phẩm Sạch <br/><span className="text-green-300 italic">Tươi Ngon Mỗi Ngày</span></h1>
                <p className="text-lg text-green-50/80 mb-10 max-w-2xl mx-auto font-medium">
                    Hỗ trợ nông dân, bảo vệ sức khỏe gia đình bạn với các sản phẩm nông sản hữu cơ đạt chuẩn quốc tế.
                </p>
                <div className="flex justify-center gap-6">
                    <Link to="/products" className="bg-white font-bold px-10 py-4 rounded-full text-green-900 hover:bg-green-50 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
                        Mua ngay <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                    <Link to="/ai-scan" className="backdrop-blur-md bg-white/10 border-2 border-white/20 font-bold px-10 py-4 rounded-full text-white hover:bg-white/20 transition-all flex items-center gap-2">
                        <BeakerIcon className="w-5 h-5" /> Kiểm tra AI
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {[
                    { icon: <SparklesIcon className="w-10 h-10" />, title: 'Hữu cơ 100%', desc: 'Sản phẩm được chứng nhận hữu cơ, không thuốc trừ sâu', color: 'bg-emerald-50 text-emerald-600' },
                    { icon: <TruckIcon className="w-10 h-10" />, title: 'Giao hàng nhanh', desc: 'Giao hàng trong ngày, đảm bảo độ tươi của sản phẩm', color: 'bg-blue-50 text-blue-600' },
                    { icon: <ShieldCheckIcon className="w-10 h-10" />, title: 'Đảm bảo chất lượng', desc: 'Hoàn tiền 100% nếu sản phẩm không đạt chất lượng', color: 'bg-amber-50 text-amber-600' },
                ].map((f) => (
                    <div key={f.title} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${f.color}`}>
                            {f.icon}
                        </div>
                        <h3 className="font-black text-gray-800 text-xl mb-3 tracking-tight">{f.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Danh mục</h2>
                        <div className="h-px flex-1 bg-gray-100"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?categoryId=${cat.id}`}
                                className="bg-white p-6 text-center rounded-3xl border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all group"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                    {cat.imageUrl ? (
                                        <img src={cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <TagIcon className="w-8 h-8 text-gray-300 group-hover:text-green-500 transition-colors" />
                                    )}
                                </div>
                                <p className="font-bold text-sm text-gray-700 group-hover:text-green-700 tracking-tight">{cat.name}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Top products */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Sản phẩm bán chạy</h2>
                    <Link to="/products" className="group flex items-center gap-2 text-green-700 font-bold hover:gap-4 transition-all">
                        Xem tất cả <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
                {loading ? (
                    <div className="text-center py-20 text-gray-400 font-medium">Đang chuẩn bị sản phẩm...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {topProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    );
}

function ProductCard({ product }) {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (user && product.id) {
            wishlistService.check(product.id).then(res => setIsLiked(res.data)).catch(() => { });
        }
    }, [user, product.id]);

    const toggleWishlist = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Vui lòng đăng nhập để yêu thích'); return; }
        try {
            if (isLiked) {
                await wishlistService.remove(product.id);
                toast.success('Đã xoá khỏi yêu thích');
            } else {
                await wishlistService.add(product.id);
                toast.success('Đã chọn yêu thích');
            }
            setIsLiked(!isLiked);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (err) {
            toast.error('Lỗi khi cập nhật yêu thích');
        }
    };

    return (
        <Link to={`/products/${product.id}`} className="group bg-white rounded-[2rem] border border-gray-100 p-0 overflow-hidden relative shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <CubeIcon className="w-16 h-16 text-gray-200" />
                )}
            </div>
            
            <button 
                onClick={toggleWishlist}
                className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 scale-90 group-hover:scale-100 ${isLiked ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'}`}
            >
                {isLiked ? <HeartIconSolid className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
            </button>

            <div className="p-6">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{product.farmName || 'Trang trại'}</p>
                <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-1 group-hover:text-green-700 transition-colors">{product.name}</h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter mb-0.5">Giá / {product.unit}</p>
                        <span className="text-xl font-black text-green-700">
                            {product.price?.toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100 shadow-sm">
                            <StarIcon className="w-3.5 h-3.5 text-yellow-500" />
                            <span className="text-yellow-700 font-bold text-xs">{product.averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
