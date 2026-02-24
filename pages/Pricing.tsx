import React from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle,
    XCircle,
    Zap,
    HelpCircle,
    ArrowRight,
    ShieldCheck,
    Star,
    Users,
    LayoutDashboard,
    MessageSquare
} from 'lucide-react';

const Pricing: React.FC = () => {
    const [isAnnual, setIsAnnual] = React.useState(false);

    const tiers = [
        {
            name: "Starter",
            priceMonthly: "£29",
            priceAnnual: "£24",
            desc: "Perfect for solo pros starting out.",
            features: [
                { text: "Up to 50 active jobs", included: true },
                { text: "Manual Quoting", included: true },
                { text: "Basic Scheduling", included: true },
                { text: "Email Support", included: true },
                { text: "AI Smart Quoting", included: false },
                { text: "Route Optimization", included: false },
                { text: "SMS Notifications", included: false },
            ],
            cta: "Start Basic",
            recommended: false
        },
        {
            name: "Professional",
            priceMonthly: "£79",
            priceAnnual: "£64",
            desc: "The sweet spot for growing teams.",
            features: [
                { text: "Unlimited active jobs", included: true },
                { text: "AI Smart Quoting", included: true },
                { text: "Route Optimization", included: true },
                { text: "SMS Notifications", included: true },
                { text: "Priority Support", included: true },
                { text: "Custom Integrations", included: false },
                { text: "Fleet Tracking", included: false },
            ],
            cta: "Start Pro Trial",
            recommended: true
        },
        {
            name: "Enterprise",
            priceMonthly: "£199",
            priceAnnual: "£159",
            desc: "For multi-van landscaping fleets.",
            features: [
                { text: "Unlimited active jobs", included: true },
                { text: "AI Smart Quoting", included: true },
                { text: "Route Optimization", included: true },
                { text: "Custom Integrations", included: true },
                { text: "Fleet Tracking", included: true },
                { text: "Dedicated Account Manager", included: true },
                { text: "24/7 Phone Support", included: true },
            ],
            cta: "Contact Sales",
            recommended: false
        }
    ];

    const faqs = [
        {
            q: "Is there a free trial?",
            a: "Yes! All plans come with a 14-day free trial. No credit card is required to start testing the Professional features."
        },
        {
            q: "Can I change plans later?",
            a: "Absolutely. You can upgrade or downgrade your plan at any time from your billing settings. Changes are prorated immediately."
        },
        {
            q: "What is AI Smart Quoting?",
            a: "Our AI uses satellite imagery and historical property data to calculate the exact square footage of a lawn and provide an instant, profitable quote based on your pricing rules."
        },
        {
            q: "Does JobMow process payments?",
            a: "We integrate directly with Stripe, allowing you to collect credit card payments, set up recurrent billing, and get paid faster than ever."
        }
    ];

    return (
        <div className="flex flex-col gap-24 pb-20 pt-16">
            {/* Hero */}
            <section className="max-w-4xl mx-auto text-center px-4">
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                    Simple, transparent <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-600 to-emerald-600">pricing for pros.</span>
                </h1>
                <p className="text-xl text-slate-500 mb-12 leading-relaxed">
                    From solo mower to multi-van enterprise, JobMow scales with your business. No hidden fees, no long-term contracts.
                </p>
            </section>

            {/* Tiers */}
            <section className="max-w-7xl mx-auto px-4 w-full">
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
                    {tiers.map((plan, idx) => (
                        <div
                            key={idx}
                            className={`relative p-10 rounded-[2.5rem] border-2 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${plan.recommended
                                ? 'border-transparent bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl shadow-slate-900/20 z-10'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                        >
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

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        {f.included ? (
                                            <CheckCircle size={18} className={plan.recommended ? 'text-lawn-400' : 'text-slate-300'} />
                                        ) : (
                                            <XCircle size={18} className={plan.recommended ? 'text-slate-700' : 'text-slate-200'} />
                                        )}
                                        <span className={`text-sm font-medium ${f.included ? (plan.recommended ? 'text-slate-200' : 'text-slate-600') : (plan.recommended ? 'text-slate-600 line-through' : 'text-slate-300 line-through')}`}>
                                            {f.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/login?isLogin=false"
                                className={`w-full py-4 px-6 rounded-2xl font-black text-center transition-all ${plan.recommended
                                    ? 'bg-lawn-500 text-white hover:bg-lawn-400 shadow-xl shadow-lawn-900/20'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison Table (Desktop Only) */}
            <section className="max-w-5xl mx-auto px-4 w-full hidden lg:block">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900">Compare features</h2>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest w-1/2">Feature</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-900 uppercase tracking-widest text-center">Starter</th>
                                <th className="px-8 py-6 text-xs font-black text-lawn-600 uppercase tracking-widest text-center">Pro</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-900 uppercase tracking-widest text-center">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {[
                                { label: "AI Quoting Engine", s: "Manual", p: "Autonomous", e: "Customizable" },
                                { label: "Daily Route Optimization", s: false, p: true, e: true },
                                { label: "Client CRM Management", s: true, p: true, e: true },
                                { label: "Stripe Payment Processing", s: "Basic", p: "Automated", e: "Advanced" },
                                { label: "Team Management", s: "1 User", p: "Up to 5", e: "Unlimited" },
                                { label: "Mobile App Access", s: true, p: true, e: true },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-slate-700">{row.label}</td>
                                    <td className="px-8 py-5 text-sm text-center font-medium text-slate-500">
                                        {typeof row.s === 'boolean' ? (row.s ? <CheckCircle className="mx-auto text-emerald-500" size={18} /> : <XCircle className="mx-auto text-slate-200" size={18} />) : row.s}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-center font-bold text-lawn-600">
                                        {typeof row.p === 'boolean' ? (row.p ? <CheckCircle className="mx-auto text-lawn-500" size={18} /> : <XCircle className="mx-auto text-slate-200" size={18} />) : row.p}
                                    </td>
                                    <td className="px-8 py-5 text-sm text-center font-medium text-slate-500">
                                        {typeof row.e === 'boolean' ? (row.e ? <CheckCircle className="mx-auto text-emerald-500" size={18} /> : <XCircle className="mx-auto text-slate-200" size={18} />) : row.e}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-slate-50 py-24 border-y border-slate-100">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-slate-500">Everything you need to know about the product and billing.</p>
                    </div>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group">
                                <div className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-lawn-50 text-lawn-600 flex items-center justify-center font-black text-sm">?</div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h4>
                                        <p className="text-slate-500 leading-relaxed text-sm">{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="max-w-5xl mx-auto px-4 w-full">
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-lawn-500 rounded-full blur-[100px] opacity-20 -translate-y-32 -translate-x-32 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative z-10 text-white">
                        <h2 className="text-4xl font-black mb-8 leading-tight">Start growing your <br />landscaping business today.</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/login?isLogin=false"
                                className="w-full sm:w-auto px-12 py-5 bg-lawn-600 text-white font-black rounded-2xl hover:bg-lawn-500 transition-all hover:scale-105 shadow-xl shadow-lawn-900/40"
                            >
                                Start 14-Day Free Trial
                            </Link>
                            <Link
                                to="/contact"
                                className="w-full sm:w-auto px-12 py-5 bg-slate-800 text-white font-black rounded-2xl border border-white/10 hover:bg-slate-700 transition-all"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
