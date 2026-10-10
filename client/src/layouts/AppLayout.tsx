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
        <div className="min-h-screen flex flex-col relative w-full">
            {/* ── Top Nav ──────────────────────────────────────────── */}
            <nav className="glass-nav sticky top-0 z-40">
                <div className="page-container flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                        <span className="text-xl">⚡</span>
                        <span className="text-base">CS Fundamentals</span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        {user?.role === 'ADMIN' && (
                            <Link to="/admin/content" className="text-[13px] font-black text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 px-3 py-1.5 rounded border border-brand-100 hidden sm:block">
                                Admin Console
                            </Link>
                        )}
                        <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                            <span className="text-sm font-semibold text-gray-700 hidden sm:block">{user?.name}</span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-600 hover:text-red-500 transition-colors"
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
            <footer className="border-t border-gray-200 py-4 mt-8 hidden">
                <div className="page-container text-center text-xs text-gray-500">
                    CS Fundamentals — Structured learning for engineers
                </div>
            </footer>
        </div>
    );
}
