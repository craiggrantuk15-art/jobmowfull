import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Activity,
    Globe,
    Database,
    Zap,
    ShieldCheck,
    RefreshCcw,
    BarChart3,
    Calendar,
    ArrowRight
} from 'lucide-react';

const Status: React.FC = () => {
    const [isChecking, setIsChecking] = useState(true);
    const [lastChecked, setLastChecked] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsChecking(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const services = [
        { name: "Global API", icon: <Globe size={20} />, uptime: "99.98%" },
        { name: "Real-time Database", icon: <Database size={20} />, uptime: "100%" },
        { name: "AI Quoting Engine", icon: <Zap size={20} />, uptime: "99.95%" },
        { name: "Auth Services", icon: <ShieldCheck size={20} />, uptime: "100%" },
        { name: "Lead Engagement Hub", icon: <BarChart3 size={20} />, uptime: "99.99%" },
        { name: "Stripe Integration", icon: <RefreshCcw size={20} />, uptime: "100%" },
    ];

    const maintenance = [
        {
            title: "Scheduled Database Maintenance",
            date: "March 5, 2026 - 02:00 UTC",
            desc: "We will be performing routine maintenance on our primary database cluster. Expect 5-10 minutes of read-only access.",
            type: "upcoming"
        }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            {/* Header */}
            <div className="text-center mb-16 space-y-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all duration-500 ${isChecking
                    ? 'bg-blue-50 border-blue-100 text-blue-700'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}>
                    {isChecking ? (
                        <>
                            <Activity size={16} className="animate-spin" /> Checking System Status...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={16} /> All Systems Operational
                        </>
                    )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">System Status</h1>
                <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                    Real-time status of the JobMow infrastructure and services. <br />
                    <span className="text-xs uppercase font-black tracking-widest text-slate-300">Last checked: {lastChecked}</span>
                </p>
            </div>

            {/* Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {services.map((service, i) => (
                    <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:text-lawn-600 transition-colors">
                                {service.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{service.name}</h3>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{service.uptime} Uptime</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 font-bold text-sm px-3 py-1.5 rounded-full transition-all duration-700 ${isChecking ? 'opacity-20 translate-y-1' : 'opacity-100 translate-y-0 text-emerald-500 bg-emerald-50'}`}>
                            <CheckCircle2 size={14} /> Operational
                        </div>
                    </div>
                ))}
            </div>

            {/* Uptime History (Visual) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-xl text-slate-900">Uptime History</h3>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Last 90 Days</div>
                </div>

                <div className="space-y-6">
                    {["API Gateway", "Data Store", "Static Assets"].map((label, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                <span>{label}</span>
                                <span className="text-lawn-600">100%</span>
                            </div>
                            <div className="flex gap-1">
                                {Array.from({ length: 45 }).map((_, j) => {
                                    const isMinorIssue = (j + i) % 15 === 0;
                                    return (
                                        <div
                                            key={j}
                                            className={`flex-1 h-8 rounded-sm transition-all cursor-crosshair ${isMinorIssue ? 'bg-amber-400 opacity-60' : 'bg-emerald-500 opacity-80'} hover:opacity-100 hover:scale-y-110`}
                                            title={`Day ${j + 1}: ${isMinorIssue ? '99.4%' : '100.0%'} operational`}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <span>90 Days Ago</span>
                    <span>Today</span>
                </div>
            </div>

            {/* Maintenance */}
            <div className="space-y-6">
                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                    <Calendar size={20} className="text-slate-400" /> Scheduled Maintenance
                </h3>

                {maintenance.length > 0 ? (
                    maintenance.map((m, i) => (
                        <div key={i} className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] -translate-y-4 translate-x-4">
                                <Clock size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-4 uppercase tracking-widest">
                                    <AlertCircle size={14} /> Upcoming Maintenance
                                </div>
                                <h4 className="text-xl font-black text-slate-900 mb-2">{m.title}</h4>
                                <p className="text-sm font-bold text-amber-800 mb-4">{m.date}</p>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{m.desc}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">No scheduled maintenance at this time.</p>
                    </div>
                )}
            </div>

            {/* Footer Support */}
            <div className="mt-20 text-center">
                <p className="text-slate-500 text-sm mb-6">Experience an issue not listed here?</p>
                <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                    Open a Support Ticket <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
};

export default Status;
