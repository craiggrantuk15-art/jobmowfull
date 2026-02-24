import React from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Target,
    Leaf,
    Heart,
    ShieldCheck,
    Award,
    ArrowRight,
    MapPin,
    Trophy,
    Coffee
} from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="flex flex-col gap-24 pb-20">
            {/* ── HERO SECTION ── */}
            <section className="relative pt-20 pb-16 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-lawn-100 rounded-full blur-[120px] opacity-30"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[120px] opacity-40"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lawn-50 border border-lawn-100 text-lawn-700 text-xs font-black mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Heart size={14} className="fill-lawn-600 border-none" /> Our Mission
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        We're on a mission to <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lawn-600 to-emerald-600">Grow Better Businesses.</span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                        JobMow started from a simple observation: lawn care pros spend too much time in front of computers and not enough time doing what they love. We're here to change that.
                    </p>
                </div>
            </section>

            {/* ── OUR STORY ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="relative animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative">
                            <img
                                src="https://images.unsplash.com/photo-1591586120021-e978f7447e03?auto=format&fit=crop&q=80&w=1200"
                                alt="Lawn Care Professional"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white">
                                <div className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-lawn-300">Founded 2024</div>
                                <div className="text-2xl font-bold">Built by Pros, for Pros.</div>
                            </div>
                        </div>
                        {/* Floating Badge */}
                        <div className="absolute -top-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl max-w-[180px] animate-bounce-subtle">
                            <div className="text-lawn-600 font-black text-3xl mb-1">10k+</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-tight">Admin Hours Saved Per Month</div>
                        </div>
                    </div>

                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
                        <h2 className="text-xs font-black text-lawn-600 uppercase tracking-[0.3em]">The Story</h2>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">The JobMow Genesis</h3>
                        <div className="space-y-6 text-slate-500 text-lg leading-relaxed">
                            <p>
                                As a family of third-generation landscapers, we lived the "late-night admin" struggle. Calculating quotes at midnight, chasing invoices on weekends, and juggling spreadsheets while on site.
                            </p>
                            <p>
                                We realized that the software available was either too complex or didn't understand the unique nuances of the lawn care industry—like how lawn size, property type, and visit frequency radically change the bottom line.
                            </p>
                            <p>
                                In 2024, we set out to build **JobMow**: the world's most intelligent operating system for lawn care professionals. A platform that doesn't just manage data, but actually handles the hard work of quoting and scheduling for you.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div>
                                <div className="text-2xl font-black text-slate-900 mb-1">100%</div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Focused on Pros</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900 mb-1">24/7</div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">AI Support</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900 mb-1">UK</div>
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Based Team</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CORE VALUES ── */}
            <section className="bg-slate-900 py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em]">Our Foundation</h2>
                        <h3 className="text-4xl font-black text-white">The values that guide us.</h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "Simplicity Above All",
                                desc: "We believe professional tools should be intuitive. If a feature adds friction, we don't build it.",
                                icon: <Zap className="text-amber-400" />
                            },
                            {
                                title: "Pro-First Innovation",
                                desc: "We build for the person in the field. Every update starts with a 'How does this help them finish early?' check.",
                                icon: <Target className="text-lawn-400" />
                            },
                            {
                                title: "Radical Integrity",
                                desc: "We're прозрачный about our pricing, our data privacy, and our roadmap. No hidden fees, ever.",
                                icon: <ShieldCheck className="text-blue-400" />
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 group">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {React.cloneElement(value.icon as React.ReactElement, { size: 28 })}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">{value.title}</h4>
                                <p className="text-slate-400 leading-relaxed">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── THE TEAM section ── */}
            <section className="max-w-7xl mx-auto px-4 w-full">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-xs font-black text-lawn-600 uppercase tracking-[0.3em]">Meet the Squad</h2>
                    <h3 className="text-4xl font-black text-slate-900">The people behind the pixels.</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { name: "Alex Rivers", role: "CEO & Co-Founder", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" },
                        { name: "Sarah Chen", role: "Product Designer", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400" },
                        { name: "Marcus Thorne", role: "CTO", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" },
                        { name: "Jasmine Kaur", role: "Head of Success", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400" }
                    ].map((member, idx) => (
                        <div key={idx} className="group text-center">
                            <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-xl grayscale hover:grayscale-0 transition-all duration-700">
                                <img src={member.img} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                            <p className="text-sm text-slate-500 font-medium">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="max-w-5xl mx-auto px-4 w-full">
                <div className="bg-lawn-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-lawn-700 to-emerald-600 opacity-100"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Help us build the <br className="hidden md:block" />future of landscaping.</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link
                                to="/login?isLogin=false"
                                className="w-full sm:w-auto px-12 py-5 bg-white text-lawn-600 font-black rounded-2xl hover:bg-slate-50 transition-all hover:scale-105"
                            >
                                Join the Mission
                            </Link>
                            <a
                                href="mailto:hello@jobmow.pro"
                                className="w-full sm:w-auto px-12 py-5 bg-transparent text-white border border-white/20 font-black rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Re-using Zap from Lucide for internal component
const Zap = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" />
    </svg>
);

export default AboutUs;
