import React from 'react';
import { useCompare } from '../../context/CompareContext';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { XMarkIcon, ShoppingBagIcon, BoltIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Compare() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();

    const handleAddToCart = (productId) => {
        addToCart(productId, 1);
        toast.success('Đã thêm vào giỏ hàng');
    };

    if (compareItems.length === 0) {
        return (
            <Layout>
                <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Danh sách so sánh đang trống</p>
                    <Link to="/products" className="mt-8 inline-block btn-primary px-8">Tìm sản phẩm ngay</Link>
                </div>
            </Layout>
        );
    }

    const rows = [
        { label: 'Hình ảnh', key: 'imageUrl', type: 'image' },
        { label: 'Tên sản phẩm', key: 'name', type: 'text' },
        { label: 'Giá bán', key: 'price', type: 'price' },
        { label: 'Đơn vị', key: 'unit', type: 'text' },
        { label: 'Kho hàng', key: 'totalStock', type: 'stock' },
        { label: 'Trang trại', key: 'farmName', type: 'text' },
        { label: 'Danh mục', key: 'categoryName', type: 'text' },
        { label: 'Chứng chỉ', key: 'certification', type: 'text' },
    ];

    return (
        <Layout>
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase mb-2">So sánh sản phẩm</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-1 bg-green-600 rounded-full"></span>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Đánh giá chi tiết {compareItems.length} sản phẩm</p>
                    </div>
                </div>
                <button onClick={clearCompare} className="text-red-500 font-black text-xs uppercase tracking-widest hover:underline">Xóa tất cả</button>
            </div>

            <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white/40' : 'bg-gray-50/30'}>
                                    <td className="px-8 py-6 w-48 border-r border-gray-100/50">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{row.label}</span>
                                    </td>
                                    {compareItems.map((item) => (
                                        <td key={item.id} className="px-8 py-6 min-w-[250px] text-center border-r border-gray-100/50 last:border-0 relative group">
                                            {row.key === 'imageUrl' && (
                                                <button 
                                                    onClick={() => removeFromCompare(item.id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </button>
                                            )}

                                            {row.type === 'image' && (
                                                <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden shadow-sm border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                                                    <img src={item[row.key]} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            {row.type === 'text' && (
                                                <span className="text-sm font-bold text-gray-800">{item[row.key] || 'N/A'}</span>
                                            )}
                                            {row.type === 'price' && (
                                                <div className="flex flex-col items-center">
                                                    {item.flashSalePrice ? (
                                                        <>
                                                            <span className="text-[10px] text-gray-300 line-through font-bold mb-0.5">{item.price?.toLocaleString('vi-VN')}₫</span>
                                                            <span className="text-xl font-black text-red-600 flex items-center gap-1">
                                                                <BoltIcon className="w-4 h-4" />
                                                                {item.flashSalePrice.toLocaleString('vi-VN')}₫
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xl font-black text-green-700">{item[row.key]?.toLocaleString('vi-VN')}₫</span>
                                                    )}
                                                </div>
                                            )}
                                            {row.type === 'stock' && (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`text-sm font-black ${item[row.key] > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                                        {item[row.key] > 0 ? `Còn ${item[row.key]}` : 'Hết hàng'}
                                                    </span>
                                                    <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full ${item[row.key] > 10 ? 'bg-green-500' : 'bg-amber-500'}`} 
                                                            style={{ width: `${Math.min(100, item[row.key] * 2)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                    {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
                                        <td key={i} className="px-8 py-6 bg-gray-50/20 last:border-0"></td>
                                    ))}
                                </tr>
                            ))}
                            <tr>
                                <td className="px-8 py-10 border-r border-gray-100/50"></td>
                                {compareItems.map((item) => (
                                    <td key={item.id} className="px-8 py-10 text-center border-r border-gray-100/50 last:border-0">
                                        <button 
                                            onClick={() => handleAddToCart(item.id)}
                                            disabled={item.totalStock === 0}
                                            className="w-full bg-green-600 text-white px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-green-100 hover:shadow-black/20 disabled:bg-gray-200 disabled:shadow-none"
                                        >
                                            Thêm vào giỏ
                                        </button>
                                    </td>
                                ))}
                                {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
                                    <td key={i} className="px-8 py-10 bg-gray-50/20 last:border-0"></td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
}
