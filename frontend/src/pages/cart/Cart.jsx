import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';


export default function Cart() {
    const { cart, loading, updateItem, removeItem, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return (
        <Layout>
            <div className="text-center py-20">
                <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
                <Link to="/login" className="btn-primary">Đăng nhập</Link>
            </div>
        </Layout>
    );

    if (loading) return <Layout><div className="text-center py-20 text-gray-400">Đang tải...</div></Layout>;

    const items = cart?.items || [];

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="p-6 bg-green-50 rounded-full">
                            <ShoppingCartIcon className="w-16 h-16 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 mb-6 text-lg">Giỏ hàng của bạn đang trống</p>
                    <Link to="/products" className="btn-primary px-8">Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <CartItem key={item.cartItemId} item={item} onUpdate={updateItem} onRemove={removeItem} />
                        ))}
                        <button
                            onClick={async () => {
                                if (!confirm('Xóa tất cả sản phẩm khỏi giỏ hàng?')) return;
                                await clearCart();
                                toast.success('Đã xóa sạch giỏ hàng');
                            }}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold transition-colors bg-red-50 px-4 py-2 rounded-xl"
                        >
                            <TrashIcon className="w-4 h-4" />
                            Xóa tất cả
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="card h-fit">
                        <h2 className="font-bold text-lg text-gray-800 mb-4">Tóm tắt đơn hàng</h2>
                        <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Số lượng sản phẩm</span>
                                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base border-t pt-2">
                                <span>Tổng cộng</span>
                                <span className="text-green-700">{cart?.totalAmount?.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                            Tiến hành đặt hàng
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </Layout>
    );
}

function CartItem({ item, onUpdate, onRemove }) {
    return (
        <div className="card flex items-center gap-4">
            <div className="w-20 h-20 bg-green-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-green-100">
                {item.productImageUrl ? (
                    <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                    <ShoppingCartIcon className="w-10 h-10 text-green-200" />
                )}
            </div>
            <div className="flex-1">
                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-800 hover:text-green-700">
                    {item.productName}
                </Link>
                <p className="text-sm text-gray-500">{item.unitPrice?.toLocaleString('vi-VN')}đ/đơn vị</p>
                <p className="text-xs text-gray-400">Còn: {item.availableStock}</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                        onClick={() => { if (item.quantity > 1) onUpdate(item.cartItemId, item.quantity - 1); }}
                        className="p-2 hover:bg-gray-50 text-gray-500"
                    >
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-bold text-gray-800 min-w-[40px] text-center">{item.quantity}</span>
                    <button
                        onClick={() => { if (item.quantity < item.availableStock) onUpdate(item.cartItemId, item.quantity + 1); }}
                        className="p-2 hover:bg-gray-50 text-gray-500"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
                <span className="font-bold text-green-700 w-28 text-right">
                    {item.subtotal?.toLocaleString('vi-VN')}đ
                </span>
                <button
                    onClick={() => onRemove(item.cartItemId)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Xóa"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
