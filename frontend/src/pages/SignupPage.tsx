import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchSchema } from '../store/slices/formSlice';
import { register } from '../store/slices/authSlice';
import { DynamicForm } from '../components/DynamicForm/DynamicForm';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';

export const SignupPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { schemas, loading: formLoading } = useSelector((state: RootState) => state.form);
    const { loading: authLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(fetchSchema('SIGNUP'));
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSignup = async (data: any) => {
        const result = await dispatch(register(data));
        if (register.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    const schema = schemas['SIGNUP'];

    if (formLoading || !schema) return <div className="flex justify-center items-center h-screen">Loading form...</div>;

    return (
        <AuthLayout title="Create Account" subtitle="Join us today!">
            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <DynamicForm
                schema={schema}
                onSubmit={handleSignup}
                isLoading={authLoading}
                submitLabel="Sign Up"
            />

            <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-500">
                    Log in
                </Link>
            </div>
        </AuthLayout>
    );
};
