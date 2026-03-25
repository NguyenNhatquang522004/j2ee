import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
    { value: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng (COD)' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
    { value: 'MOMO', label: 'Ví MoMo' },
    { value: 'VNPAY', label: 'VNPay' },
];

export default function Checkout() {
    const { cart, fetchCart } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        shippingAddress: '',
        paymentMethod: 'CASH_ON_DELIVERY',
        couponCode: '',
        note: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shippingAddress.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng'); return; }
        setLoading(true);
        try {
            const orderItems = cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));
            await orderService.create({
                items: orderItems,
                shippingAddress: form.shippingAddress,
                paymentMethod: form.paymentMethod,
                couponCode: form.couponCode || undefined,
                note: form.note || undefined,
            });
            await fetchCart();
            toast.success('Đặt hàng thành công!');
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const items = cart?.items || [];

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Thanh toán</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
                    <div className="card">
                        <h2 className="font-bold text-gray-700 mb-4">Thông tin giao hàng</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng *</label>
                                <textarea
                                    name="shippingAddress"
                                    value={form.shippingAddress}
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                    className="input-field"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                                <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="input-field">
                                    {PAYMENT_METHODS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
                                <input name="couponCode" value={form.couponCode} onChange={handleChange} className="input-field" placeholder="Nhập mã nếu có" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea name="note" value={form.note} onChange={handleChange} rows={2} className="input-field" placeholder="Ghi chú cho người giao hàng..." />
                            </div>
                        </div>
                    </div>
                    <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full text-base py-3">
                        {loading ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
                    </button>
                </form>

                {/* Summary */}
                <div className="card h-fit">
                    <h2 className="font-bold text-lg text-gray-800 mb-4">Đơn hàng ({items.length} sản phẩm)</h2>
                    <div className="space-y-3 mb-4">
                        {items.map((item) => (
                            <div key={item.cartItemId} className="flex items-center gap-3 text-sm">
                                <span className="flex-1 text-gray-700 truncate">{item.productName}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                                <span className="font-medium text-gray-800 w-24 text-right">{item.subtotal?.toLocaleString('vi-VN')}đ</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-base">
                        <span>Tổng cộng</span>
                        <span className="text-green-700">{cart?.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
