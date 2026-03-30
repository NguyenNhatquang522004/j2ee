import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ModalContext = createContext({
    confirm: () => Promise.resolve(false),
    prompt: () => Promise.resolve(null),
});

export const useConfirm = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        placeholder: '',
        value: '',
        resolve: null
    });

    const confirm = useCallback((options) => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                title: options.title || 'Xác nhận',
                message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
                type: options.type || 'info',
                resolve
            });
        });
    }, []);

    const prompt = useCallback((options) => {
        return new Promise((resolve) => {
            setModal({
                isOpen: true,
                title: options.title || 'Nhập thông tin',
                message: options.message || 'Vui lòng nhập nội dung bên dưới:',
                type: 'prompt',
                placeholder: options.placeholder || 'Nhập nội dung...',
                value: options.value || '',
                resolve
            });
        });
    }, []);

    const handleConfirm = (value) => {
        if (modal.resolve) modal.resolve(value);
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (modal.resolve) modal.resolve(modal.type === 'prompt' ? null : false);
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ confirm, prompt }}>
            {children}
            <ConfirmModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                placeholder={modal.placeholder}
                value={modal.value}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ModalContext.Provider>
    );
};
