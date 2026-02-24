import React, { useState, useEffect } from 'react';
import {
    Shield,
    FileText,
    Cookie,
    ChevronRight,
    Clock,
    Lock,
    Eye,
    Scale
} from 'lucide-react';

const Legal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cookies'>('privacy');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const tabs = [
        { id: 'privacy', title: 'Privacy Policy', icon: <Shield size={18} /> },
        { id: 'terms', title: 'Terms of Service', icon: <FileText size={18} /> },
        { id: 'cookies', title: 'Cookie Policy', icon: <Cookie size={18} /> },
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 py-20">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Legal Center</h1>
                <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                    Transparent, fair, and secure. Everything you need to know about how we handle your data and our services.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar Nav */}
                <div className="w-full lg:w-64 shrink-0 bg-white rounded-3xl border border-slate-100 p-2 shadow-sm">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-xl'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {tab.icon}
                            {tab.title}
                            {activeTab === tab.id && <ChevronRight size={14} className="ml-auto" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 md:p-12 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        {activeTab === 'privacy' && <Lock size={200} />}
                        {activeTab === 'terms' && <Scale size={200} />}
                        {activeTab === 'cookies' && <Eye size={200} />}
                    </div>

                    <div className="relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'privacy' && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-lawn-600 text-xs font-black uppercase tracking-widest">
                                        <Clock size={14} /> Last Updated: February 24, 2026
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">Privacy Policy</h2>
                                </div>

                                <section className="space-y-4 text-slate-600 leading-relaxed">
                                    <h3 className="text-xl font-bold text-slate-900">1. Information We Collect</h3>
                                    <p>
                                        We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
                                    </p>

                                    <h3 className="text-xl font-bold text-slate-900">2. How We Use Information</h3>
                                    <p>
                                        We use the information we collect to provide, maintain, and improve our services, such as to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support, and send administrative and marketing communications.
                                    </p>

                                    <h3 className="text-xl font-bold text-slate-900">3. Artificial Intelligence</h3>
                                    <p>
                                        The JobMow platform utilizes various AI models to provide quoting, route optimization, and customer communication assistance. Your data is used to provide these services but is not used to train generic models without your explicit consent.
                                    </p>
                                </section>
                            </>
                        )}

                        {activeTab === 'terms' && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-purple-600 text-xs font-black uppercase tracking-widest">
                                        <Clock size={14} /> Last Updated: January 15, 2026
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">Terms of Service</h2>
                                </div>

                                <section className="space-y-4 text-slate-600 leading-relaxed">
                                    <h3 className="text-xl font-bold text-slate-900">1. Acceptance of Terms</h3>
                                    <p>
                                        By accessing or using the JobMow website or application, you agree to be bound by these terms. If you do not agree to these terms, please do not use the service.
                                    </p>

                                    <h3 className="text-xl font-bold text-slate-900">2. Subscription & Payments</h3>
                                    <p>
                                        JobMow provides subscription-based software services. Subscriptions are billed on a monthly basis. You are responsible for all charges incurred under your account. Failure to pay may result in suspension of services.
                                    </p>

                                    <h3 className="text-xl font-bold text-slate-900">3. Prohibited Use</h3>
                                    <p>
                                        You may not use the platform for any illegal activities or to harass other users. We reserve the right to terminate accounts that violate our community standards.
                                    </p>
                                </section>
                            </>
                        )}

                        {activeTab === 'cookies' && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-amber-600 text-xs font-black uppercase tracking-widest">
                                        <Clock size={14} /> Last Updated: December 10, 2025
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">Cookie Policy</h2>
                                </div>

                                <section className="space-y-4 text-slate-600 leading-relaxed">
                                    <h3 className="text-xl font-bold text-slate-900">1. What are cookies?</h3>
                                    <p>
                                        Cookies are small text files stored on your device that help us provide a better experience. We use them for authentication, analytics, and service performance.
                                    </p>

                                    <h3 className="text-xl font-bold text-slate-900">2. Essential Cookies</h3>
                                    <p>
                                        These are necessary for the website to function properly. They include, for example, cookies that enable you to log into secure areas of our website.
                                    </p>

                                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                        <h4 className="font-bold text-slate-900 mb-2">Manage Preferences</h4>
                                        <p className="text-sm text-slate-500 mb-4">You can control cookie settings in your browser at any time.</p>
                                        <button className="text-xs font-black text-lawn-600 uppercase tracking-widest hover:underline">Revoke Consent</button>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legal;
