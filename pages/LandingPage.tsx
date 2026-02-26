import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    CheckCircle,
    Leaf,
    Zap,
    ShieldCheck,
    Users,
    LayoutDashboard,
    Calendar,
    ClipboardCheck,
    TrendingUp,
    MessageSquare,
    Award,
    Globe,
    Sparkles
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const [isAnnual, setIsAnnual] = React.useState(false);

    return (
        <div className="flex flex-col gap-24 pb-20">
            {/* ── HERO SECTION ── */}
            <section className="relative pt-16 pb-12 overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-lawn-200 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 translate-y-24 -translate-x-24 w-80 h-80 bg-emerald-200 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-900/10 text-slate-800 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 backdrop-blur-md">
                        <Sparkles size={14} className="text-lawn-600" /> Built for Modern Lawn Care Pros
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        Automate your landscaping business <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-600 to-emerald-500">on autopilot.</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        The all-in-one operating system for lawn care professionals. Manage bookings, AI-powered quoting, and automated scheduling in one premium platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                        <Link
                            to="/login?isLogin=false"
                            className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 group"
                        >
                            Start Your Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/book"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-600 font-bold rounded-2xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                        >
                            Live Demo <div className="w-2 h-2 rounded-full bg-lawn-500 animate-pulse"></div>
                        </Link>
                    </div>

                    <div className="mt-20 relative animate-in fade-in zoom-in-95 duration-1000 delay-500">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent bottom-0 h-40 z-20"></div>
                        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_100px_-20px_rgba(0,0,0,0.12)] border border-slate-100 overflow-hidden">
                            <div className="bg-slate-900 px-6 py-4 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                                </div>
                                <div className="mx-auto text-[10px] text-slate-500 font-bold uppercase tracking-widest">JobMow Pro Dashboard</div>
                            </div>
                            <div className="p-2 bg-slate-100/50">
                                <img
                                    src="/dashboard-mockup.png"
                                    alt="JobMow Dashboard Mockup"
                                    className="w-full rounded-2xl shadow-inner border border-slate-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── DASHBOARD PREVIEW SECTION ── */}
            <section className="bg-white py-24 border-y border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-lawn-50/30 -skew-x-12 translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 space-y-10 order-2 lg:order-1">
                            <div className="space-y-4">
                                <h2 className="text-xs font-black text-lawn-600 uppercase tracking-[0.3em]">Inside look</h2>
                                <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">Crafted for clarity. <br />Engineered for speed.</h3>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { title: "One-Click Scheduling", desc: "Our intuitive calendar lets you move jobs around and optimize routes with simple drag-and-drop actions.", icon: <Calendar className="text-lawn-600" /> },
                                    { title: "Real-time Profit Heatmaps", desc: "Visualize exactly where your most profitable jobs are located across the city in real-time.", icon: <TrendingUp className="text-emerald-600" /> },
                                    { title: "Automated Customer SMS", desc: "Keep your clients in the loop with automated arrival notifications and after-care instructions.", icon: <MessageSquare className="text-blue-600" /> }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 group">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-lawn-50 group-hover:text-lawn-600 transition-colors">
                                            {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                                            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4">
                                <Link to="/features" className="inline-flex items-center gap-2 text-lawn-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                                    Explore all features <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>

                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <div className="relative group">
                                {/* Main Dashboard Screen */}
                                <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200 transform group-hover:-translate-y-2 transition-transform duration-700">
                                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        </div>
                                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Main Dashboard</div>
                                    </div>
                                    <img
                                        src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=2000"
                                        alt="Main Dashboard Screen"
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Secondary Screen - Mobile */}
                                <div className="absolute -bottom-10 -right-10 w-48 z-20 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900 transform group-hover:rotate-2 group-hover:translate-x-4 transition-all duration-700 hidden md:block">
                                    <img
                                        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800"
                                        alt="Mobile App View"
                                        className="w-full h-auto"
                                    />
                                </div>

                                {/* Third Screen - Calendar */}
                                <div className="absolute -top-10 -left-10 w-64 z-0 rounded-[1.5rem] overflow-hidden shadow-xl border border-slate-200 opacity-80 group-hover:opacity-100 group-hover:-rotate-2 group-hover:-translate-x-4 transition-all duration-700 hidden lg:block">
                                    <img
                                        src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1000"
                                        alt="Schedule View"
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES GRID ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-black text-lawn-600 uppercase tracking-[0.3em] mb-4">Supercharged Workflow</h2>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tight">Everything you need to scale up.</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            title: "AI Smart Quoting",
                            description: "Our proprietary AI analyzes property data to provide instant, profitable quotes to your customers within 60 seconds.",
                            icon: <Zap className="text-amber-500" />,
                            color: "bg-amber-50"
                        },
                        {
                            title: "Autonomous Schedule",
                            description: "Drag-and-drop calendar that handles routing, recurrence, and travel optimization automatically.",
                            icon: <Calendar className="text-lawn-600" />,
                            color: "bg-lawn-50"
                        },
                        {
                            title: "Instant Invoicing",
                            description: "Collect payments via Stripe the moment a job is completed. No more chasing late checks.",
                            icon: <TrendingUp className="text-emerald-600" />,
                            color: "bg-emerald-50"
                        },
                        {
                            title: "Customer CRM",
                            description: "Maintain a professional database of every client, property detail, and service history.",
                            icon: <Users className="text-blue-600" />,
                            color: "bg-blue-50"
                        },
                        {
                            title: "Lead Magnet Toolkit",
                            description: "Built-in marketing pages designed to capture high-intent leads and convert them into customers.",
                            icon: <Award className="text-purple-600" />,
                            color: "bg-purple-50"
                        },
                        {
                            title: "Business Intelligence",
                            description: "Real-time dashboards showing profit heatmaps, expense ratios, and revenue forecasts.",
                            icon: <LayoutDashboard className="text-indigo-600" />,
                            color: "bg-indigo-50"
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-lawn-200 hover:shadow-2xl hover:shadow-lawn-100/50 transition-all duration-500">
                            <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                            <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── VALUE STEPS section ── */}
            <section className="bg-slate-900 py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="grid grid-cols-12 h-full w-full">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="border-r border-white h-full last:border-0"></div>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">How it works</h3>
                                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">Focus on the grass. <br />We'll handle the rest.</h2>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Set your pricing", desc: "Input your service rates and lawn size rules into your customized dashboard." },
                                    { step: "02", title: "Launch your widget", desc: "Embed your booking portal on your website or use your JobMow hosted page." },
                                    { step: "03", title: "Watch the jobs roll in", desc: "Get notified as customers book. Our AI handles the quoting and scheduling." }
                                ].map((s, idx) => (
                                    <div key={idx} className="flex gap-6">
                                        <div className="text-3xl font-black text-white/20 select-none">{s.step}</div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
                                            <p className="text-slate-400 max-w-sm leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-lawn-500 to-emerald-600 rounded-[3rem] p-1 shadow-2xl">
                                <div className="bg-slate-900 rounded-[2.8rem] overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&q=80&w=1200"
                                        alt="Landscape Professional using tablet"
                                        className="w-full opacity-80 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal transition-all duration-1000"
                                    />
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl max-w-[240px] animate-bounce-subtle">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm">Revenue Up 42%</div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%] rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING SECTION ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="text-center mb-12 space-y-4">
                    <h2 className="text-xs font-black text-lawn-600 uppercase tracking-[0.3em]">Scalable Pricing</h2>
                    <h3 className="text-4xl font-black text-slate-900">Choose the plan that fits.</h3>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="bg-slate-100 p-1.5 rounded-full inline-flex items-center">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Annually <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full tracking-widest">Save 20%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Starter",
                            priceMonthly: "£29",
                            priceAnnual: "£24",
                            desc: "Perfect for solo pros starting out.",
                            features: ["Up to 50 active jobs", "Manual Quoting", "Basic Scheduling", "Email Support"],
                            cta: "Start Basic",
                            recommended: false
                        },
                        {
                            name: "Professional",
                            priceMonthly: "£79",
                            priceAnnual: "£64",
                            desc: "The sweet spot for growing teams.",
                            features: ["Unlimited active jobs", "AI Smart Quoting", "Route Optimization", "SMS Notifications", "Priority Support"],
                            cta: "Start Pro Trial",
                            recommended: true
                        },
                        {
                            name: "Enterprise",
                            priceMonthly: "£199",
                            priceAnnual: "£159",
                            desc: "For multi-van landscaping fleets.",
                            features: ["Custom Integrations", "Fleet Tracking", "Dedicated Account Manager", "White-label Portal", "24/7 Phone Support"],
                            cta: "Contact Sales",
                            recommended: false
                        }
                    ].map((plan, idx) => (
                        <div key={idx} className={`relative p-10 rounded-[2.5rem] border-2 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${plan.recommended ? 'border-transparent bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl shadow-slate-900/20 z-10' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                            {plan.recommended && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-lawn-500 to-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h4 className={`text-xl font-bold mb-2 ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h4>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-black ${plan.recommended ? 'text-white' : 'text-slate-900'}`}>{isAnnual ? plan.priceAnnual : plan.priceMonthly}</span>
                                    <span className={`font-bold ${plan.recommended ? 'text-slate-400' : 'text-slate-400'}`}>/month</span>
                                </div>
                                <p className={`text-sm mt-4 ${plan.recommended ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                            </div>

                            <div className="space-y-5 mb-10 flex-1">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle size={18} className={plan.recommended ? 'text-lawn-400' : 'text-slate-300'} />
                                        <span className={`text-sm font-medium ${plan.recommended ? 'text-slate-200' : 'text-slate-600'}`}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/login?isLogin=false"
                                className={`w-full py-4 px-6 rounded-2xl font-black text-center transition-all ${plan.recommended ? 'bg-lawn-500 text-white hover:bg-lawn-400 shadow-xl shadow-lawn-900/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="bg-lawn-50/50 py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-6">
                            <div className="w-16 h-1 w-bg-lawn-600"></div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Trusted by hundreds of <br />landscaping businesses.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed italic border-l-4 border-lawn-600 pl-6">
                                "JobMow literally halved my admin time. The AI quote widget on my site is closing leads while I'm out in the field. It's the best investment I've made for my company this year."
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="Avatar" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">David Henderson</div>
                                    <div className="text-sm text-slate-500 font-medium">Owner, Henderson Lawn & Garden</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { label: "Bookings", val: "12k+" },
                                { label: "Active Pros", val: "450+" },
                                { label: "Admin Hours Saved", val: "85k" },
                                { label: "Average ROI", val: "4.2x" }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-lawn-100 shadow-sm transition-transform hover:-translate-y-2 duration-500">
                                    <div className="text-3xl font-black text-lawn-600 mb-1">{stat.val}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="max-w-5xl mx-auto px-4 w-full">
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-lawn-500 rounded-full blur-[100px] opacity-20 -translate-y-32 translate-x-32 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Ready to reclaim your <br />evenings and weekends?</h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">Join the waitlist or start your 14-day free trial today. No credit card required.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/login?isLogin=false"
                                className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all hover:scale-105"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                to="/founders"
                                className="w-full sm:w-auto px-12 py-5 bg-slate-800 text-white font-black rounded-2xl border border-white/10 hover:bg-slate-700 transition-all"
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

export default LandingPage;
