import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { newsletterService, settingsService } from '../api/services';
import { toast } from 'react-hot-toast';
import { 
    DevicePhoneMobileIcon, 
    AtSymbolIcon, 
    MapPinIcon 
} from '@heroicons/react/24/outline';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        STORE_NAME: 'FreshFood',
        STORE_EMAIL: 'support@freshfood.vn',
        STORE_PHONE: '1900 1234',
        STORE_ADDRESS: 'Cầu Giấy, Hà Nội',
        COPYRIGHT_TEXT: '© 2026 FRESHFOOD ECO-SYSTEM. ALL RIGHTS RESERVED.',
        FACEBOOK: '#',
        INSTAGRAM: '#',
        YOUTUBE: '#',
        TWITTER: '#'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await settingsService.getPublic();
                const sMap = {};
                data.forEach(s => {
                    sMap[s.settingKey] = s.settingValue;
                });
                setSettings(prev => ({ ...prev, ...sMap }));
            } catch (error) {
                console.error('Failed to fetch store settings', error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }

        setLoading(true);
        try {
            await newsletterService.subscribe(email);
            toast.success('Đăng ký nhận bản tin thành công!');
            setEmail('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-[#f2f6f4] text-[#2d4a3e] mt-20 pt-20 pb-10 border-t border-[#dae5e0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8 lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 rounded-2xl bg-[#1a3c31] flex items-center justify-center text-white shadow-xl group-hover:bg-[#10b981] transition-all duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-[#1a3c31] uppercase italic">
                                {settings.STORE_NAME}
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed font-semibold italic text-[#4a6d5f]">
                            Cùng FreshFood lan tỏa niềm tin nông sản sạch, nâng tầm giá trị cuộc sống qua từng bữa ăn Việt.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon href={settings.FACEBOOK}>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </SocialIcon>
                            <SocialIcon href={settings.INSTAGRAM}>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </SocialIcon>
                            <SocialIcon href={settings.YOUTUBE}>
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </SocialIcon>
                            <SocialIcon href={settings.TWITTER}>
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Quick Links Part 1 */}
                    <div>
                        <h4 className="text-[#1a3c31] font-black text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                            Cửa hàng
                        </h4>
                        <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest leading-none">
                            <li><Link to="/products" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Tất cả sản phẩm</Link></li>
                            <li><Link to="/compare" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">So sánh giá sản phẩm</Link></li>
                            <li><Link to="/ai-scan" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Kiểm tra thực phẩm AI</Link></li>
                            <li><Link to="/farms" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Hệ thống trang trại</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links Part 2 */}
                    <div>
                        <h4 className="text-[#1a3c31] font-black text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                            Tài khoản
                        </h4>
                        <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest leading-none">
                            <li><Link to="/orders" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Lịch sử đơn hàng</Link></li>
                            <li><Link to="/wishlist" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Danh sách yêu thích</Link></li>
                            <li><Link to="/profile?tab=vouchers" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Ưu đãi & Voucher</Link></li>
                            <li><Link to="/profile" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Hồ sơ & Bảo mật</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links Part 3 */}
                    <div>
                        <h4 className="text-[#1a3c31] font-black text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                            Hỗ trợ
                        </h4>
                        <ul className="space-y-5 text-[11px] font-black uppercase tracking-widest leading-none">
                            <li><Link to="/about" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Về FreshFood</Link></li>
                            <li><Link to="/contact" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Liên hệ chúng tôi</Link></li>
                            <li><Link to="/faq" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Câu hỏi thường gặp</Link></li>
                            <li><Link to="/buying-guide" className="text-[#2d4a3e] hover:text-[#10b981] transition-colors">Hướng dẫn mua hàng</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[#1a3c31] font-black text-[10px] uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                            Bản tin
                        </h4>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email nhận tin..." 
                                disabled={loading}
                                className="w-full bg-white border-2 border-transparent rounded-[1.25rem] px-6 py-4 text-xs text-[#1a3c31] focus:border-[#10b981] outline-none transition-all font-black placeholder:text-[#5a7d6e]/40 shadow-sm disabled:opacity-50"
                            />
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1a3c31] hover:bg-[#10b981] text-white font-black py-4 rounded-[1.25rem] shadow-xl shadow-[#1a3c31]/10 transition-all uppercase text-[10px] tracking-[0.2em] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : "Đăng ký ngay"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-10 border-t border-[#dae5e0] flex flex-col gap-10">
                    {/* Sage Contact Row */}
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 py-10 px-14 bg-white/60 rounded-[3rem] border border-[#dae5e0] shadow-sm group backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                        
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-3xl bg-[#1a3c31] flex items-center justify-center text-white shadow-lg group-hover:bg-[#10b981] transition-all">
                                <DevicePhoneMobileIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5a7d6e] mb-1 italic">Hotline 24/7</p>
                                <p className="font-black text-[#1a3c31] text-2xl tracking-tight">{settings.STORE_PHONE}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-3xl bg-[#1a3c31] flex items-center justify-center text-white shadow-lg group-hover:bg-[#10b981] transition-all">
                                <AtSymbolIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5a7d6e] mb-1 italic">Email Hỗ trợ</p>
                                <p className="font-black text-[#1a3c31] text-lg">{settings.STORE_EMAIL}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-14 h-14 rounded-3xl bg-[#1a3c31] flex items-center justify-center text-white shadow-lg group-hover:bg-[#10b981] transition-all">
                                <MapPinIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#5a7d6e] mb-1 italic">Văn phòng</p>
                                <p className="text-sm font-black text-[#4a6d5f]">{settings.STORE_ADDRESS}</p>
                            </div>
                        </div>
                    </div>

                    {/* Final Bottom Links */}
                    <div className="flex flex-wrap justify-between items-center gap-6 text-[10px] font-black tracking-[0.2em] text-[#5a7d6e]/40 px-6">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-[1px] bg-[#1a3c31]/30"></div>
                            <p className="uppercase">{settings.COPYRIGHT_TEXT}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-10 uppercase italic">
                            <Link to="/privacy" className="hover:text-[#10b981] transition-colors border-b border-transparent hover:border-[#10b981]/20 pb-0.5">Chính sách bảo mật</Link>
                            <Link to="/terms" className="hover:text-[#10b981] transition-colors border-b border-transparent hover:border-[#10b981]/20 pb-0.5">Điều khoản dịch vụ</Link>
                            <Link to="/cookies" className="hover:text-[#10b981] transition-colors border-b border-transparent hover:border-[#10b981]/20 pb-0.5">Chính sách Cookie</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

const SocialIcon = ({ children, href }) => (
    <a 
        href={href || "#"} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="w-12 h-12 rounded-3xl bg-white border border-[#dae5e0] flex items-center justify-center text-[#1a3c31] hover:bg-[#1a3c31] hover:text-white transition-all shadow-sm hover:-translate-y-1"
    >
        {children}
    </a>
);
