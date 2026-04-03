import { Link, useNavigate } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CompareBar() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const navigate = useNavigate();

    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-4xl bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="bg-green-600 p-3 rounded-2xl shadow-lg shadow-green-200">
                        <ArrowsRightLeftIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="font-black text-gray-900 text-sm tracking-tight">So sánh sản phẩm</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{compareItems.length}/4 sản phẩm</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {compareItems.map((item) => (
                        <div key={item.id} className="relative group w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            <button 
                                onClick={() => removeFromCompare(item.id)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <XMarkIcon className="w-3 h-3 stroke-[3]" />
                            </button>
                        </div>
                    ))}
                    
                    {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
                        <div key={i} className="hidden xs:flex w-14 h-14 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 items-center justify-center text-gray-200">
                            <span className="text-xl font-black">+</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={clearCompare}
                        className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa tất cả"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest">Xóa</span>
                    </button>
                    <button 
                        onClick={() => {
                            if (compareItems.length < 2) {
                                toast.error('Vui lòng chọn ít nhất 2 sản phẩm để so sánh');
                                return;
                            }
                            navigate('/compare');
                        }}
                        className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl uppercase tracking-tight ${compareItems.length >= 2 ? 'bg-black text-white hover:bg-green-600 shadow-gray-200 hover:shadow-green-100' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        So sánh ngay
                    </button>
                </div>
            </div>
        </div>
    );
}
