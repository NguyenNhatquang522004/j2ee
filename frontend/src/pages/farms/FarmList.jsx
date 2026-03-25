import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmService } from '../../api/services';
import Layout from '../../components/Layout';

export default function FarmList() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const fetchFarms = async (q = '') => {
    setLoading(true);
    try {
      const res = q
        ? await farmService.search(q, { page: 0, size: 20 })
        : await farmService.getAll({ page: 0, size: 20 });
      setFarms(res.data.content || res.data);
    } catch {
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFarms(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFarms(keyword);
  };

  const CERT_COLORS = {
    VIETGAP: 'bg-green-100 text-green-800',
    GLOBALGAP: 'bg-blue-100 text-blue-800',
    ORGANIC: 'bg-emerald-100 text-emerald-800',
    HACCP: 'bg-orange-100 text-orange-800',
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Trang trại đối tác</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm trang trại..."
            className="input-field"
          />
          <button type="submit" className="btn-primary whitespace-nowrap">Tìm kiếm</button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Đang tải...</div>
      ) : farms.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Không tìm thấy trang trại nào</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/products?farmId=${farm.id}`)}
            >
              {farm.imageUrl && (
                <div className="h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
                  <img src={farm.imageUrl} alt={farm.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 text-lg leading-tight">{farm.name}</h3>
                {farm.certification && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ml-2 ${CERT_COLORS[farm.certification] || 'bg-gray-100 text-gray-700'}`}>
                    {farm.certification}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">📍 {farm.province}</p>
              {farm.ownerName && <p className="text-sm text-gray-600 mb-1">👤 {farm.ownerName}</p>}
              {farm.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{farm.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 font-semibold">{farm.productCount} sản phẩm</span>
                <span className="text-blue-600 hover:underline">Xem sản phẩm →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
