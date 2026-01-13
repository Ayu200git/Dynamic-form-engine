import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchema, saveSchema } from '../store/slices/formSlice';
import { RootState, AppDispatch } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { DynamicForm } from '../components/DynamicForm/DynamicForm';
import { StatsCard } from '../components/ui/StatsCard';
import { IFormSchema, IFormField } from '../types/schema.types';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

type TabType = 'overview' | 'users' | 'products' | 'schemas';

export const AdminDashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { schemas, loading } = useSelector((state: RootState) => state.form);
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [selectedForm, setSelectedForm] = useState<string>('LOGIN');
    const [editingSchema, setEditingSchema] = useState<IFormSchema | null>(null);

    // Analytics state
    const [stats, setStats] = useState<any>(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Users state
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Products state
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchSchema(selectedForm));
    }, [selectedForm, dispatch]);

    useEffect(() => {
        if (schemas[selectedForm]) {
            setEditingSchema(JSON.parse(JSON.stringify(schemas[selectedForm])));
        }
    }, [schemas, selectedForm]);

    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'products') {
            fetchProducts();
            dispatch(fetchSchema('ADD_PRODUCT'));
        }
    }, [activeTab, dispatch]);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const res = await api.get('/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setStatsLoading(false);
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchProducts = async () => {
        setProductsLoading(true);
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setProductsLoading(false);
        }
    };

    const handleAddField = () => {
        if (!editingSchema) return;
        const newField: IFormField = {
            name: `field_${editingSchema.fields.length + 1}`,
            type: 'text',
            required: false,
            ui: { label: 'New Field', placeholder: '' }
        };
        setEditingSchema({
            ...editingSchema,
            fields: [...editingSchema.fields, newField]
        });
    };

    const handleFieldChange = (index: number, key: string, value: any) => {
        if (!editingSchema) return;
        const updatedFields = [...editingSchema.fields];
        if (key.startsWith('ui.')) {
            updatedFields[index].ui = { ...updatedFields[index].ui, [key.split('.')[1]]: value };
        } else {
            (updatedFields[index] as any)[key] = value;
        }
        setEditingSchema({ ...editingSchema, fields: updatedFields });
    };

    const handleDeleteField = (index: number) => {
        if (!editingSchema) return;
        const updatedFields = editingSchema.fields.filter((_, i) => i !== index);
        setEditingSchema({ ...editingSchema, fields: updatedFields });
    };

    const handleAddValidationRule = (fieldIndex: number) => {
        if (!editingSchema) return;
        const updatedFields = [...editingSchema.fields];
        const field = updatedFields[fieldIndex];
        const newRule = {
            type: 'minLength' as const,
            value: '',
            message: ''
        };
        field.validation = [...(field.validation || []), newRule];
        setEditingSchema({ ...editingSchema, fields: updatedFields });
    };

    const handleValidationRuleChange = (fieldIndex: number, ruleIndex: number, key: string, value: any) => {
        if (!editingSchema) return;
        const updatedFields = [...editingSchema.fields];
        const rules = [...(updatedFields[fieldIndex].validation || [])];

        let finalValue = value;
        if (key === 'value') {
            const ruleType = rules[ruleIndex].type;
            if (['min', 'max', 'minLength', 'maxLength'].includes(ruleType)) {
                const num = Number(value);
                if (!isNaN(num)) finalValue = num;
            }
        }

        rules[ruleIndex] = { ...rules[ruleIndex], [key]: finalValue };
        updatedFields[fieldIndex].validation = rules as any;
        setEditingSchema({ ...editingSchema, fields: updatedFields });
    };

    const handleDeleteValidationRule = (fieldIndex: number, ruleIndex: number) => {
        if (!editingSchema) return;
        const updatedFields = [...editingSchema.fields];
        updatedFields[fieldIndex].validation = updatedFields[fieldIndex].validation?.filter((_, i) => i !== ruleIndex);
        setEditingSchema({ ...editingSchema, fields: updatedFields });
    };

    const handleSave = () => {
        if (editingSchema) {
            dispatch(saveSchema(editingSchema));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            fetchStats(); // Refresh stats
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleCreateProduct = async (data: any) => {
        setIsSubmitting(true);
        try {
            await api.post('/products', data);
            setIsCreateModalOpen(false);
            fetchProducts();
            fetchStats(); // Refresh stats
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to create product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = (product: any) => {
        setEditingProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (data: any) => {
        if (!editingProduct) return;
        setIsSubmitting(true);
        try {
            await api.put(`/products/${editingProduct._id}`, data);
            setIsEditModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
            fetchStats(); // Refresh stats
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete product');
        }
    };

    const addProductSchema = schemas['ADD_PRODUCT'];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">A</div>
                        <span className="text-lg font-bold tracking-wide">Admin Console</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300 text-sm">{user?.email}</span>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-200 hover:text-white hover:bg-slate-800">
                            Log Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: '📊' },
                            { id: 'users', label: 'Users', icon: '👥' },
                            { id: 'products', label: 'Products', icon: '📦' },
                            { id: 'schemas', label: 'Form Schemas', icon: '📝' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                        {statsLoading ? (
                            <div className="text-center py-12">Loading stats...</div>
                        ) : stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    title="Total Users"
                                    value={stats.totalUsers}
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                                    color="blue"
                                />
                                <StatsCard
                                    title="Total Products"
                                    value={stats.totalProducts}
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>}
                                    color="green"
                                />
                                <StatsCard
                                    title="Recent Signups"
                                    value={stats.recentSignups}
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>}
                                    color="purple"
                                />
                                <StatsCard
                                    title="Categories"
                                    value={stats.productsByCategory?.length || 0}
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>}
                                    color="orange"
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">No stats available</div>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                            <p className="text-gray-500 mt-1">View and manage registered users</p>
                        </div>

                        {usersLoading ? (
                            <div className="text-center py-12">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No users found</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role?.name === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {u.role?.name || 'USER'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        disabled={u._id === user?._id}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                                <p className="text-gray-500 mt-1">Create, edit, and delete products</p>
                            </div>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Create Product
                            </Button>
                        </div>

                        {productsLoading ? (
                            <div className="text-center py-12">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No products found</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {products.map((product) => (
                                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">${product.price}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{product.category || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{product.brand || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="secondary" onClick={() => handleEditProduct(product)}>
                                                            Edit
                                                        </Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleDeleteProduct(product._id)}>
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Schemas Tab */}
                {activeTab === 'schemas' && (
                    <div className="flex gap-8">
                        {/* Sidebar */}
                        <aside className="w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Form Schemas</h3>
                                {['LOGIN', 'SIGNUP', 'ADD_PRODUCT'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedForm(type)}
                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${selectedForm === type
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span className="truncate">{type.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Main Editor Area */}
                        <main className="flex-1">
                            {!editingSchema ? (
                                <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Loading schema...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">{editingSchema.title}</h2>
                                            <p className="text-sm text-gray-500">Configure fields and validation rules</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="secondary" onClick={handleAddField}>+ Add Field</Button>
                                            <Button onClick={handleSave} isLoading={loading}>Save Changes</Button>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {editingSchema.fields.map((field, index) => (
                                            <div key={index} className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDeleteField(index)}
                                                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                        title="Delete Field"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-12 gap-6">
                                                    <div className="col-span-12 md:col-span-4">
                                                        <Input
                                                            label="Database Key (Field Name)"
                                                            value={field.name}
                                                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                            placeholder="e.g. firstName"
                                                            disabled={field.name === 'email' || field.name === 'password'}
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-4">
                                                        <Select
                                                            label="Input Type"
                                                            value={field.type}
                                                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                            options={[
                                                                { label: 'Text', value: 'text' },
                                                                { label: 'Number', value: 'number' },
                                                                { label: 'Password', value: 'password' },
                                                                { label: 'Email', value: 'email' },
                                                                { label: 'Select Dropdown', value: 'select' },
                                                                { label: 'Date', value: 'date' }
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-4 flex items-end pb-2">
                                                        <label className="flex items-center gap-3 cursor-pointer select-none text-gray-700 font-medium">
                                                            <input
                                                                type="checkbox"
                                                                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                                                                checked={field.required || false}
                                                                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                                            />
                                                            Required Field
                                                        </label>
                                                    </div>

                                                    <div className="col-span-12 border-t border-gray-100 pt-4 mt-2">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">UI Configuration</p>
                                                        <div className="grid grid-cols-12 gap-6">
                                                            <div className="col-span-12 md:col-span-6">
                                                                <Input
                                                                    label="Label Text"
                                                                    value={field.ui.label}
                                                                    onChange={(e) => handleFieldChange(index, 'ui.label', e.target.value)}
                                                                    placeholder="User facing label"
                                                                />
                                                            </div>
                                                            <div className="col-span-12 md:col-span-6">
                                                                <Input
                                                                    label="Placeholder Text"
                                                                    value={field.ui.placeholder || ''}
                                                                    onChange={(e) => handleFieldChange(index, 'ui.placeholder', e.target.value)}
                                                                    placeholder="Helper text inside input"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Validation Rules Section */}
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Validation Rules</h6>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleAddValidationRule(index)}
                                                                    className="h-7 px-2 text-xs"
                                                                >
                                                                    Add Rule
                                                                </Button>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {field.validation?.map((rule, ruleIndex) => (
                                                                    <div key={ruleIndex} className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative group/rule">
                                                                        <button
                                                                            onClick={() => handleDeleteValidationRule(index, ruleIndex)}
                                                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/rule:opacity-100 transition-opacity shadow-sm z-10"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                                            <select
                                                                                value={rule.type}
                                                                                onChange={(e) => handleValidationRuleChange(index, ruleIndex, 'type', e.target.value)}
                                                                                className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                                            >
                                                                                <option value="required">Required</option>
                                                                                <option value="minLength">Min Length</option>
                                                                                <option value="maxLength">Max Length</option>
                                                                                <option value="pattern">Pattern (Regex)</option>
                                                                                <option value="min">Min Value</option>
                                                                                <option value="max">Max Value</option>
                                                                            </select>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Value"
                                                                                value={typeof rule.value === 'boolean' ? String(rule.value) : (rule.value ?? '')}
                                                                                onChange={(e) => handleValidationRuleChange(index, ruleIndex, 'value', e.target.value)}
                                                                                className="text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                                            />
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Custom Error Message"
                                                                            value={rule.message}
                                                                            onChange={(e) => handleValidationRuleChange(index, ruleIndex, 'message', e.target.value)}
                                                                            className="w-full text-xs border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                                        />
                                                                    </div>
                                                                ))}
                                                                {(!field.validation || field.validation.length === 0) && (
                                                                    <p className="text-xs text-gray-400 italic text-center py-2">No validation rules added</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {editingSchema.fields.length === 0 && (
                                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                                No fields configured. Click "Add Field" to start.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </main>
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Product"
                size="lg"
            >
                {addProductSchema ? (
                    <DynamicForm
                        schema={addProductSchema}
                        onSubmit={handleCreateProduct}
                        isLoading={isSubmitting}
                        submitLabel="Create Product"
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">Loading form...</div>
                )}
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingProduct(null);
                }}
                title="Edit Product"
                size="lg"
            >
                {addProductSchema && editingProduct ? (
                    <DynamicForm
                        schema={addProductSchema}
                        onSubmit={handleUpdateProduct}
                        isLoading={isSubmitting}
                        submitLabel="Update Product"
                        defaultValues={editingProduct}
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">Loading form...</div>
                )}
            </Modal>
        </div>
    );
};
