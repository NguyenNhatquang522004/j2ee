import React, { useState, useEffect } from 'react';
import { 
    ExclamationTriangleIcon, 
    InformationCircleIcon, 
    PencilSquareIcon,
    XMarkIcon 
} from '@heroicons/react/24/outline';

/**
 * ConfirmModal: A premium replacement for window.confirm and window.prompt
 * @param {boolean} isOpen - Control visibility
 * @param {string} title - Modal title
 * @param {string} message - Description message
 * @param {string} type - 'danger' | 'warning' | 'info' | 'prompt'
 * @param {string} placeholder - Placeholder for prompt input
 * @param {string} value - Initial value for prompt
 * @param {function} onConfirm - Callback with value (if prompt)
 * @param {function} onCancel - Callback on cancel
 */
export default function ConfirmModal({ 
    isOpen, 
    title, 
    message, 
    type = 'info', 
    placeholder = 'Nhập nội dung...', 
    value = '',
    onConfirm, 
    onCancel 
}) {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        if (isOpen) setInputValue(value);
    }, [isOpen, value]);

    if (!isOpen) return null;

    const colors = {
        danger: 'bg-red-50 text-red-600 border-red-100 ring-red-500/20',
        warning: 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/20',
        info: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/20',
        prompt: 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500/20'
    };

    const icons = {
        danger: <ExclamationTriangleIcon className="w-6 h-6" />,
        warning: <ExclamationTriangleIcon className="w-6 h-6" />,
        info: <InformationCircleIcon className="w-6 h-6" />,
        prompt: <PencilSquareIcon className="w-6 h-6" />
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in slide-in-from-bottom-4">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-current opacity-20 pointer-events-none" style={{ color: type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6' }}></div>
                
                <div className="p-8 sm:p-10">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-8 transition-all duration-500 ${colors[type]}`}>
                            {icons[type]}
                        </div>
                        
                        <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto mb-8">
                            {message}
                        </p>

                        {type === 'prompt' && (
                            <div className="w-full mb-8">
                                <textarea
                                    autoFocus
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full h-32 px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-sm resize-none"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-4 px-6 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all border border-gray-100"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => onConfirm(type === 'prompt' ? inputValue : true)}
                                className={`flex-[1.5] py-4 px-6 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 ${
                                    type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 
                                    type === 'prompt' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' :
                                    'bg-gray-900 hover:bg-black shadow-gray-100'
                                }`}
                            >
                                {type === 'danger' ? 'Xác nhận xóa' : type === 'prompt' ? 'Gửi đi' : 'Đồng ý'}
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onCancel}
                    className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
