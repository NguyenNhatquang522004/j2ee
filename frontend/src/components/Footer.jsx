import { Link } from 'react-router-dom';
import { 
    DevicePhoneMobileIcon, 
    AtSymbolIcon, 
    MapPinIcon 
} from '@heroicons/react/24/outline';

const SocialIcon = ({ children }) => (
    <a href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all hover:-translate-y-1">
        {children}
    </a>
);

export default function Footer() {
    return (
        <footer className="bg-[#0f172a] text-gray-400 mt-20 pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white uppercase italic">
                                FreshFood
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-xs text-gray-400 font-medium">
                            Hệ sinh thái nông nghiệp bền vững, kết nối trực tiếp nông sản từ trang trại tới bàn ăn, cam kết an toàn vinh quang nguồn gốc.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </SocialIcon>
                            <SocialIcon>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="footer-title">Khám phá</h4>
                        <ul className="space-y-4 text-sm mt-6 font-semibold">
                            <li><Link to="/products" className="hover:text-green-500 transition-colors">Tất cả sản phẩm</Link></li>
                            <li><Link to="/orders" className="hover:text-green-500 transition-colors">Lịch sử mua hàng</Link></li>
                            <li><Link to="/farms" className="hover:text-green-500 transition-colors">Danh sách trang trại</Link></li>
                            <li><Link to="/ai-scan" className="hover:text-green-500 transition-colors">Kiểm tra thực phẩm AI</Link></li>
                            <li><Link to="/about" className="hover:text-green-500 transition-colors">Câu chuyện thương hiệu</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="footer-title">Liên hệ</h4>
                        <ul className="space-y-4 text-sm mt-6">
                            <li className="flex items-center gap-3">
                                <DevicePhoneMobileIcon className="w-5 h-5 text-green-500" />
                                <span className="font-bold text-gray-300">1900 1234</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <AtSymbolIcon className="w-5 h-5 text-green-500" />
                                <span className="text-gray-400">support@freshfood.vn</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPinIcon className="w-5 h-5 text-green-500" />
                                <span className="text-gray-400 leading-tight">123 Trần Duy Hưng, Cầu Giấy, Hà Nội</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact/Newsletter */}
                    <div>
                        <h4 className="footer-title">Bản tin</h4>
                        <p className="text-sm mb-4">Đăng ký để nhận báo cáo thực phẩm sạch hàng tuần và ưu đãi mới nhất.</p>
                        <form className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder="Email của bạn..." 
                                className="bg-gray-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-green-600 outline-none transition-all"
                            />
                            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all">
                                Đăng ký ngay
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wide">
                    <p>© 2025 FRESHFOOD ECO-SYSTEM. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white uppercase">Privacy Policy</a>
                        <a href="#" className="hover:text-white uppercase">Terms of Use</a>
                        <a href="#" className="hover:text-white uppercase">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
