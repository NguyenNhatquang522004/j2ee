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
    XMarkIcon
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
                                </Link>

                                <button 
                                    onClick={() => handleRemove(product.id)}
                                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 scale-90 group-hover:scale-100"
                                    title="Xoá khỏi yêu thích"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>

                                <div className="p-6">
                                    <Link to={`/products/${product.id}`} className="block mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 hover:text-green-600 transition-colors line-clamp-1">{product.name}</h3>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{product.categoryName || 'Sản phẩm'}</p>
                                    </Link>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Giá bán</p>
                                            <p className="text-lg font-black text-green-700">{product.price?.toLocaleString('vi-VN')}đ</p>
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
