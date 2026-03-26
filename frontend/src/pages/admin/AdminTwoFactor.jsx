import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { userService, twoFactorService } from '../../api/services';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
    ShieldCheckIcon, 
    ArrowPathIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function AdminTwoFactor() {
    const { user: authUser } = useAuth();
    const [user, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);

    // 2FA state
    const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
    const [showTwoFactorDisable, setShowTwoFactorDisable] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [twoFactorQrUrl, setTwoFactorQrUrl] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const userRes = await userService.me();
            setUserData(userRes.data);
        } catch (err) {
            toast.error('Không thể tải trạng thái bảo mật');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupClick = () => {
        setShowTwoFactorSetup(true);
        setTwoFactorSecret('');
        setTwoFactorCode('');
    };

    const startTwoFactorSetup = async () => {
        try {
            setSetupLoading(true);
            const response = await twoFactorService.setup();
            const payload = response.data; 
            if (payload) {
                setTwoFactorSecret(payload.secret);
                setTwoFactorQrUrl(payload.qrUrl);
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
            loadData();
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
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Mã xác thực không đúng');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-3">
                        <ShieldCheckIcon className="w-10 h-10 text-green-600" />
                        Bảo mật xác thực 2 bước
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Bảo vệ quyền truy cập quản trị bằng Google Authenticator (TOTP)</p>
                </div>

                <div className="grid gap-8">
                    {/* Status Card */}
                    <div className={`p-8 rounded-[2.5rem] shadow-xl border flex items-center justify-between overflow-hidden relative ${
                        user.isTwoFactorEnabled 
                        ? 'bg-green-50 border-green-100' 
                        : 'bg-red-50 border-red-100'
                    }`}>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
                                user.isTwoFactorEnabled ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                            }`}>
                                <ShieldCheckIcon className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Trạng thái bảo mật</h3>
                                <p className={`text-lg font-black uppercase tracking-wider ${user.isTwoFactorEnabled ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.isTwoFactorEnabled ? 'ĐÃ KÍCH HOẠT' : 'CHƯA BẢO VỆ'}
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10">
                            {user.isTwoFactorEnabled ? (
                                <button 
                                    onClick={() => setShowTwoFactorDisable(true)}
                                    className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-2xl font-black transition-all shadow-sm"
                                >
                                    TẮT 2FA
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSetupClick}
                                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl shadow-green-900/20"
                                >
                                    THIẾT LẬP NGAY
                                </button>
                            )}
                        </div>
                        <ShieldCheckIcon className={`w-64 h-64 absolute -right-20 -bottom-20 opacity-5 ${user.isTwoFactorEnabled ? 'text-green-900' : 'text-red-900'}`} />
                    </div>

                    {/* Setup Section */}
                    {showTwoFactorSetup && (
                        <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl animate-fade-in relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black italic mb-8 flex items-center gap-3">
                                    <ShieldCheckIcon className="w-10 h-10 text-green-500" />
                                    Cấu hình Google Authenticator
                                </h2>

                                {!twoFactorSecret ? (
                                    <div className="flex flex-col items-center py-10 border-2 border-dashed border-white/10 rounded-[2rem]">
                                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                            <ArrowPathIcon className={`w-12 h-12 text-green-500 ${setupLoading ? 'animate-spin' : ''}`} />
                                        </div>
                                        <p className="text-gray-400 mb-8 max-w-sm text-center font-medium leading-relaxed">
                                            Hệ thống sẽ tạo ra một mã bí mật duy nhất để liên kết với ứng dụng xác thực trên điện thoại của bạn.
                                        </p>
                                        <button 
                                            onClick={startTwoFactorSetup}
                                            disabled={setupLoading}
                                            className="bg-green-600 hover:bg-green-500 px-12 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-green-900/40"
                                        >
                                            {setupLoading ? 'ĐANG TẠO MÃ...' : 'BẮT ĐẦU NGAY'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-6">
                                            <div className="bg-white p-4 rounded-[2rem] inline-block shadow-2xl">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(twoFactorQrUrl)}`} 
                                                    alt="QR Code" 
                                                    className="w-56 h-56"
                                                />
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-[1.5rem] border border-white/10">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Mã bí mật (Setup Key)</p>
                                                <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl border border-white/5">
                                                    <code className="text-green-400 font-mono font-bold tracking-wider">{twoFactorSecret}</code>
                                                    <button 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(twoFactorSecret);
                                                            toast.success('Đã sao chép mã');
                                                        }}
                                                        className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-lg"
                                                    >
                                                        COPY
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <span className="w-6 h-6 bg-green-600 text-xs font-black rounded-lg flex items-center justify-center shrink-0">1</span>
                                                    <p className="text-sm font-medium text-gray-300">Quét mã QR bằng ứng dụng <b>Google Authenticator</b> trên điện thoại.</p>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <span className="w-6 h-6 bg-green-600 text-xs font-black rounded-lg flex items-center justify-center shrink-0">2</span>
                                                    <p className="text-sm font-medium text-gray-300">Nhập mã 6 số hiển thị trên ứng dụng vào ô bên dưới.</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <input 
                                                    type="text" 
                                                    maxLength="6"
                                                    value={twoFactorCode}
                                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-white/10 border border-white/10 rounded-3xl py-6 text-center text-5xl tracking-[1.5rem] font-black focus:border-green-500 focus:bg-white/20 transition-all placeholder-white/5"
                                                    placeholder="000000"
                                                />
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={confirmTwoFactorEnable}
                                                        disabled={twoFactorCode.length !== 6 || saving}
                                                        className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-30 py-4 rounded-2xl font-black transition-all shadow-xl shadow-green-900/40"
                                                    >
                                                        {saving ? 'ĐANG XÁC MINH...' : 'KÍCH HOẠT'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowTwoFactorSetup(false)}
                                                        className="px-6 border border-white/10 rounded-2xl font-bold hover:bg-white/5 transition-all"
                                                    >
                                                        HỦY
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px]"></div>
                        </div>
                    )}

                    {/* Disable Confirmation */}
                    {showTwoFactorDisable && (
                        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 animate-fade-in shadow-xl">
                            <h3 className="text-2xl font-black text-red-800 mb-2 flex items-center gap-3">
                                <TrashIcon className="w-8 h-8" />
                                Hủy kích hoạt bảo vệ
                            </h3>
                            <p className="text-red-600/70 font-bold mb-8 italic">Vui lòng nhập mã OTP hiện tại để xác nhận quyền sở hữu.</p>
                            <div className="flex gap-4">
                                <input 
                                    type="text" 
                                    maxLength="6"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                                    className="flex-1 bg-white border-2 border-red-200 rounded-2xl py-4 text-center text-3xl tracking-[1rem] font-black focus:border-red-500 focus:ring-0 transition-all"
                                    placeholder="000000"
                                />
                                <button 
                                    onClick={confirmTwoFactorDisable}
                                    disabled={twoFactorCode.length !== 6 || saving}
                                    className="bg-red-600 hover:bg-red-700 text-white px-10 rounded-2xl font-black transition-all shadow-lg shadow-red-900/20"
                                >
                                    XÁC NHẬN TẮT
                                </button>
                                <button onClick={() => setShowTwoFactorDisable(false)} className="px-6 font-bold text-gray-400 hover:text-gray-600">HUỶ</button>
                            </div>
                        </div>
                    )}

                    {/* Instruction Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            💡 Tại sao cần 2FA?
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <p className="font-bold text-gray-800 mb-2">Chống đánh cắp mật khẩu</p>
                                <p className="text-sm text-gray-500 leading-relaxed">Ngay cả khi hacker biết mật khẩu của bạn, họ vẫn không thể truy cập nếu không có mã xác thực vật lý từ điện thoại.</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl">
                                <p className="font-bold text-gray-800 mb-2">Bảo vệ quyền Admin</p>
                                <p className="text-sm text-gray-500 leading-relaxed">Quản trị viên nắm giữ các dữ liệu quan trọng, việc bảo mật 2 lớp là yêu cầu tối thiểu trong an ninh hệ thống.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
