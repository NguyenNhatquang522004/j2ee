import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService, cartService, mediaService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { 
    ChevronLeftIcon, 
    ClockIcon, 
    CheckCircleIcon, 
    TruckIcon, 
    ArchiveBoxIcon, 
    CreditCardIcon,
    ArrowPathIcon,
    PrinterIcon,
    MapPinIcon,
    PhoneIcon,
    XCircleIcon,
    ReceiptRefundIcon,
    ShieldCheckIcon,
    XMarkIcon,
    PhotoIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const STEPS = [
    { key: 'PENDING', label: 'Đặt hàng', icon: ClockIcon },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircleIcon },
    { key: 'SHIPPING', label: 'Đang vận chuyển', icon: TruckIcon },
    { key: 'DELIVERED', label: 'Giao hàng thành công', icon: ArchiveBoxIcon },
];

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        orderService.getById(id)
            .then(res => setOrder(res.data))
            .catch(() => toast.error('Không thể tải chi tiết đơn hàng'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleBuyAgain = async () => {
        const loadingToast = toast.loading('Đang thêm vào giỏ hàng...');
        try {
            for (const item of order.orderItems) {
                await cartService.addItem({
                    productId: item.productId,
                    quantity: item.quantity
                });
            }
            toast.success('Đã thêm sản phẩm vào giỏ hàng', { id: loadingToast });
            navigate('/cart');
        } catch (err) {
            toast.error('Có lỗi khi thêm sản phẩm vào giỏ hàng', { id: loadingToast });
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
        const loadingToast = toast.loading('Đang xử lý hủy đơn...');
        try {
            const res = await orderService.cancel(id);
            setOrder(res.data);
            toast.success('Đã hủy đơn hàng thành công', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng', { id: loadingToast });
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            toast.error('Chỉ chấp nhận định dạng ảnh hoặc video!');
            return;
        }

        const maxSize = isImage ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error(`${isImage ? 'Ảnh' : 'Video'} minh chứng không được vượt quá ${maxSize / (1024 * 1024)}MB!`);
            return;
        }

        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleRequestReturn = async () => {
        if (!returnReason.trim()) {
            toast.error('Vui lòng nhập lý do để chúng tôi có thể xử lý yêu cầu của bạn.');
            return;
        }

        if (!selectedImage) {
            toast.error('Vui lòng tải lên hình ảnh minh chứng (sản phẩm lỗi/hư hại).');
            return;
        }
        
        const loadingToast = toast.loading('Đang xử lý yêu cầu...');
        try {
            let imageUrl = null;
            if (selectedImage) {
                const formData = new FormData();
                formData.append('file', selectedImage);
                const uploadRes = await mediaService.upload(formData);
                imageUrl = uploadRes.data.url;
            }

            const res = await orderService.requestReturn(id, returnReason, imageUrl);
            setOrder(res.data);
            setShowReturnModal(false);
            setReturnReason('');
            setSelectedImage(null);
            setPreviewUrl(null);
            toast.success('Yêu cầu trả hàng đã được gửi thành công. Chúng tôi sẽ xử lý sớm nhất có thể.', { id: loadingToast, duration: 5000 });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu trả hàng', { id: loadingToast });
        }
    };

    const handlePrintInvoice = () => {
        const printWindow = window.open('', '_blank');
        const itemsHtml = order.orderItems.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">${item.productName}</td>
                <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px 0; text-align: right;">${(item.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head><title>Hóa đơn #${order.orderCode}</title></head>
                <body style="padding: 40px; font-family: sans-serif;">
                    <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="margin: 0; color: #166534;">FRESHFOOD</h1>
                        <p style="margin: 5px 0; color: #666; font-size: 14px;">Cảm ơn bạn đã tin chọn FreshFood!</p>
                    </div>

                    <h2 style="text-align: center; color: #333;">HÓA ĐƠN BÁN HÀNG</h2>
                    <div style="margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                        <div>
                            <p><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
                            <p><strong>Ngày tạo:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'N/A'}</p>
                            <p><strong>Trình trạng:</strong> ${order.statusDisplayName || order.status}</p>
                        </div>
                        <div>
                            <p><strong>Khách hàng:</strong> ${order.receiverName || order.username}</p>
                            <p><strong>Điện thoại:</strong> ${order.phone || 'N/A'}</p>
                            <p><strong>Địa chỉ:</strong> ${order.addressDetail || order.shippingAddress}</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                <th style="padding: 12px; text-align: left;">Sản phẩm</th>
                                <th style="padding: 12px; text-align: center;">SL</th>
                                <th style="padding: 12px; text-align: right;">Đơn giá</th>
                                <th style="padding: 12px; text-align: right;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>

                    <div style="width: 300px; margin-left: auto; border-top: 1px solid #eee; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Tạm tính:</span>
                            <span style="font-weight: bold;">${(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        ${order.discountAmount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626;">
                            <span>Chiết khấu:</span>
                            <span>-${(order.discountAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>` : ''}
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Phí vận chuyển:</span>
                            <span style="font-weight: bold;">${(order.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; border-top: 2px solid #166534; padding-top: 10px; margin-top: 10px; font-size: 18px;">
                            <span style="font-weight: 800; color: #166534;">TỔNG CỘNG:</span>
                            <span style="font-weight: 800; color: #166534;">${(order.finalAmount || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>

                    <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                        <p style="color: #666; font-style: italic;">Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi nhận hàng.<br/>FreshFood - Thực phẩm sạch cho mọi nhà.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const fmtFullDate = (s) => {
        if(!s) return null;
        const d = new Date(s);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <Layout><div className="animate-pulse py-20 text-center">Đang tải...</div></Layout>;
    if (!order) return <Layout><div className="py-20 text-center text-red-500 font-bold">Không tìm thấy đơn hàng</div></Layout>;

    let displaySteps = [];
    if (order.status === 'CANCELLED') {
        displaySteps = [
            { key: 'PENDING', label: 'Đặt hàng', icon: ClockIcon, completed: true, time: order.createdAt },
            { key: 'CANCELLED', label: 'Đã hủy', icon: XCircleIcon, completed: true, error: true, time: order.cancelledAt || order.updatedAt }
        ];
    } else if (order.status === 'RETURN_REQUESTED' || order.status === 'RETURNED' || order.status === 'RETURN_REJECTED') {
        displaySteps = [
            { key: 'PENDING', label: 'Đặt hàng', icon: ClockIcon, completed: true, time: order.createdAt },
            { key: 'DELIVERED', label: 'Đã giao hàng', icon: ArchiveBoxIcon, completed: true, time: order.deliveredAt },
            { key: 'RETURN_REQUESTED', label: 'Yêu cầu trả hàng', icon: ReceiptRefundIcon, completed: true, time: order.returnRequestedAt || order.updatedAt },
            { 
                key: order.status, 
                label: order.status === 'RETURNED' ? 'Đã hoàn tiền' : order.status === 'RETURN_REJECTED' ? 'Từ chối trả hàng' : 'Đang xử lý trả', 
                icon: order.status === 'RETURN_REJECTED' ? XCircleIcon : ShieldCheckIcon, 
                completed: order.status !== 'RETURN_REQUESTED', 
                error: order.status === 'RETURN_REJECTED',
                time: order.updatedAt 
            }
        ];
    } else {
        displaySteps = [
            { key: 'PENDING', label: 'Đặt hàng', icon: ClockIcon, completed: true, time: order.createdAt },
            { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircleIcon, completed: !!order.confirmedAt, time: order.confirmedAt },
            { key: 'SHIPPING', label: 'Đang vận chuyển', icon: TruckIcon, completed: !!order.shippedAt, time: order.shippedAt },
            { key: 'DELIVERED', label: 'Giao hàng thành công', icon: ArchiveBoxIcon, completed: !!order.deliveredAt, time: order.deliveredAt },
        ];
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/30">
                <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
                    {/* Breadcrumbs & Header */}
                    <Link to="/orders" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 transition-all mb-8 group">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                            <ChevronLeftIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">Lịch sử đơn hàng</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                    Đơn hàng <span className="text-green-600">#{order.orderCode}</span>
                                </h1>
                                <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                                    order.status === 'CANCELLED' || order.status === 'RETURN_REJECTED' ? 'bg-red-50 text-red-600 border-red-100' : 
                                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                    order.status === 'RETURN_REQUESTED' || order.status === 'RETURNED' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {order.status === 'RETURN_REJECTED' ? 'TỪ CHỐI TRẢ HÀNG' : (order.statusDisplayName || order.status)}
                                </span>
                            </div>
                            <p className="text-gray-500 font-medium flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                Đặt hàng vào lúc <span className="text-gray-900 font-bold">{fmtFullDate(order.createdAt)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* Left Column: Progress & Products */}
                        <div className="lg:col-span-2 space-y-10">
                            
                            {/* Visual Tracking Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                <h3 className="text-xl font-black text-gray-900 mb-12 flex items-center gap-3">
                                    Tiến độ đơn hàng
                                    <div className="h-0.5 w-12 bg-green-100"></div>
                                </h3>
                                
                                <div className="overflow-x-auto pb-4 -mx-2">
                                    <div className="relative flex justify-between items-start min-w-[600px] px-2">
                                    {/* Progress Background Line */}
                                    <div className="absolute top-7 left-10 right-10 h-1 bg-gray-50 rounded-full"></div>
                                    
                                    {displaySteps.map((step, idx) => {
                                        const isLast = idx === displaySteps.length - 1;
                                        const nextStep = !isLast ? displaySteps[idx+1] : null;
                                        return (
                                            <div key={idx} className="relative z-10 flex flex-col items-center gap-6 flex-1">
                                                {/* Connecting line for active state */}
                                                {!isLast && nextStep?.completed && (
                                                    <div className="absolute top-7 left-[50%] w-full h-1 bg-green-500 z-0"></div>
                                                )}

                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all duration-700 relative z-10 ${
                                                    step.completed ? (step.error ? 'bg-gradient-to-br from-red-500 to-red-600 rotate-12 scale-110' : 'bg-gradient-to-br from-green-500 to-green-600 scale-110 shadow-green-100') : 'bg-gray-100'
                                                }`}>
                                                    <step.icon className={`w-6 h-6 ${step.completed ? 'text-white' : 'text-gray-300'}`} />
                                                    {step.completed && !step.error && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="text-center group w-full">
                                                    <div className="min-h-[44px] flex items-center justify-center mb-2">
                                                        <p className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg transition-colors duration-500 leading-tight ${step.completed ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="min-h-[40px] flex flex-col items-center justify-start">
                                                        {step.time ? (
                                                            <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-3 py-1.5 rounded-full shadow-inner">
                                                                {fmtFullDate(step.time)}
                                                            </p>
                                                        ) : (
                                                            <div className="space-y-1 transform group-hover:translate-y-1 transition-transform">
                                                                {step.key === 'SHIPPING' && (
                                                                    <p className="text-[10px] text-gray-500 font-bold">Mã vận đơn<br/><span className="text-green-600 text-xs tracking-wider">{order.trackingNumber || 'CHỜ CẬP NHẬT'}</span></p>
                                                                )}
                                                                {step.key === 'DELIVERED' && (
                                                                    <p className="text-[10px] text-gray-500 font-bold">Dự kiến<br/><span className="text-gray-900 text-xs tracking-wider uppercase">{order.estimatedArrival ? fmtFullDate(order.estimatedArrival) : 'SỚM THÔI'}</span></p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    </div>
                                </div>
                            </div>

                            {/* Product List Card */}
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-blue-50/50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                                    <h3 className="text-xl font-black text-gray-900">Chi tiết sản phẩm</h3>
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{order.orderItems?.length} items</span>
                                </div>
                                <div className="space-y-8">
                                    {order.orderItems?.map((item) => (
                                        <div key={item.orderItemId} className="flex items-center gap-8 p-6 rounded-[2rem] border border-transparent hover:border-green-100 hover:bg-green-50/20 transition-all duration-500 group">
                                            <div className="w-24 h-24 rounded-3xl bg-gray-100 object-cover overflow-hidden border-4 border-white shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                <img 
                                                    src={item.productImageUrl || 'https://via.placeholder.com/150'} 
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-gray-900 text-lg mb-2 group-hover:text-green-700 transition-colors uppercase tracking-tight">{item.productName}</h4>
                                                <div className="flex items-center gap-4 text-sm font-bold">
                                                    <span className="py-1 px-3 bg-gray-100 rounded-lg text-gray-500">{(item.unitPrice || 0).toLocaleString('vi-VN')}đ</span>
                                                    <span className="text-gray-400">×</span>
                                                    <span className="py-1 px-3 bg-green-50 text-green-700 rounded-lg">{item.quantity} sản phẩm</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-green-600 tabular-nums">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery & Payment Info (Dual Cards Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                     <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-green-500 rounded-full"></div>
                                        Thông tin giao hàng
                                     </h3>
                                     <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Người nhận</p>
                                            <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-sm uppercase shadow-inner">
                                                {order.receiverName || order.username}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Số điện thoại</p>
                                            <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-sm tracking-widest shadow-inner leading-none">
                                                {order.phone}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Số nhà, tên đường</p>
                                            <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-bold text-sm italic shadow-inner">
                                                {order.shippingAddress?.split(', ')[0] || order.shippingAddress}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Phường/Xã</p>
                                                <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-[11px] shadow-inner">
                                                    {order.shippingAddress?.split(', ')[1] || '---'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Quận/Huyện</p>
                                                <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-[11px] shadow-inner">
                                                    {order.shippingAddress?.split(', ')[2] || '---'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-1">Tỉnh/TP</p>
                                                <div className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-[11px] shadow-inner">
                                                    {order.shippingAddress?.split(', ')[3] || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        {order.note && (
                                            <div className="mt-8 p-6 bg-gray-50 rounded-[1.5rem] border-l-4 border-green-500 relative overflow-hidden">
                                                <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">Ghi chú vận chuyển</p>
                                                <p className="text-gray-600 font-medium text-sm italic leading-relaxed">"{order.note}"</p>
                                            </div>
                                        )}
                                     </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                     <h3 className="text-xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                                        Hình thức thanh toán
                                     </h3>
                                     <div className="flex flex-col h-[calc(100%-80px)] justify-between">
                                        <div className="space-y-6">
                                            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Phương thức</p>
                                                    <p className="text-gray-900 font-black text-lg leading-none">
                                                        {order.paymentMethod === 'COD' ? 'Thanh toán trực tiếp' : order.paymentMethod}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500 text-sm font-medium">Trạng thái:</span>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                        order.isPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        {order.isPaid ? 'ĐÃ QUYẾT TOÁN' : 'CHƯA TRẢ'}
                                                    </span>
                                                </div>
                                                {order.deliveredAt && (
                                                    <div className="flex justify-between items-center text-xs border-t border-gray-200/50 pt-4">
                                                        <span className="text-gray-400 font-medium">Xác nhận ngày:</span>
                                                        <span className="text-gray-900 font-bold">{fmtFullDate(order.deliveredAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center gap-3 p-4 bg-green-50/30 rounded-2xl text-green-700 border border-green-100/50">
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                                                <ShieldCheckIcon className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-[11px] font-bold leading-relaxed">
                                                Giao dịch được bảo vệ và đảm bảo an toàn bởi hệ thống FreshFood Security.
                                            </p>
                                        </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Order Summary (Glassmorphism Sticky) */}
                        <div className="space-y-8 sticky top-12">
                            <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
                                <h3 className="text-2xl font-black text-gray-900 mb-10 tracking-tight">Thanh toán</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Tiền hàng</span>
                                        <span className="text-gray-900 text-lg tracking-tight tabular-nums">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Phí vận chuyển</span>
                                        <span className={order.shippingFee === 0 ? "text-green-600 font-black" : "text-gray-900"}>
                                            {order.shippingFee === 0 ? "Miễn phí" : `${(Number(order.shippingFee) || 0).toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-gray-400 uppercase tracking-widest">Thuế VAT (0%)</span>
                                        <span className="text-gray-900 tracking-tight italic">0đ</span>
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-sm font-bold px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
                                            <span className="text-green-700 uppercase tracking-[0.1em] flex items-center gap-2">
                                                🔖 {order.couponCode || 'VOUCHER'}
                                            </span>
                                            <span className="text-green-700 font-black tracking-tight tabular-nums">-{(Number(order.discountAmount) || 0).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    
                                    <div className="pt-8 border-t border-gray-100 flex flex-col items-end gap-1">
                                        <span className="font-black text-gray-400 text-xs uppercase tracking-widest mb-1">Tổng cộng</span>
                                        <div className="text-5xl font-black text-green-600 tracking-tighter tabular-nums drop-shadow-sm">
                                            {(Number(order.finalAmount) || 0).toLocaleString('vi-VN')}<span className="text-2xl ml-1">đ</span>
                                        </div>
                                    </div>

                                    {order.status === 'RETURN_REJECTED' && (
                                        <div className="mt-6 p-6 bg-red-50/50 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full -mr-10 -mt-10"></div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                                                    <XCircleIcon className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Yêu cầu bị từ chối</h4>
                                                    <p className="text-gray-600 text-[11px] font-bold leading-relaxed italic pr-4">"{order.rejectReason || 'Không có lý do chi tiết'}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="mt-10 space-y-4">
                                        <button 
                                            onClick={handleBuyAgain} 
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                        >
                                            <ArrowPathIcon className="w-5 h-5" />
                                            MUA LẠI NGAY
                                        </button>
                                        
                                        {order.status === 'DELIVERED' && (
                                            <button 
                                                onClick={() => setShowReturnModal(true)} 
                                                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-4 rounded-2xl border border-orange-200 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                            >
                                                <ReceiptRefundIcon className="w-5 h-5" />
                                                YÊU CẦU TRẢ HÀNG
                                            </button>
                                        )}

                                        {order.status === 'PENDING' && (
                                            <button 
                                                onClick={handleCancel} 
                                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-200 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                                HỦY ĐƠN HÀNG
                                            </button>
                                        )}

                                        <button 
                                            onClick={handlePrintInvoice} 
                                            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl border border-gray-200 flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] transition-colors"
                                        >
                                            <PrinterIcon className="w-4 h-4 text-gray-400" />
                                            XUẤT HÓA ĐƠN PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] px-10 leading-loose">
                                Bạn cần hỗ trợ? <br/>
                                Hotline: <span className="text-green-500">1900-FRESHFOOD</span> (8:00 - 21:00)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Return Reason Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500"
                        onClick={() => setShowReturnModal(false)}
                    ></div>
                    
                    {/* Modal Card */}
                    <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        
                        <div className="relative p-10 sm:p-14">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-orange-100 flex items-center justify-center shrink-0">
                                        <ReceiptRefundIcon className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Lý do trả hàng</h3>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Đơn hàng #{order.orderCode}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowReturnModal(false)}
                                    className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-2">Mô tả chi tiết lý do</label>
                                    <textarea 
                                        autoFocus
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                        placeholder="Ví dụ: Sản phẩm bị dập nát khi vận chuyển, Giao thiếu số lượng, Sản phẩm không đúng mô tả..."
                                        className="w-full h-40 px-8 py-6 bg-gray-50 border border-gray-100 focus:border-orange-200 focus:ring-8 focus:ring-orange-500/5 rounded-[2rem] outline-none text-gray-700 font-medium text-sm leading-relaxed transition-all placeholder:text-gray-300 resize-none shadow-inner"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-2">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Hình ảnh/Video minh chứng</label>
                                        <span className="text-[9px] text-gray-400 italic">Ảnh &lt; 5MB | Video &lt; 20MB</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <label className={`relative flex-1 flex flex-col items-center justify-center h-48 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group ${
                                            previewUrl ? 'border-transparent' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
                                        }`}>
                                            <input 
                                                type="file" 
                                                accept="image/*,video/*" 
                                                className="hidden" 
                                                onChange={handleMediaChange}
                                            />
                                            
                                            {previewUrl ? (
                                                <div className="relative w-full h-full rounded-[2rem] overflow-hidden group/img bg-black shadow-inner">
                                                    {selectedImage?.type.startsWith('video/') ? (
                                                        <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop playsInline />
                                                    ) : (
                                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                        <PlusIcon className="w-8 h-8 text-white" />
                                                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Thay đổi tệp</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                                        <PhotoIcon className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-orange-600">Nhấn để tải ảnh/video</p>
                                                </div>
                                            )}
                                        </label>

                                        {previewUrl && (
                                            <button 
                                                onClick={() => {setSelectedImage(null); setPreviewUrl(null);}}
                                                className="w-14 h-14 rounded-2xl bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors shrink-0 self-end mb-1"
                                                title="Xóa ảnh"
                                            >
                                                <TrashIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setShowReturnModal(false)}
                                        className="w-full py-5 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button 
                                        onClick={handleRequestReturn}
                                        className="w-full py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-100 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Gửi yêu cầu
                                    </button>
                                </div>
                            </div>
                            
                            <p className="mt-10 text-center text-[10px] text-gray-400 font-medium leading-relaxed italic">
                                Chú ý: Đội ngũ FreshFood sẽ kiểm tra yêu cầu và phản hồi cho bạn trong vòng 24h làm việc. 
                                Vui lòng giữ sản phẩm ở trạng thái nguyên vẹn.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
