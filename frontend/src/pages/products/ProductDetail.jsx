import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, reviewService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

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
                <div className="rounded-xl overflow-hidden bg-gray-100 h-96 flex items-center justify-center">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-8xl">🥦</span>
                    )}
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {product.certification && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                ✓ {product.certification}
                            </span>
                        )}
                        {!product.isActive && (
                            <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">Ngừng bán</span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <p className="text-gray-500 text-sm mb-4">
                        {product.farmName && <span>🌱 {product.farmName} · {product.farmProvince}</span>}
                    </p>

                    <div className="text-3xl font-bold text-green-700 mb-2">
                        {product.price?.toLocaleString('vi-VN')}đ
                        <span className="text-lg font-normal text-gray-400">/{product.unit}</span>
                    </div>

                    {product.averageRating > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-yellow-400 text-lg">{'⭐'.repeat(Math.round(product.averageRating))}</span>
                            <span className="text-gray-500 text-sm">{product.averageRating.toFixed(1)} / 5</span>
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
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">-</button>
                                <span className="px-4 py-2 font-semibold">{quantity}</span>
                                <button onClick={() => setQuantity(q => Math.min(product.totalStock, q + 1))} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 font-bold">+</button>
                            </div>
                            <button onClick={handleAddToCart} className="btn-primary flex-1">
                                🛒 Thêm vào giỏ
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
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">Số sao:</span>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s} type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                    className={`text-2xl ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ⭐
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
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-800">{r.fullName || r.username}</span>
                                    <span className="text-yellow-400">{'⭐'.repeat(r.rating)}</span>
                                    <span className="text-gray-400 text-xs ml-auto">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
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
