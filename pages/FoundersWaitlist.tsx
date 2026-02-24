
import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Truck, Calendar, CreditCard, MapPin, FileText, Star, Users, Zap, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FoundersWaitlist: React.FC = () => {
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [crewSize, setCrewSize] = useState('1-3');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('leads')
                .insert({
                    type: 'founders_waitlist',
                    name: businessName, // Using businessName as the primary name
                    email,
                    business_name: businessName,
                    crew_size: crewSize
                });

            if (error) throw error;

            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error submitting waitlist:', error);
            // Optionally show error
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-lawn-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">You're on the list!</h2>
                    <p className="text-slate-600 mb-6">
                        Thanks for joining the JobMow Founders Club waitlist. We'll be in touch soon with your exclusive access.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-lawn-600 font-medium hover:text-lawn-700 hover:underline"
                    >
                        Back to site
                    </button>
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400">JobMow - Built for UK Lawn Care</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="font-sans text-slate-900 antialiased bg-white">
            {/* Header / Hero Section */}
            <header className="relative bg-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>
                {/* Abstract lawn pattern overlay */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                        <span className="text-yellow-300 text-xs font-bold tracking-wide uppercase">Founders Access Only</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-5xl leading-tight">
                        Spend Less Time in the Van. <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-400 to-emerald-300">More Time on the Mower.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl leading-relaxed">
                        The all-in-one job management system built specifically for UK lawn care and landscaping businesses.
                    </p>

                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                        <a href="#join-waitlist" className="w-full bg-lawn-600 hover:bg-lawn-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-lawn-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                            Join the Founders Waitlist <ArrowRight className="w-5 h-5" />
                        </a>
                        <p className="text-sm text-slate-400 font-medium">Limited to the first 50 UK businesses for 50% off for life.</p>
                    </div>
                </div>
            </header>

            {/* The "Problem" Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Software shouldn't be a "second job."</h2>
                    <div className="prose prose-lg mx-auto text-slate-600">
                        <p className="mb-6">
                            Most job management tools are built in the US. They don't understand <strong>UK VAT</strong>, they don't handle <strong>British postcodes</strong>, and they make recurring garden maintenance feel like an afterthought.
                        </p>
                        <p className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic font-medium text-slate-700">
                            "You’re either stuck with 'nearly right' American software or a messy pile of spreadsheets and paper diaries."
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                            JobMow is different.
                        </p>
                    </div>
                </div>
            </section>

            {/* The "Features" Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-lawn-600 font-semibold tracking-wide uppercase mb-2">The UK Advantage</h2>
                        <h3 className="text-3xl md:text-5xl font-bold text-slate-900">Built for the way you work in the UK</h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <span className="text-2xl font-bold">🇬🇧</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">UK-First Admin</h4>
                            <p className="text-slate-600">
                                Proper VAT-ready invoicing, UK date formats, and postcode-accurate address lookups. No more "Zip Codes".
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Recurring Round Mastery</h4>
                            <p className="text-slate-600">
                                Effortlessly manage weekly, fortnightly, or 4-weekly maintenance schedules. Automated rollover for rain days.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Automated Collections</h4>
                            <p className="text-slate-600">
                                Integrated with <span className="font-semibold text-indigo-600">GoCardless</span> and <span className="font-semibold text-indigo-600">Stripe</span>. Set up a maintenance plan once and get paid automatically the moment the job is done.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Route Planning</h4>
                            <p className="text-slate-600">
                                Stop zig-zagging across town. JobMow optimises your day by postcode to save you fuel and time.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Professional Quotes</h4>
                            <p className="text-slate-600">
                                Send branded PDF quotes via WhatsApp or Email in seconds. Win more work with professional looking estimates.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The "Founders Club" Offer */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-lawn-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-yellow-500/20 component border border-yellow-500/40 rounded-full px-3 py-1 mb-6 text-yellow-300 font-bold text-sm uppercase tracking-wider">
                                <Star className="w-4 h-4 fill-yellow-300" /> Exclusive Invitation
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why join the Waitlist?</h2>
                            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                                We are launching JobMow to a select group of UK operators first. By joining the waitlist today, you aren't just getting software—you’re helping us build the future of the UK lawn care industry.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 flex-shrink-0">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-1">50% Discount for Life</h4>
                                        <p className="text-slate-400">Lock in our lowest ever price. It will never increase for you, even as we add more features.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-lawn-500/20 flex items-center justify-center text-lawn-400 flex-shrink-0">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-1">Direct Line to the Founder</h4>
                                        <p className="text-slate-400">You’ll have a direct say in the features we build next.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-1">Early Beta Access</h4>
                                        <p className="text-slate-400">Get your business moved over and running before the peak season hits.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Final CTA Form */}
                        <div id="join-waitlist" className="bg-white rounded-2xl p-8 shadow-2xl text-slate-900">
                            <h3 className="text-2xl font-bold mb-2">Ready to ditch the "Admin Sundays"?</h3>
                            <p className="text-slate-500 mb-8">Join the waitlist now to secure your spot in the Founders Club.</p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                                    <input
                                        type="text"
                                        id="businessName"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 transition-colors"
                                        placeholder="e.g. Green Gardens Ltd"
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 transition-colors"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="crewSize" className="block text-sm font-medium text-slate-700 mb-1">Number of Crews</label>
                                    <select
                                        id="crewSize"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 transition-colors bg-white"
                                        value={crewSize}
                                        onChange={(e) => setCrewSize(e.target.value)}
                                    >
                                        <option value="Solo">Solo Operator</option>
                                        <option value="1-3">1-3 Crews</option>
                                        <option value="4+">4+ Crews</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-lawn-600 hover:bg-lawn-500 text-white font-bold py-4 px-6 rounded-lg shadow-lg shadow-lawn-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed text-lg mt-4"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            SECURE MY FOUNDER DISCOUNT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-400 mt-4">
                                    No credit card required. 100% free to join the waitlist.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Trust Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="relative p-10 bg-white rounded-3xl shadow-xl border border-slate-100">
                        <div className="absolute top-0 left-0 transform -translate-x-4 -translate-y-4 text-lawn-200">
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.01699V21H14.017ZM12.017 14H9.01699V11.0001H12.017C12.5693 11.0001 13.017 11.4478 13.017 12.0001C13.017 12.5524 12.5693 13.0001 12.017 13.0001V14ZM12.017 9H9.01699V6H12.017C12.5693 6 13.017 6.44772 13.017 7C13.017 7.55228 12.5693 8 12.017 8V9ZM14.017 4H7.01699V23H14.017C15.1216 23 16.017 22.1046 16.017 21V19.0001C16.5693 19.0001 17.017 18.5524 17.017 18.0001C17.017 17.4478 16.5693 17.0001 16.017 17.0001V15.0001C16.5693 15.0001 17.017 14.5524 17.017 14.0001C17.017 13.4478 16.5693 13.0001 16.017 13.0001V11.0001C16.5693 11.0001 17.017 10.5524 17.017 10.0001C17.017 9.44782 16.5693 9.0001 16.017 9.0001V7C16.017 5.89543 15.1216 5 14.017 5V4Z" className="hidden" /> {/* This was a fallback path, removing for cleaner quote icon */}
                                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                            </svg>
                        </div>
                        <p className="text-xl md:text-2xl text-slate-800 font-medium italic mb-6 leading-relaxed">
                            "I was spending 6 hours a week on quotes and invoices. JobMow is being built to solve exactly what we deal with on the ground in the UK. It’s a game-changer."
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80" alt="Local Pro" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-slate-900">David M.</div>
                                <div className="text-sm text-slate-500">Local Lawn Care Pro, Cheshire</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-white border-t border-slate-100 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                    <p className="text-slate-400 text-sm">© 2026 JobMow. Built for UK Lawn Care Professionals.</p>
                </div>
            </footer>
        </div>
    );
};

export default FoundersWaitlist;
