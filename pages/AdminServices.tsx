import React, { useState } from 'react';
import { useServices } from '../context/ServiceContext';
import { Service } from '../types';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';

const AdminServices: React.FC = () => {
    const { services, addService, updateService, deleteService } = useServices();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        description: '',
        category: 'Outdoor',
        active: true
    });

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData(service);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            deleteService(id);
        }
    };

    const handleAddNew = () => {
        setEditingService(null);
        setFormData({
            name: '',
            description: '',
            category: 'Outdoor',
            active: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (editingService) {
                await updateService({ ...editingService, ...formData } as Service);
            } else {
                const newService: Service = {
                    id: formData.name?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString(),
                    ...formData
                } as Service;
                await addService(newService);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save service:", err);
            setError(err.message || "Failed to save service. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Services</h1>
                    <p className="text-slate-500">Manage the services you offer to customers.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-lawn-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-lawn-700 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add Service
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lawn-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Services List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServices.map(service => (
                    <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.category === 'Outdoor' ? 'bg-green-100 text-green-700' :
                                service.category === 'Indoor' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                {service.category}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-blue-600"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-red-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 mb-1">{service.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 min-h-[40px]">{service.description}</p>

                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className={`flex items-center gap-1.5 text-xs font-medium ${service.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {service.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                {service.active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">ID: {service.id}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingService ? 'Edit Service' : 'Add New Service'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lawn-500"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lawn-500"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                >
                                    <option value="Outdoor">Outdoor</option>
                                    <option value="Indoor">Indoor</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lawn-500"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    className="w-4 h-4 text-lawn-600 rounded focus:ring-lawn-500"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label htmlFor="active" className="text-sm font-medium text-slate-700">Active (Visible to customers)</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-lawn-600 text-white rounded-lg hover:bg-lawn-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? 'Saving...' : editingService ? 'Save Changes' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
