import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Zap,
    Calendar,
    Users,
    TrendingUp,
    MessageSquare,
    ShieldCheck,
    Smartphone,
    CreditCard,
    BarChart3,
    ArrowRight,
    Map,
    MousePointerClick,
    Clock,
    CheckCircle2,
    Sparkles,
    LayoutDashboard
} from 'lucide-react';

const Features: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const coreFeatures = [
        {
            title: "AI Smart Quoting",
            description: "Stop wasting hours on site visits. Our AI analyzes property boundaries and local data to provide precise quotes in under 60 seconds.",
            icon: <Zap className="text-amber-500" />,
            color: "bg-amber-50",
            details: [
                "Automated property area measurement",
                "Dynamic pricing based on service type",
                "Instant PDF quote generation",
                "One-click customer acceptance"
            ]
        },
        {
            title: "Autonomous Scheduling",
            description: "Our drag-and-drop calendar doesn't just manage time; it optimizes your entire route for maximum efficiency and fuel savings.",
            icon: <Calendar className="text-lawn-600" />,
            color: "bg-lawn-50",
            details: [
                "Recurrent job automation",
                "Real-time route optimization",
                "Team capacity management",
                "Weather-aware scheduling"
            ]
        },
        {
            title: "Modern Client CRM",
            description: "Maintain a professional edge with a centralized database of every client, property nuance, and service history.",
            icon: <Users className="text-blue-600" />,
            color: "bg-blue-50",
            details: [
                "Detailed property service logs",
                "Automated SMS arrival alerts",
                "Client-specific pricing 'locks'",
                "Multi-property management"
            ]
        }
    ];

    const deepDiveFeatures = [
        {
            icon: <CreditCard className="text-emerald-500" />,
            title: "Instant Invoicing",
            desc: "Get paid the moment the grass is trimmed. Automated invoicing and Stripe integration ensure your cash flow never stalls."
        },
        {
            icon: <BarChart3 className="text-indigo-500" />,
            title: "Profit Heatmaps",
            desc: "Visualize your revenue density. Identify high-margin neighborhoods and optimize your marketing where it counts."
        },
        {
            icon: <Smartphone className="text-purple-500" />,
            title: "Pro Mobile App",
            desc: "Equip your teams with the JobMow Pro app. Mark jobs as complete, upload photos, and track time on the fly."
        },
        {
            icon: <MessageSquare className="text-sky-500" />,
            title: "Automated Comms",
            desc: "Keep clients updated with zero effort. Automated reminders, booking confirmations, and post-service follow-ups."
        },
        {
            icon: <ShieldCheck className="text-rose-500" />,
            title: "Secure Portals",
            desc: "Give your clients a premium login experience to manage their bookings, view invoices, and update preferences."
        },
        {
            icon: <Map className="text-orange-500" />,
            title: "Route Live Traffic",
            desc: "Real-time traffic integration keeps your teams on the fastest path, avoiding delays and maximizing daily jobs."
        }
    ];

    return (
        <div className="flex flex-col gap-24 pb-20">
            {/* ── HERO SECTION ── */}
            <section className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-lawn-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lawn-50 border border-lawn-100 text-lawn-700 text-xs font-bold mb-8">
                        <Sparkles size={14} /> The Future of Landscaping Management
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                        Every tool you need to <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-600 to-emerald-600 font-black">dominate the market.</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
                        JobMow is more than just scheduling software. It's an intelligent engine designed to automate your admin, optimize your field ops, and scale your revenue.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/login?isLogin=false"
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
                        >
                            Start 14-Day Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/book"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                        >
                            See Demo Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CORE FEATURES ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="space-y-32">
                    {coreFeatures.map((feature, idx) => (
                        <div key={idx} className={`flex flex-col ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>
                            <div className="lg:w-1/2 space-y-8">
                                <div className={`w-16 h-16 ${feature.color} rounded-[2rem] flex items-center justify-center shadow-lg transform -rotate-3`}>
                                    {React.cloneElement(feature.icon as React.ReactElement, { size: 32, strokeWidth: 2.5 })}
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{feature.title}</h2>
                                    <p className="text-lg text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    {feature.details.map((detail, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-lawn-50 flex items-center justify-center">
                                                <CheckCircle2 size={14} className="text-lawn-600" />
                                            </div>
                                            <span className="text-slate-700 font-semibold">{detail}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <Link to="/login?isLogin=false" className="inline-flex items-center gap-2 text-lawn-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                                        Activate this feature <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>

                            <div className="lg:w-1/2 w-full">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-lawn-400/20 to-emerald-400/20 rounded-[3rem] blur-2xl group-hover:opacity-100 opacity-60 transition-opacity"></div>
                                    <div className="relative bg-white p-4 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
                                        <img
                                            src={idx === 0
                                                ? "https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=1200"
                                                : idx === 1
                                                    ? "https://images.unsplash.com/photo-1506784920405-b1a13e8b0b92?auto=format&fit=crop&q=80&w=1200"
                                                    : "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=1200"
                                            }
                                            alt={feature.title}
                                            className="w-full h-[400px] object-cover rounded-[2rem] transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-8 right-8 bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl max-w-[200px] transform rotate-3">
                                            <p className="text-xs font-bold uppercase tracking-widest text-lawn-400 mb-2">Pro Tip</p>
                                            <p className="text-sm font-medium leading-relaxed">
                                                {idx === 0 ? "Users save 3+ hours daily on quoting." : idx === 1 ? "Lower fuel costs by up to 22%." : "Improve client retention by 40%."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── SECONDARY FEATURES GRID ── */}
            <section className="bg-slate-900 py-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-xs font-black text-lawn-500 uppercase tracking-[0.3em]">Deep Capabilities</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">Engineered for every corner <br className="hidden md:block" />of your business.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {deepDiveFeatures.map((feature, idx) => (
                            <div key={idx} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                                </div>
                                <h4 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h4>
                                <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-lawn-600 rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-10 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            </section>

            {/* ── QUOTE COMPONENT PREVIEW ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="bg-lawn-50 rounded-[3rem] p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
                    <div className="lg:w-1/2 space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lawn-100 text-lawn-700 text-[10px] font-black uppercase tracking-widest">
                            Built-in Growth
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">The Quote Widget: Your 24/7 Sales Rep.</h2>
                        <p className="text-xl text-slate-600 font-medium leading-relaxed">
                            Embed our beautiful booking portal on your existing website. Let customers get instant quotes and book services while you're deep in the field.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link to="/book" className="flex items-center gap-2 px-8 py-4 bg-lawn-600 text-white font-black rounded-2xl hover:bg-lawn-700 transition-all shadow-xl shadow-lawn-200">
                                Try the Widget Demo <MousePointerClick size={20} />
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden transform rotate-2">
                            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Client Portal</div>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-slate-100 rounded-full"></div>
                                    <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-24 bg-lawn-50 rounded-2xl border-2 border-lawn-200 flex flex-col items-center justify-center gap-2 p-4">
                                        <div className="w-8 h-8 rounded-full bg-lawn-200"></div>
                                        <div className="h-2 w-16 bg-lawn-300 rounded-full"></div>
                                    </div>
                                    <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2 p-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                        <div className="h-2 w-16 bg-slate-300 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="h-14 w-full bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                                    Get My Instant Quote
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CALL TO ACTION ── */}
            <section className="max-w-5xl mx-auto px-4 w-full">
                <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-lawn-600/20 to-emerald-600/20 pointer-events-none"></div>
                    <div className="relative z-10 space-y-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                            <Clock size={14} className="text-lawn-400" /> Start Saving Time Today
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">Stop chasing admin. <br className="hidden md:block" />Start growing your crew.</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Join over 450 landscaping businesses that have automated their growth with JobMow.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/login?isLogin=false"
                                className="w-full sm:w-auto px-12 py-5 bg-lawn-600 text-white font-black rounded-2xl hover:bg-lawn-700 transition-all hover:scale-105 shadow-2xl shadow-lawn-900/50"
                            >
                                Start My Free Trial
                            </Link>
                            <Link
                                to="/founders"
                                className="w-full sm:w-auto px-12 py-5 bg-white/10 text-white font-black rounded-2xl border border-white/10 hover:bg-white/20 transition-all"
                            >
                                Join Waitlist
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Features;
