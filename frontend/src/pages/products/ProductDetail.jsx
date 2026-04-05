import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, reviewService, wishlistService, flashSaleService } from '../../api/services';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import { useCompare } from '../../context/CompareContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    CheckBadgeIcon, 
    StarIcon as StarIconOutline, 
    ShoppingCartIcon, 
    HeartIcon as HeartIconOutline,
    MapPinIcon,
    InformationCircleIcon,
    CubeIcon,
    MinusIcon,
    PlusIcon,
    ArrowsRightLeftIcon,
    PhotoIcon as PhotoIconOutline,
    VideoCameraIcon as VideoCameraIconOutline,
    UserCircleIcon as UserCircleIconOutline,
    XMarkIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToCompare } = useCompare();
    const { user } = useAuth();
    const queryParams = new URLSearchParams(window.location.search);
    const isViewOnly = queryParams.get('mode') === 'view';

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewFiles, setReviewFiles] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [reviewPermission, setReviewPermission] = useState('NOT_PURCHASED');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [flashSaleItem, setFlashSaleItem] = useState(null);
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [ratingFilter, setRatingFilter] = useState(null);
    const [existingMedia, setExistingMedia] = useState([]);
    const [removeMediaIds, setRemoveMediaIds] = useState([]);

    useEffect(() => {
        if (user && product?.id) {
            wishlistService.check(product.id).then(res => setIsLiked(res.data)).catch(() => {});
        }
    }, [user, product?.id]);

    const toggleWishlist = async () => {
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pRes = await productService.getById(id);
                setProduct(pRes.data);
                
                if (pRes.data?.id) {
                    const realProductId = pRes.data.id;
                    const rParams = { page: 0, size: 50 };
                    if (ratingFilter) rParams.rating = ratingFilter;

                    const [rRes, fsRes] = await Promise.all([
                        reviewService.byProduct(realProductId, rParams),
                        flashSaleService.getActive()
                    ]);

                    setReviews(rRes.data.content || rRes.data);

                    if (user) {
                        reviewService.canReview(realProductId).then(res => setReviewPermission(res.data)).catch(() => {});
                    }

                    if (fsRes.data) {
                        const item = fsRes.data.items.find(it => it.product.id === realProductId);
                        if (item) {
                            setFlashSaleItem(item);
                            setFlashSaleEndTime(fsRes.data.endTime);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching product data:", err);
                toast.error('Không thể tải sản phẩm');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate, user, ratingFilter]);

    useEffect(() => {
        if (!flashSaleEndTime) return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(flashSaleEndTime).getTime();
            const diff = end - now;
            if (diff <= 0) {
                clearInterval(timer);
                setFlashSaleItem(null);
                setFlashSaleEndTime(null);
                return;
            }
            setTimeLeft({
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000)
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [flashSaleEndTime]);

    const handleAddToCart = async () => {
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity);
            toast.success(`Đã thêm ${quantity} ${product.unit} vào giỏ hàng!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        setSubmittingReview(true);
        try {
            const formData = new FormData();
            const requestPayload = { 
                productId: product.id, 
                ...reviewForm,
                removeMediaIds: removeMediaIds.length > 0 ? removeMediaIds : null 
            };
            
            formData.append('review', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }));
            reviewFiles.forEach(file => formData.append('files', file));

            if (editingReviewId) {
                await reviewService.update(editingReviewId, formData);
                toast.success('Đã cập nhật đánh giá!');
                setEditingReviewId(null);
            } else {
                await reviewService.add(formData);
                toast.success('Đã gửi đánh giá! Vui lòng chờ kiểm duyệt.');
            }
            
            setReviewForm({ rating: 5, comment: '' });
            setReviewFiles([]);
            setExistingMedia([]);
            setRemoveMediaIds([]);
            const r = await reviewService.byProduct(id, { page: 0, size: 50 });
            setReviews(r.data.content || r.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi xử lý đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá đánh giá này?')) return;
        try {
            await reviewService.deleteMy(reviewId);
            toast.success('Đã xoá đánh giá');
            const r = await reviewService.byProduct(id, { page: 0, size: 10 });
            setReviews(r.data.content || r.data);
        } catch (err) {
            toast.error('Lỗi khi xoá đánh giá');
        }
    };

    const handleEditClick = (review) => {
        setEditingReviewId(review.id);
        setReviewForm({ rating: review.rating, comment: review.comment });
        setExistingMedia(review.media || []);
        setRemoveMediaIds([]);
        setReviewFiles([]);
        window.scrollTo({ top: document.querySelector('#review-section').offsetTop - 100, behavior: 'smooth' });
    };

    const LayoutComponent = (isViewOnly && (user?.role === 'ADMIN' || user?.role?.name === 'ROLE_ADMIN')) ? AdminLayout : Layout;

    if (loading) return <LayoutComponent><div className="text-center py-20 text-gray-400">Đang tải...</div></LayoutComponent>;
    if (!product) return null;

    return (
        <LayoutComponent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden bg-green-50 h-[450px] flex items-center justify-center border border-green-100 shadow-inner">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <CubeIcon className="w-32 h-32 text-green-200 animate-pulse" />
                    )}
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                        {product.isNew && (
                            <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
                                Mới
                            </span>
                        )}
                        {product.originalPrice > product.price && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
                                Giảm {Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}%
                            </span>
                        )}
                        {product.certification && (
                            <span className="flex items-center gap-1.5 bg-green-100 text-green-800 text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
                                <CheckBadgeIcon className="w-4 h-4" />
                                {product.certification}
                            </span>
                        )}
                        {!product.isActive && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Ngừng bán</span>
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase">{product.name}</h1>
                    
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                s <= Math.round(product.averageRating || 0) 
                                ? <StarIconSolid key={s} className="w-5 h-5 text-yellow-400" /> 
                                : <StarIconOutline key={s} className="w-5 h-5 text-gray-200" />
                            ))}
                        </div>
                        <span className="text-yellow-600 font-black text-sm tracking-tighter uppercase">{(product.averageRating || 0).toFixed(1)} / 5.0</span>
                        <span className="text-gray-300 mx-1">|</span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-none mt-0.5">{reviews.length} Đánh giá</span>
                    </div>

                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-1.5 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100 font-bold uppercase tracking-wider">
                        {product.farmName && (
                            <>
                                <MapPinIcon className="w-4 h-4 text-green-600" />
                                <span className="text-gray-700">{product.farmName}</span>
                                <span className="text-gray-300 mx-1">|</span>
                                <span>{product.farmProvince}</span>
                            </>
                        )}
                    </p>

                    {flashSaleItem && (
                        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-[2px] rounded-3xl mb-6 shadow-xl shadow-red-100 animate-in slide-in-from-top-4 duration-700">
                            <div className="bg-white rounded-[1.4rem] overflow-hidden">
                                <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <BoltIcon className="w-5 h-5 animate-pulse" />
                                        <span className="font-black uppercase tracking-widest text-xs">Flash Sale Đang diễn ra</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-white/70 uppercase">Kết thúc trong:</span>
                                        <div className="flex items-center gap-1 font-black text-white text-sm">
                                            <span className="bg-white/20 px-2 py-0.5 rounded-lg">{timeLeft.hours.toString().padStart(2, '0')}</span>
                                            <span>:</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded-lg">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                                            <span>:</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded-lg">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Giá sốc độc quyền</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-black text-red-600">{(flashSaleItem.flashSalePrice || 0).toLocaleString()}đ</span>
                                            <span className="text-gray-300 line-through text-sm font-bold italic">{(product.price || 0).toLocaleString()}đ</span>
                                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg animate-bounce">
                                                -{Math.round(((product.price || 0) - (flashSaleItem.flashSalePrice || 0)) / (product.price || 1) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mb-2 shadow-inner border border-gray-100">
                                            <div 
                                                className="h-full bg-gradient-to-r from-red-600 to-orange-400 shadow-lg"
                                                style={{ width: `${Math.min((flashSaleItem.soldQuantity / flashSaleItem.quantityLimit) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter italic">
                                            {flashSaleItem.soldQuantity >= flashSaleItem.quantityLimit ? 'Đã hết hàng sale' : `Đã bán ${flashSaleItem.soldQuantity}/${flashSaleItem.quantityLimit}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
 
                    {!flashSaleItem && (
                        <div className="flex items-baseline gap-4 mb-4">
                            <div className="text-4xl font-black text-green-700">
                                {(product.price || 0).toLocaleString('vi-VN')}đ
                                <span className="text-lg font-bold text-gray-400">/{product.unit}</span>
                            </div>
                            {product.originalPrice > product.price && (
                                <div className="flex items-center gap-3">
                                    <div className="text-xl font-bold text-gray-400 line-through italic">
                                        {(product.originalPrice || 0).toLocaleString('vi-VN')}đ
                                    </div>
                                    <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-lg border border-white/20">
                                        -{Math.round(((product.originalPrice || 0) - (product.price || 0)) / (product.originalPrice || 1) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Removed old rating display here */}

                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Tồn kho: </span>
                        <span className={`font-semibold ${product.totalStock === 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {product.totalStock === 0 ? 'Hết hàng' : `${product.totalStock} ${product.unit}`}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {product.totalStock > 0 && product.isActive ? (
                            <>
                                <div className="flex items-center border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                                    <button 
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                        className="p-4 hover:bg-gray-50 text-gray-500 transition-colors"
                                    >
                                        <MinusIcon className="w-5 h-5" />
                                    </button>
                                    <span className="px-6 py-2 font-black text-gray-800 text-xl min-w-[60px] text-center">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(q => Math.min(product.totalStock, 10, q + 1))} 
                                        className="p-4 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-30"
                                        disabled={quantity >= 10}
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleAddToCart} 
                                    disabled={addingToCart}
                                    className="btn-primary flex-1 py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-green-100 shadow-xl disabled:opacity-75 transition-all"
                                >
                                    {addingToCart ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <ShoppingCartIcon className="w-6 h-6 text-white/90" />
                                    )}
                                    {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                                </button>
                            </>
                        ) : (
                            <div className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold flex items-center justify-center gap-2 border border-gray-200 cursor-not-allowed">
                                <CubeIcon className="w-6 h-6" />
                                {product.isActive ? 'Tạm hết hàng' : 'Ngừng kinh doanh'}
                            </div>
                        )}
                        <button 
                            onClick={toggleWishlist}
                            className={`w-14 h-14 aspect-square rounded-2xl border-2 transition-all inline-grid place-items-center shrink-0 ${isLiked ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-100 text-gray-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50/30 shadow-sm'}`}
                            title={isLiked ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
                        >
                            <div className="w-8 h-8 flex items-center justify-center">
                                {isLiked ? <HeartIconSolid className="w-full h-full" /> : <HeartIconOutline className="w-full h-full" />}
                            </div>
                        </button>
                        <button 
                            onClick={() => addToCompare(product)}
                            className="w-14 h-14 aspect-square rounded-2xl border-2 border-gray-100 bg-white text-gray-300 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50/30 transition-all inline-grid place-items-center shrink-0 shadow-sm hover:shadow-md"
                            title="So sánh giá"
                        >
                            <div className="w-8 h-8 flex items-center justify-center">
                                <ArrowsRightLeftIcon className="w-full h-full" />
                            </div>
                        </button>
                    </div>

                    {product.certificationDescription && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                            <span className="font-semibold">Chứng nhận: </span>{product.certificationDescription}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <section id="review-section" className="mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Đánh giá sản phẩm ({reviews.length})</h2>
                    
                    {/* Rating Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={() => setRatingFilter(null)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ratingFilter === null ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-white border border-gray-100 text-gray-400 hover:border-green-200'}`}
                        >
                            Tất cả
                        </button>
                        {[5, 4, 3, 2, 1].map(s => (
                            <button 
                                key={s}
                                onClick={() => setRatingFilter(s)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${ratingFilter === s ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-white border border-gray-100 text-gray-400 hover:border-yellow-200'}`}
                            >
                                {s} <StarIconSolid className="w-3 h-3" />
                            </button>
                        ))}
                    </div>
                </div>

                {user ? (
                    (reviewPermission === 'ALLOWED' || editingReviewId) ? (
                        <form onSubmit={handleReviewSubmit} className="card mb-6">
                            <h3 className="font-semibold mb-3">Viết đánh giá của bạn</h3>
                            <div className="flex items-center gap-1 mb-4">
                                <span className="text-sm font-bold text-gray-600 mr-2 uppercase tracking-wider">Đánh giá của bạn:</span>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s} type="button"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                        className="transition-transform active:scale-90"
                                    >
                                        {s <= reviewForm.rating 
                                            ? <StarIconSolid className="w-8 h-8 text-yellow-400" /> 
                                            : <StarIconOutline className="w-8 h-8 text-gray-200" />
                                        }
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                placeholder="Nhận xét của bạn..."
                                rows={4}
                                className="input-field mb-4"
                            />
                            <div className="mb-4">
                                <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wider">Hình ảnh/video đính kèm</label>
                                
                                {/* Existing Media Management */}
                                {existingMedia.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {existingMedia.map((m, idx) => (
                                            <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-gray-100 group">
                                                {m.fileType?.startsWith('video') ? (
                                                    <video src={m.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={m.url} className="w-full h-full object-cover" alt="" />
                                                )}
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setRemoveMediaIds(prev => [...prev, m.id]);
                                                        setExistingMedia(prev => prev.filter(item => item.id !== m.id));
                                                    }}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-lg border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <XMarkIcon className="w-3 h-3 stroke-[4]" />
                                                </button>
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-white hover:border-green-300 p-6 rounded-2xl border-2 border-dashed border-gray-200 transition-all group group-hover:shadow-lg group-hover:shadow-green-50/50">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-green-50 transition-colors">
                                        <PhotoIconOutline className="w-6 h-6 text-gray-400 group-hover:text-green-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-gray-700 group-hover:text-green-600 transition-colors">
                                            {editingReviewId ? 'Bổ sung ảnh/video mới' : 'Đính kèm ảnh/video'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-loose">Tối đa 5 tập tin • 20MB/Video • 5MB/Ảnh</p>
                                    </div>
                                    <input 
                                        type="file" 
                                        multiple 
                                        className="hidden" 
                                        accept="image/*,video/*"
                                        onChange={(e) => setReviewFiles([...reviewFiles, ...Array.from(e.target.files)])}
                                    />
                                </label>

                                {reviewFiles.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {reviewFiles.map((f, i) => {
                                            const url = URL.createObjectURL(f);
                                            return (
                                                <div key={i} className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-green-100 shadow-sm">
                                                    {f.type.startsWith('image') ? (
                                                        <img src={url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full bg-black/90 flex items-center justify-center text-white">
                                                            <VideoCameraIconOutline className="w-8 h-8 opacity-40" />
                                                            <span className="absolute bottom-1 text-[8px] font-black uppercase">NEW</span>
                                                        </div>
                                                    )}
                                                    <button 
                                                        type="button"
                                                        onClick={() => setReviewFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-1 right-1 bg-gray-900/60 text-white rounded-full p-1 hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <XMarkIcon className="w-3 h-3 stroke-[4]" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <button type="submit" disabled={submittingReview} className="btn-primary w-full py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-green-100">
                                {submittingReview ? 'ĐANG XỬ LÝ...' : (editingReviewId ? 'CẬP NHẬT ĐÁNH GIÁ' : 'GỬI ĐÁNH GIÁ NGAY')}
                            </button>
                            {editingReviewId && (
                                <button 
                                    type="button" 
                                    onClick={() => { 
                                        setEditingReviewId(null); 
                                        setReviewForm({ rating: 5, comment: '' }); 
                                        setReviewFiles([]);
                                        setExistingMedia([]);
                                        setRemoveMediaIds([]);
                                    }}
                                    className="w-full mt-2 text-gray-400 font-bold uppercase text-xs tracking-widest hover:text-red-500 transition-colors"
                                >
                                    Hủy bỏ chỉnh sửa
                                </button>
                            )}
                        </form>
                    ) : reviewPermission === 'NOT_PURCHASED' ? (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8 text-center mb-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <InformationCircleIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-black text-blue-900 uppercase mb-2">Bạn chưa thể đánh giá sản phẩm này</h3>
                            <p className="text-blue-700 font-medium max-w-sm mx-auto">
                                Để đánh giá sản phẩm, hãy đảm bảo bạn đã mua và nhận hàng thành công nhé. Sự góp ý của bạn rất quan trọng với chúng mình!
                            </p>
                        </div>
                    ) : null
                ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 text-center mb-8">
                        <p className="text-gray-500 font-bold mb-4">Vui lòng đăng nhập để gửi đánh giá của bạn</p>
                        <button onClick={() => navigate('/login')} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all uppercase text-xs tracking-widest">
                            Đăng nhập ngay
                        </button>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <p className="text-gray-400">Chưa có đánh giá nào.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                        {r.userAvatarUrl ? (
                                            <img src={r.userAvatarUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><UserCircleIconOutline className="w-7 h-7" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-black text-gray-900 leading-tight uppercase tracking-tighter">
                                                {r.userFullName || r.username}
                                                {r.status === 'PENDING' && (
                                                    <span className="ml-2 bg-orange-100 text-orange-600 text-[8px] px-1.5 py-0.5 rounded-md font-black italic">Đang chờ duyệt</span>
                                                )}
                                            </p>
                                            {user && (user.username === r.username) && (
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => handleEditClick(r)}
                                                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteReview(r.id)}
                                                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                s <= r.rating 
                                                ? <StarIconSolid key={s} className="w-3.5 h-3.5 text-yellow-400" /> 
                                                : <StarIconOutline key={s} className="w-3.5 h-3.5 text-gray-200" />
                                            ))}
                                            <span className="text-[10px] text-gray-400 ml-2 font-black uppercase tracking-widest italic">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed font-medium pl-1">{r.comment}</p>
                                
                                {r.media && r.media.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2 pl-1">
                                        {r.media.map((m, i) => (
                                            <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 group/img">
                                                {m.fileType === 'video' ? (
                                                    <video src={m.url} className="w-full h-full object-cover" controls />
                                                ) : (
                                                    <img 
                                                        src={m.url} 
                                                        className="w-full h-full object-cover cursor-zoom-in group-hover/img:scale-110 transition-transform duration-500" 
                                                        alt="" 
                                                        onClick={() => window.open(m.url, '_blank')} 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {r.adminReply && (
                                    <div className="mt-6 ml-4 p-5 bg-blue-50/50 border border-blue-100/50 rounded-2xl relative">
                                        <div className="absolute top-0 left-6 -translate-y-1/2 w-4 h-4 bg-blue-50/50 border-t border-l border-blue-100/50 rotate-45"></div>
                                        <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1 shadow-sm w-fit bg-blue-100 px-2 py-0.5 rounded-lg">Admin phản hồi</p>
                                        <p className="text-sm text-blue-800 font-medium italic">{r.adminReply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </LayoutComponent>
    );
}
