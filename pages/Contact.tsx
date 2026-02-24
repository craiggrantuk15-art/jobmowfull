import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Mail,
    Phone,
    MapPin,
    MessageSquare,
    Send,
    CheckCircle2,
    Twitter,
    Linkedin,
    Github,
    Globe,
    Clock,
    Sparkles,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

const Contact: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: submitError } = await supabase
                .from('support_tickets')
                .insert([{
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    status: 'new'
                }]);

            if (submitError) throw submitError;

            setSubmitted(true);
        } catch (err: any) {
            console.error('Error submitting ticket:', err);
            setError(err.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="flex flex-col pb-20 pt-16 gap-24">
            {/* Hero Header */}
            <section className="max-w-4xl mx-auto text-center px-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lawn-50 border border-lawn-100 text-lawn-700 text-xs font-bold mb-8 uppercase tracking-widest">
                    <Sparkles size={14} /> Get in touch
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
                    We're here to help you <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-600 to-emerald-600">grow.</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Questions about the product? Need help setting up your AI quoting? Our team is ready to assist you.
                </p>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="grid lg:grid-cols-5 gap-16 items-start">
                    {/* Contact Info */}
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-8">
                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-lawn-50 text-lawn-600 flex items-center justify-center shrink-0 border border-lawn-100 group-hover:scale-110 transition-transform">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">Email support</h4>
                                    <p className="text-slate-500 mb-3 text-sm">Our friendly team is here to help.</p>
                                    <a href="mailto:hello@jobmow.pro" className="text-lawn-600 font-black hover:underline">hello@jobmow.pro</a>
                                </div>
                            </div>

                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">Chat to us</h4>
                                    <p className="text-slate-500 mb-3 text-sm">Mon-Fri from 9am to 6pm.</p>
                                    <button className="text-blue-600 font-black hover:underline">Start a live chat</button>
                                </div>
                            </div>

                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">Office</h4>
                                    <p className="text-slate-500 mb-3 text-sm">Come say hello at our HQ.</p>
                                    <p className="text-slate-700 font-bold">123 Green Lane, London, UK</p>
                                </div>
                            </div>

                            <div className="flex gap-6 group">
                                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 transition-transform">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-1">Phone</h4>
                                    <p className="text-slate-500 mb-3 text-sm">Enterprise support line.</p>
                                    <a href="tel:+442012345678" className="text-amber-600 font-black hover:underline">+44 20 1234 5678</a>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Socials</h5>
                            <div className="flex items-center gap-4">
                                <a href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-lawn-600 hover:bg-lawn-50 transition-all shadow-sm"><Twitter size={20} /></a>
                                <a href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm"><Linkedin size={20} /></a>
                                <a href="#" className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all shadow-sm"><Github size={20} /></a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50">
                            {submitted ? (
                                <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-lawn-100 text-lawn-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4 font-outfit">Message sent!</h2>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
                                    >
                                        Send another message <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm flex items-center gap-3">
                                            <AlertCircle size={18} />
                                            {error}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="John"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Doe"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 outline-none transition-all placeholder:text-slate-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Message</label>
                                        <textarea
                                            required
                                            rows={5}
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="How can we help?"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        ></textarea>
                                    </div>

                                    <p className="text-xs text-slate-400 italic">
                                        By clicking send, you agree to our <a href="/#/legal" className="text-lawn-600 font-bold hover:underline">Privacy Policy</a>.
                                    </p>

                                    <button
                                        disabled={loading}
                                        className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Presence */}
            <section className="bg-white py-24 border-y border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-lawn-50/20 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Supporting pros globally.</h2>
                        <p className="text-slate-500">We have support representatives scattered across 3 timezones to ensure fast responses.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { city: "London", time: "GMT+0", active: true },
                            { city: "New York", time: "EST", active: true },
                            { city: "Los Angeles", time: "PST", active: true },
                            { city: "Sydney", time: "AEST", active: false },
                        ].map((loc, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${loc.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{loc.city}</span>
                                </div>
                                <div className="text-sm font-bold text-slate-900">{loc.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
