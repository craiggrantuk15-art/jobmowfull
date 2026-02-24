import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, Globe, ShieldAlert, Zap, Bell, Server } from 'lucide-react';

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
        postcodeApiUrl: 'https://api.postcodes.io'
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
                });
                setFormData(newFormData);
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
                { key: 'postcode_api_url', value: formData.postcodeApiUrl }
            ];

            const { error } = await supabase
                .from('platform_settings')
                .upsert(updates);

            if (error) throw error;

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
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-black text-slate-900 mb-2">Platform Settings</h1>
                <p className="text-slate-500">Configure global behavior and system-wide parameters.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* System Policy */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <ShieldAlert size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">System Policies</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900">Maintenance Mode</p>
                                    <p className="text-sm text-slate-500">Disable all customer-facing features except login.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-12 h-6 rounded-full bg-slate-200 appearance-none checked:bg-lawn-500 transition-colors relative cursor-pointer
                                    before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                                    checked={formData.maintenanceMode}
                                    onChange={e => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div>
                                    <p className="font-bold text-slate-900">Email Verification</p>
                                    <p className="text-sm text-slate-500">Require email confirmation for new signups.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-12 h-6 rounded-full bg-slate-200 appearance-none checked:bg-lawn-500 transition-colors relative cursor-pointer
                                    before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                                    checked={formData.requireEmailVerification}
                                    onChange={e => setFormData({ ...formData, requireEmailVerification: e.target.checked })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Trial Period (Days)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-lawn-500 outline-none font-bold"
                                    value={formData.defaultTrialPeriod}
                                    onChange={e => setFormData({ ...formData, defaultTrialPeriod: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                <Globe size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Service APIs</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">OpenWeatherMap API Key</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    placeholder="Enter API Key..."
                                    value={formData.weatherApiKey}
                                    onChange={e => setFormData({ ...formData, weatherApiKey: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Default Weather City</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="e.g. London, UK"
                                    value={formData.weatherCity}
                                    onChange={e => setFormData({ ...formData, weatherCity: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Postcode Lookup API URL</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                                    value={formData.postcodeApiUrl}
                                    onChange={e => setFormData({ ...formData, postcodeApiUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                <Bell size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Global Announcements</h3>
                        </div>

                        <textarea
                            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none h-32"
                            placeholder="System-wide banner message..."
                            value={formData.platformAnnouncements}
                            onChange={e => setFormData({ ...formData, platformAnnouncements: e.target.value })}
                        />
                        <p className="text-xs text-slate-400 mt-2">Maximum 255 characters. Leave empty to disable.</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lawn-500 rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Server size={18} className="text-lawn-400" /> System Health
                    </h4>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center text-slate-400">
                            <span>API Status</span>
                            <span className="text-lawn-400 font-bold">Operational</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                            <span>DB Engine</span>
                            <span className="text-white font-mono">PostgreSQL 15</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400">
                            <span>Region</span>
                            <span className="text-white">UK West</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading || fetching}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : fetching ? 'Loading...' : <><Save size={18} /> Save All Changes</>}
                </button>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                        Platform settings updated successfully!
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminSettings;
