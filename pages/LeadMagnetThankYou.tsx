
import React from 'react';
import { CheckCircle, ArrowRight, Zap, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const LeadMagnetThankYou: React.FC = () => {
    return (
        <div className="font-sans text-slate-900 antialiased min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden text-center relative">

                {/* Success Header */}
                <div className="bg-lawn-50 p-12 pb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-10 h-10 text-lawn-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Check your inbox!</h1>
                    <p className="text-slate-600 text-lg">Your <span className="font-semibold">2026 UK Lawn Care Toolkit</span> is on the way.</p>
                </div>

                {/* Upsell Section */}
                <div className="p-10 bg-white">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>

                        <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-600 fill-current" />
                            While you wait...
                        </h2>
                        <p className="text-slate-600 mb-4 leading-relaxed">
                            Spreadsheets are great, but <strong className="text-slate-900">JobMow</strong> can automate your entire business. Quotes, scheduling, invoicing, and customer management—all in one place.
                        </p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-green-500" /> No more late invoices
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-green-500" /> Eliminate "admin Sundays"
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Check className="w-4 h-4 text-green-500" /> Get paid faster
                            </div>
                        </div>

                        <Link to="/" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            Join the Waitlist for 50% Off <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <Link to="/" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
                        Return to Homepage
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-slate-400 text-sm">
                © 2026 JobMow. Built for UK Lawn Care Professionals.
            </div>
        </div>
    );
};

export default LeadMagnetThankYou;
