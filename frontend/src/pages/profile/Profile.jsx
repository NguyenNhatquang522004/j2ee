import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { userService, addressService } from '../../api/services';
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
    ArchiveBoxIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function Profile() {
    const { user: authUser, setUser } = useAuth();
    const [user, setUserData] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [userRes, addrRes] = await Promise.all([
                userService.me(),
                addressService.getAll()
            ]);
            setUserData(userRes.data);
            setAddresses(addrRes.data || []);
            setProfileForm({
                fullName: userRes.data.fullName || '',
                email: userRes.data.email || '',
                phone: userRes.data.phone || '',
                password: ''
            });
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
            const { data } = await userService.updateMe(profileForm);
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

    if (loading) return <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                    <Cog8ToothIcon className="w-8 h-8 text-green-600" />
                    Cài đặt tài khoản
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Info */}
                    <div className="md:col-span-1 border-r border-gray-100 pr-0 md:pr-8">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 border-4 border-white shadow-md">
                                <UserCircleIcon className="w-16 h-16" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{user.fullName || user.username}</h2>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
                                {user.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Link to="/orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-green-50 hover:border-green-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-600 shadow-sm">
                                        <ArchiveBoxIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-800">Lịch sử đơn hàng</p>
                                        <p className="text-[10px] text-gray-400">Xem và quản lý đơn hàng</p>
                                    </div>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                            </Link>

                            <Link to="/wishlist" className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-500 shadow-sm">
                                        <PlusIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-gray-800">Sản phẩm yêu thích</p>
                                        <p className="text-[10px] text-gray-400">Danh sách quan tâm</p>
                                    </div>
                                </div>
                                <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Forms */}
                    <div className="md:col-span-2 space-y-10">
                        {/* Profile Form */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                📝 Thông tin cá nhân
                            </h3>
                            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Họ và tên</label>
                                    <input
                                        className="input-field mt-1"
                                        value={profileForm.fullName}
                                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                    <input
                                        className="input-field mt-1"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Số điện thoại</label>
                                    <input
                                        className="input-field mt-1"
                                        value={profileForm.phone}
                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        placeholder="0xxxxxxxxx"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Đổi mật khẩu (Tuỳ chọn)</label>
                                    <input
                                        type="password"
                                        className="input-field mt-1"
                                        value={profileForm.password}
                                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                                        placeholder="Nhập mật khẩu mới"
                                    />
                                </div>
                                <div className="sm:col-span-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary w-full py-2.5 font-bold"
                                    >
                                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Address Management */}
                        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    📍 Địa chỉ đã lưu
                                </h3>
                                <button
                                    onClick={() => {
                                        if (showAddrForm) {
                                            setShowAddrForm(false);
                                            setEditingAddrId(null);
                                        } else {
                                            setShowAddrForm(true);
                                        }
                                    }}
                                    className="text-green-700 font-bold text-sm hover:underline"
                                >
                                    {showAddrForm ? 'Huỷ' : '+ Thêm mới'}
                                </button>
                            </div>

                            {showAddrForm && (
                                <form onSubmit={handleAddrSubmit} className="mb-8 p-4 bg-green-50 rounded-xl border border-green-100 space-y-4">
                                    <h4 className="font-bold text-green-800 text-sm flex items-center gap-2">
                                        {editingAddrId ? <PencilIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                                        {editingAddrId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase">Loại địa chỉ</label>
                                            <select
                                                className="input-field mt-0.5 text-sm py-1.5"
                                                value={addrForm.label}
                                                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                                            >
                                                <option>Nhà</option>
                                                <option>Công ty</option>
                                                <option>Khác</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 pt-4">
                                            <input
                                                type="checkbox"
                                                id="isDefault"
                                                checked={addrForm.isDefault}
                                                onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                                                className="w-4 h-4 text-green-600 rounded"
                                            />
                                            <label htmlFor="isDefault" className="text-xs font-medium text-gray-700 cursor-pointer">Đặt làm mặc định</label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Họ tên người nhận</label>
                                        <input
                                            className="input-field mt-0.5 text-sm py-1.5"
                                            value={addrForm.fullName}
                                            onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Số điện thoại</label>
                                        <input
                                            className="input-field mt-0.5 text-sm py-1.5"
                                            value={addrForm.phone}
                                            onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Địa chỉ chi tiết</label>
                                        <textarea
                                            className="input-field mt-0.5 text-sm py-1.5"
                                            rows={2}
                                            value={addrForm.details}
                                            onChange={(e) => setAddrForm({ ...addrForm, details: e.target.value })}
                                            placeholder="Số nhà, tên đường, phường/xã..."
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full text-sm py-2">
                                        {editingAddrId ? 'Lưu thay đổi' : 'Xác nhận thêm'}
                                    </button>
                                </form>
                            )}

                            <div className="space-y-4">
                                {addresses.length === 0 ? (
                                    <p className="text-center text-gray-400 py-4 italic text-sm">Chưa có địa chỉ nào được lưu.</p>
                                ) : (
                                    addresses.map(addr => (
                                        <div key={addr.id} className="group flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                                            <div className="pt-1 text-green-600">
                                                {addr.label === 'Nhà' ? <HomeIcon className="w-6 h-6" /> : addr.label === 'Công ty' ? <BriefcaseIcon className="w-6 h-6" /> : <MapPinIcon className="w-6 h-6" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-gray-800">{addr.label}</span>
                                                    {addr.isDefault && (
                                                        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Mặc định</span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">{addr.fullName} | {addr.phone}</p>
                                                <p className="text-sm text-gray-500">{addr.details}</p>
                                            </div>
                                            <div className="flex flex-col gap-2 items-end">
                                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditAddress(addr)}
                                                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        className="text-red-400 hover:text-red-600 text-xs font-medium"
                                                    >
                                                        Xoá
                                                    </button>
                                                </div>
                                                {!addr.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefault(addr.id)}
                                                        className="text-green-600 hover:text-green-800 text-xs font-bold"
                                                    >
                                                        Đặt mặc định
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
