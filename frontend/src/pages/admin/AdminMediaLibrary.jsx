import { useState, useEffect, useCallback } from 'react';
import { mediaService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { 
    CloudArrowUpIcon, 
    TrashIcon, 
    PhotoIcon, 
    VideoCameraIcon, 
    ClipboardDocumentIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminMediaLibrary({ onSelect, isModal = false, onClose }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, image, video

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const res = await mediaService.getAll();
            setMedia(res.data || []);
        } catch {
            toast.error('Không thể tải thư viện');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        toast.loading('Đang tải lên...', { id: 'upload' });
        try {
            await mediaService.upload(formData);
            toast.success('Tải lên thành công', { id: 'upload' });
            fetchMedia();
        } catch {
            toast.error('Tải lên thất bại', { id: 'upload' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa file này khỏi thư viện?')) return;
        try {
            await mediaService.delete(id);
            toast.success('Đã xóa');
            fetchMedia();
        } catch {
            toast.error('Không thể xóa');
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('Đã sao chép liên kết');
    };

    const filteredMedia = media.filter(m => {
        const matchesSearch = m.fileName?.toLowerCase().includes(search.toLowerCase());
        const matchesType = filter === 'all' || (filter === 'image' && m.fileType?.startsWith('image')) || (filter === 'video' && m.fileType?.startsWith('video'));
        return matchesSearch && matchesType;
    });

    const Content = (
        <div className={`flex flex-col h-full bg-white ${isModal ? 'rounded-xl overflow-hidden' : ''}`}>
            {/* Header */}
            <div className={`p-4.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50`}>
                <div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <PhotoIcon className="w-6 h-6 text-green-600" />
                        Thư viện Media
                    </h1>
                    <p className="text-[13px] text-gray-500 font-medium">Lưu trữ và quản lý tài sản số của FreshFood.</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className={`cursor-pointer flex items-center gap-2 px-4.5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-lg shadow-lg shadow-green-100 transition-all active:scale-95 text-[11px] uppercase tracking-wider ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <CloudArrowUpIcon className="w-5 h-5 stroke-[3]" />
                        <span>{uploading ? 'Đang tải...' : 'Tải lên'}</span>
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                    {isModal && (
                        <button onClick={onClose} className="p-3 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600" />
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm file..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-green-500/20 outline-none text-sm"
                    />
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                    {['all', 'image', 'video'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${filter === t ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t === 'all' ? 'Tất cả' : t === 'image' ? 'Hình ảnh' : 'Video'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array(12).fill(0).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 py-16">
                        <PhotoIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold text-sm">Chưa có tập tin nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {filteredMedia.map((m) => {
                            const isVideo = m.fileType?.startsWith('video');
                            return (
                                <div key={m.id} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-lg transition-all duration-300">
                                    {isVideo ? (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <VideoCameraIcon className="w-10 h-10 text-white/50" />
                                            <video src={m.url} className="absolute inset-0 w-full h-full object-cover hidden group-hover:block" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}} />
                                        </div>
                                    ) : (
                                        <img src={m.url} alt={m.fileName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    )}
                                    
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        {onSelect ? (
                                            <button 
                                                onClick={() => onSelect(m)}
                                                className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-full hover:scale-110 transition-transform"
                                                title="Chọn"
                                            >
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </button>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => copyToClipboard(m.url)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
                                                    title="Sao chép URL"
                                                >
                                                    <ClipboardDocumentIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(m.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-white rounded-full transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Info Flag */}
                                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center pointer-events-none">
                                        <span className="text-[10px] bg-black/50 backdrop-blur px-2 py-0.5 rounded text-white font-bold truncate max-w-[70%]">
                                            {m.fileName}
                                        </span>
                                        {isVideo && <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-black uppercase">Video</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    if (isModal) return Content;

    return (
        <AdminLayout>
            {Content}
        </AdminLayout>
    );
}
