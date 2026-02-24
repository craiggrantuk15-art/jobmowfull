import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Search,
    BookOpen,
    MessageSquare,
    LifeBuoy,
    Zap,
    CreditCard,
    Settings,
    ShieldCheck,
    ArrowRight,
    ExternalLink,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { helpArticles as defaultArticles } from '../data/helpArticles';

interface HelpArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    is_featured: boolean;
    description?: string; // For backward compatibility with mockup data
}

const HelpCenter: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [articles, setArticles] = useState<HelpArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('help_articles')
                .select('*');

            if (error) throw error;

            // Merge with default articles if empty or just use DB
            if (data && data.length > 0) {
                setArticles(data);
            } else {
                setArticles(defaultArticles as any);
            }
        } catch (err) {
            console.error("Failed to fetch help articles:", err);
            setArticles(defaultArticles as any);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { title: "Getting Started", icon: <Zap size={24} className="text-lawn-600" />, desc: "Learn the basics and set up your profile." },
        { title: "Billing & Plans", icon: <CreditCard size={24} className="text-blue-600" />, desc: "Manage subscriptions, invoices, and payments." },
        { title: "AI Quote Widget", icon: <Sparkles size={24} className="text-purple-600" />, desc: "How to embed and customize your quote engine." },
        { title: "Team Management", icon: <Settings size={24} className="text-orange-600" />, desc: "Adding coworkers and managing permissions." },
        { title: "Security & Privacy", icon: <ShieldCheck size={24} className="text-emerald-600" />, desc: "Data protection and account security settings." },
        { title: "Mobile App", icon: <LifeBuoy size={24} className="text-pink-600" />, desc: "Using JobMow on the go with our mobile features." },
    ];

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (article.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryCounts = articles.reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="flex flex-col gap-24 pb-20 pt-16">
            {/* Hero Search */}
            <section className="relative px-4 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 -z-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-lawn-500 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] opacity-10 translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                        How can we <br />
                        <span className="text-lawn-400">help you today?</span>
                    </h1>

                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lawn-400 transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, and more..."
                            className="w-full bg-white/10 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-white text-lg focus:outline-none focus:ring-4 focus:ring-lawn-500/20 focus:bg-white/15 transition-all placeholder:text-slate-500 backdrop-blur-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
                        <span>Popular:</span>
                        <button className="text-slate-300 hover:text-lawn-400 font-bold transition-colors">AI Settings</button>
                        <button className="text-slate-300 hover:text-lawn-400 font-bold transition-colors">Billing</button>
                        <button className="text-slate-300 hover:text-lawn-400 font-bold transition-colors">Member Roles</button>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-900">Browse by Category</h2>
                    {selectedCategory && (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-sm font-bold text-lawn-600 hover:text-lawn-700 flex items-center gap-2"
                        >
                            Clear Filter <ArrowRight size={14} className="rotate-180" />
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((cat, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedCategory(cat.title)}
                            className={`group p-10 rounded-[2.5rem] border transition-all cursor-pointer ${selectedCategory === cat.title
                                ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200'
                                : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-transform group-hover:scale-110 ${selectedCategory === cat.title ? 'bg-white/10 border-white/10' : 'bg-slate-50 border-slate-100'
                                }`}>
                                {cat.icon}
                            </div>
                            <h3 className={`text-xl font-black mb-2 ${selectedCategory === cat.title ? 'text-white' : 'text-slate-900'}`}>{cat.title}</h3>
                            <p className={`text-sm mb-6 leading-relaxed ${selectedCategory === cat.title ? 'text-slate-400' : 'text-slate-500'}`}>{cat.desc}</p>
                            <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                                <span className={selectedCategory === cat.title ? 'text-slate-500' : 'text-slate-400'}>
                                    {categoryCounts[cat.title] || 0} articles
                                </span>
                                <span className={`${selectedCategory === cat.title ? 'text-lawn-400' : 'text-lawn-600'} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                                    Browse <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Articles & Sidebar */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="grid lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <h2 className="text-3xl font-black text-slate-900">
                                {searchTerm ? 'Search Results' : selectedCategory ? `${selectedCategory} Articles` : 'Popular Articles'}
                            </h2>
                            <span className="text-sm font-bold text-slate-400">{filteredArticles.length} found</span>
                        </div>

                        <div className="space-y-4">
                            {filteredArticles.length > 0 ? (
                                filteredArticles.map((article, i) => (
                                    <Link
                                        key={i}
                                        to={`/help/article/${article.id}`}
                                        className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100 group-hover:text-lawn-600 transition-colors">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-700 block">{article.title}</span>
                                                <span className="text-xs text-slate-400 font-medium">{article.category}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-300 group-hover:text-lawn-600" />
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                        <Search size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No articles found</h3>
                                    <p className="text-slate-500 text-sm">Try using different keywords or another category.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-lawn-500 rounded-full blur-3xl opacity-20 -translate-y-16 translate-x-16 group-hover:opacity-40 transition-opacity"></div>
                            <h3 className="text-2xl font-black mb-4 relative z-10">Can't find what you need?</h3>
                            <p className="text-slate-400 text-sm mb-8 relative z-10">Our actual humans are ready to jump in and help you grow your lawn business.</p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-lawn-600 text-white font-black rounded-2xl hover:bg-lawn-500 transition-all relative z-10 shadow-xl shadow-lawn-900/40"
                            >
                                Contact Support <MessageSquare size={18} />
                            </Link>
                        </div>

                        <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Other Resources</h4>
                            <nav className="space-y-6">
                                <Link to="/docs" className="flex items-center justify-between text-slate-600 hover:text-lawn-600 font-bold group">
                                    Product Docs <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                                <a href="#" className="flex items-center justify-between text-slate-600 hover:text-lawn-600 font-bold group">
                                    Community Forum <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <Link to="/status" className="flex items-center justify-between text-slate-600 hover:text-lawn-600 font-bold group">
                                    System Status <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HelpCenter;
