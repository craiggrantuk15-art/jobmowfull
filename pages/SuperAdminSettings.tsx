import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Globe, ShieldAlert, Zap, Bell, Server, Layout, CheckCircle2, ChevronRight, Settings, Clock, CreditCard, Megaphone, Shield, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlanLevel, PlanFeatures } from '../types';

const SuperAdminSettings: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        maintenanceMode: false,
        platformAnnouncements: '',
        defaultTrialPeriod: 14,
        requireEmailVerification: true,
        enableBetaFeatures: false,
        weatherApiKey: '',
        weatherCity: '',
        postcodeApiUrl: 'https://api.ideal-postcodes.co.uk/v1',
        platformSubscriptionPriceStarter: 29,
        googleMapsApiKey: '',
        idealPostcodesApiKey: ''
    });

    const [planFeatures, setPlanFeatures] = useState<Record<string, PlanFeatures>>({
        [PlanLevel.STARTER]: { ai_quoting: false, route_optimization: false, sms_notifications: false, unlimited_jobs: false, priority_support: false, custom_integrations: false, fleet_tracking: false, lawn_measurement: false },
        [PlanLevel.PRO]: { ai_quoting: false, route_optimization: false, sms_notifications: false, unlimited_jobs: false, priority_support: false, custom_integrations: false, fleet_tracking: false, lawn_measurement: false },
        [PlanLevel.ENTERPRISE]: { ai_quoting: false, route_optimization: false, sms_notifications: false, unlimited_jobs: false, priority_support: false, custom_integrations: false, fleet_tracking: false, lawn_measurement: false },
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setFetching(true);
        try {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*');

            if (error) throw error;

            if (data) {
                const newFormData = { ...formData };
                data.forEach(item => {
                    const key = item.key;
                    const value = item.value;

                    if (key === 'maintenance_mode') newFormData.maintenanceMode = value;
                    if (key === 'platform_announcements') newFormData.platformAnnouncements = value;
                    if (key === 'default_trial_period') newFormData.defaultTrialPeriod = value;
                    if (key === 'require_email_verification') newFormData.requireEmailVerification = value;
                    if (key === 'enable_beta_features') newFormData.enableBetaFeatures = value;
                    if (key === 'weather_api_key') newFormData.weatherApiKey = value;
                    if (key === 'weather_city') newFormData.weatherCity = value;
                    if (key === 'postcode_api_url') newFormData.postcodeApiUrl = value;
                    if (key === 'platform_subscription_price_starter') newFormData.platformSubscriptionPriceStarter = value;
                    if (key === 'google_maps_api_key') newFormData.googleMapsApiKey = value;
                    if (key === 'ideal_postcodes_api_key') newFormData.idealPostcodesApiKey = value;
                });
                setFormData(newFormData);
            }

            // Fetch Plan Features
            const { data: featureData, error: featureError } = await supabase
                .from('plan_features')
                .select('*');

            if (featureError) throw featureError;

            if (featureData) {
                const newPlanFeatures = { ...planFeatures };
                featureData.forEach(item => {
                    newPlanFeatures[item.plan_level] = item.features;
                });
                setPlanFeatures(newPlanFeatures);
            }
        } catch (err: any) {
            console.error("Failed to fetch platform settings:", err);
            setError("Failed to load settings. Please refresh.");
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);
        setError(null);
        try {
            const updates = [
                { key: 'maintenance_mode', value: formData.maintenanceMode },
                { key: 'platform_announcements', value: formData.platformAnnouncements },
                { key: 'default_trial_period', value: formData.defaultTrialPeriod },
                { key: 'require_email_verification', value: formData.requireEmailVerification },
                { key: 'enable_beta_features', value: formData.enableBetaFeatures },
                { key: 'weather_api_key', value: formData.weatherApiKey },
                { key: 'weather_city', value: formData.weatherCity },
                { key: 'postcode_api_url', value: formData.postcodeApiUrl },
                { key: 'platform_subscription_price_starter', value: formData.platformSubscriptionPriceStarter },
                { key: 'google_maps_api_key', value: formData.googleMapsApiKey },
                { key: 'ideal_postcodes_api_key', value: formData.idealPostcodesApiKey }
            ];

            if (error) throw error;

            // Save Plan Features
            for (const [level, features] of Object.entries(planFeatures)) {
                const { error: fError } = await supabase
                    .from('plan_features')
                    .upsert({ plan_level: level, features });
                if (fError) throw fError;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error("Failed to save platform settings", error);
            setError(error.message || "Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
            {/* ─── Hero Header ─────────────────────────────────────────── */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-10 overflow-hidden border border-white/10 shadow-2xl">
                    {/* Dynamic Background Elements */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Settings size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                        System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Settings</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Global Platform Configuration</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                to="/super-admin"
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all duration-300 flex items-center gap-2 group/btn"
                            >
                                <ChevronRight size={16} className="text-slate-400 group-hover/btn:-translate-x-1 transition-transform rotate-180" />
                                Back to Console
                            </Link>
                            <button
                                onClick={handleSave}
                                disabled={loading || fetching}
                                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-black text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2 group/save"
                            >
                                {loading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <Save size={18} className="group-hover/save:scale-110 transition-transform" />
                                )}
                                {loading ? 'SYNCING...' : 'PATCH SYSTEM'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* ─── Left Column (Policies & Pulse) ────────────────────────── */}
                <div className="xl:col-span-8 space-y-8">
                    {/* System Policies Card */}
                    <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ShieldAlert size={20} className="font-bold" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">System Policies</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group/item">
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">Maintenance</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Lockdown</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.maintenanceMode}
                                        onChange={e => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                                    />
                                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner" />
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 group/item">
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">Verification</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enforce Email Auth</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.requireEmailVerification}
                                        onChange={e => setFormData({ ...formData, requireEmailVerification: e.target.checked })}
                                    />
                                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Trial Period (Days)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                        <Server size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-300"
                                        value={formData.defaultTrialPeriod}
                                        onChange={e => setFormData({ ...formData, defaultTrialPeriod: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Starter Price (£)</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                                        <Zap size={18} />
                                    </div>
                                    <input
                                        type="number"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                                        value={formData.platformSubscriptionPriceStarter}
                                        onChange={e => setFormData({ ...formData, platformSubscriptionPriceStarter: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Feature Toggles Card */}
                    <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Layout size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Plan Entitlements</h2>
                        </div>

                        <div className="space-y-12">
                            {[PlanLevel.STARTER, PlanLevel.PRO, PlanLevel.ENTERPRISE].map((level) => (
                                <div key={level} className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                                            <div className={`w-2.5 h-2.5 rounded-full ${level === PlanLevel.STARTER ? 'bg-slate-300' : level === PlanLevel.PRO ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]'}`} />
                                            {level} tier
                                        </h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Manifest</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.keys(planFeatures[level]).map((feature) => (
                                            <div key={`${level}-${feature}`} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all group shadow-sm">
                                                <div>
                                                    <p className="font-bold text-slate-900 capitalize text-xs">{feature.replace(/_/g, ' ')}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Feature Flag</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={planFeatures[level][feature as keyof PlanFeatures]}
                                                        onChange={e => {
                                                            const newPlanFeatures = { ...planFeatures };
                                                            newPlanFeatures[level] = { ...newPlanFeatures[level], [feature]: e.target.checked };
                                                            setPlanFeatures(newPlanFeatures);
                                                        }}
                                                    />
                                                    <div className="w-10 h-6 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Right Column (APIs & Announcements) ───────────────────── */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Service Pulse Card */}
                    <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Globe size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Service Pulse</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">OpenWeather Intel</label>
                                <div className="mt-2 relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                                        <Zap size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="••••••••••••••••"
                                        value={formData.weatherApiKey}
                                        onChange={e => setFormData({ ...formData, weatherApiKey: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ideal Postcodes Auth</label>
                                <div className="mt-2 relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-blue-600 transition-colors">
                                        <Server size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        placeholder="••••••••••••••••"
                                        value={formData.idealPostcodesApiKey}
                                        onChange={e => setFormData({ ...formData, idealPostcodesApiKey: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                    MowVision™ Geo Intel
                                    <span className="bg-indigo-600 text-[8px] text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Enterprise</span>
                                </label>
                                <div className="mt-2 relative group/input">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                        <Globe size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-mono outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="••••••••••••••••"
                                        value={formData.googleMapsApiKey}
                                        onChange={e => setFormData({ ...formData, googleMapsApiKey: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Broadcast Center Card */}
                    <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                <Bell size={20} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Broadcast Center</h2>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-3xl text-xs font-bold min-h-[140px] outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 transition-all placeholder:text-slate-300"
                                placeholder="Enter global system broadcast message..."
                                value={formData.platformAnnouncements}
                                onChange={e => setFormData({ ...formData, platformAnnouncements: e.target.value })}
                            />
                            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Live Broadcast Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Modals */}
                    {error && (
                        <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-right-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black uppercase tracking-wider animate-in fade-in slide-in-from-right-4 flex items-center gap-3">
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle2 size={14} />
                            </div>
                            System Manifest Updated
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
