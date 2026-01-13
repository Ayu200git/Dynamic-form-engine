import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchema } from '../store/slices/formSlice';
import { login } from '../store/slices/authSlice';
import { DynamicForm } from '../components/DynamicForm/DynamicForm';
import { RootState, AppDispatch } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { schemas, loading: formLoading } = useSelector((state: RootState) => state.form);
    const { user, isAuthenticated, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchSchema('LOGIN'));
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = (data: any) => {
        dispatch(login(data));
    };

    const schema = schemas['LOGIN'];

    if (formLoading && !schema) return <div>Loading form...</div>;
    if (!schema) return <div>Error: Login form configuration missing.</div>;

    return (
        <AuthLayout title="Welcome Back" subtitle="Please login to your account">
            {authError && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded">{authError}</div>}
            <DynamicForm
                schema={schema}
                onSubmit={handleLogin}
                isLoading={authLoading}
                submitLabel="Login"
            />
            <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-500">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    );
};
