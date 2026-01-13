import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from './store/slices/authSlice';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { RootState, AppDispatch } from './store';

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    if (loading && !isAuthenticated && !user) {
        return <div>Loading...</div>;
    }

    const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
        if (!isAuthenticated) return <Navigate to="/login" replace />;
        if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                        <UserDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'ADMIN' ? '/admin' : '/dashboard') : "/login"} replace />} />
            </Routes>
        </Router>
    );
};

export default App;
