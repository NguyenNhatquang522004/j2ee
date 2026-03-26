import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { KeyIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/v1/auth/forgot-password', { email });
            toast.success('Yêu cầu đã được gửi! Vui lòng kiểm tra email.');
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f0fdf4' }}>
            <div className="card w-full max-w-md shadow-xl border-0">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                        <KeyIcon className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Quên mật khẩu</h1>
                    <p className="text-gray-500 font-medium font-vietnam">Nhập email để nhận mã xác nhận</p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 font-vietnam">Email của bạn</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field py-3 px-4 focus:ring-2 focus:ring-green-500 transition-all font-vietnam"
                                placeholder="example@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-green-200 font-vietnam"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                    </form>
                ) : (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center mb-6">
                        <p className="text-green-800 font-medium font-vietnam">
                            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn. 
                            Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác).
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold border-b-2 border-transparent hover:border-green-600 transition-all font-vietnam" style={{ color: '#16a34a' }}>
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}
