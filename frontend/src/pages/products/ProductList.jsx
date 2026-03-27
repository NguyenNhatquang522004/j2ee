import { useEffect, useState, useCallback, Fragment } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { productService, categoryService, wishlistService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { 
    HeartIcon, 
    ShoppingBagIcon, 
    CakeIcon, 
    Square3Stack3DIcon,
    ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { 
    ChevronUpDownIcon, 
    CheckIcon,
    BarsArrowUpIcon,
    BarsArrowDownIcon,
    ArrowsUpDownIcon
} from '@heroicons/react/20/solid';

const sortOptions = [
    { id: 'id-desc', label: 'Mới nhất', icon: <ArrowsUpDownIcon className="w-4 h-4" /> },
    { id: 'price-asc', label: 'Giá: Thấp đến Cao', icon: <BarsArrowUpIcon className="w-4 h-4" /> },
    { id: 'price-desc', label: 'Giá: Cao đến Thấp', icon: <BarsArrowDownIcon className="w-4 h-4" /> },
    { id: 'name-asc', label: 'Tên: A-Z', icon: <CheckIcon className="w-4 h-4" /> },
    { id: 'name-desc', label: 'Tên: Z-A', icon: <CheckIcon className="w-4 h-4" /> },
];

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const farmId = searchParams.get('farmId') || '';
    const sortBy = searchParams.get('sortBy') || 'id';
    const direction = searchParams.get('direction') || 'desc';
    const page = parseInt(searchParams.get('page') || '0');
    const size = 12;

    const currentSort = sortOptions.find(o => o.id === `${sortBy}-${direction}`) || sortOptions[0];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            const params = { page, size, sortBy, direction };
            if (keyword) {
                res = await productService.search(keyword, params);
            } else {
                res = await productService.getAll({ 
                    ...params, 
                    categoryId: categoryId || undefined,
                    farmId: farmId || undefined 
                });
            }
            setProducts(res.data.content || res.data);
            setTotal(res.data.totalElements || res.data.length);
        } catch {
            toast.error('Không thể tải sản phẩm');
        } finally {
            setLoading(false);
        }
    }, [keyword, categoryId, farmId, page, size, sortBy, direction]);

    useEffect(() => {
        fetchProducts();
        categoryService.getAll().then((r) => setCategories(r.data));
    }, [fetchProducts]);

    const handleSortChange = (option) => {
        const [sort, dir] = option.id.split('-');
        setSearchParams({ ...Object.fromEntries(searchParams), sortBy: sort, direction: dir, page: 0 });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const val = e.target.keyword.value.trim();
        const newParams = { ...Object.fromEntries(searchParams) };
        if (val) newParams.keyword = val; else delete newParams.keyword;
        newParams.page = 0;
        setSearchParams(newParams);
    };

    const totalPages = Math.ceil(total / size);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 uppercase">Cửa hàng</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-green-600 rounded-full"></span>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            {farmId ? "Sản phẩm của trang trại đối tác" : "Thực phẩm sạch mỗi ngày"}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <input 
                            name="keyword" 
                            defaultValue={keyword} 
                            placeholder="Tìm kiếm sản phẩm..." 
                            className="w-[300px] pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm font-medium" 
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                            <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                    </form>

                    <div className="w-56">
                        <Listbox value={currentSort} onChange={handleSortChange}>
                            <div className="relative">
                                <Listbox.Button className="relative w-full cursor-pointer rounded-2xl bg-white border border-gray-100 py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-gray-700 text-sm italic">
                                    <span className="flex items-center gap-3 truncate">
                                        <span className="text-green-600">{currentSort.icon}</span>
                                        {currentSort.label}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white/80 backdrop-blur-xl py-1 text-base shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 border border-white/20">
                                        {sortOptions.map((option) => (
                                            <Listbox.Option
                                                key={option.id}
                                                className={({ active }) =>
                                                    `relative cursor-pointer select-none py-3 pl-10 pr-4 transition-all ${
                                                        active ? 'bg-green-600 text-white' : 'text-gray-900'
                                                    }`
                                                }
                                                value={option}
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span className={`block truncate text-sm font-bold ${selected ? 'font-black' : 'font-semibold'}`}>
                                                            {option.label}
                                                        </span>
                                                        {selected ? (
                                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-green-600'}`}>
                                                                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                                                            </span>
                                                        ) : (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-300">
                                                                {option.icon}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </Listbox>
                    </div>
                </div>
            </div>

            <div className="flex gap-10 items-start">
                <aside className="w-64 hidden md:block shrink-0 sticky top-28 self-start">
                    <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-[2.5rem] p-6 shadow-xl shadow-gray-100/50">
                        <div className="flex items-center gap-3 mb-6 pl-2">
                            <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                            <h3 className="font-black text-gray-900 uppercase tracking-[0.2em] text-[11px]">Danh mục</h3>
                        </div>
                        <ul className="space-y-2">
                            <li>
                                <button
                                    onClick={() => setSearchParams({ sortBy, direction })}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group ${!categoryId ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'text-gray-500 hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-100'}`}
                                >
                                    Tất cả sản phẩm
                                    {!categoryId && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                </button>
                            </li>
                            {categories.map((c) => (
                                <li key={c.id}>
                                    <button
                                        onClick={() => setSearchParams({ categoryId: c.id, sortBy, direction })}
                                        className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-between group ${categoryId === String(c.id) ? 'bg-green-600 text-white shadow-xl shadow-green-200' : 'text-gray-500 hover:bg-green-50 hover:text-green-600 border border-transparent hover:border-green-100'}`}
                                    >
                                        {c.name}
                                        {categoryId === String(c.id) && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {Array(8).fill(0).map((_, i) => (
                                <div key={i} className="bg-gray-50 animate-pulse rounded-[2.5rem] h-96 border border-gray-100"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <Square3Stack3DIcon className="w-20 h-20 text-gray-200 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Hiện tại chưa có sản phẩm nào</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map((p) => <ProductCard key={p.id} product={p} />)}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-center mt-16 gap-3">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: i })}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 border-2 ${page === i ? 'bg-green-600 border-green-600 text-white shadow-xl shadow-green-100' : 'bg-white border-gray-100 text-gray-400 hover:border-green-200 hover:text-green-600 shadow-sm'}`}
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
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { compareItems, addToCompare, removeFromCompare } = useCompare();
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (user && product.id) {
            wishlistService.check(product.id).then(res => setIsLiked(res.data)).catch(() => { });
        }
    }, [user, product.id]);

    const toggleWishlist = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { toast.error('Vui lòng đăng nhập để yêu thích'); return; }
        try {
            if (isLiked) { await wishlistService.remove(product.id); toast.success('Đã xoá khỏi yêu thích'); }
            else { await wishlistService.add(product.id); toast.success('Đã chọn yêu thích'); }
            setIsLiked(!isLiked);
            window.dispatchEvent(new Event('wishlist-updated'));
        } catch { toast.error('Lỗi khi cập nhật yêu thích'); }
    };

    const handleAdd = async (e) => {
        e.preventDefault(); e.stopPropagation();
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        try { await addToCart(product.id, 1); toast.success('Đã thêm vào giỏ hàng'); }
        catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
    };

    return (
        <div className="group bg-white rounded-[2.5rem] border border-gray-100 p-0 overflow-hidden relative shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full border-b-[6px] hover:border-b-green-500">
            <Link to={`/products/${product.id}`} className="relative block h-56 overflow-hidden">
                <div className="h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <Square3Stack3DIcon className="w-20 h-20 text-gray-200 animate-pulse" />
                    )}
                </div>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 transition-transform group-hover:translate-x-1 duration-500">
                    {product.isNew && (
                        <span className="bg-black/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/10">Mới</span>
                    )}
                    {product.originalPrice > product.price && (
                        <span className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                            -{Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}%
                        </span>
                    )}
                </div>

                <button 
                    onClick={toggleWishlist}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 ${isLiked ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'}`}
                >
                    {isLiked ? <HeartIconSolid className="w-5 h-5 transition-transform active:scale-110" /> : <HeartIcon className="w-5 h-5 transition-transform active:scale-110" />}
                </button>

                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCompare(product); }}
                    className={`absolute top-16 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 ${compareItems.some(i => i.id === product.id) ? 'bg-green-600 text-white' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-green-600'}`}
                >
                    <ArrowsRightLeftIcon className="w-5 h-5 transition-transform active:rotate-180 duration-500" />
                </button>
            </Link>
            
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-1.5 text-[9px] text-gray-300 mb-2 truncate font-black uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {product.farmName || 'Trang trại hữu cơ'}
                </div>
                
                <Link to={`/products/${product.id}`} className="font-extrabold text-gray-800 hover:text-green-700 block truncate text-lg transition-colors uppercase tracking-tight">
                    {product.name}
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm transition-all group-hover:shadow-md ${product.totalStock > 0 ? 'bg-gray-50 border-gray-100 group-hover:border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.totalStock > 10 ? 'bg-green-500' : product.totalStock > 0 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${product.totalStock > 0 ? 'text-gray-500' : 'text-red-600'}`}>
                            {product.totalStock > 0 ? `Còn lại: ${product.totalStock} ${product.unit}` : 'Tạm hết hàng'}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-tighter">Giá / {product.unit}</p>
                        <div className="flex flex-col -gap-1">
                            {product.originalPrice > product.price && (
                                <span className="text-gray-300 line-through text-[10px] font-bold italic leading-none mb-1">
                                    {product.originalPrice.toLocaleString('vi-VN')}đ
                                </span>
                            )}
                            <span className="text-green-700 font-black text-xl leading-none">
                                {product.price?.toLocaleString('vi-VN')}đ
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={handleAdd} 
                        className="w-11 h-11 bg-green-600 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-green-100 hover:shadow-black/20 group/btn"
                    >
                        <ShoppingBagIcon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
