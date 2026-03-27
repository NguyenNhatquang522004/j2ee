import Navbar from './Navbar';
import Footer from './Footer';
import CompareBar from './CompareBar';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
                {children}
            </main>
            <CompareBar />
            <Footer />
        </div>
    );
}
