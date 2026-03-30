import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
        onCancel: () => {}
    });

    const confirm = useCallback((config) => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title: config.title || 'Xác nhận',
                message: config.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
                type: config.type || 'info',
                onConfirm: (value) => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(value);
                },
                onCancel: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(null);
                }
            });
        });
    }, []);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <ConfirmModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    return useContext(ConfirmContext);
}
