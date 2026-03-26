import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { settingsService, userService, addressService, twoFactorService, orderService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheckIcon, 
    WrenchScrewdriverIcon, 
    BellIcon, 
    CommandLineIcon,
    ArrowPathIcon,
    LockClosedIcon,
    PencilIcon,
    ArchiveBoxIcon,
    StarIcon,
    UserCircleIcon,
    MapPinIcon,
    TrashIcon,
    HomeIcon,
    BriefcaseIcon,
    PhoneIcon,
    PlusIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function AdminSettings() {
    const { user: authUser, setUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'system';

    const [settings, setSettings] = useState([]);
    const [user, setUserData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile Form state
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        dateOfBirth: '',
        gender: 'other',
        emailNotifications: true,
        promoNotifications: false
    });

    // Address Form state
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [editingAddrId, setEditingAddrId] = useState(null);
    const [addrForm, setAddrForm] = useState({
        label: 'Nhà',
        fullName: '',
        phone: '',
        details: '',
        isDefault: false
    });

    // 2FA state
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
    const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [setupLoading, setSetupLoading] = useState(false);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsRes, userRes] = await Promise.all([
                settingsService.getAll(),
                userService.me()
            ]);
            
            setSettings(settingsRes.data);
            const data = userRes.data;
            setUserData(data);
            setProfileForm({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                password: '',
                dateOfBirth: data.dateOfBirth || '',
                gender: data.gender || 'other',
                emailNotifications: data.emailNotifications ?? true,
                promoNotifications: data.promoNotifications ?? false
            });

            // Load addresses
            const addrRes = await addressService.getAll();
            setAddresses(addrRes.data || []);
            
            // Sync with auth context
            if (data.fullName !== authUser?.fullName) {
                setUser({ ...authUser, fullName: data.fullName, isTwoFactorEnabled: data.isTwoFactorEnabled });
            }
        } catch (err) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await settingsService.getAll();
            setSettings(res.data);
        } catch {
            toast.error('Lỗi khi tải cài đặt hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (key, currentValue) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setSaving(true);
        try {
            await settingsService.update(key, newValue);
            setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: newValue } : s));
            toast.success('Cập nhật thành công');
        } catch {
            toast.error('Lỗi khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    // 2FA Handlers (Shared with Profile)
    const handleTwoFactorClick = () => {
        if (authUser?.isTwoFactorEnabled) {
            setShowTwoFactorDisable(true);
            setTwoFactorCode('');
        } else {
            setShowTwoFactorSetup(true);
            setTwoFactorSecret('');
            setTwoFactorCode('');
        }
    };

    const startTwoFactorSetup = async () => {
        try {
            setSetupLoading(true);
            const response = await twoFactorService.setup();
            const data = response.data;
            if (data) {
                setTwoFactorSecret(data.secret);
                setTwoFactorQrUrl(data.qrCode || data.qrUrl);
            }
        } catch (err) {
            toast.error('Không thể khởi tạo 2FA');
        } finally {
            setSetupLoading(false);
        }
    };

    const confirmTwoFactorEnable = async () => {
        setSaving(true);
        try {
            await twoFactorService.enable({ secret: twoFactorSecret, code: twoFactorCode });
            toast.success('Đã kích hoạt 2FA thành công');
            setShowTwoFactorSetup(false);
            // Refresh auth user state
            setUser({ ...authUser, isTwoFactorEnabled: true });
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
            setUser({ ...authUser, isTwoFactorEnabled: false });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setSaving(false);
        }
    };

    // Profile Handlers
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Fix: Clean up payload before sending
            const payload = { ...profileForm };
            if (!payload.dateOfBirth) payload.dateOfBirth = null;
            if (payload.password === '') delete payload.password; // Don't send empty password

            const res = await userService.updateMe(payload);
            const data = res.data;
            setUserData(data);
            setUser({ ...authUser, fullName: data.fullName });
            toast.success('Cập nhật hồ sơ thành công');
            setProfileForm(prev => ({ ...prev, password: '' }));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            toast.loading('Đang trích xuất dữ liệu...', { id: 'export' });
            // For admin, we also fetch settings
            const exportData = {
                profile: user,
                addresses: addresses,
                systemPreferences: settings,
                exportedAt: new Date().toISOString(),
                role: 'ADMIN'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `admin_data_${user.username}_${new Date().getTime()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Hồ sơ dữ liệu đã sẵn sàng!', { id: 'export' });
        } catch (err) {
            toast.error(`Lỗi trích xuất: ${err.response?.data?.message || err.message}`, { id: 'export' });
        }
    };

    // Address Handlers
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
            const res = await addressService.getAll();
            setAddresses(res.data || []);
        } catch (err) {
            toast.error('Lỗi khi lưu địa chỉ');
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
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xoá địa chỉ này?')) return;
        try {
            await addressService.delete(id);
            toast.success('Đã xoá địa chỉ');
            const res = await addressService.getAll();
            setAddresses(res.data || []);
        } catch (err) {
            toast.error('Lỗi khi xoá địa chỉ');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await addressService.setDefault(id);
            toast.success('Đã đặt làm mặc định');
            const res = await addressService.getAll();
            setAddresses(res.data || []);
        } catch (err) {
            toast.error('Lỗi khi cập nhật địa chỉ');
        }
    };

    const getSettingIcon = (key) => {
        if (key.includes('MAINTENANCE')) return <WrenchScrewdriverIcon className="w-6 h-6" />;
        if (key.includes('FACTOR') || key.includes('AUTH')) return <ShieldCheckIcon className="w-6 h-6" />;
        if (key.includes('NOTI')) return <BellIcon className="w-6 h-6" />;
        return <CommandLineIcon className="w-6 h-6" />;
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Trung tâm cấu hình</h1>
                    <p className="text-gray-500 font-medium italic">Quản trị toàn bộ cài đặt hệ thống và bảo mật cá nhân của bạn.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
                    {/* Navigation Sidebar */}
                    <aside className="w-full md:w-80 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col gap-8">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-black flex items-center justify-center text-white text-3xl font-black shadow-xl mb-4 relative group">
                                {authUser?.fullName?.charAt(0).toUpperCase() || 'A'}
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-xl border-4 border-white flex items-center justify-center">
                                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h2 className="font-black text-gray-900 leading-tight">{authUser?.fullName}</h2>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Quản trị viên đặc quyền</span>
                        </div>

                        <nav className="space-y-3">
                            <button onClick={() => setActiveTab('system')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'system' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <CommandLineIcon className="w-6 h-6" />
                                <span className="text-sm">Cài đặt hệ thống</span>
                            </button>
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'profile' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <UserCircleIcon className="w-6 h-6" />
                                <span className="text-sm">Hồ sơ cá nhân</span>
                            </button>
                            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'notifications' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <BellIcon className="w-6 h-6" />
                                <span className="text-sm">Thông báo</span>
                            </button>
                            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'security' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <ShieldCheckIcon className="w-6 h-6" />
                                <span className="text-sm">Bảo mật & 2FA</span>
                            </button>
                            <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'addresses' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <MapPinIcon className="w-6 h-6" />
                                <span className="text-sm">Sổ địa chỉ</span>
                            </button>
                            <button onClick={() => setActiveTab('privacy')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'privacy' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <LockClosedIcon className="w-6 h-6" />
                                <span className="text-sm">Quyền riêng tư</span>
                            </button>
                        </nav>

                        {/* Membership Card - Premium Layout */}
                        <div className="mt-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
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
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 p-10 bg-white">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto">
                                {/* Tab: System Settings - Structured like TOAN_STORE */}
                                {activeTab === 'system' && (
                                    <div className="space-y-12 animate-fade-in pb-20">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Cấu hình hệ thống</h3>
                                                <p className="text-gray-500 font-medium italic mt-2">Quản lý toàn bộ thông số định danh và vận hành cửa hàng.</p>
                                            </div>
                                            <button onClick={fetchSettings} className={`p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                                                <ArrowPathIcon className="w-6 h-6 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Section: Thông tin cửa hàng */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-black rounded-full"></div>
                                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Thông tin cửa hàng</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {settings.filter(s => ['STORE_NAME', 'STORE_EMAIL', 'STORE_PHONE', 'STORE_ADDRESS', 'COPYRIGHT_TEXT'].some(k => s.settingKey.includes(k))).map(s => (
                                                    <div key={s.id} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 hover:border-black transition-all group">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">{s.settingKey.replace(/_/g, ' ')}</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-black transition-colors shadow-sm">
                                                                {getSettingIcon(s.settingKey)}
                                                            </div>
                                                            <input type="text" value={s.settingValue} className="flex-1 bg-transparent border-none font-bold text-gray-900 focus:ring-0" onChange={(e) => handleToggle(s.settingKey, e.target.value)} readOnly={s.settingKey === 'STORE_EMAIL'} />
                                                        </div>
                                                    </div>
                                                ))}
                                                {settings.filter(s => ['STORE_NAME', 'STORE_EMAIL', 'STORE_PHONE', 'STORE_ADDRESS', 'COPYRIGHT_TEXT'].some(k => s.settingKey.includes(k))).length === 0 && (
                                                    <p className="text-gray-400 italic text-sm col-span-2 text-center py-6 border-2 border-dashed rounded-[2rem]">Chưa có thông tin cửa hàng cơ bản.</p>
                                                )}
                                            </div>
                                        </section>

                                        {/* Section: Cài đặt tài chính */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Tài chính & Thanh toán</h4>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {settings.filter(s => ['TAX', 'CURRENCY', 'SHIPPING', 'FEE'].some(k => s.settingKey.includes(k))).map(s => (
                                                    <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">{s.settingKey.replace(/_/g, ' ')}</label>
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type={s.settingKey.includes('CURRENCY') ? 'text' : 'number'} 
                                                                value={s.settingValue} 
                                                                className="w-full text-2xl font-black text-gray-900 border-none p-0 focus:ring-0" 
                                                                step="0.01"
                                                            />
                                                            <span className="text-gray-300 font-bold">{s.settingKey.includes('TAX') ? '%' : ''}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Section: Mạng xã hội */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Mạng xã hội</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {settings.filter(s => ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER'].some(k => s.settingKey.includes(k))).map(s => (
                                                    <div key={s.id} className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                                        <span className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            <span className="text-blue-600 font-black">#</span>
                                                        </span>
                                                        <input type="text" value={s.settingValue} className="flex-1 bg-transparent border-none font-medium text-gray-500 italic" placeholder={`Link ${s.settingKey.toLowerCase()}...`} />
                                                    </div>
                                                ))}
                                                {settings.filter(s => ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER'].some(k => s.settingKey.includes(k))).length === 0 && (
                                                    <p className="text-gray-400 italic text-sm">Chưa có liên kết mạng xã hội nào được cấu hình.</p>
                                                )}
                                            </div>
                                        </section>

                                        {/* Section: Vận hành & Bảo mật hệ thống */}
                                        <section className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                                                <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Vận hành & Bảo mật</h4>
                                            </div>
                                            <div className="grid gap-6">
                                                {settings.filter(s => ['MAINTENANCE', 'IP_WHITELIST', 'ENFORCE'].some(k => s.settingKey.includes(k))).map((s) => (
                                                    <div key={s.id} className="group flex items-center justify-between p-8 bg-white border border-gray-100 rounded-[2rem] hover:border-red-100 hover:bg-red-50/10 transition-all shadow-sm">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                                                                {getSettingIcon(s.settingKey)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{s.settingKey.replace(/_/g, ' ')}</h4>
                                                                <p className="text-sm text-gray-500 font-medium italic mt-1">{s.description || 'Tham số điều khiển bảo mật và trạng thái hệ thống.'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {(s.settingValue === 'true' || s.settingValue === 'false') ? (
                                                                <button 
                                                                    onClick={() => handleToggle(s.settingKey, s.settingValue)}
                                                                    disabled={saving}
                                                                    className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 ${s.settingValue === 'true' ? 'bg-red-600' : 'bg-gray-200'}`}
                                                                >
                                                                    <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-all duration-300 shadow-lg ${s.settingValue === 'true' ? 'translate-x-8' : 'translate-x-1'}`} />
                                                                </button>
                                                            ) : (
                                                                <input type="text" value={s.settingValue} className="w-48 bg-gray-100 border-none rounded-xl px-4 py-3 font-bold text-gray-400 italic" readOnly />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Shortcut to Logs */}
                                        <div className="pt-10 border-t border-gray-100 text-center">
                                            <Link to="/admin/audit-logs" className="inline-flex items-center gap-4 px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95">
                                                <CommandLineIcon className="w-6 h-6" />
                                                Xem nhật ký hoạt động (Audit Logs)
                                            </Link>
                                            <p className="text-gray-400 text-[10px] font-black italic mt-4 uppercase tracking-widest">Giám sát toàn bộ thay đổi dữ liệu từ quản trị viên</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Profile (Migrated from Profile.jsx) */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-10 animate-fade-in">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">Hồ sơ định danh</h3>
                                            <p className="text-gray-500 font-medium italic mt-2">Thông tin định danh quản trị viên trên hệ thống.</p>
                                        </div>
                                        <form onSubmit={handleProfileSubmit} className="space-y-8 bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Họ và tên quản trị</label>
                                                    <input className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none" value={profileForm.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} />
                                                </div>
                                                <div className="space-y-2 text-gray-400 cursor-not-allowed">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Email hệ thống</label>
                                                    <div className="relative">
                                                        <input className="w-full bg-white/50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold italic" value={profileForm.email} readOnly />
                                                        <LockClosedIcon className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 opacity-30" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Số điện thoại</label>
                                                    <input className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Đổi mật khẩu mới</label>
                                                    <input type="password" className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none" value={profileForm.password} onChange={(e) => setProfileForm({...profileForm, password: e.target.value})} placeholder="Để trống nếu không muốn đổi" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Ngày sinh</label>
                                                    <input type="date" className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none uppercase" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Giới tính</label>
                                                    <select className="w-full bg-white border-2 border-transparent rounded-2xl px-6 py-4 font-bold focus:border-green-600 transition-all shadow-sm outline-none appearance-none" value={profileForm.gender} onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}>
                                                        <option value="male">Nam</option>
                                                        <option value="female">Nữ</option>
                                                        <option value="other">Khác</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={saving} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                                {saving ? 'ĐANG LƯU...' : 'XÁC NHẬN CẬP NHẬT HỒ SƠ'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Tab: Notifications (Communication Preferences) */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-10 animate-fade-in">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Cài đặt thông báo</h3>
                                            <p className="text-gray-500 font-medium italic mt-2">Tùy chỉnh cách chúng tôi liên lạc và gửi thông tin vận hành cho bạn.</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-4 shadow-sm overflow-hidden">
                                            {[
                                                { key: 'emailNotifications', label: 'Email thông báo hệ thống', desc: 'Nhận tin nhắn về trạng thái đơn hàng, đăng nhập và bảo mật qua email.' },
                                                { key: 'promoNotifications', label: 'Email ưu đãi & Marketing', desc: 'Nhận các bản tin về sản phẩm mới, khuyến mãi và tích điểm thành viên.' }
                                            ].map((n) => (
                                                <div key={n.key} className="flex items-center justify-between p-8 border-b last:border-none border-gray-50 group transition-all hover:bg-gray-50/50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                                                            <BellIcon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{n.label}</h4>
                                                            <p className="text-sm text-gray-500 font-medium italic mt-1">{n.desc}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const newValue = !profileForm[n.key];
                                                            setProfileForm({...profileForm, [n.key]: newValue});
                                                            handleToggle(n.key.toUpperCase(), newValue.toString());
                                                        }}
                                                        className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-300 ${profileForm[n.key] ? 'bg-black' : 'bg-gray-200'}`}
                                                    >
                                                        <span className={`inline-block h-7 w-7 transform rounded-full bg-white transition-all duration-300 shadow-lg ${profileForm[n.key] ? 'translate-x-8' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Security (Integrated) */}
                                {activeTab === 'security' && (
                                    <div className="space-y-10 animate-fade-in">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Bảo mật & 2FA</h3>
                                            <p className="text-gray-500 font-medium italic mt-2">Nâng cấp lớp bảo vệ tài khoản bằng ứng dụng Google Authenticator.</p>
                                        </div>
                                        
                                        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${user?.isTwoFactorEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                                                            <ShieldCheckIcon className="w-10 h-10" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-2xl font-black text-gray-900 leading-tight">Xác thực 2 bước</h4>
                                                            <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] ${user?.isTwoFactorEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                                                {user?.isTwoFactorEnabled ? 'ĐANG KÍCH HOẠT' : 'CHƯA BẢO VỆ'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {!showTwoFactorSetup && !showTwoFactorDisable && (
                                                        <button onClick={handleTwoFactorClick} className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 ${user?.isTwoFactorEnabled ? 'bg-white text-red-600 border-2 border-red-50 hover:bg-red-600 hover:text-white' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                                                            {user?.isTwoFactorEnabled ? 'GỠ BỎ XÁC THỰC' : 'THIẾT LẬP NGAY'}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Session Placeholder logic from TOAN_STORE */}
                                                <div className="mt-12 p-10 bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <CommandLineIcon className="w-6 h-6 text-gray-400" />
                                                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-sm">Quản lý phiên đăng nhập</h5>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                                                    <div className="w-2 h-2 bg-current rounded-full animate-ping"></div>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">Thiết bị hiện tại (Windows Client)</p>
                                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Việt Nam • 127.0.0.1</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">ĐANG HOẠT ĐỘNG</span>
                                                        </div>
                                                        <button className="w-full py-4 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-50 rounded-xl transition-all italic">
                                                            Đăng xuất khỏi tất cả các thiết bị khác →
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Setup flow */}
                                                {showTwoFactorSetup && (
                                                    <div className="mt-8 pt-8 border-t border-gray-100 animate-fade-in">
                                                        {!twoFactorSecret ? (
                                                            <div className="text-center py-10 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                                                <p className="font-bold text-gray-500 italic mb-8">Hệ thống sẽ tạo mã QR bảo mật riêng cho quản trị viên.</p>
                                                                <div className="flex justify-center gap-4">
                                                                    <button onClick={startTwoFactorSetup} disabled={setupLoading} className="bg-black text-white px-10 py-4 rounded-xl font-black flex items-center gap-3">
                                                                        <ArrowPathIcon className={`w-5 h-5 ${setupLoading ? 'animate-spin' : ''}`} />
                                                                        XÁC NHẬN KHỞI TẠO
                                                                    </button>
                                                                    <button onClick={() => setShowTwoFactorSetup(false)} className="text-gray-400 font-black">HỦY</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grid lg:grid-cols-2 gap-12 bg-white p-10 rounded-[2.5rem] shadow-inner border">
                                                                <div className="flex flex-col items-center gap-6">
                                                                    <div className="p-4 bg-gray-50 rounded-3xl border-4 border-white shadow-xl relative overflow-hidden">
                                                                        <img src={twoFactorQrUrl && twoFactorQrUrl.startsWith('data:') ? twoFactorQrUrl : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(twoFactorQrUrl)}&margin=10`} alt="QR" className="w-60 h-60 mix-blend-multiply" />
                                                                    </div>
                                                                    <div className="bg-green-50 px-6 py-2 rounded-2xl border border-green-100 italic">
                                                                        <code className="text-xs font-black text-green-700 tracking-widest">{twoFactorSecret}</code>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-8">
                                                                    <div className="space-y-4">
                                                                        <div className="flex gap-4">
                                                                            <span className="w-8 h-8 rounded-lg bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                                                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">Mở Google Authenticator và chọn "Quét mã QR".</p>
                                                                        </div>
                                                                        <div className="flex gap-4">
                                                                            <span className="w-8 h-8 rounded-lg bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                                                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">Nhập mã 6 chữ số vừa tạo vào đây.</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <input type="text" maxLength="6" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-5xl font-black py-6 border-2 border-gray-100 rounded-3xl focus:border-green-600 outline-none" placeholder="000000" />
                                                                        <div className="flex gap-4">
                                                                            <button onClick={confirmTwoFactorEnable} disabled={twoFactorCode.length !== 6 || saving} className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black shadow-xl">KÍCH HOẠT NHANH</button>
                                                                            <button onClick={() => setShowTwoFactorSetup(false)} className="px-6 font-black text-gray-400">HỦY</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Disable flow */}
                                                {showTwoFactorDisable && (
                                                    <div className="mt-8 pt-8 border-t border-red-50 space-y-8 text-center bg-red-50/20 p-10 rounded-[2.5rem]">
                                                        <p className="text-red-600 font-black italic">Hệ thống yêu cầu mã xác thực hiện tại để xác nhận gỡ bỏ.</p>
                                                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                                                            <input type="text" maxLength="6" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} className="w-64 py-5 rounded-3xl text-center text-3xl font-black focus:border-red-600 outline-none border-2 border-red-100" placeholder="000000" />
                                                            <button onClick={confirmTwoFactorDisable} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black shadow-xl">XÁC NHẬN TẮT</button>
                                                            <button onClick={() => setShowTwoFactorDisable(false)} className="font-black text-gray-400">HỦY</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Addresses */}
                                {activeTab === 'addresses' && (
                                    <div className="space-y-10 animate-fade-in">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Sổ địa chỉ cá nhân</h3>
                                                <p className="text-gray-500 font-medium italic mt-2">Dành cho việc nhận hàng mẫu hoặc quà tặng doanh nghiệp.</p>
                                            </div>
                                            <button onClick={() => setShowAddrForm(!showAddrForm)} className="bg-black text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
                                                <PlusIcon className="w-5 h-5" />
                                                {showAddrForm ? 'HỦY BỎ' : 'THÊM ĐỊA CHỈ'}
                                            </button>
                                        </div>

                                        {showAddrForm && (
                                            <form onSubmit={handleAddrSubmit} className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-8 relative animate-fade-in">
                                                <div className="md:col-span-2 flex items-center justify-between mb-4">
                                                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px] italic">{editingAddrId ? 'Đang cập nhật' : 'Thêm mới'} địa chỉ</h4>
                                                    <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border">
                                                        <input type="checkbox" id="isDefault" checked={addrForm.isDefault} onChange={(e) => setAddrForm({...addrForm, isDefault: e.target.checked})} className="w-5 h-5" />
                                                        <label htmlFor="isDefault" className="text-[10px] font-black text-gray-400">MẶC ĐỊNH</label>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Họ tên người nhận</label>
                                                    <input className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold shadow-sm" value={addrForm.fullName} onChange={(e) => setAddrForm({...addrForm, fullName: e.target.value})} required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Số điện thoại</label>
                                                    <input className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold shadow-sm" value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})} required />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">Địa chỉ chi tiết</label>
                                                    <textarea className="w-full bg-white border-none rounded-2xl px-6 py-4 font-bold shadow-sm" rows={2} value={addrForm.details} onChange={(e) => setAddrForm({...addrForm, details: e.target.value})} required />
                                                </div>
                                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                                    <div className="flex gap-4">
                                                        {['Nhà', 'Công ty', 'Khác'].map(label => (
                                                            <button key={label} type="button" onClick={() => setAddrForm({...addrForm, label})} className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${addrForm.label === label ? 'bg-black text-white shadow-xl' : 'bg-white text-gray-400 border'}`}>{label}</button>
                                                        ))}
                                                    </div>
                                                    <button type="submit" className="bg-green-600 text-white rounded-2xl py-4.5 font-black uppercase text-sm tracking-widest shadow-xl shadow-green-900/10">LƯU ĐỊA CHỈ</button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                            {addresses.length === 0 ? (
                                                <div className="lg:col-span-2 text-center py-20 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100 text-gray-300 font-black italic tracking-widest uppercase">Chưa có dữ liệu địa chỉ</div>
                                            ) : (
                                                addresses.map(addr => (
                                                    <div key={addr.id} className={`p-10 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl flex flex-col justify-between ${addr.isDefault ? 'bg-green-50/20 border-green-600 shadow-xl' : 'bg-white border-gray-50'}`}>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-8">
                                                                <div className={`p-5 rounded-2xl shadow-lg ${addr.isDefault ? 'bg-green-600 text-white shadow-green-900/20' : 'bg-gray-100 text-gray-400'}`}>
                                                                    {addr.label === 'Nhà' ? <HomeIcon className="w-8 h-8" /> : addr.label === 'Công ty' ? <BriefcaseIcon className="w-8 h-8" /> : <MapPinIcon className="w-8 h-8" />}
                                                                </div>
                                                                <div className="flex flex-col items-end gap-2">
                                                                    {addr.isDefault && <span className="bg-green-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md">MẶC ĐỊNH</span>}
                                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{addr.label}</span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-2xl font-black text-gray-900 mb-2">{addr.fullName}</h4>
                                                            <div className="flex items-center gap-3 text-sm font-black text-gray-400 mb-6 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 inline-flex">
                                                                <PhoneIcon className="w-4 h-4 text-green-600" />
                                                                {addr.phone}
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-500 italic bg-gray-50/50 p-6 rounded-2xl leading-relaxed">{addr.details}</p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-100/50">
                                                            <div className="flex gap-6">
                                                                <button type="button" onClick={() => handleEditAddress(addr)} className="text-gray-900 hover:text-green-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">CHỈNH SỬA</button>
                                                                <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">XÓA</button>
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

                                {activeTab === 'privacy' && (
                                    <div className="space-y-12 animate-fade-in pb-20">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Quyền riêng tư & Dữ liệu</h3>
                                            <p className="text-gray-500 font-medium italic mt-2">Quyền kiểm soát dữ liệu cá nhân của bạn theo tiêu chuẩn bảo mật quốc tế.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                    <ArchiveBoxIcon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Xuất dữ liệu cá nhân</h4>
                                                    <p className="text-sm text-gray-500 font-medium italic mt-2">Chúng tôi sẽ tạo một bản sao dữ liệu của bạn ở định dạng JSON. Quá trình này có thể mất vài phút.</p>
                                                </div>
                                                <button onClick={handleExportData} className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl">BẮT ĐẦU TRÍCH XUẤT</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AdminLayout>
    );
}
