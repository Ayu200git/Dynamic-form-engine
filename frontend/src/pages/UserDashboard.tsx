import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { DynamicForm } from '../components/DynamicForm/DynamicForm';
import { fetchSchema } from '../store/slices/formSlice';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import api from '../api/client';

export const UserDashboard: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { schemas } = useSelector((state: RootState) => state.form);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchProducts();
        dispatch(fetchSchema('ADD_PRODUCT'));
    }, [dispatch]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleAddProduct = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.post('/products', data);
            setIsAddModalOpen(false);
            fetchProducts(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addProductSchema = schemas['ADD_PRODUCT'];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                            D
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                            DynamicEngine
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600 hidden sm:block">
                            Signed in as <span className="font-semibold text-gray-900">{user?.username}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Log out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-gray-500 mt-1">Browse and manage your inventory</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="shadow-lg">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="mt-1 text-gray-500">Get started by creating a new product.</p>
                        <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
                            Add Your First Product
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className={`${product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} text-xs px-2 py-1 rounded-full font-medium`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">{product.title}</h3>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">${product.price}</p>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4 text-sm space-y-2">
                                    {Object.keys(product).map((key) => {
                                        if (['title', 'price', '_id', '__v', 'createdAt', 'updatedAt'].includes(key)) return null;
                                        return (
                                            <div key={key} className="flex justify-between items-center text-gray-600">
                                                <span className="capitalize font-medium text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                                <span className="font-medium text-gray-900">{String(product[key])}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add Product Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Product"
                size="lg"
            >
                {addProductSchema ? (
                    <DynamicForm
                        schema={addProductSchema}
                        onSubmit={handleAddProduct}
                        isLoading={isSubmitting}
                        submitLabel="Create Product"
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">Loading form...</div>
                )}
            </Modal>
        </div>
    );
};
