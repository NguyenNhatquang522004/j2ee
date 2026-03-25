import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-4xl">🌿</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Đăng nhập</h1>
          <p className="text-gray-500 text-sm mt-1">Thực Phẩm Sạch - Nhóm 5</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold" style={{ color: '#16a34a' }}>Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
