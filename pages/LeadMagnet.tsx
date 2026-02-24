
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck, Download, Calculator, MapPin, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PoundIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 7c0-5.333-8-5.333-8 0" />
        <path d="M10 7v14" />
        <path d="M6 21h12" />
        <path d="M6 13h10" />
    </svg>
);

const LeadMagnet: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('leads')
                .insert({
                    type: 'lead_magnet',
                    name,
                    email
                });

            if (error) throw error;

            navigate('/toolkit/thank-you');
        } catch (error) {
            console.error('Error submitting lead:', error);
            // Optionally show error to user
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans text-slate-900 antialiased">
            {/* Header / Hero Section */}
            <header className="relative bg-slate-900 text-white overflow-hidden pb-20 pt-16">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/95"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 bg-lawn-500/10 border border-lawn-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-lawn-400 animate-pulse"></span>
                        <span className="text-lawn-300 text-xs font-semibold tracking-wide uppercase">New for 2026 Season</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
                        Stop Guessing Your Prices. <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-400 to-emerald-300">Start Running a Profitable UK Lawn Care Business.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl leading-relaxed">
                        Download the free <span className="font-semibold text-white">2026 UK Lawn Care Toolkit</span>. Calculate your true hourly rate, quote with confidence, and organise your recurring rounds in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <a href="#get-the-toolkit" className="flex-1 bg-lawn-600 hover:bg-lawn-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-lawn-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                            Get The Free Toolkit <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lawn-500" />
                            <span>UK VAT Rules</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lawn-500" />
                            <span>British Postcodes</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-lawn-500" />
                            <span>Profit Margins</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* The Visual / Offer Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            {/* Placeholder for Mockup Image - Using a CSS representation if image gen fails, but passing a placeholder for now */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200 aspect-[4/3] group">
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
                                    {/* This would be the generated image */}
                                    <div className="text-center p-8">
                                        <div className="bg-white p-4 rounded-xl shadow-lg mb-4 inline-block transform rotate-[-2deg] border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                <span className="text-xs text-slate-400 font-mono ml-2">JobMow_Toolkit_2026.xlsx</span>
                                            </div>
                                            <div className="space-y-2 w-64">
                                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                                <div className="h-4 bg-lawn-50 rounded w-5/6"></div>
                                                <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                                            </div>
                                        </div>
                                        <div className="relative z-10 bg-slate-900 text-white px-6 py-2 rounded-lg shadow-xl text-sm font-medium transform translate-y-[-10px]">
                                            Includes Customer Dashboard & Roundup
                                        </div>
                                    </div>
                                </div>
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">What’s inside the Toolkit:</h2>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">The Business Health Calculator</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Discover your generic "Break-Even" point and set a UK hourly rate that actually pays the bills. Stop working for turnover and start working for profit.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 text-lawn-600 flex items-center justify-center">
                                        <PoundIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">The 'Mow & Strim' Quoting Engine</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Price up jobs on-site instantly. Includes UK VAT toggles and green waste removal fees so you never undercharge again.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">The Fortnightly Round Planner</h3>
                                        <p className="text-slate-600 leading-relaxed">
                                            Never miss a recurring customer. Track "Due This Week" jobs and visualize your daily travel time to optimize your route.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <section className="py-20 bg-white border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-8">Why This Matters</h2>
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg text-left mb-10 shadow-sm">
                        <p className="text-lg text-red-800 font-medium italic">
                            "Most UK lawn care operators are working for less than minimum wage after expenses."
                        </p>
                    </div>

                    <div className="prose prose-lg text-slate-600 mx-auto text-left">
                        <p className="mb-6">
                            Between van insurance, rising fuel costs, and equipment repairs, it’s easy to lose track of your margins. If you aren't strictly charging for travel time, waste disposal, and admin, you're losing money every single day.
                        </p>
                        <p className="mb-6">
                            Generic American software handles dollars and 'zip codes'. <strong className="text-slate-900">This toolkit was built specifically for the UK market</strong>—using British postcodes, UK tax rules (including VAT thresholds), and the terminology we actually use on the job.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Opt-in Form Section */}
            <section id="get-the-toolkit" className="py-24 bg-slate-900 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-lawn-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300">
                        <div className="p-8 sm:p-10">
                            <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">Send me the free Toolkit</h2>
                            <p className="text-slate-500 text-center mb-8">Join 1,000+ UK Lawn Care Pros who are profitable.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 transition-colors"
                                        placeholder="e.g. Dave"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 transition-colors"
                                        placeholder="dave@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-lawn-600 hover:bg-lawn-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-lawn-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            GET THE TOOLKIT NOW <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="w-4 h-4" />
                                <span>No spam. Just tools for UK lawn care pros.</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-500">
                                We respect your privacy. Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About the Creator / Trust Section */}
            <section className="py-16 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="w-16 h-16 bg-lawn-100 text-lawn-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LeafIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Built by the team behind JobMow</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        We’re on a mission to help UK lawn care and landscaping businesses ditch the paperwork and get back to the work they love. This spreadsheet is the first step to taking control of your business.
                    </p>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm">
                        © 2026 JobMow. Built for UK Lawn Care Professionals.
                    </div>
                    <div className="flex gap-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Simple Leaf Icon for the Trust Section
const LeafIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
);

export default LeadMagnet;
