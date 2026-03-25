import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../api/services';
import Layout from '../../components/Layout';

export default function Home() {
  const [topProducts, setTopProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.topSelling(), categoryService.getAll()])
      .then(([pRes, cRes]) => {
        setTopProducts(pRes.data.slice(0, 8));
        setCategories(cRes.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section
        className="rounded-2xl text-white text-center py-16 px-4 mb-10"
        style={{ background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)' }}
      >
        <h1 className="text-4xl font-bold mb-4">🌿 Thực Phẩm Sạch - Tươi Ngon Mỗi Ngày</h1>
        <p className="text-lg text-green-100 mb-6 max-w-2xl mx-auto">
          Sản phẩm nông sản sạch, hữu cơ từ các trang trại uy tín. Đảm bảo an toàn, không chất bảo quản.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="bg-white font-bold px-6 py-3 rounded-full text-green-800 hover:bg-green-50 transition-colors">
            Mua ngay
          </Link>
          <Link to="/ai-scan" className="border-2 border-white font-bold px-6 py-3 rounded-full text-white hover:bg-white hover:text-green-800 transition-colors">
            🤖 Kiểm tra AI
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { icon: '🌱', title: 'Hữu cơ 100%', desc: 'Sản phẩm được chứng nhận hữu cơ, không thuốc trừ sâu' },
          { icon: '🚚', title: 'Giao hàng nhanh', desc: 'Giao hàng trong ngày, đảm bảo độ tươi của sản phẩm' },
          { icon: '🛡️', title: 'Đảm bảo chất lượng', desc: 'Hoàn tiền 100% nếu sản phẩm không đạt chất lượng' },
        ].map((f) => (
          <div key={f.title} className="card text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="card text-center hover:shadow-md transition-shadow cursor-pointer group"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 mx-auto mb-2 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center text-2xl">🥗</div>
                )}
                <p className="font-medium text-sm text-gray-700 group-hover:text-green-700">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sản phẩm bán chạy</h2>
          <Link to="/products" className="text-green-700 font-semibold hover:underline">Xem tất cả →</Link>
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-400">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {topProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.id}`} className="card hover:shadow-md transition-shadow group cursor-pointer p-0 overflow-hidden">
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-5xl">🥦</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate mb-1">{product.name}</h3>
        <p className="text-xs text-gray-400 mb-2">{product.farmName || 'Trang trại'}</p>
        <div className="flex items-center justify-between">
          <span className="text-green-700 font-bold">
            {product.price?.toLocaleString('vi-VN')}đ/{product.unit}
          </span>
          {product.averageRating > 0 && (
            <span className="text-xs text-yellow-500">⭐ {product.averageRating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
