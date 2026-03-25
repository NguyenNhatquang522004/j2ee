import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService, wishlistService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { 
    HeartIcon, 
    ShoppingBagIcon, 
    CakeIcon, 
    Square3Stack3DIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const size = 12;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            if (keyword) {
                res = await productService.search(keyword, { page, size });
            } else {
                res = await productService.getAll({ page, size, categoryId: categoryId || undefined });
            }
            setProducts(res.data.content || res.data);
            setTotal(res.data.totalElements || res.data.length);
        } catch {
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [keyword, categoryId, page, size]);

    useEffect(() => {
        fetchProducts();
        categoryService.getAll().then((r) => setCategories(r.data));
    }, [fetchProducts]);

    const handleSearch = (e) => {
        e.preventDefault();
        const val = e.target.keyword.value.trim();
        setSearchParams(val ? { keyword: val } : {});
    };

    const totalPages = Math.ceil(total / size);

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm</h1>
                <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
                    <input name="keyword" defaultValue={keyword} placeholder="Tìm kiếm sản phẩm..." className="input-field" />
                    <button type="submit" className="btn-primary whitespace-nowrap">Tìm kiếm</button>
                </form>
            </div>

            <div className="flex gap-6">
                {/* Sidebar categories */}
                <aside className="w-48 hidden md:block shrink-0">
                    <h3 className="font-semibold text-gray-700 mb-3">Danh mục</h3>
                    <ul className="space-y-1">
                        <li>
                            <button
                                onClick={() => setSearchParams({})}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryId ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Tất cả
                            </button>
                        </li>
                        {categories.map((c) => (
                            <li key={c.id}>
                                <button
                                    onClick={() => setSearchParams({ categoryId: c.id })}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryId === String(c.id) ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {c.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Product grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="text-center py-16 text-gray-400">Đang tải...</div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 text-gray-400">Không tìm thấy sản phẩm nào</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: i })}
                                            className={`w-9 h-9 rounded-lg font-medium transition-colors ${i === page ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (user && product.id) {
            wishlistService.check(product.id).then(res => setIsLiked(res.data)).catch(() => {});
        }
    }, [user, product.id]);

    const toggleWishlist = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Vui lòng đăng nhập để yêu thích'); return; }
        try {
            if (isLiked) {
                await wishlistService.remove(product.id);
                toast.success('Đã xoá khỏi danh sách yêu thích');
            } else {
                await wishlistService.add(product.id);
                toast.success('Đã thêm vào danh sách yêu thích');
            }
            setIsLiked(!isLiked);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch (err) {
            toast.error('Lỗi khi cập nhật yêu thích');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Vui lòng đăng nhập để mua hàng'); return; }
        try {
            await addToCart(product.id, 1);
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi thêm vào giỏ');
        }
    };

    return (
        <div className="card p-0 overflow-hidden hover:shadow-md transition-shadow">
            <Link to={`/products/${product.id}`} className="relative block">
                <div className="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <Square3Stack3DIcon className="w-16 h-16 text-gray-200" />
                    )}
                </div>
                <button 
                    onClick={toggleWishlist}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}
                >
                    {isLiked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                </button>
            </Link>
            <div className="p-4">
                <Link to={`/products/${product.id}`} className="font-bold text-gray-800 hover:text-green-700 block truncate mb-1">
                    {product.name}
                </Link>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 truncate">
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    {product.farmName}
                </div>
                {product.certification && (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider border border-green-100">
                        <StarIconSolid className="w-3 h-3" />
                        {product.certification}
                    </span>
                )}
                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Giá/ {product.unit}</p>
                        <span className="text-green-700 font-black text-base">
                            {product.price?.toLocaleString('vi-VN')}đ
                        </span>
                    </div>
                    <button 
                        onClick={handleAdd} 
                        className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center hover:bg-green-700 transition-all shadow-sm hover:shadow-lg active:scale-95"
                        title="Thêm vào giỏ"
                    >
                        <ShoppingBagIcon className="w-5 h-5" />
                    </button>
                </div>
                {product.totalStock === 0 && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Hết hàng</p>
                )}
            </div>
        </div>
    );
}
