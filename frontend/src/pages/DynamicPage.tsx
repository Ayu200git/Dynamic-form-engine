import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import DynamicForm from '../components/DynamicForm/DynamicForm';
import { IFormSchema } from '../types';

const DynamicPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [schema, setSchema] = useState<IFormSchema | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        // If slug is 'login' or 'signup', we might want to handle data submission specially (Auth token)
        // But keeping it generic: Fetch schema first.
        api.get(`/forms/${slug}`)
            .then(res => setSchema(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [slug]);

    const handleSubmit = async (data: any) => {
        console.log('Submitting dynamic form:', slug, data);
        try {
            if (slug === 'login') {
                const res = await api.post('/auth/login', data);
                localStorage.setItem('token', res.data.token);
                alert('Login Successful!');
                window.location.href = '/admin'; // quick redirect
            } else if (slug === 'register') {
                await api.post('/auth/register', data);
                alert('Registration Successful');
            } else if (slug === 'add-product') {
                await api.post('/products', data);
                alert('Product Created');
            } else {
                alert('Form submitted (no handler defined for this slug)');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Submission failed');
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!schema) return <div className="p-8">Form not found. Ask Admin to create '{slug}' form.</div>;

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
            <DynamicForm schema={schema} onSubmit={handleSubmit} />
        </div>
    );
};

export default DynamicPage;
