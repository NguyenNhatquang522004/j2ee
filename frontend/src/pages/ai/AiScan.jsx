import { useState } from 'react';
import { aiService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';

export default function AiScan() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) { toast.error('Vui lòng chọn ảnh thực phẩm'); return; }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', image);
            const res = await aiService.analyze(formData);
            // res.data is the ApiResponse, we want the AiFreshnessResponse inside it
            setResult(res.data.data || res.data); 
        } catch (err) {
            toast.error(err.response?.data?.message || 'Kiểm tra thất bại');
        } finally {
            setLoading(false);
        }
    };

    const FRESHNESS_COLOR = {
        FRESH: 'text-green-700 bg-green-50 border-green-200',
        GOOD: 'text-blue-700 bg-blue-50 border-blue-200',
        FAIR: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        POOR: 'text-orange-700 bg-orange-50 border-orange-200',
        SPOILED: 'text-red-700 bg-red-50 border-red-200',
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Kiểm tra chất lượng thực phẩm bằng AI</h1>
                <p className="text-gray-500 mb-8">Tải ảnh thực phẩm lên để AI phân tích độ tươi và chất lượng</p>

                <form onSubmit={handleSubmit} className="card mb-6">
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
                        onClick={() => document.getElementById('ai-image').click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
                        ) : (
                            <div className="text-gray-400">
                                <div className="text-5xl mb-3">📷</div>
                                <p className="font-medium">Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
                                <p className="text-sm mt-1">JPG, PNG, WEBP — tối đa 10MB</p>
                            </div>
                        )}
                        <input
                            id="ai-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    {image && (
                        <p className="text-sm text-gray-500 mt-2 text-center">{image.name}</p>
                    )}
                    <div className="flex gap-3 mt-4 justify-center">
                        {preview && (
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => { setImage(null); setPreview(null); setResult(null); }}
                            >
                                Chọn lại
                            </button>
                        )}
                        <button type="submit" disabled={loading || !image} className="btn-primary min-w-[140px]">
                            {loading ? 'Đang phân tích...' : 'Phân tích ngay'}
                        </button>
                    </div>
                </form>

                {result && (
                    <div className={`card border ${FRESHNESS_COLOR[result.freshness] || 'border-gray-200'} mb-6`}>
                        <h2 className="text-xl font-bold mb-4">Kết quả phân tích</h2>
                        <div className={`inline-block px-4 py-2 rounded-full font-semibold text-lg mb-4 border ${FRESHNESS_COLOR[result.freshness] || ''}`}>
                            {result.freshness || 'Không xác định'}
                        </div>
                        {result.confidence !== undefined && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Độ chính xác</p>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-green-500 h-3 rounded-full"
                                        style={{ width: `${Math.round(result.confidence * 100)}%` }}
                                    />
                                </div>
                                <p className="text-sm mt-1 font-medium">{Math.round(result.confidence * 100)}%</p>
                            </div>
                        )}
                        {result.description && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-1">Nhận xét</p>
                                <p className="text-gray-800">{result.description}</p>
                            </div>
                        )}
                        {result.suggestion && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-600 mb-1">💡 Gợi ý</p>
                                <p className="text-gray-700 text-sm">{result.suggestion}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="card bg-green-50 border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Hướng dẫn chụp ảnh đạt kết quả tốt nhất</h3>
                    <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                        <li>Chụp ảnh rõ nét, đủ ánh sáng</li>
                        <li>Đặt thực phẩm trên nền trắng hoặc sáng màu</li>
                        <li>Ảnh tập trung vào bề mặt thực phẩm</li>
                        <li>Tránh chụp ngược sáng hoặc tối</li>
                    </ul>
                </div>
            </div>
        </Layout>
    );
}
