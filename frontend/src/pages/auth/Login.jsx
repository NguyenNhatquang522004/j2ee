import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(form);
            toast.success(`Chào mừng, ${data.fullName || data.username}!`);
            navigate(data.role === 'ADMIN' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="card w-full max-w-md shadow-xl border-0 animate-fade-in translate-y-0 transition-all">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 border-4 border-white shadow-sm">
                        <SparklesIcon className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Đăng nhập</h1>
                    <p className="text-gray-500 font-medium">Thực Phẩm Sạch - Nhóm 5</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="input-field py-3 px-4 focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="input-field py-3 px-4 focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-green-200 transform active:scale-[0.98] transition-all"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : 'Đăng nhập'}
                    </button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Hoặc</span>
                    </div>
                </div>

                <p className="text-center text-base text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold border-b-2 border-transparent hover:border-green-600 transition-all" style={{ color: '#16a34a' }}>
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
