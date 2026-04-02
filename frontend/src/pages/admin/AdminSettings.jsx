import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { settingsService, userService, addressService, twoFactorService, orderService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ModalContext';
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
    PencilSquareIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';

/**
 * ADMIN COMPONENT: AdminSettings
 * ---------------------------------------------------------
 * Comprehensive control panel for system-wide configurations and admin account security.
 * 
 * Main Modules:
 * 1. System Settings: Batch update global store parameters (Tax, Currency, Maintenance).
 * 2. Profile Management: Update administrative identity and credentials.
 * 3. Security (2FA): Specialized workflow for Two-Factor Authentication (TOTP).
 * 4. Address Center: Manage physical warehouse and office locations.
 */
export default function AdminSettings() {
    const { confirm } = useConfirm();
    const { user: authUser, setUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'system';

    // --- STATE ---
    const [settings, setSettings] = useState([]);
    const [systemForm, setSystemForm] = useState({});
    const [user, setUserData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    // Profile Form state
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

    // Address Form state
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [editingAddrId, setEditingAddrId] = useState(null);
    const [addrForm, setAddrForm] = useState({
        label: 'Văn phòng',
        fullName: '',
        phone: '',
        addressDetail: '',
        ward: '',
        district: '',
        province: '',
        isDefault: false
    });

    // 2FA state (TOTP Workflow)
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
    const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [setupLoading, setSetupLoading] = useState(false);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    /**
     * loadData: Central hydration point for all settings modules.
     * Fetches system preferences, user profile, and registered addresses.
     */
    const loadData = async () => {
        setLoading(true);
        try {
            const [settingsRes, userRes] = await Promise.all([
                settingsService.getAll(),
                userService.me()
            ]);
            
            setSettings(settingsRes.data);
            
            // Map settings list to a key-value object for form easy access
            const sMap = {};
            settingsRes.data.forEach(s => {
                sMap[s.settingKey] = s.settingValue;
            });
            setSystemForm(sMap);

            const data = userRes.data;
            setUserData(data);
            setProfileForm({
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                dateOfBirth: data.dateOfBirth || '',
                gender: data.gender || 'other',
                emailNotifications: data.emailNotifications ?? true,
                promoNotifications: data.promoNotifications ?? false,
                oldPassword: '',
                password: ''
            });

            // Load addresses
            const addrRes = await addressService.getAll();
            setAddresses(addrRes.data || []);
            
            // SYNC: Push fresh user data to AuthContext to update Global UI (Navbar/Sidebar)
            setUser({ ...authUser, fullName: data.fullName, isTwoFactorEnabled: data.isTwoFactorEnabled, avatarUrl: data.avatarUrl });
        } catch (err) {
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSettingValueChange = (key, value) => {
        setSystemForm(prev => ({ ...prev, [key]: value }));
    };

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await settingsService.getAll();
            setSettings(res.data);
            const sMap = {};
            res.data.forEach(s => {
                sMap[s.settingKey] = s.settingValue;
            });
            setSystemForm(sMap);
        } catch {
            toast.error('Lỗi khi tải cài đặt');
        } finally {
            setLoading(false);
        }
    };

    const saveSection = async (keys) => {
        const batch = {};
        keys.forEach(k => {
            batch[k] = systemForm[k] || '';
        });

        setSaving(true);
        try {
            await settingsService.updateBatch(batch);
            setSettings(prev => {
                let next = [...prev];
                keys.forEach(k => {
                    const idx = next.findIndex(s => s.settingKey === k);
                    if (idx > -1) {
                        next[idx] = { ...next[idx], settingValue: batch[k] };
                    } else {
                        next.push({ settingKey: k, settingValue: batch[k], id: Date.now() + Math.random() });
                    }
                });
                return next;
            });
            toast.success('Đã lưu thay đổi cấu hình');
        } catch {
            toast.error('Lỗi khi lưu bộ cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const saveSetting = async (key) => {
        const newValue = systemForm[key] || '';
        setSaving(true);
        try {
            await settingsService.update(key, newValue);
            setSettings(prev => {
                const existing = prev.find(s => s.settingKey === key);
                if (existing) {
                    return prev.map(s => s.settingKey === key ? { ...s, settingValue: newValue } : s);
                }
                return [...prev, { settingKey: key, settingValue: newValue, id: Date.now() }];
            });
            toast.success('Cập nhật thành công');
        } catch {
            toast.error('Lỗi khi cập nhật cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (key, currentValue) => {
        const newValue = currentValue === 'true' ? 'false' : 'true';
        setSaving(true);
        try {
            await settingsService.update(key, newValue);
            setSettings(prev => prev.map(s => s.settingKey === key ? { ...s, settingValue: newValue } : s));
            setSystemForm(prev => ({ ...prev, [key]: newValue }));
            toast.success('Đã thay đổi trạng thái');
        } catch {
            toast.error('Lỗi khi cập nhật');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveAvatar = async () => {
        const ok = await confirm({
            title: 'Gỡ ảnh đại diện',
            message: 'Bạn có chắc chắn muốn gỡ bỏ ảnh đại diện và quay về sử dụng tên viết tắt?',
            type: 'warning'
        });
        if (!ok) return;

        setSaving(true);
        try {
            await userService.removeAvatar();
            toast.success('Đã gỡ ảnh đại diện');
            const data = { ...user, avatarUrl: null };
            setUserData(data);
            setUser({ ...authUser, avatarUrl: null });
        } catch (err) {
            toast.error('Gỡ ảnh thất bại');
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
        try {
            const res = await userService.updateAvatar(formData);
            toast.success('Cập nhật ảnh đại diện thành công');
            const data = { ...user, avatarUrl: res.data.avatarUrl };
            setUserData(data);
            setUser({ ...authUser, avatarUrl: res.data.avatarUrl });
        } catch (err) {
            toast.error('Lỗi khi tải ảnh lên');
        } finally {
            setSaving(false);
        }
    };

    const handleTwoFactorClick = () => {
        if (user?.isTwoFactorEnabled) {
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
            // Refresh states
            const updatedUser = { ...user, isTwoFactorEnabled: true };
            setUserData(updatedUser);
            setUser({ ...authUser, isTwoFactorEnabled: true });
            setTwoFactorCode('');
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
            // Refresh states
            const updatedUser = { ...user, isTwoFactorEnabled: false };
            setUserData(updatedUser);
            setUser({ ...authUser, isTwoFactorEnabled: false });
            setTwoFactorCode('');
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
                fullName: user.fullName || '',
                phone: user.phone || '',
                addressDetail: '',
                ward: '',
                district: '',
                province: '',
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
            addressDetail: addr.addressDetail,
            ward: addr.ward,
            district: addr.district,
            province: addr.province,
            isDefault: addr.isDefault
        });
        setShowAddrForm(true);
    };

    const handleDeleteAddress = async (id) => {
        const ok = await confirm({
            title: 'Xóa địa chỉ',
            message: 'Bạn có chắc chắn muốn xóa vĩnh viễn địa chỉ này khỏi hồ sơ quản trị? Các thông báo hoặc kiện hàng mẫu gửi tới đây sẽ bị gián đoạn.',
            type: 'danger'
        });
        if (!ok) return;
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
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1.5">Trung tâm cấu hình</h1>
                    <p className="text-sm text-gray-500 font-medium italic">Quản trị toàn bộ cài đặt hệ thống và bảo mật tài khoản đặc quyền.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                    {/* Navigation Sidebar */}
                    <aside className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-5 flex flex-col gap-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl font-black shadow-lg mb-4 relative group overflow-hidden border-2 border-white">
                                {authUser?.avatarUrl ? (
                                    <img src={authUser.avatarUrl} alt={authUser.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    authUser?.fullName?.charAt(0).toUpperCase() || 'A'
                                )}
                                <div className="absolute inset-0 bg-green-600/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
                                    <label className="cursor-pointer hover:scale-110 transition-transform" title="Thay đổi ảnh">
                                        <PencilIcon className="w-5 h-5 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                                    </label>
                                    {authUser?.avatarUrl && (
                                        <button 
                                            type="button"
                                            onClick={handleRemoveAvatar} 
                                            className="hover:scale-110 transition-transform text-white/90 hover:text-red-400" 
                                            title="Gỡ ảnh đại diện"
                                            disabled={saving}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <h2 className="font-black text-gray-900 leading-tight text-sm px-2">{authUser?.fullName}</h2>
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin đặc quyền</span>
                        </div>

                        <nav className="space-y-1.5 flex-1">
                            <button onClick={() => setActiveTab('system')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'system' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <CommandLineIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Cài đặt hệ thống</span>
                            </button>
                            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'profile' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <UserCircleIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Hồ sơ quản trị</span>
                            </button>
                            <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'addresses' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <HomeIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Kho bãi & Văn phòng</span>
                            </button>
                            <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'notifications' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <BellIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Thông báo hệ thống</span>
                            </button>
                            <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'security' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <ShieldCheckIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Bảo mật & 2FA</span>
                            </button>
                            <button onClick={() => setActiveTab('privacy')} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-black transition-all ${activeTab === 'privacy' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:bg-white hover:text-green-600'}`}>
                                <LockClosedIcon className="w-5 h-5" />
                                <span className="text-[11px] uppercase tracking-wider">Dữ liệu & Lưu trữ</span>
                            </button>
                        </nav>

                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 p-6 bg-white overflow-y-auto max-h-[85vh]">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto">
                                {/* Tab: System Settings - Structured like TOAN_STORE */}
                                {activeTab === 'system' && (
                                    <div className="space-y-10 animate-fade-in pb-16">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Cấu hình hệ thống</h3>
                                                <p className="text-sm text-gray-500 font-medium italic mt-1.5">Quản lý toàn bộ thông số định danh và vận hành cửa hàng.</p>
                                            </div>
                                            <button onClick={fetchSettings} className={`p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all ${loading ? 'animate-spin' : ''}`}>
                                                <ArrowPathIcon className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Section: Thông tin cửa hàng */}
                                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                                                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Thông tin cửa hàng</h4>
                                                </div>
                                                <button 
                                                    onClick={() => saveSection(['STORE_NAME', 'STORE_EMAIL', 'STORE_PHONE', 'STORE_ADDRESS', 'COPYRIGHT_TEXT'])}
                                                    disabled={saving}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {saving ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {['STORE_NAME', 'STORE_EMAIL', 'STORE_PHONE', 'STORE_ADDRESS', 'COPYRIGHT_TEXT'].map(key => {
                                                    const s = settings.find(st => st.settingKey === key);
                                                    const isMissing = !s;
                                                    const currentVal = systemForm[key] || '';
                                                    return (
                                                        <div key={key} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-green-600 transition-all group">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">
                                                                    {key.replace(/_/g, ' ')}
                                                                </label>
                                                                {isMissing && <span className="text-red-500 font-bold text-[8px] uppercase tracking-tighter">(CHƯA KHỞI TẠO)</span>}
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <input 
                                                                    type="text" 
                                                                    value={currentVal} 
                                                                    className={`flex-1 bg-transparent border-none font-bold text-gray-900 focus:ring-0 text-sm p-0 ${isMissing ? 'placeholder-gray-300' : ''}`} 
                                                                    placeholder={`Nhập ${key.replace(/_/g, ' ').toLowerCase()}...`}
                                                                    onChange={(e) => handleSettingValueChange(key, e.target.value)} 
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        {/* Section: Điểm thưởng & Thành viên */}
                                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Điểm thưởng & Thành viên</h4>
                                                </div>
                                                <button 
                                                    onClick={() => saveSection(['LOYALTY_RATIO', 'LOYALTY_POINTS_VALUE'])}
                                                    disabled={saving}
                                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
                                                >
                                                    {saving ? 'ĐANG LƯU...' : 'LƯU ĐIỂM THƯỞNG'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {['LOYALTY_RATIO', 'LOYALTY_POINTS_VALUE'].map(key => {
                                                    const s = settings.find(st => st.settingKey === key);
                                                    const isMissing = !s;
                                                    const currentVal = systemForm[key] !== undefined ? systemForm[key] : '';
                                                    return (
                                                        <div key={key} className="bg-amber-50/20 p-4 rounded-xl border border-amber-100 hover:border-amber-500 transition-all group">
                                                            <div className="flex justify-between items-start mb-1">
                                                                 <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">
                                                                     {key === 'LOYALTY_RATIO' ? 'Tỉ giá tích điểm (VNĐ = 1 điểm)' : 'Giá trị 1 điểm quy đổi (VNĐ)'}
                                                                 </label>
                                                                 {isMissing && <span className="text-amber-300 font-bold text-[8px] uppercase tracking-tighter">(CHƯA KHỞI TẠO)</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input 
                                                                    type="number" 
                                                                    value={currentVal} 
                                                                    className="w-full text-lg font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0" 
                                                                    onChange={(e) => handleSettingValueChange(key, e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        {/* Section: Tài chính & Thanh toán */}
                                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                                                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Tài chính & Thanh toán</h4>
                                                </div>
                                                <button 
                                                    onClick={() => saveSection(['TAX', 'CURRENCY', 'SHIPPING_FEE', 'FREE_SHIPPING_THRESHOLD'])}
                                                    disabled={saving}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {saving ? 'ĐANG LƯU...' : 'LƯU TÀI CHÍNH'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                                                {['TAX', 'CURRENCY', 'SHIPPING_FEE', 'FREE_SHIPPING_THRESHOLD'].map(key => {
                                                    const s = settings.find(st => st.settingKey === key);
                                                    const isMissing = !s;
                                                    const currentVal = systemForm[key] !== undefined ? systemForm[key] : '';
                                                    return (
                                                        <div key={key} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all flex flex-col items-center justify-center text-center space-y-4 min-h-[160px] group">
                                                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-green-600 transition-colors">
                                                                {key.replace(/_/g, ' ')} {isMissing && <span className="text-red-300 ml-1">(?)</span>}
                                                            </label>
                                                            <div className="flex items-center justify-center gap-2 w-full max-w-[220px]">
                                                                <input 
                                                                    type="text"
                                                                    value={currentVal} 
                                                                    placeholder="0"
                                                                    className="w-full text-3xl font-black text-gray-900 border-none p-0 focus:ring-0 bg-transparent text-center tabular-nums leading-none tracking-tighter" 
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace(/[^0-9.]/g, '');
                                                                        handleSettingValueChange(key, val);
                                                                    }}
                                                                />
                                                                <span className="text-gray-300 font-black text-xs uppercase shrink-0 pt-2">
                                                                    {key.includes('TAX') ? '%' : key.includes('CURRENCY') ? '' : 'VNĐ'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        {/* Section: Mạng xã hội */}
                                        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Mạng xã hội</h4>
                                                </div>
                                                <button 
                                                    onClick={() => saveSection(['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER'])}
                                                    disabled={saving}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                                                >
                                                    {saving ? 'ĐANG LƯU...' : 'LƯU LIÊN KẾT'}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {['FACEBOOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER'].map(key => {
                                                    const s = settings.find(st => st.settingKey === key);
                                                    const isMissing = !s;
                                                    const currentVal = systemForm[key] || '';
                                                    
                                                    // Brand specific colors and SVG Icons
                                                    const brandConfig = {
                                                        FACEBOOK: { 
                                                            color: 'text-blue-600', 
                                                            bg: 'bg-blue-50', 
                                                            icon: (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                                                </svg>
                                                            ) 
                                                        },
                                                        INSTAGRAM: { 
                                                            color: 'text-pink-600', 
                                                            bg: 'bg-pink-50', 
                                                            icon: (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                                                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path>
                                                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                                                </svg>
                                                            ) 
                                                        },
                                                        YOUTUBE: { 
                                                            color: 'text-red-600', 
                                                            bg: 'bg-red-50', 
                                                            icon: (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                                </svg>
                                                            ) 
                                                        },
                                                        TWITTER: { 
                                                            color: 'text-sky-500', 
                                                            bg: 'bg-sky-50', 
                                                            icon: (
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                                </svg>
                                                            ) 
                                                        }
                                                    };
                                                    const config = brandConfig[key] || { color: 'text-gray-400', bg: 'bg-gray-50', icon: '#' };

                                                    return (
                                                        <div key={key} className="flex items-center gap-4 bg-gray-50/30 p-5 rounded-2xl border border-gray-100 group hover:border-gray-200 hover:bg-white transition-all shadow-sm">
                                                            <div className={`w-12 h-12 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                                                                {config.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{key}</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={currentVal} 
                                                                    className="w-full bg-transparent border-none font-bold text-gray-700 text-sm p-0 focus:ring-0 truncate" 
                                                                    placeholder={`https://${key.toLowerCase()}.com/username`}
                                                                    onChange={(e) => handleSettingValueChange(key, e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </section>

                                        {/* Section: Vận hành & Bảo mật hệ thống */}
                                        <section className="space-y-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                                                <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Vận hành & Bảo mật</h4>
                                            </div>
                                            <div className="grid gap-3">
                                                {settings.filter(s => ['MAINTENANCE', 'IP_WHITELIST', 'ENFORCE'].some(k => s.settingKey.includes(k))).map((s) => (
                                                    <div key={s.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-red-100 hover:bg-red-50/10 transition-all shadow-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-red-100 group-hover:text-red-600 transition-all">
                                                                <span className="scale-75">{getSettingIcon(s.settingKey)}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">
                                                                    {s.settingKey.includes('ENFORCE_2FA') ? 'Bắt buộc 2FA toàn hệ thống' : s.settingKey.replace(/_/g, ' ')}
                                                                </h4>
                                                                <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">
                                                                    {s.settingKey.includes('ENFORCE_2FA') 
                                                                        ? 'Khi kích hoạt, mọi quản trị viên và nhân viên bắt buộc phải thiết lập 2FA để truy cập Dashboard.'
                                                                        : (s.description || 'Tham số điều khiển bảo mật và trạng thái hệ thống.')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {(s.settingValue === 'true' || s.settingValue === 'false') ? (
                                                                <button 
                                                                    onClick={() => handleToggle(s.settingKey, s.settingValue)}
                                                                    disabled={saving}
                                                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${s.settingValue === 'true' ? 'bg-red-600' : 'bg-gray-200'}`}
                                                                >
                                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md ${s.settingValue === 'true' ? 'translate-x-6' : 'translate-x-1'}`} />
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-2">
                                                                    <input 
                                                                        type="text" 
                                                                        value={systemForm[s.settingKey] || ''} 
                                                                        onChange={(e) => handleSettingValueChange(s.settingKey, e.target.value)}
                                                                        className="w-40 bg-gray-100 border-none rounded-lg px-3 py-2 text-[10px] font-bold text-gray-900 focus:ring-2 focus:ring-red-500 transition-all shadow-inner" 
                                                                    />
                                                                    <button 
                                                                        onClick={() => saveSetting(s.settingKey)}
                                                                        disabled={saving}
                                                                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                                                                    >
                                                                        <PencilSquareIcon className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Shortcut to Logs */}
                                        <div className="pt-8 border-t border-gray-100 text-center">
                                            <Link to="/admin/audit-logs" className="inline-flex items-center gap-4 px-8 py-4 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-700 transition-all shadow-xl active:scale-95">
                                                <CommandLineIcon className="w-5 h-5" />
                                                Xem nhật ký hoạt động (Audit Logs)
                                            </Link>
                                            <p className="text-gray-400 text-[9px] font-black italic mt-3 uppercase tracking-widest">Giám sát toàn bộ thay đổi dữ liệu từ quản trị viên</p>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Profile (Migrated from Profile.jsx) */}
                                {activeTab === 'profile' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">Hồ sơ quản trị</h3>
                                            <p className="text-[13px] text-gray-500 font-medium italic mt-1">Thông tin tài khoản và định danh quản trị viên trên hệ thống.</p>
                                        </div>
                                        <form onSubmit={handleProfileSubmit} className="space-y-5 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Họ và tên quản trị</label>
                                                    <input className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none" value={profileForm.fullName} onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})} />
                                                </div>
                                                <div className="space-y-1.5 text-gray-400 cursor-not-allowed">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Email hệ thống</label>
                                                    <div className="relative">
                                                        <input className="w-full bg-white/50 border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold italic" value={profileForm.email} readOnly />
                                                        <LockClosedIcon className="w-4 h-4 absolute right-5 top-1/2 -translate-y-1/2 opacity-30" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Số điện thoại</label>
                                                    <input className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Mật khẩu cũ (Xác nhận)</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showOldPassword ? "text" : "password"}
                                                            className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none pr-10"
                                                            value={profileForm.oldPassword}
                                                            onChange={(e) => setProfileForm({ ...profileForm, oldPassword: e.target.value })}
                                                            placeholder="Bắt buộc nếu đổi pass"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                                        >
                                                            {showOldPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Đổi mật khẩu mới</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none pr-10"
                                                            value={profileForm.password}
                                                            onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                                            placeholder="Để trống nếu không đổi"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                        >
                                                            {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Ngày sinh</label>
                                                    <input type="date" className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none uppercase" value={profileForm.dateOfBirth} onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3">Giới tính</label>
                                                    <select className="w-full bg-white border-2 border-transparent rounded-xl px-5 py-3 text-sm font-bold focus:border-green-600 transition-all shadow-sm outline-none appearance-none" value={profileForm.gender} onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}>
                                                        <option value="male">Nam</option>
                                                        <option value="female">Nữ</option>
                                                        <option value="other">Khác</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-green-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                                                {saving ? 'ĐANG LƯU...' : 'XÁC NHẬN CẬP NHẬT'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Tab: Notifications (Communication Preferences) */}
                                {activeTab === 'notifications' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-4">Cài đặt thông báo</h3>
                                            <p className="text-[13px] text-gray-500 font-medium italic mt-1">Tùy chỉnh cách chúng tôi liên lạc và gửi thông tin vận hành cho bạn.</p>
                                        </div>
                                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                            {[
                                                { key: 'emailNotifications', label: 'Email thông báo hệ thống', desc: 'Nhận tin nhắn về các hoạt động quan trọng của hệ thống, đăng nhập và bảo mật qua email.' }
                                            ].map((n) => (
                                                <div key={n.key} className="flex items-center justify-between p-5 border-b last:border-none border-gray-50 group hover:bg-gray-50/50 transition-all">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-green-600 group-hover:text-white transition-all">
                                                            <BellIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{n.label}</h4>
                                                            <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">{n.desc}</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            const newValue = !profileForm[n.key];
                                                            setProfileForm({...profileForm, [n.key]: newValue});
                                                            handleToggle(n.key.toUpperCase(), newValue.toString());
                                                        }}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${profileForm[n.key] ? 'bg-green-600' : 'bg-gray-200'}`}
                                                    >
                                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md ${profileForm[n.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Security (Integrated) */}
                                {activeTab === 'security' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Bảo mật & 2FA</h3>
                                            <p className="text-[13px] text-gray-500 font-medium italic mt-1">Nâng cấp lớp bảo vệ tài khoản bằng ứng dụng Google Authenticator.</p>
                                        </div>
                                        
                                        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
                                            <div className="relative z-10">
                                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${user?.isTwoFactorEnabled ? 'bg-green-600' : 'bg-red-600'}`}>
                                                            <ShieldCheckIcon className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black text-gray-900 leading-tight">Xác thực 2 bước</h4>
                                                            <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-[8.5px] font-black tracking-[0.2em] ${user?.isTwoFactorEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                                                {user?.isTwoFactorEnabled ? 'ĐANG KÍCH HOẠT' : 'CHƯA BẢO VỆ'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {!showTwoFactorSetup && !showTwoFactorDisable && (
                                                        <button onClick={handleTwoFactorClick} className={`px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95 ${user?.isTwoFactorEnabled ? 'bg-white text-red-600 border-2 border-red-50 hover:bg-red-600 hover:text-white' : 'bg-green-600 text-white hover:bg-green-500'}`}>
                                                            {user?.isTwoFactorEnabled ? 'GỠ BỎ XÁC THỰC' : 'THIẾT LẬP NGAY'}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Session Placeholder */}
                                                <div className="mt-6 p-4 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <CommandLineIcon className="w-5 h-5 text-gray-400" />
                                                        <h5 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Quản lý phiên đăng nhập</h5>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></div>
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-sm">Thiết bị hiện tại (Windows Client)</p>
                                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Việt Nam • 127.0.0.1</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full uppercase tracking-widest">HOẠT ĐỘNG</span>
                                                        </div>
                                                        <button className="w-full py-3 text-red-600 font-black uppercase text-[9px] tracking-widest hover:bg-red-50 rounded-lg transition-all italic">
                                                            Đăng xuất khỏi thiết bị khác →
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Setup flow */}
                                                {showTwoFactorSetup && (
                                                    <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
                                                        {!twoFactorSecret ? (
                                                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                                                <p className="font-bold text-gray-500 italic mb-8">Hệ thống sẽ tạo mã QR bảo mật riêng cho quản trị viên.</p>
                                                                <div className="flex justify-center gap-4">
                                                                    <button onClick={startTwoFactorSetup} disabled={setupLoading} className="bg-green-600 text-white px-10 py-4 rounded-xl font-black flex items-center gap-3 hover:bg-green-700 transition-all shadow-lg">
                                                                        <ArrowPathIcon className={`w-5 h-5 ${setupLoading ? 'animate-spin' : ''}`} />
                                                                        XÁC NHẬN KHỞI TẠO
                                                                    </button>
                                                                    <button onClick={() => setShowTwoFactorSetup(false)} className="text-gray-400 font-black">HỦY</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col xl:flex-row gap-8 bg-white p-6 rounded-xl shadow-inner border border-gray-100">
                                                                <div className="flex flex-col items-center gap-6 xl:w-1/2">
                                                                    <div className="p-3 bg-gray-50 rounded-xl border-4 border-white shadow-xl relative overflow-hidden">
                                                                        <img src={twoFactorQrUrl && twoFactorQrUrl.startsWith('data:') ? twoFactorQrUrl : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(twoFactorQrUrl)}&margin=10`} alt="QR" className="w-40 h-40 mix-blend-multiply" />
                                                                    </div>
                                                                    <div className="bg-green-50 px-6 py-2 rounded-2xl border border-green-100 italic">
                                                                        <code className="text-xs font-black text-green-700 tracking-widest">{twoFactorSecret}</code>
                                                                    </div>
                                                                </div>
                                                                    <div className="space-y-6 flex-1">
                                                                        <div className="space-y-4">
                                                                            <div className="flex gap-4">
                                                                                <span className="w-8 h-8 rounded-lg bg-green-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                                                                                <p className="text-sm font-bold text-gray-700 leading-relaxed">Mở Google Authenticator và chọn "Quét mã QR".</p>
                                                                            </div>
                                                                            <div className="flex gap-4">
                                                                                <span className="w-8 h-8 rounded-lg bg-green-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                                                                                <p className="text-sm font-bold text-gray-700 leading-relaxed">Nhập mã 6 chữ số vừa tạo vào đây.</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <input type="password" maxLength="6" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} className="w-full text-center text-4xl font-black py-4 border-2 border-gray-100 rounded-[1.5rem] focus:border-green-600 outline-none shadow-sm transition-all placeholder:tracking-normal" placeholder="..." />
                                                                            <div className="flex flex-col sm:flex-row gap-3">
                                                                                <button onClick={confirmTwoFactorEnable} disabled={twoFactorCode.length !== 6 || saving} className="flex-1 bg-green-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-green-500 transition-all">KÍCH HOẠT NHANH</button>
                                                                                <button onClick={() => setShowTwoFactorSetup(false)} className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest hover:text-gray-900 transition-all">HỦY</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Disable flow */}
                                                {showTwoFactorDisable && (
                                                    <div className="mt-8 pt-8 border-t border-red-50 space-y-6 text-center bg-red-50/20 p-6 rounded-2xl">
                                                        <p className="text-red-600 font-black italic">Hệ thống yêu cầu mã xác thực hiện tại để xác nhận gỡ bỏ.</p>
                                                        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                                                            <input type="password" maxLength="6" value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))} className="w-64 py-5 rounded-3xl text-center text-3xl font-black focus:border-red-600 outline-none border-2 border-red-100" placeholder="..." />
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
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Hệ thống kho bãi & Văn phòng</h3>
                                                <p className="text-[13px] text-gray-500 font-medium italic mt-1">Quản lý các địa điểm vận hành, kho hàng và trụ sở làm việc của hệ thống.</p>
                                            </div>
                                            <button onClick={() => setShowAddrForm(!showAddrForm)} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all text-[10px] tracking-wider uppercase">
                                                <PlusIcon className="w-4 h-4" />
                                                {showAddrForm ? 'HỦY BỎ' : 'THÊM ĐỊA CHỈ'}
                                            </button>
                                        </div>
                                        
                                        {showAddrForm && (
                                            <form onSubmit={handleAddrSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner grid grid-cols-1 md:grid-cols-2 gap-4 relative animate-fade-in">
                                                <div className="md:col-span-2 flex items-center justify-between mb-2">
                                                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-[9px] italic">{editingAddrId ? 'Đang cập nhật' : 'Thêm mới'} địa chỉ</h4>
                                                    <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border">
                                                        <input type="checkbox" id="isDefault" checked={addrForm.isDefault} onChange={(e) => setAddrForm({...addrForm, isDefault: e.target.checked})} className="w-4 h-4" />
                                                        <label htmlFor="isDefault" className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">MẶC ĐỊNH</label>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Họ tên người nhận</label>
                                                    <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.fullName} onChange={(e) => setAddrForm({...addrForm, fullName: e.target.value})} required />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Số điện thoại</label>
                                                    <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.phone} onChange={(e) => setAddrForm({...addrForm, phone: e.target.value})} required />
                                                </div>
                                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Số nhà, tên đường</label>
                                                        <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.addressDetail} onChange={(e) => setAddrForm({...addrForm, addressDetail: e.target.value})} required placeholder="Ví dụ: 123 Đường ABC" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Phường/Xã</label>
                                                        <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.ward} onChange={(e) => setAddrForm({...addrForm, ward: e.target.value})} required />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Quận/Huyện</label>
                                                        <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.district} onChange={(e) => setAddrForm({...addrForm, district: e.target.value})} required />
                                                    </div>
                                                    <div className="space-y-1.5 md:col-span-2">
                                                        <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Tỉnh/Thành phố</label>
                                                        <input className="w-full bg-white border-none rounded-xl px-5 py-3 text-sm font-bold shadow-sm" value={addrForm.province} onChange={(e) => setAddrForm({...addrForm, province: e.target.value})} required />
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-black text-gray-400 ml-3 uppercase tracking-widest">Tên gợi nhớ (Ví dụ: Trụ sở chính, Kho lạnh...)</label>
                                                        <input 
                                                            className="w-full bg-white border-2 border-transparent focus:border-green-600 rounded-xl px-5 py-3 text-sm font-black shadow-sm outline-none transition-all"
                                                            value={addrForm.label}
                                                            onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                                                            placeholder="Nhập nhãn tùy chỉnh..."
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 mb-4">
                                                        {['Văn phòng', 'Kho hàng', 'Trụ sở'].map(suggestion => (
                                                            <button
                                                                key={suggestion}
                                                                type="button"
                                                                onClick={() => setAddrForm({ ...addrForm, label: suggestion })}
                                                                className={`px-4 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all border-2 ${
                                                                    addrForm.label === suggestion 
                                                                    ? 'bg-green-600 text-white border-black' 
                                                                    : 'bg-white text-gray-400 border-gray-50 hover:border-green-100 hover:text-green-600'
                                                                }`}
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <button type="submit" className="w-full bg-green-600 text-white rounded-xl py-3.5 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-green-900/10 hover:bg-green-500 transition-all">LƯU ĐỊA CHỈ</button>
                                                </div>
                                            </form>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {addresses.length === 0 ? (
                                                <div className="lg:col-span-2 text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100 text-gray-300 font-black italic tracking-widest uppercase text-[10px]">Chưa có dữ liệu địa chỉ</div>
                                            ) : (
                                                addresses.map(addr => (
                                                    <div key={addr.id} className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg flex flex-col justify-between ${addr.isDefault ? 'bg-green-50/20 border-green-600 shadow-sm' : 'bg-white border-gray-50'}`}>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className={`p-2 rounded-lg ${addr.isDefault ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                                    {addr.label === 'Văn phòng' ? <BriefcaseIcon className="w-5 h-5" /> : addr.label === 'Kho hàng' ? <ArchiveBoxIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5" />}
                                                                </div>
                                                                <div className="flex flex-col items-end gap-1.5">
                                                                    {addr.isDefault && <span className="bg-green-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">MẶC ĐỊNH</span>}
                                                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">{addr.label}</span>
                                                                </div>
                                                            </div>
                                                            <h4 className="text-base font-black text-gray-900 mb-1">{addr.fullName}</h4>
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-2.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 inline-flex">
                                                                <PhoneIcon className="w-3 h-3 text-green-600" />
                                                                {addr.phone}
                                                            </div>
                                                            <p className="text-[11px] font-bold text-gray-500 italic bg-gray-100/30 p-2.5 rounded-lg leading-relaxed">
                                                                {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100/50">
                                                            <div className="flex gap-4">
                                                                <button type="button" onClick={() => handleEditAddress(addr)} className="text-gray-900 hover:text-green-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">CHỈNH SỬA</button>
                                                                <button type="button" onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">XÓA</button>
                                                            </div>
                                                            {!addr.isDefault && (
                                                                <button type="button" onClick={() => handleSetDefault(addr.id)} className="text-[8px] font-black text-white bg-green-600 px-3 py-1.5 rounded-full uppercase tracking-tighter hover:bg-green-600 transition-all shadow-md active:scale-95">ĐẶT LÀM CHÍNH</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'privacy' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Lưu trữ & Trích xuất dữ liệu</h3>
                                            <p className="text-[13px] text-gray-500 font-medium italic mt-1">Quyền kiểm soát và trích xuất dữ liệu vận hành theo tiêu chuẩn bảo mật.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                                                    <ArchiveBoxIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-black text-gray-900 uppercase tracking-tighter">Trích xuất hồ sơ quản trị</h4>
                                                    <p className="text-[11px] text-gray-500 font-medium italic mt-1.5">Chúng tôi sẽ tạo một bản sao toàn bộ cấu hình và hồ sơ quản trị của bạn ở định dạng JSON để lưu trữ ngoại tuyến.</p>
                                                </div>
                                                <button onClick={handleExportData} className="w-full py-3 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-green-700 transition-all shadow-lg active:scale-95">BẮT ĐẦU TRÍCH XUẤT</button>
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
