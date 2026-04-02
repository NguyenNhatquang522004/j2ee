import { useState } from 'react';
import { aiService } from '../../api/services';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { CameraIcon, LightBulbIcon, SparklesIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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
            setResult(res.data || res); 
        } catch (err) {
            toast.error(err.response?.data?.message || 'Kiểm tra thất bại');
        } finally {
            setLoading(false);
        }
    };

    const FRESHNESS_COLOR = {
        FRESH: 'text-green-600 bg-green-50 border-green-200',
        GOOD: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        FAIR: 'text-amber-600 bg-amber-50 border-amber-200',
        POOR: 'text-orange-600 bg-orange-50 border-orange-200',
        SPOILED: 'text-red-600 bg-red-50 border-red-200',
        UNKNOWN: 'text-gray-600 bg-gray-50 border-gray-200'
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Header Section */}
                <div className="text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -z-10"></div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 animate-bounce shadow-sm border border-green-200">
                        <SparklesIcon className="w-4 h-4" />
                        Trợ lý AI Thông minh v3.0
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic mb-4 leading-none">
                        KIỂM TRA <span className="text-green-600">CHẤT LƯỢNG</span>
                    </h1>
                    <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-xs">Phân tích độ tươi nông sản bằng trí tuệ nhân tạo (AI Vision)</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
                    {/* Upload Container */}
                    <div className="lg:col-span-3">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-1000"></div>
                            
                            <div
                                className={`relative z-10 border-4 border-dashed rounded-[2.5rem] p-4 text-center cursor-pointer transition-all duration-500 min-h-[300px] flex items-center justify-center overflow-hidden
                                    ${preview ? 'border-green-600 bg-gray-50' : 'border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-green-400'}`}
                                onClick={() => document.getElementById('ai-image').click()}
                            >
                                {preview ? (
                                    <div className="relative w-full h-full overflow-hidden rounded-3xl">
                                        <img src={preview} alt="Preview" className="max-h-80 mx-auto rounded-3xl object-contain shadow-2xl" />
                                        
                                        {/* Premium Scanning Animation Line */}
                                        {loading && (
                                            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl">
                                                <div className="w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent shadow-[0_0_20px_#22c55e] absolute top-0 animate-scan"></div>
                                                <div className="absolute inset-0 bg-green-500/10 opacity-30 animate-pulse"></div>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                            <p className="text-white font-black uppercase text-xs tracking-widest">Thay đổi ảnh</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 py-10">
                                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-gray-100 text-gray-300 group-hover:text-green-500 transition-colors">
                                            <CameraIcon className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-700 uppercase tracking-widest">Chọn ảnh nông sản</p>
                                            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter mt-2">Kéo thả hoặc nhấn để duyệt tệp tin</p>
                                        </div>
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

                            <div className="flex gap-4 mt-8 relative z-10">
                                {preview && (
                                    <button
                                        type="button"
                                        className="flex-1 py-5 border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-red-100 hover:text-red-500 transition-all bg-white"
                                        onClick={() => { setImage(null); setPreview(null); setResult(null); }}
                                    >
                                        Hủy ảnh
                                    </button>
                                )}
                                <button 
                                    type="submit" 
                                    disabled={loading || !image} 
                                    className="flex-[2] py-5 bg-green-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-green-100 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none overflow-hidden group/btn"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                            Bắt đầu phân tích AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 bg-gray-50/50 rounded-[2rem] border border-gray-100 p-8 flex items-start gap-6 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <InformationCircleIcon className="w-24 h-24" />
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2 shadow-inner w-fit px-2 py-0.5 rounded-lg bg-white/50">Mẹo nhỏ từ chuyên gia</h3>
                                <ul className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter space-y-2">
                                    <li className="flex items-center gap-2">• Ánh sáng ban ngày là tốt nhất để AI nhận diện vân bề mặt</li>
                                    <li className="flex items-center gap-2">• Chụp cận cảnh thực phẩm, đảm bảo không bị mờ (out-focus)</li>
                                    <li className="flex items-center gap-2">• Đảm bảo thực phẩm chiếm ít nhất 50% diện tích khung hình</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Result Container */}
                    <div className="lg:col-span-2">
                        {loading && (
                            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 h-full flex flex-col items-center justify-center text-center shadow-xl">
                                <div className="relative mb-10">
                                    <div className="w-24 h-24 border-8 border-green-50 border-t-green-600 rounded-full animate-spin shadow-2xl shadow-green-100"></div>
                                    <SparklesIcon className="w-8 h-8 text-green-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight mb-2">Đang quét phân tử...</h2>
                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Hệ thống AI đang so khớp dữ liệu tươi sạch</p>
                            </div>
                        )}

                        {!loading && !result && (
                            <div className="bg-gray-50/50 rounded-[3.5rem] border-4 border-dashed border-gray-100 p-10 h-full flex flex-col items-center justify-center text-center grayscale opacity-60">
                                <SparklesIcon className="w-20 h-20 text-gray-200 mb-6" />
                                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Chờ dữ liệu phân tích</p>
                            </div>
                        )}

                        {result && (
                            <div className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-2xl shadow-green-100/50 flex flex-col h-full animate-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-black text-gray-900 uppercase italic tracking-tight underline decoration-green-500/30 decoration-4 underline-offset-4">Chìa khóa phân tích</h2>
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>

                                <div className={`px-6 py-4 rounded-3xl border-2 font-black text-xl uppercase tracking-widest text-center mb-8 shadow-lg shadow-gray-100/30 ${FRESHNESS_COLOR[result.freshness] || 'border-gray-100 bg-gray-50'}`}>
                                    {result.freshness || 'CHƯA XÁC ĐỊNH'}
                                </div>

                                {result.confidence !== undefined && (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest leading-none">Độ tin cậy của AI</span>
                                            <span className="text-xs font-black text-green-600">{Math.round(result.confidence * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 p-0.5 border border-gray-50 shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full shadow-lg"
                                                style={{ width: `${Math.round(result.confidence * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {result.description && (
                                    <div className="mb-8">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 px-1 ml-1 border-l-2 border-green-500 italic">Nhận định chi tiết</p>
                                        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                                            <p className="text-sm font-semibold text-gray-700 leading-relaxed italic">"{result.description}"</p>
                                        </div>
                                    </div>
                                )}

                                {result.suggestion && (
                                    <div className="mt-auto p-6 bg-gradient-to-br from-green-900 via-green-800 to-black rounded-[2rem] text-white shadow-xl relative overflow-hidden group/card transition-all hover:scale-[1.02]">
                                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover/card:bg-green-400/20 transition-all"></div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <LightBulbIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 leading-none">Kiến nghị xử lý</span>
                                        </div>
                                        <p className="text-sm font-bold leading-relaxed">{result.suggestion}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
