import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Save,
    X,
    BookOpen,
    Check,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Star
} from 'lucide-react';

interface HelpArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    is_featured: boolean;
    created_at: string;
}

const AdminHelpCenter: React.FC = () => {
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Getting Started',
        content: '',
        is_featured: false
    });

    const categories = [
        "Getting Started",
        "Billing & Plans",
        "AI Quote Widget",
        "Team Management",
        "Security & Privacy",
        "Mobile App"
    ];

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('help_articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setArticles(data || []);
        } catch (err: any) {
            console.error("Failed to fetch articles:", err);
            setError("Failed to load articles.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (article?: HelpArticle) => {
        if (article) {
            setEditingArticle(article);
            setFormData({
                title: article.title,
                category: article.category,
                content: article.content,
                is_featured: article.is_featured
            });
        } else {
            setEditingArticle(null);
            setFormData({
                title: '',
                category: 'Getting Started',
                content: '',
                is_featured: false
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (editingArticle) {
                const { error } = await supabase
                    .from('help_articles')
                    .update(formData)
                    .eq('id', editingArticle.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('help_articles')
                    .insert([formData]);
                if (error) throw error;
            }

            await fetchArticles();
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save article:", err);
            setError(err.message || "Failed to save article.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;

        try {
            const { error } = await supabase
                .from('help_articles')
                .delete()
                .eq('id', id);
            if (error) throw error;
            setArticles(prev => prev.filter(a => a.id !== id));
        } catch (err: any) {
            console.error("Failed to delete article:", err);
            alert("Failed to delete article.");
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Help Center Management</h1>
                    <p className="text-slate-500">Create and curate guides for your users.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-lawn-600 text-white rounded-2xl font-bold hover:bg-lawn-700 transition-all shadow-lg shadow-lawn-200"
                >
                    <Plus size={18} /> New Article
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-lawn-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">Total Articles</span>
                    <span className="text-2xl font-black text-slate-900">{articles.length}</span>
                </div>
            </div>

            {/* Articles List */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Title</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Featured</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={4} className="px-8 py-6">
                                            <div className="h-4 bg-slate-100 rounded w-1/2" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredArticles.length > 0 ? (
                                filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6 font-bold text-slate-900">{article.title}</td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {article.is_featured && (
                                                <Star size={16} className="text-amber-500 fill-amber-500" />
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleOpenModal(article)}
                                                    className="p-2 text-slate-400 hover:text-lawn-600 bg-white border border-slate-100 rounded-lg shadow-sm"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 bg-white border border-slate-100 rounded-lg shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-slate-500 font-medium">
                                        No articles found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900">
                                {editingArticle ? 'Edit Article' : 'Create New Article'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-bold">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lawn-500 outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="How to set up your profile..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Category</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lawn-500 outline-none font-medium text-slate-700"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Content (Markdown Support)</label>
                                <textarea
                                    required
                                    className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lawn-500 outline-none font-mono text-sm"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="# Introduction\nUse markdown headers for sections..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <input
                                    type="checkbox"
                                    id="featured"
                                    className="w-5 h-5 rounded border-slate-300 text-lawn-600 focus:ring-lawn-500"
                                    checked={formData.is_featured}
                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                />
                                <label htmlFor="featured" className="text-sm font-bold text-slate-700">Display as Featured Article</label>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : <><Save size={18} /> {editingArticle ? 'Update Article' : 'Publish Article'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHelpCenter;
