import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#0b0c0c] flex flex-col">
            {/* ── Top Nav ──────────────────────────────────────────── */}
            <nav className="bg-[#0b0c0c] border-b border-gray-800 sticky top-0 z-40">
                <div className="page-container flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-gray-200 hover:text-brand-400 transition-colors">
                        <span className="text-xl">⚡</span>
                        <span className="text-base">CS Fundamentals</span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <Link to="/dashboard" className="text-sm text-gray-400 hover:text-gray-200 transition-colors hidden sm:block">
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400 hidden sm:block">{user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Page Content ─────────────────────────────────────── */}
            <main className="flex-1 flex overflow-hidden">
                <Outlet />
            </main>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="border-t border-gray-800 py-4 mt-8 hidden">
                <div className="page-container text-center text-xs text-gray-500">
                    CS Fundamentals — Structured learning for engineers
                </div>
            </footer>
        </div>
    );
}
