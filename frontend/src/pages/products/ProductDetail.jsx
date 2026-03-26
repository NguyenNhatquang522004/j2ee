import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, reviewService, wishlistService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
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
    PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (user && id) {
            wishlistService.check(id).then(res => setIsLiked(res.data)).catch(() => {});
        }
    }, [user, id]);

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
                const [pRes, rRes] = await Promise.all([
                    productService.getById(id),
                    reviewService.byProduct(id, { page: 0, size: 10 }),
                ]);
                setProduct(pRes.data);
                setReviews(rRes.data.content || rRes.data);
            } catch {
                toast.error('Không thể tải sản phẩm');
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleAddToCart = async () => {
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        try {
            await addToCart(product.id, quantity);
            toast.success(`Đã thêm ${quantity} ${product.unit} vào giỏ hàng!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) { toast.error('Vui lòng đăng nhập'); return; }
        setSubmittingReview(true);
        try {
            await reviewService.add({ productId: product.id, ...reviewForm });
            toast.success('Đã gửi đánh giá!');
            setReviewForm({ rating: 5, comment: '' });
            const r = await reviewService.byProduct(id, { page: 0, size: 10 });
            setReviews(r.data.content || r.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi gửi đánh giá');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <Layout><div className="text-center py-20 text-gray-400">Đang tải...</div></Layout>;
    if (!product) return null;

    return (
        <Layout>
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {product.isNew && (
                            <span className="bg-black text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-sm uppercase tracking-widest">
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

                    <div className="flex items-baseline gap-4 mb-4">
                        <div className="text-4xl font-black text-green-700">
                            {product.price?.toLocaleString('vi-VN')}đ
                            <span className="text-lg font-bold text-gray-400">/{product.unit}</span>
                        </div>
                        {product.originalPrice > product.price && (
                            <div className="text-xl font-bold text-gray-300 line-through italic">
                                {product.originalPrice.toLocaleString('vi-VN')}đ
                            </div>
                        )}
                    </div>

                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-3 mb-6 bg-yellow-50 w-fit px-4 py-2 rounded-xl border border-yellow-100">
                            <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    s <= Math.round(product.averageRating) 
                                    ? <StarIconSolid key={s} className="w-5 h-5 text-yellow-400" /> 
                                    : <StarIconOutline key={s} className="w-5 h-5 text-gray-200" />
                                ))}
                            </div>
                            <span className="text-yellow-800 font-black text-sm">{product.averageRating.toFixed(1)} / 5.0</span>
                        </div>
                    )}

                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Tồn kho: </span>
                        <span className={`font-semibold ${product.totalStock === 0 ? 'text-red-600' : 'text-green-700'}`}>
                            {product.totalStock === 0 ? 'Hết hàng' : `${product.totalStock} ${product.unit}`}
                        </span>
                    </div>

                    {product.totalStock > 0 && product.isActive && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                                    className="p-4 hover:bg-gray-50 text-gray-500 transition-colors"
                                >
                                    <MinusIcon className="w-5 h-5" />
                                </button>
                                <span className="px-6 py-2 font-black text-gray-800 text-xl min-w-[60px] text-center">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => Math.min(product.totalStock, q + 1))} 
                                    className="p-4 hover:bg-gray-50 text-gray-500 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <button onClick={handleAddToCart} className="btn-primary flex-1 py-4 text-lg font-bold flex items-center justify-center gap-3 shadow-green-100 shadow-xl">
                                <ShoppingCartIcon className="w-6 h-6 text-white/90" />
                                Thêm vào giỏ
                            </button>
                            <button 
                                onClick={toggleWishlist}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center ${isLiked ? 'bg-red-50 border-red-200 text-red-500 shadow-inner' : 'bg-white border-gray-100 text-gray-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50/30 shadow-sm'}`}
                                title={isLiked ? "Xoá khỏi yêu thích" : "Thêm vào yêu thích"}
                            >
                                {isLiked ? <HeartIconSolid className="w-7 h-7" /> : <HeartIconOutline className="w-7 h-7" />}
                            </button>
                        </div>
                    )}

                    {product.certificationDescription && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                            <span className="font-semibold">Chứng nhận: </span>{product.certificationDescription}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <section className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Đánh giá sản phẩm ({reviews.length})</h2>

                {user && (
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
                            rows={3}
                            className="input-field mb-3"
                        />
                        <button type="submit" disabled={submittingReview} className="btn-primary">
                            {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </form>
                )}

                {reviews.length === 0 ? (
                    <p className="text-gray-400">Chưa có đánh giá nào.</p>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div key={r.id} className="card">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-1">
                                        <p className="font-black text-gray-800 text-base">{r.fullName || r.username}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                s <= r.rating 
                                                ? <StarIconSolid key={s} className="w-4 h-4 text-yellow-400" /> 
                                                : <StarIconOutline key={s} className="w-4 h-4 text-gray-200" />
                                            ))}
                                            <span className="text-[10px] text-gray-400 ml-2 font-bold uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm">{r.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </Layout>
    );
}
