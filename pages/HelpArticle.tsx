import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft,
    Clock,
    User,
    ThumbsUp,
    ThumbsDown,
    Share2,
    ChevronRight,
    MessageSquare,
    Sparkles,
    Search,
    ArrowRight
} from 'lucide-react';
import { helpArticles as defaultArticles } from '../data/helpArticles';

interface HelpArticleType {
    id: string;
    title: string;
    category: string;
    content: string;
    author?: string;
    readTime?: string;
    lastUpdated?: string;
}

const HelpArticle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [helpful, setHelpful] = useState<boolean | null>(null);
    const [article, setArticle] = useState<HelpArticleType | null>(null);
    const [loading, setLoading] = useState(true);
    const [allArticles, setAllArticles] = useState<HelpArticleType[]>([]);

    useEffect(() => {
        fetchArticle();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        try {
            // Fetch all articles for sidebar
            const { data: allData } = await supabase.from('help_articles').select('*');
            if (allData && allData.length > 0) {
                setAllArticles(allData);
            } else {
                setAllArticles(defaultArticles as any);
            }

            // Try to find in DB
            const { data, error } = await supabase
                .from('help_articles')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setArticle(data);
            } else {
                // Fallback to defaults
                const local = defaultArticles.find(a => a.id === id);
                if (local) setArticle(local as any);
            }
        } catch (err) {
            console.error("Failed to fetch article:", err);
            const local = defaultArticles.find(a => a.id === id);
            if (local) setArticle(local as any);
        } finally {
            setLoading(false);
        }
    };

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-4">Article not found</h2>
                <p className="text-slate-500 mb-8">We couldn't find the guide you're looking for.</p>
                <Link to="/help" className="text-lawn-600 font-bold flex items-center justify-center gap-2 hover:underline">
                    <ArrowLeft size={18} /> Back to Help Center
                </Link>
            </div>
        );
    }

    // Simple "markdown" formatter for the demonstration
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-slate-900 mt-12 mb-6 tracking-tight">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-900 mt-10 mb-4">{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-3">{line.replace('### ', '')}</h3>;
            if (line.startsWith('- ')) return <li key={i} className="ml-6 text-slate-600 mb-2 list-disc">{line.replace('- ', '')}</li>;
            if (line.startsWith('> [!NOTE]')) return <div key={i} className="my-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-2xl text-blue-700 italic">{content.split('\n')[i + 1]}</div>;
            if (i > 0 && content.split('\n')[i - 1].startsWith('> [!NOTE]')) return null; // Skip line after note tag
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="text-slate-600 leading-relaxed mb-4">{line}</p>;
        });
    };

    const relatedArticles = allArticles.filter(a => article && a.category === article.category && a.id !== article.id);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-12">
                <Link to="/help" className="hover:text-lawn-600">Help Center</Link>
                <ChevronRight size={12} />
                <span className="text-slate-500">{article.category}</span>
                <ChevronRight size={12} />
                <span className="text-lawn-600 truncate max-w-[200px]">{article.title}</span>
            </nav>

            <div className="grid lg:grid-cols-4 gap-16">
                {/* Sidebar Nav */}
                <div className="hidden lg:block space-y-12">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">In this category</h4>
                        <div className="space-y-3">
                            {allArticles.filter(a => a.category === article.category).map(a => (
                                <Link
                                    key={a.id}
                                    to={`/help/article/${a.id}`}
                                    className={`block p-4 rounded-2xl text-sm font-bold transition-all ${a.id === article.id
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {a.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-lawn-50 rounded-[2rem] border border-lawn-100">
                        <Sparkles className="text-lawn-600 mb-4" size={24} />
                        <h5 className="font-black text-slate-900 mb-2 text-sm">Need a hand?</h5>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">Our support team handles technical setup for Pro customers.</p>
                        <Link to="/contact" className="text-xs font-black text-lawn-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                            Chat with us <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <article className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-16">
                        <header className="mb-12 border-b border-slate-50 pb-12">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 tracking-tight">{article.title}</h1>

                            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-400 font-bold">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User size={14} className="text-slate-400" />
                                    </div>
                                    <span>{article.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>{article.readTime} read</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>Updated {article.lastUpdated}</span>
                                </div>
                            </div>
                        </header>

                        <div className="prose prose-slate max-w-none">
                            {renderContent(article.content)}
                        </div>

                        <footer className="mt-16 pt-12 border-t border-slate-50">
                            <div className="bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <h4 className="text-lg font-black text-slate-900 mb-1">Was this article helpful?</h4>
                                    <p className="text-sm text-slate-500">Your feedback helps us improve our guides.</p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setHelpful(true)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${helpful === true
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                            : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100'
                                            }`}
                                    >
                                        <ThumbsUp size={18} /> Yes
                                    </button>
                                    <button
                                        onClick={() => setHelpful(false)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${helpful === false
                                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                                            : 'bg-white text-slate-600 hover:bg-pink-50 hover:text-pink-600 border border-slate-100'
                                            }`}
                                    >
                                        <ThumbsDown size={18} /> No
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-6">
                                <button className="text-xs font-black text-slate-400 hover:text-lawn-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                    <Share2 size={14} /> Share Article
                                </button>
                                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                                <Link to="/contact" className="text-xs font-black text-slate-400 hover:text-lawn-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                    <MessageSquare size={14} /> Request Correction
                                </Link>
                            </div>
                        </footer>
                    </article>

                    {/* Related Articles */}
                    {allArticles.filter(a => a.category === article.category && a.id !== article.id).length > 0 && (
                        <div className="mt-20">
                            <h3 className="text-2xl font-black text-slate-900 mb-8">Related Articles</h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {allArticles.filter(a => a.category === article.category && a.id !== article.id).map(a => (
                                    <Link
                                        key={a.id}
                                        to={`/help/article/${a.id}`}
                                        className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all flex flex-col group"
                                    >
                                        <span className="text-[10px] font-black text-lawn-600 uppercase tracking-[0.2em] mb-4">{a.category}</span>
                                        <h4 className="text-lg font-black text-slate-900 mb-2 group-hover:text-lawn-600 transition-colors">{a.title}</h4>
                                        <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-2">{a.description}</p>
                                        <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                                            Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpArticle;
