import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlusIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '', email: '', fullName: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await register(form);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="card w-full max-w-lg shadow-xl border-0">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white mb-6 border-4 border-white shadow-2xl overflow-hidden group hover:scale-110 transition-all duration-500 ring-8 ring-green-100/30 p-0">
                        <img src="/logo.png" alt="FreshFood" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Tạo tài khoản</h1>
                    <p className="text-gray-700 font-medium italic">Tham gia cộng đồng thực phẩm sạch</p>
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                        <input name="fullName" value={form.fullName} onChange={handleChange} required maxLength={50} className="input-field py-2.5" placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
                        <input name="username" value={form.username} onChange={handleChange} required minLength={3} maxLength={50} className="input-field py-2.5" placeholder="username" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                        <input 
                            name="phone" 
                            value={form.phone} 
                            onChange={handleChange} 
                            required
                            pattern="^(0)(32|33|34|35|36|37|38|39|52|56|58|59|70|76|77|78|79|81|82|83|84|85|86|87|88|89|90|91|92|93|94|96|97|98|99)[0-9]{7}$"
                            title="Số điện thoại di động Việt Nam không hợp lệ"
                            className="input-field py-2.5" 
                            placeholder="0901234567" 
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field py-2.5" placeholder="email@example.com" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="input-field py-2.5 pr-11"
                                placeholder="Ít nhất 8 ký tự (A, a, 1, @)"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-green-200">
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : 'Đăng ký ngay'}
                        </button>
                    </div>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc</span>
                    </div>
                </div>

                <p className="text-center text-base text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-bold border-b-2 border-transparent hover:border-green-600 transition-all" style={{ color: '#16a34a' }}>
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
