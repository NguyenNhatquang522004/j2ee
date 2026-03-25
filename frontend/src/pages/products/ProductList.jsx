import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

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
            <Link to={`/products/${product.id}`}>
                <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <span className="text-5xl">🥦</span>
                    )}
                </div>
            </Link>
            <div className="p-4">
                <Link to={`/products/${product.id}`} className="font-semibold text-gray-800 hover:text-green-700 block truncate mb-1">
                    {product.name}
                </Link>
                <p className="text-xs text-gray-400 mb-1 truncate">{product.farmName}</p>
                {product.certification && (
                    <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mb-2">
                        {product.certification}
                    </span>
                )}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-green-700 font-bold text-sm">
                        {product.price?.toLocaleString('vi-VN')}đ/{product.unit}
                    </span>
                    <button onClick={handleAdd} className="bg-green-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-700 transition-colors">
                        + Giỏ
                    </button>
                </div>
                {product.totalStock === 0 && (
                    <p className="text-red-500 text-xs mt-1">Hết hàng</p>
                )}
            </div>
        </div>
    );
}
