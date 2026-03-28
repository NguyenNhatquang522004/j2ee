import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { addressService, orderService, couponService } from '../../api/services';
import { useCart } from '../../context/CartContext';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { 
    CheckCircleIcon, 
    MapPinIcon, 
    DevicePhoneMobileIcon, 
    CreditCardIcon, 
    TicketIcon, 
    ChatBubbleBottomCenterTextIcon, 
    PlusIcon,
    XMarkIcon,
    ShoppingBagIcon,
    ArrowRightIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline';

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
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [createdOrder, setCreatedOrder] = useState(null);

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

    const handleValidateCoupon = async () => {
        if (!form.couponCode.trim()) return;
        setValidatingCoupon(true);
        try {
            const res = await couponService.validate(form.couponCode.trim(), cart.totalAmount);
            setAppliedCoupon(res.data);
            toast.success(`Đã áp dụng mã: ${res.data.code}`);
        } catch (err) {
            setAppliedCoupon(null);
            toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setForm({ ...form, couponCode: '' });
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        let discount = (cart.totalAmount * appliedCoupon.discountPercent) / 100;
        if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
            discount = appliedCoupon.maxDiscountAmount;
        }
        return discount;
    };

    const discount = calculateDiscount();
    const finalAmount = (cart?.totalAmount || 0) - discount;

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
            const res = await orderService.create({
                items: orderItems,
                shippingAddress: form.shippingAddress,
                phone: form.phone,
                paymentMethod: form.paymentMethod,
                couponCode: appliedCoupon ? appliedCoupon.code : undefined,
                note: form.note || undefined,
            });
            
            await fetchCart();
            
            if (form.paymentMethod === 'BANK_TRANSFER') {
                setCreatedOrder(res.data);
                setShowQrModal(true);
                toast.success('Đơn hàng đã được tạo. Vui lòng thanh toán!');
            } else {
                toast.success('Đặt hàng thành công!');
                navigate('/orders');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đặt hàng thất bại');
        } finally {
            setLoading(false);
        }
    };

    const items = cart?.items || [];

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 font-vietnam tracking-tight">Thanh toán</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4 font-vietnam">
                    <div className="card shadow-sm border border-gray-100 rounded-3xl p-8">
                        <h2 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                            <MapPinIcon className="w-5 h-5 text-emerald-600" />
                            Thông tin giao hàng
                        </h2>
                        <div className="space-y-6">
                            {/* Saved Addresses */}
                            {savedAddresses.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => handleAddressSelect(addr)}
                                            className={`cursor-pointer p-4 border-2 rounded-2xl transition-all duration-300 ${
                                                selectedAddressId === addr.id 
                                                ? 'border-emerald-600 bg-emerald-50/50 shadow-md translate-y-[-2px]' 
                                                : 'border-gray-50 hover:border-emerald-200 bg-gray-50/30'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-black text-xs text-emerald-800 uppercase tracking-widest">{addr.label}</span>
                                                {addr.isDefault && <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase">Mặc định</span>}
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium line-clamp-2">{addr.details}</p>
                                        </div>
                                    ))}
                                    <div
                                        onClick={() => handleAddressSelect('new')}
                                        className={`cursor-pointer p-4 border-2 border-dashed rounded-2xl transition-all flex flex-col items-center justify-center gap-2 h-full ${
                                            selectedAddressId === 'new' 
                                            ? 'border-emerald-600 bg-emerald-50/50' 
                                            : 'border-gray-200 hover:border-emerald-200 text-gray-400'
                                        }`}
                                    >
                                        <PlusIcon className="w-6 h-6 text-emerald-600" />
                                        <span className="text-xs font-black uppercase tracking-widest">Địa chỉ khác</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                    {selectedAddressId === 'new' ? 'Địa chỉ giao hàng mới *' : 'Chi tiết địa chỉ'}
                                </label>
                                <textarea
                                    name="shippingAddress"
                                    value={form.shippingAddress}
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none focus:bg-white"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <DevicePhoneMobileIcon className="w-4 h-4" /> Số điện thoại *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none focus:bg-white"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                        <CreditCardIcon className="w-4 h-4" /> Thanh toán
                                    </label>
                                    <select 
                                        name="paymentMethod" 
                                        value={form.paymentMethod} 
                                        onChange={handleChange} 
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-black text-gray-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none appearance-none cursor-pointer focus:bg-white"
                                    >
                                        {PAYMENT_METHODS.map((m) => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 border-t pt-6">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                    <TicketIcon className="w-4 h-4" /> Mã giảm giá (Voucher)
                                </label>
                                <div className="relative group">
                                    <input 
                                        name="couponCode" 
                                        value={form.couponCode} 
                                        onChange={handleChange} 
                                        disabled={!!appliedCoupon}
                                        className={`w-full px-6 py-4 pr-32 bg-gray-50 border-none rounded-2xl font-black tracking-widest uppercase focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none ${appliedCoupon ? 'bg-green-50 text-green-700' : 'focus:bg-white'}`} 
                                        placeholder="NHẬP MÃ" 
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        {appliedCoupon ? (
                                            <button 
                                                type="button" 
                                                onClick={removeCoupon} 
                                                className="flex items-center gap-1.5 px-3 py-2 bg-red-100/50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-black text-[10px] uppercase"
                                            >
                                                <XMarkIcon className="w-4 h-4" /> Gỡ bỏ
                                            </button>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={handleValidateCoupon}
                                                disabled={validatingCoupon || !form.couponCode.trim()}
                                                className="bg-emerald-600 text-white text-[10px] font-black px-4 py-2.5 rounded-xl hover:bg-emerald-700 uppercase tracking-wider disabled:opacity-50 shadow-md shadow-emerald-100 active:scale-95 transition-all"
                                            >
                                                {validatingCoupon ? 'Đang kiểm tra...' : 'Áp dụng'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {appliedCoupon && (
                                    <p className="text-[10px] text-green-600 font-black italic ml-2 mt-2 uppercase tracking-tight flex items-center gap-1">
                                        <CheckCircleIcon className="w-4 h-4" /> Đã áp dụng ưu đãi: -{appliedCoupon.discountPercent}% cho đơn hàng
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2 border-t pt-6">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" /> Ghi chú cho người giao hàng
                                </label>
                                <textarea 
                                    name="note" 
                                    value={form.note} 
                                    onChange={handleChange} 
                                    rows={2} 
                                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-medium text-gray-900 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none focus:bg-white" 
                                    placeholder="Ghi chú thêm về thời gian, địa điểm cụ thể..." 
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || items.length === 0} 
                        className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-50 flex justify-center items-center gap-3 mt-8 uppercase tracking-tight"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Đang xử lý đơn hàng...</span>
                            </div>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-7 h-7" />
                                <span>Xác nhận & Đặt hàng ngay</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="card shadow-2xl shadow-emerald-50/50 border border-emerald-50 rounded-[2.5rem] p-8 sticky top-24 bg-white/70 backdrop-blur-xl">
                        <h2 className="font-black text-xl text-gray-900 mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                <ShoppingBagIcon className="w-6 h-6 text-emerald-600" />
                            </div>
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.cartItemId} className="flex justify-between items-start text-sm group animate-in slide-in-from-right duration-300">
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-black group-hover:text-emerald-600 transition-colors leading-snug">{item.productName}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 italic">Số lượng: {item.quantity}</p>
                                    </div>
                                    <span className="font-black text-gray-800 ml-4 font-vietnam whitespace-nowrap">{item.subtotal?.toLocaleString('vi-VN')} đ</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <div className="flex justify-between text-sm font-bold text-gray-500 italic uppercase tracking-tighter">
                                <span>Tạm tính</span>
                                <span className="text-gray-700">{cart?.totalAmount?.toLocaleString('vi-VN')} đ</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-sm font-black text-green-600 animate-in zoom-in duration-300">
                                    <span>Giam gia ({appliedCoupon?.code})</span>
                                    <span>- {discount.toLocaleString('vi-VN')} đ</span>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-6 mt-4 border-t border-emerald-100/50 border-dashed">
                                <span className="text-sm font-black text-gray-400 uppercase tracking-widest pb-1 mb-1">Tổng tiền thanh toán</span>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-emerald-600 block leading-none font-vietnam tracking-tighter">
                                        {finalAmount.toLocaleString('vi-VN')} <span className="text-xl">đ</span>
                                    </span>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">Đã bao gồm VAT & Phí dịch vụ</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-emerald-50/30 rounded-2xl border border-emerald-50">
                            <p className="text-[10px] text-emerald-400 font-medium italic text-center">
                                Phí vận chuyển sẽ được hiển thị khi liên hệ xác nhận đơn hàng theo khu vực.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SePay QR Modal */}
            <Transition appear show={showQrModal} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => {}}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto font-vietnam">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl transition-all border border-gray-100 text-center relative">
                                    <div className="absolute top-6 right-6">
                                        <button 
                                            onClick={() => navigate('/orders')}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <QrCodeIcon className="w-10 h-10" />
                                    </div>

                                    <Dialog.Title as="h3" className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                                        Thanh toán chuyển khoản
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-400 font-bold mb-8 uppercase tracking-widest italic">Quét mã VietQR để hoàn tất</p>

                                    <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-dashed border-gray-200 relative group">
                                        {createdOrder && (
                                            <img 
                                                src={`https://qr.sepay.vn/img?acc=96924888888&bank=TPBank&amount=${createdOrder.finalAmount}&des=FF${createdOrder.id}&template=compact`} 
                                                alt="SePay QR Code" 
                                                className="w-full aspect-square object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black text-blue-500 uppercase tracking-tighter shadow-sm border border-blue-100">SePay Powered</div>
                                    </div>

                                    <div className="space-y-4 text-left mb-8 bg-blue-50/30 p-6 rounded-3xl border border-blue-50">
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Số tiền</span>
                                            <span className="text-blue-600 font-black text-sm">{createdOrder?.finalAmount?.toLocaleString('vi-VN')} đ</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Nội dung</span>
                                            <span className="text-gray-900 font-black text-sm uppercase">FF{createdOrder?.id}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="w-full py-4 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        Tôi đã chuyển khoản
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                    
                                    <p className="mt-6 text-[10px] text-gray-400 font-medium italic">
                                        Hệ thống sẽ tự động cập nhật trạng thái sau khi nhận được tiền.
                                    </p>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </Layout>
    );
}
