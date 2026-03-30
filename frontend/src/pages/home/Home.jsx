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
    CubeIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon } from '@heroicons/react/24/solid';
import FlashSaleSection from '../../components/FlashSaleSection';

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
                className="rounded-3xl text-white text-center py-12 px-4 mb-8 shadow-2xl overflow-hidden relative"
                style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' }}
            >
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <CubeIcon className="w-64 h-64 rotate-12" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tight">Thực Phẩm Sạch <br/><span className="text-green-300 italic">Tươi Ngon Mỗi Ngày</span></h1>
                <p className="text-sm text-green-50/80 mb-8 max-w-xl mx-auto font-medium">
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
                    <div key={f.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${f.color}`}>
                            {f.icon}
                        </div>
                        <h3 className="font-black text-gray-800 text-lg mb-2 tracking-tight">{f.title}</h3>
                        <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </section>
 
            {/* Flash Sale */}
            <FlashSaleSection />

            {/* Categories */}
            {categories.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Danh mục</h2>
                        <div className="h-px flex-1 bg-gray-100"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?categoryId=${cat.id}`}
                                className="bg-white p-4 text-center rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all group"
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
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Sản phẩm bán chạy</h2>
                    <Link to="/products" className="group flex items-center gap-2 text-green-700 font-bold hover:gap-4 transition-all">
                        Xem tất cả <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                </div>
                {loading ? (
                    <div className="text-center py-20 text-gray-400 font-medium">Đang chuẩn bị sản phẩm...</div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-8">
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
        <Link to={`/products/${product.id}`} className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-0 overflow-hidden relative shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full border-b-[3px] sm:border-b-[4px] hover:border-b-green-500">
            <div className="h-32 sm:h-48 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                    <CubeIcon className="w-10 h-10 sm:w-16 sm:h-16 text-gray-200" />
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10 transition-transform group-hover:translate-x-1 group-hover:translate-y-1 duration-500">
                    {product.isNew && (
                        <span className="bg-black/80 backdrop-blur-md text-white text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/20">Mới</span>
                    )}
                    {product.flashSalePrice ? (
                        <span className="bg-red-600 text-white text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/20 animate-pulse flex items-center gap-0.5 sm:gap-1">
                            <BoltIcon className="w-2 sm:w-3.5 h-2 sm:h-3.5" />
                            -{Math.round(((product.price || 0) - (product.flashSalePrice || 0)) / (product.price || 1) * 100)}%
                        </span>
                    ) : (product.originalPrice > product.price && (
                        <span className="bg-red-600 text-white text-[7px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                            -{Math.round(((product.originalPrice || 0) - (product.price || 0)) / (product.originalPrice || 1) * 100)}%
                        </span>
                    ))}
                </div>
            </div>
            
            <button 
                onClick={toggleWishlist}
                className={`absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 scale-90 sm:group-hover:scale-100 ${isLiked ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'}`}
            >
                {isLiked ? <HeartIconSolid className="w-3.5 h-3.5 sm:w-6 sm:h-6" /> : <HeartIcon className="w-3.5 h-3.5 sm:w-6 sm:h-6" />}
            </button>

            <div className="p-2 sm:p-4 flex flex-col flex-1">
                <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1">{product.farmName || 'Trang trại'}</p>
                <h3 className="font-bold text-gray-800 text-[10px] sm:text-sm mb-2 sm:mb-3 line-clamp-1 group-hover:text-green-700 transition-colors uppercase tracking-tight">{product.name}</h3>
                
                <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-[7px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5 sm:mb-1">
                            {product.flashSalePrice ? "Flash Sale" : `Giá / ${product.unit}`}
                        </p>
                        <div className="flex flex-col">
                            {product.flashSalePrice ? (
                                <>
                                    <span className="text-gray-400 line-through text-[8px] sm:text-[10px] font-bold italic leading-none mb-0.5 sm:mb-1">
                                        {(product.price || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="text-red-600 font-extrabold text-xs sm:text-xl leading-none">
                                        {(product.flashSalePrice || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                </>
                            ) : (
                                <>
                                    {product.originalPrice > product.price && (
                                        <span className="text-gray-400 line-through text-[8px] sm:text-[10px] font-bold italic leading-none mb-0.5 sm:mb-1">
                                            {(product.originalPrice || 0).toLocaleString('vi-VN')}đ
                                        </span>
                                    )}
                                    <span className="text-green-700 font-extrabold text-xs sm:text-xl leading-none">
                                        {(product.price || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-yellow-100 shadow-sm">
                            <StarIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-yellow-500" />
                            <span className="text-yellow-700 font-bold text-[9px] sm:text-xs">{product.averageRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
