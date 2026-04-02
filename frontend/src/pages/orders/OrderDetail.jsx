import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { orderService, cartService, mediaService } from '../../api/services';
import Layout from '../../components/Layout';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
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

/**
 * STATIC CONFIGURATION:
 * Standard delivery steps for the progress tracker.
 * Used to render the visual timeline at the top of the detail page.
 */
const STEPS = [
    { key: 'PENDING', label: 'Đặt hàng', icon: ClockIcon },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircleIcon },
    { key: 'SHIPPING', label: 'Đang vận chuyển', icon: TruckIcon },
    { key: 'DELIVERED', label: 'Giao hàng thành công', icon: ArchiveBoxIcon },
];

/**
 * PAGE COMPONENT: OrderDetail
 * ---------------------------------------------------------
 * Displays exhaustive information about a single order.
 * This page serves as the final touchpoint for customer-order interaction.
 * 
 * Major Features:
 * 1. Visual Progress Tracking: Real-time status updates with timestamps.
 * 2. Order Management: Support for "Buy Again," "Cancel Order," and "Return/Refund."
 * 3. Media Upload: Handles image/video evidence for return requests.
 * 4. Invoice Printing: Generates a professional PDF-ready invoice view.
 */
export default function OrderDetail() {
    // --- HOOKS & STATE ---
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isManagement } = useAuth();
    
    // Parse query params to detect view-only mode
    const queryParams = new URLSearchParams(location.search);
    const isViewOnly = queryParams.get('mode') === 'view';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [updating, setUpdating] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        orderService.getByCode(id)
            .then(res => setOrder(res.data))
            .catch(() => toast.error('Không thể tải chi tiết đơn hàng'))
            .finally(() => setLoading(false));
    }, [id]);

    // --- ACTION HANDLERS ---

    /**
     * handleBuyAgain:
     * Loops through all items in the current order and adds them back to the cart.
     * Redirects to the cart page upon completion.
     */
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

    /**
     * handleCancel:
     * Triggers the cancellation flow for PENDING orders.
     * Updates the local state to 'CANCELLED' immediately upon success.
     */
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

    /**
     * handleMediaChange:
     * Validates and previews the evidence file for return requests.
     * Supports both images and videos with specific size limits.
     */
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

    /**
     * handleRequestReturn:
     * Uploads media evidence to Cloudinary and then submits the return request to the backend.
     * This follows a strict validation rule requiring both a reason and evidence.
     */
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

    // --- ADMINISTRATIVE ACTIONS (ADMIN ONLY) ---

    const handleAdminStatusUpdate = async (newStatus) => {
        setUpdating(true);
        const loadingToast = toast.loading('Đang cập nhật trạng thái...');
        try {
            await orderService.updateStatus(order.id, newStatus);
            const res = await orderService.getByCode(id);
            setOrder(res.data);
            toast.success('Đã cập nhật trạng thái đơn hàng', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại', { id: loadingToast });
        } finally {
            setUpdating(false);
        }
    };

    const handleAdminConfirmReturn = async () => {
        if (!window.confirm('Xác nhận đã nhận lại hàng và đồng ý hoàn tiền?')) return;
        setUpdating(true);
        const loadingToast = toast.loading('Đang xác nhận trả hàng...');
        try {
            await orderService.confirmReturn(order.id);
            const res = await orderService.getByCode(id);
            setOrder(res.data);
            toast.success('Đã xác nhận trả hàng thành công', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xác nhận thất bại', { id: loadingToast });
        } finally {
            setUpdating(false);
        }
    };

    const handleAdminRejectReturn = async () => {
        const reason = window.prompt('Vui lòng nhập lý do từ chối trả hàng:');
        if (!reason || !reason.trim()) return;
        
        setUpdating(true);
        const loadingToast = toast.loading('Đang xử lý...');
        try {
            await orderService.rejectReturn(order.id, reason);
            const res = await orderService.getByCode(id);
            setOrder(res.data);
            toast.success('Đã từ chối yêu cầu trả hàng', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thao tác thất bại', { id: loadingToast });
        } finally {
            setUpdating(false);
        }
    };

    const handleAdminRefund = async () => {
        if (!window.confirm('Xác nhận đã thực hiện chuyển khoản hoàn tiền cho khách?')) return;
        setUpdating(true);
        const loadingToast = toast.loading('Đang xử lý hoàn tiền...');
        try {
            await orderService.refund(order.id);
            const res = await orderService.getByCode(id);
            setOrder(res.data);
            toast.success('Đã đánh dấu hoàn tiền thành công', { id: loadingToast });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Thao tác thất bại', { id: loadingToast });
        } finally {
            setUpdating(false);
        }
    };

    /**
     * handlePrintInvoice:
     * Generates a separate document structure for printing.
     * Uses template literals to build a professional-looking invoice.
     */
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

    /**
     * Utility: Formats date string to Vi locale for user readability.
     */
    const fmtFullDate = (s) => {
        if(!s) return null;
        const d = new Date(s);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // --- RENDER LOGIC ---

    const PageLayout = isManagement ? AdminLayout : Layout;

    if (loading) return <PageLayout><div className="animate-pulse py-20 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu đơn hàng...</div></PageLayout>;
    if (!order) return <PageLayout><div className="py-20 text-center text-red-500 font-bold">Không tìm thấy đơn hàng trong hệ thống</div></PageLayout>;

    /**
     * Step Resolver: 
     * Dynamically determines which visual steps to show based on order lifecycle.
     */
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
        <PageLayout>
            <div className={`min-h-screen ${isManagement ? 'bg-white' : 'bg-gray-50/30'}`}>
                <div className={`${isManagement ? 'max-w-full' : 'max-w-6xl mx-auto'} px-4 py-6 sm:py-10`}>
                    
                    {/* Admin Action Panel */}
                    {isManagement && (
                        <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-3xl flex flex-wrap items-center justify-between gap-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                            <div>
                                <h4 className="text-sm font-black text-green-900 uppercase tracking-widest mb-1 italic">Bảng điều khiển Quản trị</h4>
                                <p className="text-xs text-green-700 font-bold">Bạn đang xem đơn hàng với tư cách Quản lý hệ thống.</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-green-200">
                                    <span className="text-[10px] font-black text-gray-400 uppercase italic">Trạng thái:</span>
                                    <select 
                                        value={order.status}
                                        disabled={isViewOnly || updating}
                                        onChange={(e) => handleAdminStatusUpdate(e.target.value)}
                                        className={`bg-transparent text-xs font-black text-green-700 outline-none uppercase ${isViewOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {['PENDING', 'CONFIRMED', 'PACKAGING', 'SHIPPING', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'RETURN_REJECTED', 'CANCELLED'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {order.status === 'RETURN_REQUESTED' && (
                                    <>
                                        <button onClick={handleAdminConfirmReturn} disabled={updating} className="px-6 py-2 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-100 hover:scale-105 transition-all">Đồng ý Trả hàng</button>
                                        <button onClick={handleAdminRejectReturn} disabled={updating} className="px-6 py-2 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-200 hover:bg-red-200 transition-all">Từ chối</button>
                                    </>
                                )}

                                {((order.status === 'CANCELLED' && order.isPaid) || order.status === 'RETURNED') && !order.isRefunded && (
                                    <button onClick={handleAdminRefund} disabled={updating} className="px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-100 hover:scale-105 transition-all">Xác thực Hoàn tiền</button>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Breadcrumbs & Header */}
                    <Link to={isManagement ? "/admin/orders" : "/orders"} className="inline-flex items-center gap-2 text-gray-400 hover:text-green-600 transition-all mb-8 group">
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
                                        <div key={item.orderItemId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-6 rounded-[2rem] border border-transparent hover:border-green-100 hover:bg-green-50/20 transition-all duration-500 group">
                                            <div className="w-20 h-20 rounded-2xl bg-gray-100 object-cover overflow-hidden border-2 border-white shadow-md shrink-0 group-hover:scale-105 transition-transform duration-500">
                                                <img 
                                                    src={item.productImageUrl || 'https://via.placeholder.com/150'} 
                                                    alt={item.productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-gray-900 text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-green-700 transition-colors uppercase tracking-tight">{item.productName}</h4>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold">
                                                    <span className="py-1 px-3 bg-gray-100 rounded-lg text-gray-500">{(item.unitPrice || 0).toLocaleString('vi-VN')}đ</span>
                                                    <span className="text-gray-400">×</span>
                                                    <span className="py-1 px-3 bg-green-50 text-green-700 rounded-lg">{item.quantity} sản phẩm</span>
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-auto text-right border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                                                <p className="text-xl sm:text-2xl font-black text-green-600 tabular-nums">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery & Payment Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                     <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-green-500 rounded-full shrink-0"></div>
                                        <span className="truncate">Thông tin giao hàng</span>
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
                                                {order.addressDetail || order.shippingAddress?.split(', ')[0] || '---'}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Phường/Xã</p>
                                                <div className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-sm shadow-inner leading-tight">
                                                    {order.ward || order.shippingAddress?.split(', ')[1] || '---'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Quận/Huyện</p>
                                                <div className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-sm shadow-inner leading-tight">
                                                    {order.district || order.shippingAddress?.split(', ')[2] || '---'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Tỉnh/TP</p>
                                                <div className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 font-black text-sm shadow-inner leading-tight">
                                                    {order.province || order.shippingAddress?.split(', ')[3] || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        {order.note && (
                                            <div className="mt-4 p-6 bg-gray-50 rounded-[1.5rem] border-l-4 border-green-500 relative overflow-hidden">
                                                <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">Ghi chú vận chuyển</p>
                                                <p className="text-gray-600 font-medium text-sm italic leading-relaxed">"{order.note}"</p>
                                            </div>
                                        )}
                                     </div>
                                </div>

                                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                     <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-8 pb-4 border-b border-gray-50 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-blue-500 rounded-full shrink-0"></div>
                                        <span>Hình thức thanh toán</span>
                                     </h3>
                                     <div className="flex flex-col h-[calc(100%-80px)] justify-between">
                                        <div className="space-y-6">
                                            <div className="p-4 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left transition-all duration-300">
                                                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                                                    <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0 w-full overflow-hidden">
                                                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-0.5">Phương thức</p>
                                                    <p className="text-gray-900 font-extrabold text-[11px] sm:text-base leading-tight break-words" title={order.paymentMethod}>
                                                        {order.paymentMethod === 'COD' ? 'Thu hộ (COD)' : 
                                                         order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                                                         order.paymentMethod === 'MOMO' ? 'Ví MoMo' :
                                                         order.paymentMethod === 'VNPAY' ? 'Ví VNPay' :
                                                         order.paymentMethod}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-5 bg-gray-50 rounded-3xl">
                                                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2.5 text-center sm:text-left">
                                                    <span className="text-gray-500 text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0">Trạng thái:</span>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap shrink-0 ${
                                                        order.isPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                        {order.isPaid ? 'ĐÃ QUYẾT TOÁN' : 'CHƯA TRẢ'}
                                                    </span>
                                                </div>
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

                        {/* Right Column: Order Summary */}
                        <div className="space-y-8 sticky top-12">
                            <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-10 tracking-tight">Thanh toán</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center gap-4 text-[11px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="shrink-0">Tiền hàng</span>
                                        <span className="text-gray-900 whitespace-nowrap">{(order.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-4 text-[11px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        <span className="shrink-0">Phí vận chuyển</span>
                                        <span className={order.shippingFee === 0 ? "text-green-600 whitespace-nowrap" : "text-gray-900 whitespace-nowrap"}>
                                            {order.shippingFee === 0 ? "Miễn phí" : `${(Number(order.shippingFee) || 0).toLocaleString('vi-VN')}đ`}
                                        </span>
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="flex flex-wrap justify-between items-center gap-2 px-4 py-3 bg-green-50 rounded-2xl border border-green-100">
                                            <span className="text-green-700 text-[10px] sm:text-sm">🔖 GIẢM GIÁ</span>
                                            <span className="text-green-700 font-black text-[10px] sm:text-sm whitespace-nowrap">-{(Number(order.discountAmount) || 0).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    )}
                                    
                                    <div className="pt-8 border-t border-gray-100 flex flex-col items-end gap-1">
                                        <span className="font-black text-gray-400 text-xs uppercase tracking-widest">Tổng cộng</span>
                                        <div className="text-5xl font-black text-green-600 tracking-tighter tabular-nums">
                                            {(Number(order.finalAmount) || 0).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>

                                    <div className="mt-10 space-y-4">
                                        {!isManagement && (
                                            <>
                                                <button 
                                                    onClick={handleBuyAgain} 
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                                >
                                                    <ArrowPathIcon className="w-5 h-5" />
                                                    MUA LẠI NGAY
                                                </button>
                                                
                                                {order.status === 'DELIVERED' && (
                                                    <button 
                                                        onClick={() => setShowReturnModal(true)} 
                                                        className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-4 rounded-2xl border border-orange-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                                    >
                                                        <ReceiptRefundIcon className="w-5 h-5" />
                                                        YÊU CẦU TRẢ HÀNG
                                                    </button>
                                                )}

                                                {order.status === 'PENDING' && (
                                                    <button 
                                                        onClick={handleCancel} 
                                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 rounded-2xl border border-red-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                        HỦY ĐƠN HÀNG
                                                    </button>
                                                )}
                                            </>
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setShowReturnModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl p-10 sm:p-14 overflow-hidden">
                        <div className="flex justify-between items-start mb-10">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Lý do trả hàng</h3>
                            <button onClick={() => setShowReturnModal(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="space-y-6">
                            <textarea 
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                placeholder="Mô tả kỹ lý do trả hàng (sản phẩm hư hỏng, thiếu hàng...)"
                                className="w-full h-40 px-8 py-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none text-gray-700 font-medium text-sm resize-none shadow-inner"
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-2">Minh chứng (Ảnh/Video)</label>
                                <div className="flex gap-4">
                                    <label className={`relative flex-1 flex flex-col items-center justify-center h-48 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer ${previewUrl ? 'border-transparent' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'}`}>
                                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
                                        {previewUrl ? (
                                            <div className="relative w-full h-full rounded-[2rem] overflow-hidden group bg-black shadow-inner">
                                                {selectedImage?.type.startsWith('video/') ? (
                                                    <video src={previewUrl} className="w-full h-full object-contain" autoPlay muted loop />
                                                ) : (
                                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><PlusIcon className="w-8 h-8 text-white" /></div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <PhotoIcon className="w-8 h-8 text-gray-300" />
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tải lên tệp</p>
                                            </div>
                                        )}
                                    </label>
                                    {previewUrl && (
                                        <button onClick={() => {setSelectedImage(null); setPreviewUrl(null);}} className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 self-end mb-1"><TrashIcon className="w-6 h-6" /></button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowReturnModal(false)} className="w-full py-5 rounded-2xl text-gray-500 font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors">Hủy</button>
                                <button onClick={handleRequestReturn} className="w-full py-5 bg-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-transform active:scale-95">Gửi yêu cầu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
