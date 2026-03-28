import { useEffect, useState } from 'react';
import { wishlistService } from '../../api/services';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { 
    HeartIcon, 
    TrashIcon, 
    ShoppingBagIcon, 
    ArrowRightIcon,
    InboxIcon,
    CubeIcon,
    XMarkIcon,
    BoltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await wishlistService.getAll();
            setItems(res.data || []);
        } catch (err) {
            toast.error('Không thể tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await wishlistService.remove(productId);
            toast.success('Đã xoá khỏi yêu thích');
            fetchWishlist();
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (err) {
            toast.error('Lỗi khi xoá');
        }
    };

    if (loading) return <Layout><div className="text-center py-20 text-gray-400">Đang tải...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <HeartIconSolid className="w-8 h-8 text-red-500" />
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">Sản phẩm yêu thích</h1>
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-red-100">
                        {items.length} sản phẩm
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <InboxIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Danh sách trống</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy khám phá và lưu lại những sản phẩm bạn thích nhé!</p>
                        <Link to="/products" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-2xl shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all">
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {items.map((product) => (
                            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative">
                                <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                                    {product.imageUrl ? (
                                        <img 
                                            src={product.imageUrl} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-200">
                                            <CubeIcon className="w-16 h-16 animate-pulse" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 transition-transform group-hover:translate-x-1 duration-500">
                                        {product.isNew && (
                                            <span className="bg-black text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/20">Mới</span>
                                        )}
                                        {product.flashSalePrice ? (
                                            <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/20 animate-pulse flex items-center gap-1">
                                                <BoltIcon className="w-3 h-3" />
                                                -{Math.round((product.price - product.flashSalePrice) / product.price * 100)}%
                                            </span>
                                        ) : (product.originalPrice > product.price && (
                                            <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                                                -{Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}%
                                            </span>
                                        ))}
                                    </div>
                                </Link>

                                <button 
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 scale-90 group-hover:scale-100"
                                    title="Xoá khỏi yêu thích"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                <div className="p-6">
                                    <div className="flex items-center gap-1 text-[9px] text-gray-500 mb-1 truncate font-black uppercase tracking-widest">
                                        <span className="w-1 h-1 rounded-full bg-green-500"></span>
                                        {product.farmName || 'Trang trại hữu cơ'}
                                    </div>
                                    <Link to={`/products/${product.id}`} className="block mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 hover:text-green-600 transition-colors line-clamp-1 uppercase tracking-tight">{product.name}</h3>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2">{product.categoryName || 'Sản phẩm'}</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm transition-all group-hover:shadow-md ${product.totalStock > 0 ? 'bg-gray-50 border-gray-100 group-hover:border-green-100' : 'bg-red-50 border-red-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.totalStock > 10 ? 'bg-green-500' : product.totalStock > 0 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${product.totalStock > 0 ? 'text-gray-500' : 'text-red-600'}`}>
                                                    {product.totalStock > 0 ? `Còn lại: ${product.totalStock} ${product.unit}` : 'Tạm hết hàng'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                         <div>
                                             <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5">
                                                 {product.flashSalePrice ? (
                                                     <span className="text-red-600 flex items-center gap-1">
                                                         <BoltIcon className="w-2.5 h-2.5" />
                                                         Giá Flash Sale
                                                     </span>
                                                 ) : 'Giá bán'}
                                             </p>
                                             <div className="flex flex-col">
                                                 {product.flashSalePrice ? (
                                                     <>
                                                         <span className="text-gray-400 line-through text-[10px] font-bold italic leading-none mb-1">
                                                             {product.price.toLocaleString('vi-VN')}đ
                                                         </span>
                                                         <span className="text-red-600 font-black text-xl leading-none">
                                                             {product.flashSalePrice.toLocaleString('vi-VN')}đ
                                                         </span>
                                                     </>
                                                 ) : (
                                                     <>
                                                         {product.originalPrice > product.price && (
                                                             <span className="text-gray-400 line-through text-[10px] font-bold italic leading-none mb-1">
                                                                 {product.originalPrice.toLocaleString('vi-VN')}đ
                                                             </span>
                                                         )}
                                                         <span className="text-green-700 font-black text-xl leading-none">
                                                             {product.price?.toLocaleString('vi-VN')}đ
                                                         </span>
                                                     </>
                                                 )}
                                             </div>
                                         </div>
                                        <Link to={`/products/${product.id}`} className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                                            <ArrowRightIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
