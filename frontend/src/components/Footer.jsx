export default function Footer() {
    return (
        <footer style={{ backgroundColor: '#14532d' }} className="text-green-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-3">🌿 Thực Phẩm Sạch</h3>
                        <p className="text-sm">Website kinh doanh thực phẩm sạch, an toàn và chất lượng cao từ các trang trại uy tín.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Liên kết</h4>
                        <ul className="text-sm space-y-2">
                            <li><a href="/products" className="hover:text-white transition-colors">Sản phẩm</a></li>
                            <li><a href="/farms" className="hover:text-white transition-colors">Trang trại</a></li>
                            <li><a href="/about" className="hover:text-white transition-colors">Về chúng tôi</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Liên hệ</h4>
                        <p className="text-sm">Email: support@thucphamsan.vn</p>
                        <p className="text-sm">Hotline: 1900 1234</p>
                    </div>
                </div>
                <div className="border-t border-green-800 mt-6 pt-4 text-center text-sm">
                    © 2025 Thực Phẩm Sạch - Nhóm 5 J2EE
                </div>
            </div>
        </footer>
    );
}
