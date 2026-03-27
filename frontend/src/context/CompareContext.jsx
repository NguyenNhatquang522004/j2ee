import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareItems, setCompareItems] = useState(() => {
        const saved = localStorage.getItem('compare_items');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('compare_items', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        if (compareItems.find(item => item.id === product.id)) {
            toast.error('Sản phẩm đã có trong danh sách so sánh');
            return;
        }

        if (compareItems.length >= 4) {
            toast.error('Chỉ có thể so sánh tối đa 4 sản phẩm');
            return;
        }

        setCompareItems(prev => [...prev, product]);
        toast.success('Đã thêm vào danh sách so sánh');
    };

    const removeFromCompare = (productId) => {
        setCompareItems(prev => prev.filter(item => item.id !== productId));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export const useCompare = () => useContext(CompareContext);
