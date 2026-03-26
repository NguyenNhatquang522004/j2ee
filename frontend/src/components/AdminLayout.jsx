import AdminSidebar from './AdminSidebar';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <AdminSidebar />
            <main className="flex-1 p-8 max-h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
