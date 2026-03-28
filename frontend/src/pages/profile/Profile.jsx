import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import AdminLayout from '../../components/AdminLayout';
import { userService, addressService, twoFactorService, orderService, reviewService } from '../../api/services';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
    UserCircleIcon, 
    MapPinIcon, 
    PencilSquareIcon, 
    Cog8ToothIcon, 
    HomeIcon, 
    BriefcaseIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    ShieldCheckIcon,
    AtSymbolIcon,
    PhoneIcon,
    LockClosedIcon,
    ArrowPathIcon,
    BellIcon,
    StarIcon,
    CommandLineIcon,
    ArchiveBoxIcon,
    ArrowRightIcon,
    ArrowLeftOnRectangleIcon,
    EyeIcon,
    EyeSlashIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function Profile() {
    const { user: authUser, setUser, logout } = useAuth();
    const [user, setUserData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'personal';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    // 2FA state
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
    const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    const [setupMethod, setSetupMethod] = useState('TOTP'); // 'TOTP' or 'EMAIL'
    const [setupStep, setSetupStep] = useState(1); // 1: choose method, 2: setup, 3: verify

    // Reviews state
    const [myReviews, setMyReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    const handleTwoFactorClick = () => {
        if (user.isTwoFactorEnabled) {
            setShowTwoFactorDisable(true);
            setTwoFactorCode('');
        } else {
            setShowTwoFactorSetup(true);
            setSetupMethod('TOTP');
            setSetupStep(1);
            setTwoFactorSecret('');
            setTwoFactorCode('');
        }
    };

    const handleMethodChange = async (method) => {
        try {
            setSaving(true);
            await twoFactorService.changeMethod(method);
            const updatedUser = { ...user, twoFactorMethod: method };
            setUserData(updatedUser);
            setUser({ ...authUser, ...updatedUser });
            toast.success(`Đã chuyển sang xác thực qua ${method === 'EMAIL' ? 'Email' : 'ứng dụng'}`);
        } catch (err) {
            toast.error('Không thể thay đổi phương thức');
        } finally {
            setSaving(false);
        }
    };

    const startTwoFactorSetup = async () => {
        try {
            setSetupLoading(true);
            if (setupMethod === 'EMAIL') {
                await twoFactorService.setupEmail();
                toast.success('Mã xác thực đã được gửi về Email của bạn');
            } else {
                const response = await twoFactorService.setup();
                const data = response.data;
                if (data) {
                    setTwoFactorSecret(data.secret);
                    setTwoFactorQrUrl(data.qrCode || data.qrUrl);
                }
            }
            setSetupStep(2);
        } catch (err) {
            toast.error('Không thể khởi tạo 2FA');
        } finally {
            setSetupLoading(false);
        }
    };

    const confirmTwoFactorEnable = async () => {
        setSaving(true);
        try {
            if (setupMethod === 'EMAIL') {
                await twoFactorService.enableEmail({ code: twoFactorCode });
            } else {
                await twoFactorService.enable({ secret: twoFactorSecret, code: twoFactorCode });
            }
            toast.success('Đã kích hoạt 2FA thành công');
            setShowTwoFactorSetup(false);
            setTwoFactorCode('');
            setTimeout(loadData, 500); // Slight delay to ensure DB sync before refresh
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setSaving(false);
        }
    };

    const confirmTwoFactorDisable = async () => {
        setSaving(true);
        try {
            await twoFactorService.disable({ code: twoFactorCode });
            toast.success('Đã tắt 2FA');
            setShowTwoFactorDisable(false);
            setTwoFactorCode('');
            setTimeout(loadData, 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setSaving(false);
        }
    };

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        oldPassword: '',
        password: '',
        dateOfBirth: '',
        gender: 'other',
        emailNotifications: true,
        promoNotifications: false
    });

    // Address form state
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [editingAddrId, setEditingAddrId] = useState(null);
    const [addrForm, setAddrForm] = useState({
        label: 'Nhà',
        fullName: '',
        phone: '',
        details: '',
        isDefault: false
    });

    const { search } = useLocation();
    
    useEffect(() => {
        loadData();
        
        // Auto trigger 2FA setup if coming from redirect
        if (search.includes('setup2fa=true')) {
            toast.error('BẢO MẬT: Quản trị viên bắt buộc phải kích hoạt 2FA để tiếp tục.', { duration: 5000 });
            setShowTwoFactorSetup(true);
        }

        if (activeTab === 'reviews') {
            loadReviews();
        }
    }, [search, activeTab]);

    const loadReviews = async () => {
        try {
            setReviewsLoading(true);
            const { data } = await reviewService.myReviews({ size: 100 });
            setMyReviews(data.content || []);
        } catch (err) {
            toast.error('Không thể tải danh sách đánh giá');
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [userRes, addrRes] = await Promise.all([
                userService.me(),
                addressService.getAll()
            ]);
            setUserData(userRes.data);
            setAddresses(addrRes.data || []);
            // Update global user context
            setUser({ ...authUser, ...userRes.data });
            setProfileForm(prev => ({
                ...prev,
                fullName: userRes.data.fullName || '',
                email: userRes.data.email || '',
                phone: userRes.data.phone || '',
                dateOfBirth: userRes.data.dateOfBirth || '',
                gender: userRes.data.gender || 'other',
                emailNotifications: userRes.data.emailNotifications ?? true,
                promoNotifications: userRes.data.promoNotifications ?? false,
                oldPassword: '',
                password: ''
            }));
            // Default for new address
            if (!editingAddrId) {
                setAddrForm(prev => ({
                    ...prev,
                    fullName: userRes.data.fullName || '',
                    phone: userRes.data.phone || ''
                }));
            }
        } catch (err) {
            toast.error('Không thể tải dữ liệu cá nhân');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Fix: Send null instead of empty string for date
            const payload = { ...profileForm };
            if (!payload.dateOfBirth) payload.dateOfBirth = null;
            if (payload.password === '') delete payload.password; // Don't send empty password

            const { data } = await userService.updateMe(payload);
            setUserData(data);
            setUser({ ...authUser, fullName: data.fullName, avatarUrl: data.avatarUrl });
            toast.success('Cập nhật hồ sơ thành công');
            setProfileForm(prev => ({ ...prev, password: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setSaving(true);
        toast.loading('Đang cập nhật ảnh đại diện...', { id: 'avatar' });
        try {
            const { data } = await userService.updateAvatar(formData);
            setUserData(data);
            setUser({ ...authUser, avatarUrl: data.avatarUrl });
            toast.success('Đã cập nhật ảnh đại diện', { id: 'avatar' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại', { id: 'avatar' });
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            toast.loading('Đang tổng hợp dữ liệu...', { id: 'export' });
            // Fetch all relevant data
            const [ordersRes] = await Promise.all([
                orderService.myOrders({ size: 100 })
            ]);

            const exportData = {
                profile: user,
                addresses: addresses,
                orders: ordersRes.data?.content || [],
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `clean_food_data_${user.username}_${new Date().getTime()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Đã tải xuống hồ sơ dữ liệu!', { id: 'export' });
        } catch (err) {
            toast.error(`Lỗi trích xuất: ${err.response?.data?.message || err.message}`, { id: 'export' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn? Mọi dữ liệu đơn hàng và điểm thưởng sẽ bị mất và KHÔNG thể khôi phục.')) {
            const password = window.prompt('Vui lòng nhập mật khẩu để xác nhận xóa tài khoản:');
            if (!password) return;

            try {
                toast.loading('Đang xử lý yêu cầu hủy tài khoản...', { id: 'delete' });
                await userService.toggleActive(user.id); // Or a specific deleteMe endpoint if exists
                toast.success('Yêu cầu đã được ghi lại. Chào tạm biệt!', { id: 'delete' });
                logout();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Không thể thực hiện lúc này', { id: 'delete' });
            }
        }
    };

    const handleAddrSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAddrId) {
                await addressService.update(editingAddrId, addrForm);
                toast.success('Đã cập nhật địa chỉ');
            } else {
                await addressService.create(addrForm);
                toast.success('Đã thêm địa chỉ mới');
            }
            setShowAddrForm(false);
            setEditingAddrId(null);
            setAddrForm({
                label: 'Nhà',
                fullName: user.fullName,
                phone: user.phone,
                details: '',
                isDefault: false
            });
            loadData();
        } catch (err) {
            toast.error(editingAddrId ? 'Cập nhật thất bại' : 'Không thể thêm địa chỉ');
        }
    };

    const handleEditAddress = (addr) => {
        setEditingAddrId(addr.id);
        setAddrForm({
            label: addr.label,
            fullName: addr.fullName,
            phone: addr.phone,
            details: addr.details,
            isDefault: addr.isDefault
        });
        setShowAddrForm(true);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xoá địa chỉ này?')) return;
        try {
            await addressService.delete(id);
            toast.success('Đã xoá địa chỉ');
            loadData();
        } catch (err) {
            toast.error('Lỗi khi xoá địa chỉ');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressService.setDefault(id);
            toast.success('Đã đặt làm mặc định');
            loadData();
        } catch (err) {
            toast.error('Lỗi khi cập nhật địa chỉ');
        }
    };

    if (!user) {
        const Wrap = authUser?.role === 'ROLE_ADMIN' ? AdminLayout : Layout;
        return <Wrap><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div></Wrap>;
    }

    const ProfileLayout = user?.role === 'ROLE_ADMIN' || authUser?.role === 'ROLE_ADMIN' ? AdminLayout : Layout;

    return (
        <ProfileLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Cài đặt tài khoản</h1>
                        <p className="text-gray-500 font-medium">Quản lý định danh, bảo mật và các tùy chọn cá nhân của bạn trên hệ thống.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden min-h-[600px] flex flex-col md:flex-row">
                    {/* Left: Navigation Sidebar */}
                    <aside className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 p-4 md:p-8 flex flex-col gap-6 md:gap-8 overflow-hidden">
                        <div className="flex md:flex-col items-center text-center md:text-center gap-4 md:gap-0">
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] bg-gray-100 flex items-center justify-center text-gray-400 text-xl md:text-3xl font-black shadow-lg md:shadow-xl relative group overflow-hidden border-2 border-white shrink-0">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    user.fullName?.charAt(0).toUpperCase() || 'U'
                                )}
                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <PencilIcon className="w-6 h-6 text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                                </label>
                            </div>
                            <div className="text-left md:text-center">
                                <h2 className="font-black text-gray-900 leading-tight text-sm md:text-base">{user.fullName}</h2>
                                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic block">Thành viên thân thiết</span>
                            </div>
                        </div>

                        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                            {[
                                { id: 'personal', icon: UserCircleIcon, label: 'Hồ sơ' },
                                { id: 'notifications', icon: BellIcon, label: 'Thông báo' },
                                { id: 'security', icon: ShieldCheckIcon, label: 'Bảo mật' },
                                { id: 'addresses', icon: MapPinIcon, label: 'Địa chỉ' },
                                { id: 'reviews', icon: StarIcon, label: 'Đánh giá' },
                                { id: 'privacy', icon: LockClosedIcon, label: 'Riêng tư' },
                            ].map((tab) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`flex items-center gap-3 px-5 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:bg-gray-100'}`}
                                >
                                    <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        {/* Membership Card - Premium Layout */}
                        <div className="mt-10 bg-gradient-to-br from-emerald-900 via-green-900 to-black p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <StarIcon className="w-8 h-8 text-yellow-400 animate-pulse" />
                                    <span className="text-[10px] font-black tracking-widest bg-white/20 px-3 py-1 rounded-full uppercase italic">VIP MEMBER</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Hạng thành viên</p>
                                        <h4 className="text-xl font-black uppercase italic tracking-tighter">{user?.membershipTier || 'BRONZE'} LAYER</h4>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                                            <span>Tiến trình hạng</span>
                                            <span>{user?.points || 0} / 1000 Pts</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: `${Math.min(100, (user?.points || 0) / 10)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(user.role !== 'ROLE_ADMIN' && authUser?.role !== 'ROLE_ADMIN') && (
                            <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col gap-4">
                                <Link to="/orders" className="flex items-center justify-between group p-2 hover:bg-white px-4 py-3 rounded-xl transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3 text-xs font-black text-gray-400 group-hover:text-gray-900 tracking-wider">
                                        <ArchiveBoxIcon className="w-5 h-5 text-gray-300 group-hover:text-green-600" />
                                        ĐƠN HÀNG CỦA TÔI
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 text-green-600" />
                                </Link>
                                <Link to="/wishlist" className="flex items-center justify-between group p-2 hover:bg-white px-4 py-3 rounded-xl transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3 text-xs font-black text-gray-400 group-hover:text-gray-900 tracking-wider">
                                        <PlusIcon className="w-5 h-5 text-gray-300 group-hover:text-red-600 rotate-45" />
                                        DANH SÁCH YÊU THÍCH
                                    </div>
                                    <ArrowRightIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 text-red-600" />
                                </Link>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-gray-100">
                            <button 
                                onClick={() => {
                                    if(window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                                        logout();
                                        toast.success('Đã đăng xuất thành công');
                                    }
                                }}
                                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-red-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-md"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                                Đăng xuất khỏi hệ thống
                            </button>
                        </div>
                    </aside>

                    {/* Right: Content Area */}
                    <main className="flex-1 p-12 bg-white relative overflow-hidden">
                        {/* Tab Content: Personal Info */}
                        {activeTab === 'personal' && (
                            <div className="animate-fade-in space-y-12 max-w-3xl">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                        <div className="w-3 h-10 bg-green-600 rounded-full"></div>
                                        Thông tin cơ bản
                                    </h3>
                                    <p className="text-gray-500 font-medium mt-3">Hãy đảm bảo thông tin liên lạc chính xác để chúng tôi phục vụ bạn tốt nhất.</p>
                                </div>

                                <form onSubmit={handleProfileSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Họ và tên đầy đủ</label>
                                            <input
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-gray-900 focus:border-green-600 focus:bg-white transition-all shadow-sm outline-none"
                                                value={profileForm.fullName}
                                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                                placeholder="Nhập họ tên của bạn"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email định danh</label>
                                            <div className="relative">
                                                <input
                                                    className="w-full bg-gray-100 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-gray-400 cursor-not-allowed italic shadow-inner outline-none"
                                                    value={profileForm.email}
                                                    readOnly
                                                />
                                                <LockClosedIcon className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Số điện thoại liên lạc</label>
                                            <input
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-gray-900 focus:border-green-600 focus:bg-white transition-all shadow-sm outline-none"
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                placeholder="SĐT không để trống"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Mật khẩu cũ (Để xác nhận)</label>
                                            <div className="relative">
                                                <input
                                                    type={showOldPassword ? "text" : "password"}
                                                    className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-gray-900 focus:border-green-600 focus:bg-white transition-all shadow-sm outline-none pr-12"
                                                    value={profileForm.oldPassword}
                                                    onChange={(e) => setProfileForm({ ...profileForm, oldPassword: e.target.value })}
                                                    placeholder="Bắt buộc nếu đổi mật khẩu"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                >
                                                    {showOldPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Mật khẩu mới</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-gray-900 focus:border-green-600 focus:bg-white transition-all shadow-sm outline-none pr-12"
                                                    value={profileForm.password}
                                                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                                    placeholder="Để trống nếu không đổi"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Ngày sinh</label>
                                            <input type="date" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none uppercase" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Giới tính</label>
                                            <select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none appearance-none" value={profileForm.gender} onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                                        >
                                            {saving ? 'ĐANG CẬP NHẬT...' : 'XÁC NHẬN LƯU THAY ĐỔI'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tab: Notifications */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-10 animate-fade-in max-w-3xl">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                        <div className="w-3 h-10 bg-blue-600 rounded-full"></div>
                                        Thông báo & Ưu đãi
                                    </h3>
                                    <p className="text-gray-500 font-medium mt-3 italic">Tùy chỉnh các kênh liên lạc để không bỏ lỡ thông tin quan trọng.</p>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-4 shadow-sm overflow-hidden">
                                    {[
                                        { key: 'emailNotifications', label: 'Email thông báo đơn hàng', desc: 'Cập nhật trạng thái xử lý, vận chuyển và giao hàng.' },
                                        { key: 'promoNotifications', label: 'Ưu đãi & Voucher', desc: 'Nhận mã giảm giá và thông tin tích điểm định kỳ.' }
                                    ].map((n) => (
                                        <div key={n.key} className="flex items-center justify-between p-8 border-b last:border-none border-gray-50 bg-gray-50/20 group hover:bg-white transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                                    <BellIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 uppercase tracking-tighter">{n.label}</h4>
                                                    <p className="text-sm text-gray-500 font-medium italic mt-1">{n.desc}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setProfileForm(prev => ({...prev, [n.key]: !prev[n.key]}))}
                                                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 ${profileForm[n.key] ? 'bg-black' : 'bg-gray-200'}`}
                                            >
                                                <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-all duration-300 shadow-lg ${profileForm[n.key] ? 'translate-x-8' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="p-8">
                                        <button onClick={handleProfileSubmit} className="w-full py-4 bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-xl active:scale-95 transition-all">CẬP NHẬT TÙY CHỌN</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Security */}
                        {activeTab === 'security' && (
                            <div className="space-y-5 max-w-2xl">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900">Bảo mật</h3>
                                    <p className="text-gray-500 mt-1 text-sm">Quản lý các phương thức xác thực và bảo vệ tài khoản quản trị.</p>
                                </div>

                                {/* 2FA Card */}
                                <div className="group overflow-hidden bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                                                <ShieldCheckIcon className="w-5 h-5" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900">Xác thực 2 bước (Google Authenticator)</h4>
                                        </div>
                                        {/* Toggle button */}
                                        <button
                                            onClick={handleTwoFactorClick}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ${
                                                user.isTwoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow ${
                                                user.isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 pr-12">Bảo vệ tài khoản bằng mã 6 số từ {user.twoFactorMethod === 'EMAIL' ? 'Email' : 'ứng dụng Google Authenticator'} mỗi khi đăng nhập.</p>
                                    <div className="mt-4 flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${user.isTwoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <span className="text-sm font-medium text-gray-600">
                                                {user.isTwoFactorEnabled ? `Đang kích hoạt (${user.twoFactorMethod === 'EMAIL' ? 'EMAIL' : 'TOTP'})` : 'Chưa kích hoạt'}
                                            </span>
                                        </div>
                                        
                                        {user.isTwoFactorEnabled && (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleMethodChange('TOTP')}
                                                    disabled={user.twoFactorMethod === 'TOTP' || saving}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${user.twoFactorMethod === 'TOTP' ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-white text-gray-900 border-gray-200 hover:border-black'}`}
                                                >
                                                    Sử dụng App
                                                </button>
                                                <button 
                                                    onClick={() => handleMethodChange('EMAIL')}
                                                    disabled={user.twoFactorMethod === 'EMAIL' || saving}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all ${user.twoFactorMethod === 'EMAIL' ? 'bg-gray-100 text-gray-400 border-transparent' : 'bg-white text-gray-900 border-gray-200 hover:border-black'}`}
                                                >
                                                    Sử dụng Email
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Session Management Placeholder */}
                                    <div className="mt-8 p-8 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <CommandLineIcon className="w-5 h-5 text-gray-400" />
                                            <h5 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Thiết bị đang truy cập</h5>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Chrome on MacOS (M1 Pro)</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Đang hoạt động • Hồ Chí Minh, VN</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="w-full py-3 text-red-600 font-black uppercase text-[9px] tracking-widest hover:bg-red-50 rounded-xl transition-all italic">
                                                Đăng xuất khỏi thiết bị khác →
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2FA Setup flow - inline */}
                                    {showTwoFactorSetup && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 animate-fade-in">
                                            {setupStep === 1 ? (
                                                <div className="space-y-6">
                                                    <div className="text-center mb-6">
                                                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-xs">Chọn phương thức bảo vệ</h5>
                                                        <p className="text-sm text-gray-500 mt-2">Chọn cách bạn muốn nhận mã xác thực mỗi khi đăng nhập.</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <button 
                                                            onClick={() => setSetupMethod('TOTP')}
                                                            className={`p-6 rounded-2xl border-2 text-left transition-all ${setupMethod === 'TOTP' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                        >
                                                            <ShieldCheckIcon className="w-8 h-8 mb-3 text-gray-900" />
                                                            <p className="font-black text-xs uppercase tracking-widest">Ứng dụng Authenticator</p>
                                                            <p className="text-xs text-gray-500 mt-2">Sử dụng Google Authenticator, Authy, v.v.</p>
                                                        </button>
                                                        <button 
                                                            onClick={() => setSetupMethod('EMAIL')}
                                                            className={`p-6 rounded-2xl border-2 text-left transition-all ${setupMethod === 'EMAIL' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                        >
                                                            <AtSymbolIcon className="w-8 h-8 mb-3 text-gray-900" />
                                                            <p className="font-black text-xs uppercase tracking-widest">Xác thực qua Email</p>
                                                            <p className="text-xs text-gray-500 mt-2">Mã xác thực sẽ được gửi trực tiếp vào hòm thư.</p>
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-3 justify-center">
                                                        <button
                                                            onClick={startTwoFactorSetup}
                                                            disabled={setupLoading}
                                                            className="px-12 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95"
                                                        >
                                                            TIẾP TỤC BƯỚC {setupMethod === 'EMAIL' ? 'DUY NHẤT' : 'TIẾP THEO'}
                                                        </button>
                                                        <button onClick={() => setShowTwoFactorSetup(false)} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">HỦY</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-8">
                                                    {setupMethod === 'TOTP' && (
                                                        <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-8 rounded-3xl border border-gray-100">
                                                            <div className="shrink-0">
                                                                <div className="bg-white p-3 border-4 border-white rounded-2xl shadow-xl">
                                                                    <img
                                                                        src={twoFactorQrUrl && twoFactorQrUrl.startsWith('data:') ? twoFactorQrUrl : `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(twoFactorQrUrl)}&margin=8`}
                                                                        alt="QR Code 2FA"
                                                                        className="w-40 h-40"
                                                                    />
                                                                </div>
                                                                <div className="mt-4 bg-amber-50 border border-amber-100 px-4 py-3 rounded-xl">
                                                                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-1">Mã bí mật (Setup Key)</p>
                                                                    <code className="text-[10px] font-mono font-bold text-amber-800 break-all">{twoFactorSecret}</code>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 space-y-6">
                                                                <h6 className="font-black text-xs uppercase tracking-[0.2em] text-gray-900">Thiết lập ứng dụng</h6>
                                                                <div className="space-y-4">
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="w-6 h-6 rounded-lg bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                                                                        <p className="text-sm font-medium text-gray-600">Mở ứng dụng <b>Authenticator</b> và quét mã QR.</p>
                                                                    </div>
                                                                    <div className="flex items-start gap-3">
                                                                        <span className="w-6 h-6 rounded-lg bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                                                                        <p className="text-sm font-medium text-gray-600">Nhập mã 6 số từ ứng dụng dưới đây.</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {setupMethod === 'EMAIL' && (
                                                        <div className="text-center py-8 bg-green-50 rounded-3xl border border-green-100">
                                                            <AtSymbolIcon className="w-12 h-12 mx-auto text-green-600 mb-4" />
                                                            <h5 className="font-black text-gray-900 uppercase tracking-widest text-xs">Xác minh hòm thư</h5>
                                                            <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">Chúng tôi đã gửi một mã xác nhận gồm 6 chữ số đến địa chỉ <b>{user.email}</b>. Vui lòng kiểm tra và nhập mã vào ô dưới đây.</p>
                                                        </div>
                                                    )}

                                                    <div className="space-y-4 max-w-md mx-auto">
                                                        <input
                                                            type="password"
                                                            maxLength="6"
                                                            value={twoFactorCode}
                                                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full text-center text-4xl font-black tracking-[1.2rem] py-6 border-4 border-gray-100 rounded-[2rem] focus:border-black shadow-inner outline-none transition-all placeholder:tracking-normal placeholder:text-gray-200"
                                                            placeholder="..."
                                                            autoFocus
                                                        />
                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            <button
                                                                onClick={confirmTwoFactorEnable}
                                                                disabled={twoFactorCode.length !== 6 || saving}
                                                                className="flex-1 bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gray-800 disabled:opacity-40 transition-all shadow-xl active:scale-95"
                                                            >
                                                                {saving ? 'XÁC MINH...' : 'KÍCH HOẠT NGAY'}
                                                            </button>
                                                            <button onClick={() => setSetupStep(1)} className="px-8 py-5 border-2 border-gray-100 rounded-2xl font-black uppercase text-[10px] tracking-widest text-gray-400 hover:border-gray-300 hover:text-gray-900 transition-all">QUAY LẠI</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Disable 2FA flow */}
                                    {showTwoFactorDisable && (
                                        <div className="mt-6 pt-6 border-t border-red-100 bg-red-50/50 rounded-2xl p-5">
                                            <p className="text-sm font-bold text-red-700 mb-4">Nhập mã OTP hiện tại để xác nhận vô hiệu hóa lớp bảo vệ.</p>
                                            <div className="flex gap-3">
                                                <input
                                                    type="password"
                                                    maxLength="6"
                                                    value={twoFactorCode}
                                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                    className="flex-1 text-center text-2xl font-black tracking-widest py-3 border-2 border-red-200 bg-white rounded-2xl focus:border-red-500 outline-none transition-all"
                                                    placeholder="..."
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={confirmTwoFactorDisable}
                                                    disabled={twoFactorCode.length !== 6 || saving}
                                                    className="bg-red-600 text-white px-6 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-40 transition-all"
                                                >
                                                    {saving ? '...' : 'Xác nhận tắt'}
                                                </button>
                                                <button onClick={() => setShowTwoFactorDisable(false)} className="px-4 font-bold text-gray-400 hover:text-gray-600">Hủy</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Password Change Card */}
                                <div className="group overflow-hidden bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2.5 bg-gray-50 rounded-xl text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
                                            <LockClosedIcon className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">Mật khẩu</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-5">Cập nhật mật khẩu thường xuyên để tăng cường bảo mật cho tài khoản.</p>
                                    <button
                                        onClick={() => setActiveTab('personal')}
                                        className="px-8 py-3 border-2 border-black rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all active:scale-95"
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Addresses */}
                        {activeTab === 'addresses' && (
                            <div className="animate-fade-in space-y-12 max-w-5xl">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                            <div className="w-3 h-10 bg-green-600 rounded-full"></div>
                                            Sổ địa chỉ
                                        </h3>
                                        <p className="text-gray-500 font-medium mt-3">Lưu trữ các địa điểm nhận hàng để thanh toán nhanh chóng hơn.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddrForm(!showAddrForm)}
                                        className="bg-black text-white px-8 py-4 rounded-2xl font-black hover:bg-gray-800 shadow-2xl transition-all flex items-center gap-3 shrink-0 active:scale-95"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                        {showAddrForm ? 'HỦY BỎ' : 'THÊM ĐỊA CHỈ'}
                                    </button>
                                </div>

                                {showAddrForm && (
                                    <form onSubmit={handleAddrSubmit} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4 relative fade-in">
                                            <div className="md:col-span-2 flex items-center justify-between mb-4">
                                                <h4 className="font-black text-gray-900 uppercase tracking-[0.2em] text-xs italic">{editingAddrId ? 'Đang cập nhật' : 'Tạo mới'} địa chỉ nhận hàng</h4>
                                                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                                                    <input
                                                        type="checkbox"
                                                        id="isDefault"
                                                        checked={addrForm.isDefault}
                                                        onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                                                        className="w-5 h-5 text-green-600 rounded-lg border-gray-300 focus:ring-green-500"
                                                    />
                                                    <label htmlFor="isDefault" className="text-[10px] font-black text-gray-500 uppercase tracking-widest">MẶC ĐỊNH</label>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Họ tên người nhận</label>
                                                <input
                                                    className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold text-gray-900 shadow-sm focus:border-green-600 outline-none transition-all"
                                                    value={addrForm.fullName}
                                                    onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Số điện thoại</label>
                                                <input
                                                    className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold text-gray-900 shadow-sm focus:border-green-600 outline-none transition-all"
                                                    value={addrForm.phone}
                                                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Địa chỉ chi tiết (Thành phố, Quận, Phường, Tên đường...)</label>
                                                <textarea
                                                    className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold text-gray-900 shadow-sm focus:border-green-600 outline-none transition-all"
                                                    rows={2}
                                                    value={addrForm.details}
                                                    onChange={(e) => setAddrForm({ ...addrForm, details: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Phân loại</label>
                                                    <div className="flex gap-4">
                                                        {['Nhà', 'Công ty', 'Khác'].map(label => (
                                                            <button
                                                                key={label}
                                                                type="button"
                                                                onClick={() => setAddrForm({ ...addrForm, label })}
                                                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                                    addrForm.label === label 
                                                                    ? 'bg-black text-white shadow-lg' 
                                                                    : 'bg-white text-gray-400 border border-gray-100 hover:text-green-600 hover:border-green-100'
                                                                }`}
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button type="submit" className="w-full bg-green-600 text-white rounded-xl py-3 font-black uppercase text-xs tracking-widest shadow-lg shadow-green-900/10 hover:bg-green-500 transition-all h-[48px]">
                                                    {editingAddrId ? 'CẬP NHẬT' : 'LƯU SỔ ĐỊA CHỈ'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {addresses.length === 0 ? (
                                        <div className="lg:col-span-2 text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                                                <MapPinIcon className="w-6 h-6 text-gray-200" />
                                            </div>
                                            <p className="font-black text-gray-400 italic uppercase tracking-[0.3em] text-[10px]">Chưa có địa chỉ nào</p>
                                        </div>
                                    ) : (
                                        addresses.map(addr => (
                                            <div key={addr.id} className={`group relative p-5 rounded-xl border-2 transition-all hover:shadow-lg flex flex-col justify-between ${
                                                addr.isDefault ? 'bg-green-50/20 border-green-600 shadow-xl shadow-green-900/5' : 'bg-white border-gray-100'
                                            }`}>
                                                <div>
                                                    <div className="flex items-center justify-between mb-5">
                                                        <div className={`p-3 rounded-lg shadow-sm ${addr.isDefault ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-gray-100 text-gray-400'}`}>
                                                            {addr.label === 'Nhà' ? <HomeIcon className="w-5 h-5" /> : addr.label === 'Công ty' ? <BriefcaseIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            {addr.isDefault && (
                                                                <span className="bg-green-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">MẶC ĐỊNH</span>
                                                            )}
                                                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{addr.label}</span>
                                                        </div>
                                                    </div>
                                                    <h4 className="text-base font-black text-gray-900 mb-1 truncate">{addr.fullName}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 inline-flex">
                                                        <PhoneIcon className="w-3.5 h-3.5 text-green-600" />
                                                        {addr.phone}
                                                    </div>
                                                    <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                                        <p className="text-[10px] font-bold text-gray-600 leading-relaxed italic">{addr.details}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100/50">
                                                    <div className="flex gap-4">
                                                        <button type="button" onClick={() => handleEditAddress(addr)} className="text-gray-900 hover:text-green-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                                                            <PencilSquareIcon className="w-4 h-4 text-gray-300 group-hover/btn:text-green-600" />
                                                            CHỈNH SỬA
                                                        </button>
                                                        <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 group/btn">
                                                            <TrashIcon className="w-4 h-4 text-gray-300 group-hover/btn:text-red-600" />
                                                            XÓA
                                                        </button>
                                                    </div>
                                                    {!addr.isDefault && (
                                                        <button type="button" onClick={() => handleSetDefault(addr.id)} className="text-[9px] font-black text-white bg-black px-5 py-2.5 rounded-full uppercase tracking-tighter hover:bg-green-600 transition-all shadow-lg active:scale-95">ĐẶT LÀM CHÍNH</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab Content: My Reviews */}
                        {activeTab === 'reviews' && (
                            <div className="animate-fade-in space-y-12 max-w-5xl">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                        <div className="w-3 h-10 bg-yellow-400 rounded-full"></div>
                                        Lịch sử đánh giá
                                    </h3>
                                    <p className="text-gray-500 font-medium mt-3 italic">Mọi phản hồi của bạn giúp chúng tôi nâng cao chất lượng dịch vụ & sản phẩm sạch.</p>
                                </div>

                                {reviewsLoading ? (
                                    <div className="flex justify-center items-center py-20">
                                        <ArrowPathIcon className="w-10 h-10 text-gray-200 animate-spin" />
                                    </div>
                                ) : myReviews.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                        <StarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Bạn chưa thực hiện đánh giá nào</p>
                                        <Link to="/orders" className="mt-6 inline-block text-xs font-black text-green-600 hover:text-green-700 underline decoration-2 underline-offset-4">ĐẾN ĐƠN HÀNG ĐỂ ĐÁNH GIÁ NGAY →</Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {myReviews.map(review => (
                                            <div key={review.id} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-yellow-50 transition-colors duration-500"></div>
                                                <div className="relative z-10">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform shadow-sm overflow-hidden">
                                                                <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg">{review.productName}</h4>
                                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Đánh giá ngày {new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-6 py-3 bg-gray-50 rounded-2xl group-hover:bg-black transition-colors">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <StarIcon key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 group-hover:text-gray-800'}`} />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-50 italic text-gray-600 font-medium leading-relaxed mb-6">
                                                        "{review.comment}"
                                                    </div>

                                                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                                                        <div className="flex gap-3 mb-8">
                                                            {review.mediaUrls.map((url, idx) => (
                                                                <img key={idx} src={url} className="w-20 h-20 object-cover rounded-xl border border-gray-100 shadow-sm hover:scale-110 transition-transform cursor-pointer" alt="" />
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                                review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700 animate-pulse'
                                                            }`}>
                                                                Trạng thái: {
                                                                    review.status === 'APPROVED' ? 'Đã duyệt' :
                                                                    review.status === 'REJECTED' ? 'Bị từ chối' :
                                                                    'Đang chờ duyệt'
                                                                }
                                                            </span>
                                                        </div>
                                                        {review.adminReply && (
                                                            <div className="flex-1 min-w-[280px] bg-emerald-50 p-4 rounded-xl border border-emerald-100 relative group-hover:scale-[1.02] transition-transform">
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                                                                    <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Phản hồi từ FreshFood:</p>
                                                                </div>
                                                                <p className="text-xs text-emerald-700 font-bold italic">{review.adminReply}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Content: Privacy & Data (User Facing) */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-12 animate-fade-in pb-20 max-w-4xl relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                        <div className="w-3 h-10 bg-red-600 rounded-full animate-pulse"></div>
                                        Quyền riêng tư & Dữ liệu
                                    </h3>
                                    <p className="text-gray-500 font-medium mt-3 italic">Yêu cầu một bản sao dữ liệu cá nhân hoặc gỡ bỏ thông tin của bạn khỏi hệ thống vĩnh viễn.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="bg-white p-7 rounded-2xl border-2 border-gray-100 shadow-lg shadow-gray-900/5 space-y-5 group hover:border-blue-600 transition-all transform hover:-translate-y-1">
                                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ArchiveBoxIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Hồ sơ dữ liệu (JSON)</h4>
                                            <p className="text-xs text-gray-500 font-medium italic mt-3 leading-relaxed">Chúng tôi sẽ tổng hợp mọi lịch sử đơn hàng, địa chỉ và thông tin bảo mật vào một tệp tin duy nhất để bạn có thể tải về.</p>
                                        </div>
                                        <button 
                                            onClick={handleExportData}
                                            className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl active:scale-95 hover:bg-blue-600"
                                        >
                                            YÊU CẦU TRÍCH XUẤT
                                        </button>
                                    </div>
                                    <div className="bg-white p-7 rounded-2xl border-2 border-red-50 shadow-lg shadow-red-900/5 space-y-5 group hover:border-red-600 transition-all transform hover:-translate-y-1">
                                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-red-600 group-hover:text-white transition-all">
                                            <TrashIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-red-600 uppercase tracking-tighter">Đóng tài khoản</h4>
                                            <p className="text-xs text-gray-500 font-medium italic mt-3 leading-relaxed">Lưu ý: Hành động này không thể hoàn tác. Mọi điểm thưởng VIP và lịch sử mua sắm sẽ bị xóa sạch khỏi máy chủ.</p>
                                        </div>
                                        <button 
                                            onClick={handleDeleteAccount}
                                            className="w-full py-4 border-2 border-red-600 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                        >
                                            XỬ LÝ HỦY TÀI KHOẢN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="absolute -left-1/4 -bottom-1/4 w-full h-full bg-green-50/20 blur-[150px] mix-blend-multiply pointer-events-none rounded-full"></div>
                    </main>
                </div>
            </div>
        </ProfileLayout>
    );
}
