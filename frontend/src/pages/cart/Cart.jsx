import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ModalContext';
import { settingsService } from '../../api/services';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { ShoppingCartIcon, TrashIcon, MinusIcon, PlusIcon, ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';


export default function Cart() {
    const { cart, loading, updateItem, removeItem, clearCart } = useCart();
    const { user } = useAuth();
    const confirm = useConfirm();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({ FREE_SHIPPING_THRESHOLD: 0 });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data } = await settingsService.getPublic();
            const s = data.find(i => i.settingKey === 'FREE_SHIPPING_THRESHOLD');
            if (s) setSettings({ FREE_SHIPPING_THRESHOLD: Number(s.settingValue) });
        } catch (err) {
            console.error(err);
        }
    };

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
    const hasInactiveItems = items.some(i => !i.isActive);

    const handleClearCart = async () => {
        const ok = await confirm({
            title: 'Xóa giỏ hàng',
            message: 'Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng không?',
            type: 'danger'
        });
        
        if (ok) {
            await clearCart();
            toast.success('Đã xóa sạch giỏ hàng');
        }
    };

    return (
        <Layout>
            <h1 className="text-xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="p-5 bg-green-50 rounded-full">
                            <ShoppingCartIcon className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 mb-6 text-base">Giỏ hàng của bạn đang trống</p>
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
                            onClick={handleClearCart}
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
                                <span className="text-green-700">{(cart?.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        {settings.FREE_SHIPPING_THRESHOLD > 0 && cart?.totalAmount < settings.FREE_SHIPPING_THRESHOLD ? (
                            <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 italic">
                                <p className="text-[10px] text-amber-700 font-bold">
                                    Mua thêm {(settings.FREE_SHIPPING_THRESHOLD - (cart?.totalAmount || 0)).toLocaleString('vi-VN')}đ để được MIỄN PHÍ VẬN CHUYỂN
                                </p>
                                <div className="w-full h-1.5 bg-amber-200/50 rounded-full mt-2 overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 transition-all duration-500" 
                                        style={{ width: `${Math.min(100, ((cart?.totalAmount || 0) / settings.FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ) : settings.FREE_SHIPPING_THRESHOLD > 0 && (
                            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <p className="text-[10px] text-green-700 font-black uppercase tracking-wider">Đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN</p>
                            </div>
                        )}
                        {hasInactiveItems && (
                            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-700 font-bold">
                                    Giỏ hàng có sản phẩm ngừng kinh doanh. Vui lòng xóa để tiếp tục.
                                </p>
                            </div>
                        )}
                        <button 
                            onClick={() => !hasInactiveItems && navigate('/checkout')} 
                            disabled={hasInactiveItems}
                            className={`btn-primary w-full flex items-center justify-center gap-2 py-3 ${hasInactiveItems ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
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
        <div className="card flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-20 sm:w-16 sm:h-16 bg-green-50 rounded-lg flex items-center justify-center shrink-0 overflow-hidden border border-green-100 shadow-sm">
                    {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                        <ShoppingCartIcon className="w-8 h-8 text-green-200" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link to={item.isActive ? `/products/${item.productId}` : '#'} className={`font-bold text-gray-800 hover:text-green-700 transition-colors line-clamp-2 ${!item.isActive ? 'text-gray-400 cursor-default' : ''}`}>
                            {item.productName}
                        </Link>
                        {!item.isActive && (
                            <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Ngừng kinh doanh</span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{(item.unitPrice || 0).toLocaleString('vi-VN')}đ/đơn vị</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kho: {item.isActive ? item.availableStock : 0}</p>
                </div>
            </div>
            
            <div className={`flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50 ${!item.isActive ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <button
                        onClick={() => { if (item.quantity > 1) onUpdate(item.cartItemId, item.quantity - 1); }}
                        className="p-2 hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-black text-gray-800 min-w-[40px] text-center text-sm">{item.quantity}</span>
                    <button
                        onClick={() => { if (item.quantity < item.availableStock) onUpdate(item.cartItemId, item.quantity + 1); }}
                        className="p-2 hover:bg-gray-50 text-gray-500 transition-colors"
                    >
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="font-extrabold text-green-700 text-lg w-auto sm:w-28 text-right">
                        {(item.subtotal || 0).toLocaleString('vi-VN')}đ
                    </span>
                    <button
                        onClick={() => onRemove(item.cartItemId)}
                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                        title="Xóa khỏi giỏ"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
