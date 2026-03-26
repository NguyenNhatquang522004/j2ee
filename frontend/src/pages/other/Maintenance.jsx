import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Maintenance() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);

    const checkStatus = async () => {
        setChecking(true);
        // Create a 10s "feel" delay as requested
        const startTime = Date.now();
        
        try {
            await axios.get('/products?page=0&size=1');
            
            // Calculate how much time left for 10s delay
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 10000 - elapsed);
            
            setTimeout(() => {
                navigate('/');
            }, remaining);
            
        } catch (err) {
            console.log('Still in maintenance...');
            setChecking(false);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-10">
                <div className="w-32 h-32 bg-green-50 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-xl shadow-green-100">
                    <WrenchScrewdriverIcon className="w-16 h-16 text-green-600" />
                </div>
                <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                </div>
            </div>
            
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">
                Hệ thống đang bảo trì
            </h1>
            
            <p className="text-xl text-gray-500 max-w-lg mx-auto font-medium leading-relaxed mb-10">
                Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt nhất cho bạn. 
                Vui lòng quay lại sau ít phút.
            </p>

            <button 
                onClick={checkStatus}
                disabled={checking}
                className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-[2rem] font-black shadow-xl shadow-green-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
                <ArrowPathIcon className={`w-6 h-6 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'ĐANG KIỂM TRA...' : 'THỬ LẠI NGAY'}
            </button>

            <div className="fixed bottom-10 text-xs font-black text-gray-300 tracking-[0.5rem] uppercase">
                FreshFood - Nhóm 5 - High Quality Service
            </div>
        </div>
    );
}
