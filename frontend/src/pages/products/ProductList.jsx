import { useEffect, useState, useCallback, Fragment } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCompare } from '../../context/CompareContext';
import { productService, categoryService, wishlistService, farmService } from '../../api/services';
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
    ArrowsRightLeftIcon,
    BoltIcon
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
    const [farms, setFarms] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('keyword') || '');

    const keyword = searchParams.get('keyword') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const farmId = searchParams.get('farmId') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const isNew = searchParams.get('isNew') === 'true';
    const isSale = searchParams.get('isSale') === 'true';
    const sortBy = searchParams.get('sortBy') || 'id';
    const direction = searchParams.get('direction') || 'desc';
    const page = parseInt(searchParams.get('page') || '0');
    const size = 12;

    const currentSort = sortOptions.find(o => o.id === `${sortBy}-${direction}`) || sortOptions[0];

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            const params = { 
                page, 
                size, 
                sortBy, 
                direction,
                name: keyword || undefined,
                categoryId: categoryId || undefined,
                farmId: farmId || undefined,
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
                isNew: isNew || undefined,
                isSale: isSale || undefined
            };
            res = await productService.getAll(params);
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
    }, [fetchProducts]);

    useEffect(() => {
        categoryService.getAll().then((r) => setCategories(r.data));
        farmService.getAll({ page: 0, size: 100 }).then((r) => setFarms(r.data.content || r.data));
    }, []);

    const handleSortChange = (option) => {
        const [sort, dir] = option.id.split('-');
        setSearchParams({ ...Object.fromEntries(searchParams), sortBy: sort, direction: dir, page: 0 });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const newParams = { ...Object.fromEntries(searchParams) };
            if (searchTerm) newParams.keyword = searchTerm; else delete newParams.keyword;
            newParams.page = 0;
            setSearchParams(newParams);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSearch = (val) => {
        setSearchTerm(val);
    };

    const handlePriceFilter = (e) => {
        e.preventDefault();
        const min = e.target.minPrice.value;
        const max = e.target.maxPrice.value;
        const newParams = { ...Object.fromEntries(searchParams) };
        if (min) newParams.minPrice = min; else delete newParams.minPrice;
        if (max) newParams.maxPrice = max; else delete newParams.maxPrice;
        newParams.page = 0;
        setSearchParams(newParams);
    };

    const resetFilters = () => {
        setSearchParams({ sortBy: 'id', direction: 'desc' });
    };

    const totalPages = Math.ceil(total / size);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2 uppercase">
                        {keyword ? `Kết quả: ${keyword}` : 'Cửa hàng'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-green-600 rounded-full"></span>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            {total} sản phẩm {farmId ? "của trang trại đối tác" : "thực phẩm sạch mỗi ngày"}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <input 
                            name="keyword" 
                            value={searchTerm} 
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..." 
                            className="w-[300px] pl-12 pr-10 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all shadow-sm font-medium" 
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
                            <ShoppingBagIcon className="w-5 h-5" />
                        </div>
                        {searchTerm && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    const newParams = { ...Object.fromEntries(searchParams) };
                                    delete newParams.keyword;
                                    setSearchParams(newParams);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

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
                <aside className="w-56 hidden md:block shrink-0 sticky top-28 self-start">
                    <div className="space-y-8 bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl p-6 shadow-xl shadow-gray-100/50">
                        {/* Categories */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 pl-2">
                                <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Danh mục</h3>
                            </div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), categoryId: '', page: 0 })}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${!categoryId ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Tất cả
                                    {!categoryId && <CheckIcon className="w-3 h-3" />}
                                </button>
                                {categories.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), categoryId: c.id, page: 0 })}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${categoryId === String(c.id) ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {c.name}
                                        {categoryId === String(c.id) && <CheckIcon className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Farms */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 pl-2">
                                <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Trang trại</h3>
                            </div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), farmId: '', page: 0 })}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${!farmId ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Tất cả đối tác
                                    {!farmId && <CheckIcon className="w-3 h-3" />}
                                </button>
                                {farms.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), farmId: f.id, page: 0 })}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${farmId === String(f.id) ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <span className="truncate pr-2">{f.name}</span>
                                        {farmId === String(f.id) && <CheckIcon className="w-3 h-3 flex-shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 pl-2">
                                <div className="w-1.5 h-5 bg-blue-500 rounded-full"></div>
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Khoảng giá</h3>
                            </div>
                            <form onSubmit={handlePriceFilter} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input 
                                        name="minPrice"
                                        defaultValue={minPrice}
                                        placeholder="Từ"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-blue-500"
                                    />
                                    <span className="text-gray-300">-</span>
                                    <input 
                                        name="maxPrice"
                                        defaultValue={maxPrice}
                                        placeholder="Đến"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[11px] font-bold outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 bg-green-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-green-700 transition-colors">
                                    Áp dụng
                                </button>
                            </form>
                        </div>

                        {/* Quick Filters */}
                        <div>
                            <div className="flex items-center gap-3 mb-4 pl-2">
                                <div className="w-1.5 h-5 bg-red-500 rounded-full"></div>
                                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Ưu đãi & Mới</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => {
                                        const next = !isNew;
                                        const p = { ...Object.fromEntries(searchParams), page: 0 };
                                        if (next) p.isNew = 'true'; else delete p.isNew;
                                        setSearchParams(p);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${isNew ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-300'}`}
                                >
                                    Sản phẩm mới
                                    <div className={`w-2 h-2 rounded-full ${isNew ? 'bg-green-400 animate-ping' : 'bg-gray-200'}`}></div>
                                </button>
                                <button
                                    onClick={() => {
                                        const next = !isSale;
                                        const p = { ...Object.fromEntries(searchParams), page: 0 };
                                        if (next) p.isSale = 'true'; else delete p.isSale;
                                        setSearchParams(p);
                                    }}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${isSale ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-red-100'}`}
                                >
                                    Đang giảm giá
                                    <div className={`w-2 h-2 rounded-full ${isSale ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></div>
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={resetFilters}
                            className="w-full py-3 border-2 border-dashed border-gray-100 text-gray-400 text-[10px] font-black uppercase rounded-2xl hover:border-red-200 hover:text-red-500 transition-all font-bold"
                        >
                            Dọn sạch bộ lọc
                        </button>
                    </div>
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                            {Array(12).fill(0).map((_, i) => (
                                <div key={i} className="bg-gray-50 animate-pulse rounded-xl sm:rounded-2xl h-48 sm:h-80 border border-gray-100"></div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <Square3Stack3DIcon className="w-20 h-20 text-gray-200 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500" />
                                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Hiện tại chưa có sản phẩm nào</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
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
    const [adding, setAdding] = useState(false);

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
        setAdding(true);
        try { await addToCart(product.id, 1); toast.success('Đã thêm vào giỏ hàng'); }
        catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
        finally { setAdding(false); }
    };

    return (
        <div className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-0 overflow-hidden relative shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full border-b-[3px] sm:border-b-[4px] hover:border-b-green-500">
            <Link to={`/products/${product.slug}`} className="relative block h-32 sm:h-48 overflow-hidden">
                <div className="h-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <Square3Stack3DIcon className="w-10 h-10 sm:w-20 sm:h-20 text-gray-200 animate-pulse" />
                    )}
                </div>
                
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10 transition-transform group-hover:translate-x-1 duration-500">
                    {product.isNew && (
                        <span className="bg-green-600/80 backdrop-blur-md text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/10">Mới</span>
                    )}
                    {product.flashSalePrice ? (
                        <span className="bg-red-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/20 animate-pulse flex items-center gap-0.5 sm:gap-1">
                            <BoltIcon className="w-2 sm:w-3 h-2 sm:h-3" />
                            -{Math.round(((product.price || 0) - (product.flashSalePrice || 0)) / (product.price || 1) * 100)}%
                        </span>
                    ) : (product.originalPrice > product.price && (
                        <span className="bg-red-600 text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                            -{Math.round(((product.originalPrice || 0) - (product.price || 0)) / (product.originalPrice || 1) * 100)}%
                        </span>
                    ))}
                </div>

                <button 
                    onClick={toggleWishlist}
                    className={`absolute top-2 right-2 sm:top-14 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg transition-all z-10 scale-100 sm:scale-90 opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover:scale-100 ${isLiked ? 'bg-white text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'}`}
                    title={isLiked ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                    {isLiked ? <HeartIconSolid className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform active:scale-110" /> : <HeartIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform active:scale-110" />}
                </button>

                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCompare(product); }}
                    className="absolute top-2 right-10 sm:top-4 sm:right-4 w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-white/80 backdrop-blur-sm text-gray-400 hover:text-blue-500 shadow-lg transition-all z-10 scale-100 sm:scale-90 opacity-100 sm:opacity-0 group-hover:opacity-100 group-hover:scale-100"
                    title="So sánh giá"
                >
                    <ArrowsRightLeftIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 transition-transform active:scale-110" />
                </button>
            </Link>
            
            <div className="p-2 sm:p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 text-[7px] sm:text-[9px] text-gray-500 mb-0.5 sm:mb-1 truncate font-black uppercase tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-green-500"></span>
                    {product.farmName || 'Hữu cơ'}
                </div>
                
                <Link to={`/products/${product.slug}`} className="font-extrabold text-gray-800 hover:text-green-700 block truncate text-[10px] sm:text-sm transition-colors uppercase tracking-tight">
                    {product.name}
                </Link>

                <div className="hidden sm:flex items-center gap-2 mt-2">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border shadow-sm transition-all group-hover:shadow-md ${product.totalStock > 0 ? 'bg-gray-50 border-gray-100 group-hover:border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${product.totalStock > 10 ? 'bg-green-500' : product.totalStock > 0 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${product.totalStock > 0 ? 'text-gray-500' : 'text-red-600'}`}>
                            {product.totalStock > 0 ? `Còn lại: ${product.totalStock} ${product.unit}` : 'Tạm hết hàng'}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-50 flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[7px] sm:text-[9px] text-gray-400 uppercase font-black tracking-tighter truncate">
                            {product.flashSalePrice ? "Flash Sale" : `Giá / ${product.unit}`}
                        </p>
                        <div className="flex flex-col">
                            {product.flashSalePrice ? (
                                <>
                                    <span className="text-gray-400 line-through text-[8px] sm:text-[10px] font-bold italic leading-none mb-0.5 sm:mb-1">
                                        {(product.price || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="text-red-600 font-black text-xs sm:text-xl leading-none">
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
                                    <span className="text-green-700 font-black text-xs sm:text-xl leading-none">
                                        {(product.price || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={handleAdd} 
                        disabled={adding}
                        className="w-7 h-7 sm:w-11 sm:h-11 bg-green-600 text-white rounded-lg sm:rounded-2xl flex items-center justify-center hover:bg-green-700 transition-all shadow-xl shadow-green-100 hover:shadow-black/20 group/btn disabled:opacity-50"
                    >
                        {adding ? (
                            <div className="w-3 h-3 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <ShoppingBagIcon className="w-3 h-3 sm:w-5 sm:h-5 group-hover/btn:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
