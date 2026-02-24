import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    Search,
    Book,
    Zap,
    Calendar,
    DollarSign,
    Settings,
    ArrowRight,
    MousePointerClick,
    Code,
    ShieldCheck,
    Smartphone
} from 'lucide-react';

const Docs: React.FC = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: <Book size={18} /> },
        { id: 'quote-widget', title: 'AI Quote Widget', icon: <Zap size={18} /> },
        { id: 'scheduling', title: 'Scheduling & Jobs', icon: <Calendar size={18} /> },
        { id: 'financials', title: 'Financial Management', icon: <DollarSign size={18} /> },
        { id: 'pro-mobile', title: 'JobMow Pro Mobile', icon: <Smartphone size={18} /> },
        { id: 'settings', title: 'Account Settings', icon: <Settings size={18} /> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'getting-started':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Getting Started</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Welcome to JobMow! This guide will help you set up your landscaping business on our platform and start automating your workflow in minutes.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-lawn-50 flex items-center justify-center mb-4">
                                    <span className="font-black text-lawn-600">1</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Complete Onboarding</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Fill out your business profile, service areas, and tax details to ensure accurate quoting and invoicing.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-lawn-50 flex items-center justify-center mb-4">
                                    <span className="font-black text-lawn-600">2</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Set Your Pricing</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Define your service rates. Our AI uses these rules to calculate instant quotes for your customers.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-lawn-500 rounded-full blur-3xl opacity-20 -translate-y-16 translate-x-16"></div>
                            <h3 className="text-xl font-bold mb-4 relative z-10">Quick Tip</h3>
                            <p className="text-slate-400 leading-relaxed relative z-10">
                                You can import your existing customer list from CSV or Excel directly in the Customers tab inside your Pro Dashboard.
                            </p>
                        </div>
                    </div>
                );
            case 'quote-widget':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">AI Quote Widget</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                The JobMow Quote Widget is an embeddable component that allows your customers to get instant pricing and book jobs from your own website.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-slate-900">Embedding the Widget</h3>
                            <p className="text-slate-600 leading-relaxed">
                                To add the widget to your site, go to <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-lawn-700">Settings &gt; Embed Widget</span> and copy your unique code snippet.
                            </p>

                            <div className="bg-slate-900 rounded-2xl p-6 font-mono text-sm overflow-x-auto">
                                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                    <span className="text-slate-400">Example Code Snippet</span>
                                    <Code size={14} className="text-slate-500" />
                                </div>
                                <pre className="text-emerald-400">
                                    {`<!-- JobMow Quote Widget -->
<div id="jobmow-quote-widget"></div>
<script 
  src="https://jobmow.pro/embed.js" 
  data-org="YOUR_ORGANIZATION_ID"
  data-accent="#16a34a"
></script>`}
                                </pre>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl border-2 border-slate-100 hover:border-lawn-200 transition-colors">
                                <MousePointerClick className="text-lawn-600 mb-4" />
                                <h4 className="font-bold text-slate-900 mb-2">Instant Quoting</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    The AI uses Satellite data to measure lawn size and applies your pricing rules automatically.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl border-2 border-slate-100 hover:border-lawn-200 transition-colors">
                                <ShieldCheck className="text-lawn-600 mb-4" />
                                <h4 className="font-bold text-slate-900 mb-2">Lead Capture</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Even if customers don't book immediately, their information is captured as a high-intent Lead.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'scheduling':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Scheduling & Jobs</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Manage your daily routes and recurrent jobs with our high-performance calendar and optimization engine.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Route Optimization</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Click the "Optimize Route" button in your daily view to let the AI reorder your stops for minimum travel time based on real-time traffic.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Recurrent Service</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Set jobs to repeat weekly, bi-weekly, or monthly. JobMow automatically generates future jobs and puts them on the map.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'financials':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-4">Financial Management</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                Track revenue, manage expenses, and automate your invoicing to keep your landscaping business profitable.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-lg font-bold text-slate-900">Automated Billing</h4>
                                <p className="text-slate-500 leading-relaxed">
                                    JobMow can automatically send invoices and process payments via Stripe the moment a job status is marked as "Completed".
                                </p>
                                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lawn-500"></div> Professional receipt generation</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lawn-500"></div> Late payment reminders</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-lawn-500"></div> Tax-ready export logs</li>
                                </ul>
                            </div>
                            <div className="bg-lawn-50 rounded-3xl p-8 border border-lawn-100">
                                <h4 className="font-bold text-lawn-900 mb-2">Expense Tracking</h4>
                                <p className="text-sm text-lawn-700 leading-relaxed mb-4">
                                    Log your fuel, equipment, and labor costs to see your true net profit heatmaps across your service areas.
                                </p>
                                <div className="h-12 bg-white rounded-xl flex items-center px-4 justify-between shadow-sm">
                                    <span className="text-xs font-bold text-slate-400">Total Profitability</span>
                                    <span className="text-emerald-600 font-bold">+84.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="py-20 text-center space-y-4">
                        <h2 className="text-2xl font-bold text-slate-900">Section Coming Soon</h2>
                        <p className="text-slate-500">We are currently updating this part of the documentation.</p>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* SIDEBAR */}
                <aside className="lg:w-72 flex-shrink-0 space-y-8">
                    <div>
                        <h1 className="text-sm font-black text-lawn-600 uppercase tracking-[0.2em] mb-4">Documentation</h1>
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lawn-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search guides..."
                                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-lawn-100 focus:border-lawn-300 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === section.id
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                    }`}
                            >
                                <span className={activeSection === section.id ? 'text-lawn-400' : 'text-slate-400'}>
                                    {section.icon}
                                </span>
                                {section.title}
                                {activeSection === section.id && <ChevronRight size={14} className="ml-auto" />}
                            </button>
                        ))}
                    </nav>

                    <div className="p-6 rounded-3xl bg-lawn-50 border border-lawn-100">
                        <h4 className="text-xs font-black text-lawn-700 uppercase tracking-widest mb-3">Need Support?</h4>
                        <p className="text-xs text-lawn-600 leading-relaxed mb-4">Our team is available 24/7 for Enterprise customers.</p>
                        <a href="mailto:support@jobmow.pro" className="flex items-center gap-2 text-xs font-black text-slate-900 hover:gap-3 transition-all">
                            Contact Support <ArrowRight size={14} />
                        </a>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 bg-white rounded-[3rem] border border-slate-100 p-8 md:p-12 lg:p-16 shadow-sm min-h-[600px]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Docs;
