import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressService, orderService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { CheckCircleIcon, MapPinIcon, DevicePhoneMobileIcon, CreditCardIcon, TicketIcon, ChatBubbleBottomCenterTextIcon, PlusIcon } from '@heroicons/react/24/outline';

const PAYMENT_METHODS = [
    { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
    { value: 'MOMO', label: 'Ví MoMo' },
    { value: 'VNPAY', label: 'VNPay' },
];

export default function Checkout() {
    const { cart, fetchCart } = useCart();
    const navigate = useNavigate();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [form, setForm] = useState({
        shippingAddress: '',
        phone: '',
        paymentMethod: 'COD',
        couponCode: '',
        note: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            const { data } = await addressService.getAll();
            setSavedAddresses(data || []);
            const def = (data || []).find(a => a.isDefault);
            if (def) {
                setSelectedAddressId(def.id);
                setForm(prev => ({ 
                    ...prev, 
                    shippingAddress: def.details,
                    phone: def.phone || ''
                }));
            }
        } catch (err) {
            console.error("Failed to load addresses", err);
        }
    };

    const handleAddressSelect = (addr) => {
        if (addr === 'new') {
            setSelectedAddressId('new');
            setForm({ ...form, shippingAddress: '', phone: '' });
        } else {
            setSelectedAddressId(addr.id);
            setForm({ ...form, shippingAddress: addr.details, phone: addr.phone || '' });
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.shippingAddress.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng'); return; }
        if (!form.phone.trim()) { toast.error('Vui lòng nhập số điện thoại'); return; }
        setLoading(true);
        try {
            const orderItems = cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            }));
            await orderService.create({
                items: orderItems,
                shippingAddress: form.shippingAddress,
                phone: form.phone,
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
                            {/* Saved Addresses */}
                            {savedAddresses.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => handleAddressSelect(addr)}
                                            className={`cursor-pointer p-3 border-2 rounded-xl transition-all ${
                                                selectedAddressId === addr.id 
                                                ? 'border-green-600 bg-green-50 shadow-sm' 
                                                : 'border-gray-200 hover:border-green-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-green-800 uppercase tracking-wider">{addr.label}</span>
                                                {addr.isDefault && <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded">Mặc định</span>}
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2">{addr.details}</p>
                                        </div>
                                    ))}
                                        <div
                                            onClick={() => handleAddressSelect('new')}
                                            className={`cursor-pointer p-3 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                                                selectedAddressId === 'new' 
                                                ? 'border-green-600 bg-green-50' 
                                                : 'border-gray-300 hover:border-green-300 text-gray-500'
                                            }`}
                                        >
                                            <PlusIcon className="w-5 h-5 text-green-600" />
                                            <span className="text-sm font-medium">Địa chỉ khác</span>
                                        </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {selectedAddressId === 'new' ? 'Địa chỉ giao hàng mới *' : 'Chi tiết địa chỉ'}
                                </label>
                                <textarea
                                    name="shippingAddress"
                                    value={form.shippingAddress}
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                    disabled={selectedAddressId !== 'new'}
                                    className={`input-field ${selectedAddressId !== 'new' ? 'bg-gray-50 text-gray-600' : ''}`}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại giao hàng *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Nhập số điện thoại liên hệ"
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
                    <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full text-lg py-4 flex justify-center items-center gap-2">
                        {loading ? 'Đang xử lý...' : (
                            <>
                                <CheckCircleIcon className="w-6 h-6" />
                                Xác nhận đặt hàng
                            </>
                        )}
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
