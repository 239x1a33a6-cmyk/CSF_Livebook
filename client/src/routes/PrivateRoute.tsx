import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500 text-sm">Loading...</div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}
