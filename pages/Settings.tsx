import React, { useState, useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { BusinessSettings } from '../types';
import { supabase } from '../lib/supabase';
// Add AlertCircle to the imported icons from lucide-react to fix missing reference error
import { Building, CreditCard, PoundSterling, Brain, ShieldCheck, Save, RefreshCcw, Download, CheckCircle, ChevronRight, Upload, Clock, Calendar, AlertTriangle, MapPin, Plus, Trash2, Fuel, Scissors, AlertCircle, Cloud, Sliders, Hash, Users, Activity, Zap, ArrowRight, Maximize2, Info } from 'lucide-react';
import TeamSettings from '../components/TeamSettings';

const Settings: React.FC = () => {
  const { settings, updateSettings, jobs, expenses, communications, loadData, subscriptionStatus, billingCustomerId, planLevel, isFeatureEnabled } = useJobs();
  const { organizationId } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'pricing' | 'schedule' | 'location' | 'ai' | 'team'>('profile');
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [newZone, setNewZone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleManualUpdate = (name: keyof BusinessSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (name: keyof BusinessSettings) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => {
      const currentDays = prev.workingDays || [];
      if (currentDays.includes(dayIndex)) {
        return { ...prev, workingDays: currentDays.filter(d => d !== dayIndex).sort() };
      } else {
        return { ...prev, workingDays: [...currentDays, dayIndex].sort() };
      }
    });
  };

  const handleAddZone = () => {
    if (newZone.trim() && !formData.zones.includes(newZone.trim())) {
      setFormData(prev => ({
        ...prev,
        zones: [...prev.zones, newZone.trim()]
      }));
      setNewZone('');
    }
  };

  const handleRemoveZone = (zone: string) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones.filter(z => z !== zone)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateSettings(formData);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (error: any) {
      console.error('Save failed:', error);
      setSaveError(error.message || 'Failed to save settings. Please check your connection.');
      // Auto-hide error after 5 seconds
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const exportData = () => {
    const data = { jobs, expenses, settings, communications };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobmow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        loadData(data);
        setFormData(data.settings || settings);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
        alert("Data imported successfully!");
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to parse the backup file. Please ensure it is a valid JSON file from JobMow.");
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Stripe Checkout
  const handleUpgrade = async () => {
    try {
      if (!organizationId) throw new Error("No organization selected.");

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_123',
          returnUrl: `${window.location.origin}/#/admin/settings`,
          organizationId
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setSaveError("Failed to initiate checkout: " + err.message);
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const handlePortal = async () => {
    try {
      if (!organizationId) throw new Error("No organization selected.");

      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: `${window.location.origin}/#/admin/settings`,
          organizationId
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setSaveError("Failed to open billing portal: " + err.message);
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: <Building size={18} /> },
    { id: 'billing', label: 'Billing & Subscription', icon: <CreditCard size={18} /> },
    { id: 'pricing', label: 'Pricing & Financials', icon: <PoundSterling size={18} /> },
    { id: 'schedule', label: 'Schedule & Hours', icon: <Clock size={18} /> },
    { id: 'location', label: 'Location & Weather', icon: <MapPin size={18} /> },
    { id: 'ai', label: 'Efficiency & Automation', icon: <Activity size={18} /> },
    { id: 'team', label: 'Team Members', icon: <Users size={18} /> },
  ];

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Global configuration for your business operations.</p>
        </div>
        {showSaveToast && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium animate-in slide-in-from-right-4 duration-300">
            <CheckCircle size={16} /> Settings saved!
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-sm font-medium animate-in slide-in-from-right-4 duration-300 border border-rose-200">
            <AlertTriangle size={16} /> {saveError}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${activeTab === tab.id
                  ? 'bg-lawn-50 text-lawn-700 border-lawn-600'
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  {tab.label}
                </div>
                <ChevronRight size={16} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">

              {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Company Details</h3>
                    <p className="text-sm text-slate-500">Basic information used for branding and communication.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Contact Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700">Business Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <CreditCard size={20} className="text-slate-400" />
                      Invoice Bank Details
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">These appear on your UK invoices for BACS transfers.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Bank Name</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <Building size={16} className="text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Sort Code</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash size={16} className="text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="sortCode"
                            value={formData.sortCode}
                            onChange={handleInputChange}
                            placeholder="00-00-00"
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Account Number</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Hash size={16} className="text-slate-400" />
                          </div>
                          <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Subscription Plan</h3>
                    <p className="text-sm text-slate-500">Manage your subscription and billing details.</p>
                  </div>

                  <div className="relative p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] border border-slate-700/50 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap size={120} className="text-lawn-400 rotate-12" />
                    </div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-lawn-500/10 rounded-full blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-tr from-lawn-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-lawn-500/20">
                            <ShieldCheck size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-black text-white tracking-tight">
                              {planLevel === 'starter' ? 'Free Starter' : planLevel === 'pro' ? 'Professional Pro' : 'Enterprise Elite'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {subscriptionStatus === 'active' ? (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-500/30">
                                  <CheckCircle size={10} /> Active Subscription
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 bg-slate-700 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest">Limited Access</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                          {planLevel === 'starter'
                            ? 'The essential toolkit for solo lawn care pros.'
                            : planLevel === 'pro'
                              ? 'Full access to AI-powered quoting, route optimization, and premium tools.'
                              : 'The complete enterprise solution for multiple crews and fleet tracking.'
                          }
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {[
                            { id: 'ai_quoting', label: 'AI Quoting' },
                            { id: 'route_optimization', label: 'Route Optimization' },
                            { id: 'sms_notifications', label: 'SMS Notifications' },
                            { id: 'lawn_measurement', label: 'Lawn Measurement' },
                            { id: 'unlimited_jobs', label: 'Unlimited Jobs' },
                          ].map(feature => (
                            <div
                              key={feature.id}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${isFeatureEnabled(feature.id as any)
                                  ? 'bg-lawn-500/20 text-lawn-400 border-lawn-500/30'
                                  : 'bg-slate-800 text-slate-600 border-slate-700/50 opacity-40'
                                }`}
                            >
                              {isFeatureEnabled(feature.id as any) && <CheckCircle size={10} className="inline mr-1" />}
                              {feature.label}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-left md:text-right shrink-0">
                        <div className="text-4xl font-black text-white flex items-baseline gap-1">
                          {subscriptionStatus === 'active' ? '£29' : '£0'}
                          <span className="text-sm text-slate-500 font-bold">/month</span>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3 md:justify-end">
                          {subscriptionStatus === 'active' ? (
                            <button
                              type="button"
                              onClick={handlePortal}
                              className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-black hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-2"
                            >
                              <CreditCard size={16} /> Manage Billing
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleUpgrade}
                              className="px-8 py-3 bg-gradient-to-r from-lawn-500 to-emerald-600 text-white rounded-xl text-sm font-black hover:from-lawn-400 hover:to-emerald-500 transition-all shadow-xl shadow-lawn-500/20 active:scale-95 flex items-center gap-2"
                            >
                              Upgrade to Pro <ArrowRight size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-4">Billing History</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                            <th className="px-4 py-3 font-medium text-slate-500 text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* Mock History */}
                          <tr className="bg-white">
                            <td className="px-4 py-3 text-slate-500" colSpan={4}>
                              <div className="text-center py-4">No working billing history available yet.</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Pricing Configuration</h3>
                    <p className="text-sm text-slate-500">The AI estimator uses these values to calculate customer quotes.</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-64 p-6 bg-lawn-50 rounded-2xl border border-lawn-100 flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lawn-600 shadow-sm mb-3">
                        <PoundSterling size={24} />
                      </div>
                      <label className="text-xs font-bold text-lawn-700 uppercase tracking-widest mb-1">Base Hourly Rate</label>
                      <div className="flex items-center text-3xl font-black text-slate-900">
                        <span className="text-lawn-500">{formData.currency}</span>
                        <input
                          type="number"
                          name="baseHourlyRate"
                          value={formData.baseHourlyRate}
                          onChange={handleInputChange}
                          className="w-20 bg-transparent text-center focus:outline-none focus:ring-0 border-none"
                        />
                      </div>
                      <p className="text-xs text-lawn-600 mt-2">Applied to estimated duration.</p>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                          <Scissors size={16} className="text-emerald-500" />
                          Visit / Lawn Size Pricing
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Small', key: 'smallLawnPrice' },
                            { label: 'Medium', key: 'mediumLawnPrice' },
                            { label: 'Large', key: 'largeLawnPrice' },
                            { label: 'Estate', key: 'estateLawnPrice' },
                          ].map((tier) => (
                            <div key={tier.key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tier.label}</div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 font-bold">{formData.currency}</span>
                                <input
                                  type="number"
                                  name={tier.key}
                                  value={(formData as any)[tier.key]}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-sm font-black"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                          <Plus size={16} className="text-blue-500" />
                          Extras & Add-on Fixed Rates
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { label: 'Fertilizer Application', key: 'extraFertilizerPrice' },
                            { label: 'Edging & Trimming', key: 'extraEdgingPrice' },
                            { label: 'Weeding Service', key: 'extraWeedingPrice' },
                            { label: 'Leaf Cleanup', key: 'extraLeafCleanupPrice' },
                          ].map((extra) => (
                            <div key={extra.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-600">{extra.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold text-sm">{formData.currency}</span>
                                <input
                                  type="number"
                                  name={extra.key}
                                  value={(formData as any)[extra.key]}
                                  onChange={handleInputChange}
                                  className="w-20 bg-white border border-slate-200 rounded px-3 py-1.5 text-sm font-black text-right"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Frequency Discounts (%)</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <div className="text-xs font-bold text-slate-400 mb-1">Weekly</div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                name="weeklyDiscount"
                                value={formData.weeklyDiscount}
                                onChange={handleInputChange}
                                className="w-12 text-center bg-white border border-slate-200 rounded text-sm font-bold"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <div className="text-xs font-bold text-slate-400 mb-1">Fortnightly</div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                name="fortnightlyDiscount"
                                value={formData.fortnightlyDiscount}
                                onChange={handleInputChange}
                                className="w-12 text-center bg-white border border-slate-200 rounded text-sm font-bold"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <div className="text-xs font-bold text-slate-400 mb-1">Monthly</div>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                name="monthlyDiscount"
                                value={formData.monthlyDiscount}
                                onChange={handleInputChange}
                                className="w-12 text-center bg-white border border-slate-200 rounded text-sm font-bold"
                              />
                              <span className="text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pricing Section */}
                  <div className="pt-8 border-t border-slate-100 space-y-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        Dynamic Rules & Surcharges
                      </h4>
                      <p className="text-xs text-slate-500">Enable automatic adjustments for difficult properties or travel distance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-white rounded-lg border border-slate-100 text-lawn-600 shadow-sm">
                            <Scissors size={20} />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800">Overgrown Grass</span>
                            <p className="text-[10px] text-slate-500">Applied when estimated time is exceeded.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-400 block tracking-widest">Threshold (Mins)</label>
                            <input
                              type="number"
                              name="overgrownThreshold"
                              value={formData.overgrownThreshold}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-lawn-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-400 block tracking-widest">Fee ({formData.currency})</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.currency}</span>
                              <input
                                type="number"
                                name="overgrownSurcharge"
                                value={formData.overgrownSurcharge}
                                onChange={handleInputChange}
                                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-lawn-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MowVision™ Satellite Measurement Configuration */}
                      <div className="md:col-span-2 p-6 bg-gradient-to-br from-lawn-600 to-emerald-700 rounded-3xl border border-lawn-500 shadow-xl shadow-lawn-900/10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all group-hover:scale-110">
                          <Maximize2 size={80} />
                        </div>
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-black tracking-tight uppercase">MowVision™ Sat-Link</h4>
                              <p className="text-xs text-lawn-100 font-bold uppercase tracking-widest opacity-80">Autonomous Satellite Measuring</p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                              <span className="text-[10px] font-black uppercase tracking-widest px-3">Active</span>
                              <input
                                type="checkbox"
                                name="enableLawnMeasurement"
                                checked={formData.enableLawnMeasurement}
                                onChange={handleInputChange}
                                className="w-12 h-6 rounded-full bg-white/20 appearance-none checked:bg-white transition-colors relative cursor-pointer
                                before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:checked:bg-lawn-600 before:transition-transform"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-lawn-200">Price per Unit Area</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lawn-300 font-black">{formData.currency}</span>
                                <input
                                  type="number"
                                  name="pricePerUnitArea"
                                  value={formData.pricePerUnitArea}
                                  onChange={handleInputChange}
                                  placeholder="0.00"
                                  className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-2xl text-xl font-black focus:border-white focus:bg-white/20 outline-none transition-all placeholder:text-white/30"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-lawn-200">Area Unit Specification</label>
                              <div className="flex gap-2">
                                {['m2', 'sqft'].map((unit) => (
                                  <button
                                    key={unit}
                                    type="button"
                                    onClick={() => handleManualUpdate('areaUnit', unit)}
                                    className={`flex-1 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border-2 ${formData.areaUnit === unit
                                      ? 'bg-white text-lawn-700 border-white shadow-lg'
                                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                      }`}
                                  >
                                    {unit === 'm2' ? 'Sq Meters' : 'Sq Feet'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-start gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Info size={16} className="text-white" />
                            </div>
                            <p className="text-[10px] text-lawn-100 font-medium leading-relaxed uppercase tracking-tight">
                              Enabling MowVision™ allows customers to use satellite imagery to measure their lawn. Pricing is calculated as (Area × Price per Unit) + Extras. This overrides the tiered lawn size pricing.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <MapPin size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-bold text-amber-900 block mb-1">Business Base Location (Postcode)</label>
                          <div className="flex gap-2 max-w-sm">
                            <input
                              type="text"
                              name="businessBasePostcode"
                              value={formData.businessBasePostcode}
                              onChange={handleInputChange}
                              placeholder="e.g. SW1A 1AA"
                              className="flex-1 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none uppercase font-mono font-bold"
                            />
                          </div>
                          <p className="text-[10px] text-amber-700 mt-1.5">This postcode is used as the starting point for calculating travel distances for your fuel surcharges.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-4">Financial Standards</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Tax Rate (VAT)</label>
                        <div className="relative">
                          <input
                            type="number"
                            name="taxRate"
                            value={formData.taxRate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-lawn-500 outline-none transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Set to 0 if not VAT registered.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Display Currency</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-lawn-500 outline-none transition-all"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">Used for all quotes and invoices.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {
                activeTab === 'schedule' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Schedule Settings</h3>
                      <p className="text-sm text-slate-500">Define your standard working hours to help with routing.</p>
                    </div>

                    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-white p-4 rounded-full shadow-sm text-blue-600">
                          <Calendar size={32} />
                        </div>
                        <div className="flex-1 w-full space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Day Start</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.scheduleStartHour}
                                name="scheduleStartHour"
                                onChange={handleInputChange}
                              >
                                {[6, 7, 8, 9, 10, 11].map(h => <option key={h} value={h}>{h}:00 AM</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-slate-700 mb-2">Day End</label>
                              <select
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.scheduleEndHour}
                                name="scheduleEndHour"
                                onChange={handleInputChange}
                              >
                                {[14, 15, 16, 17, 18, 19, 20].map(h => <option key={h} value={h}>{h > 12 ? h - 12 : h}:00 PM</option>)}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3">Working Days</label>
                            <div className="flex flex-wrap gap-2">
                              {DAYS.map((day, index) => {
                                const isActive = (formData.workingDays || []).includes(index);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => toggleDay(index)}
                                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${isActive
                                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                      : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-300'
                                      }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {
                activeTab === 'location' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Location & Weather</h3>
                      <p className="text-sm text-slate-500">Configure your business location and weather data source.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
                          <MapPin size={16} /> Regional Service Settings
                        </h4>
                        <p className="text-xs text-slate-500">Service area and regional configurations are managed by the platform administrator.</p>
                      </div>



                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Cloud size={16} className="text-blue-500" />
                          OpenWeatherMap Integration
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">Enter your API key to get real-time weather data for your dashboard widgets.</p>

                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">OpenWeather API Key</label>
                            <input
                              type="password"
                              name="weatherApiKey"
                              value={formData.weatherApiKey || ''}
                              onChange={handleInputChange}
                              placeholder="Paste your API key here"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Weather City / Region</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="weatherCity"
                                value={formData.weatherCity || ''}
                                onChange={handleInputChange}
                                placeholder="e.g. York, UK"
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  // Simple logic: if postcode is set, use it to suggest a city
                                  if (formData.businessBasePostcode) {
                                    // In a real app we'd call an API here, but for now we'll just set it to the postcode
                                    // or a generic placeholder if we don't have a lookup
                                    setFormData(prev => ({ ...prev, weatherCity: prev.businessBasePostcode }));
                                  }
                                }}
                                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors border border-slate-200"
                              >
                                Use Postcode
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400">Specify your location for accurate "Mowability" forecasts.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                          <Sliders size={16} className="text-lawn-600" />
                          Mowability Score Calibration
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">Customize how the "Mowability" score is calculated based on weather conditions.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-slate-700">Max Rain Chance</label>
                                <span className="text-xs font-bold text-slate-500">{formData.mowabilityRainThreshold || 70}%</span>
                              </div>
                              <input
                                type="range"
                                name="mowabilityRainThreshold"
                                min="0"
                                max="100"
                                value={formData.mowabilityRainThreshold || 70}
                                onChange={handleInputChange}
                                className="w-full accent-blue-500"
                              />
                              <p className="text-[10px] text-slate-400">Rain probability above this is considered "Unmowable".</p>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-slate-700">Max Wind Speed</label>
                                <span className="text-xs font-bold text-slate-500">{formData.mowabilityWindThreshold || 30} km/h</span>
                              </div>
                              <input
                                type="range"
                                name="mowabilityWindThreshold"
                                min="0"
                                max="100"
                                value={formData.mowabilityWindThreshold || 30}
                                onChange={handleInputChange}
                                className="w-full accent-slate-500"
                              />
                              <p className="text-[10px] text-slate-400">Winds above this speed reduce the score.</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-3">
                              <label className="text-sm font-bold text-slate-700">Temperature Units</label>
                              <div className="grid grid-cols-2 gap-3">
                                {['C', 'F'].map((unit) => (
                                  <button
                                    key={unit}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, temperatureUnit: unit as any })}
                                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center ${formData.temperatureUnit === unit || (!formData.temperatureUnit && unit === 'C')
                                      ? 'bg-blue-50 border-blue-600 text-blue-700'
                                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                      }`}
                                  >
                                    {unit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-slate-400">Choose how temperatures are displayed across the app.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Min Temp (°C)</label>
                                <input
                                  type="number"
                                  name="mowabilityTempMin"
                                  value={formData.mowabilityTempMin ?? 5}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Max Temp (°C)</label>
                                <input
                                  type="number"
                                  name="mowabilityTempMax"
                                  value={formData.mowabilityTempMax ?? 30}
                                  onChange={handleInputChange}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none"
                                />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400">Mowing is penalized if temperature is outside this range.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              {
                activeTab === 'ai' && (
                  <div className="space-y-10 animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">Efficiency & Automation</h3>
                      <p className="text-sm text-slate-500">Control the Profit Heatmap efficiency logic and automatic scheduling.</p>
                    </div>

                    {/* Heatmap Thresholds */}
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-rose-500" />
                        Profit Heatmap Efficiency Targets
                      </h4>
                      <p className="text-xs text-slate-500 mb-4">Set your hourly profit goals to customise the color coding on the Dashboard Heatmap.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700">High Target (Green Zone)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">{formData.currency}</span>
                            <input
                              type="number"
                              name="efficiencyThresholdHigh"
                              value={formData.efficiencyThresholdHigh}
                              onChange={handleInputChange}
                              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">Neighborhoods earning more than this per hour will show as <b>Emerald</b>.</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700">Low Warning (Red Zone)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">{formData.currency}</span>
                            <input
                              type="number"
                              name="efficiencyThresholdLow"
                              value={formData.efficiencyThresholdLow}
                              onChange={handleInputChange}
                              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400">Neighborhoods earning less than this will show as <b>Red</b> and trigger warnings.</p>
                        </div>
                      </div>
                    </div>

                    {/* Service Area Manager */}
                    <div className="pt-6 border-t border-slate-100">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3">Service Areas (Zones)</h4>
                      <p className="text-xs text-slate-500 mb-4">Define serviced neighborhoods to explicitly assign customers to areas.</p>

                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Westside"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            value={newZone}
                            onChange={(e) => setNewZone(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddZone())}
                          />
                          <button
                            type="button"
                            onClick={handleAddZone}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                          >
                            <Plus size={16} /> Add Area
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {formData.zones.map((zone) => (
                            <div key={zone} className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg group">
                              <span className="text-sm text-slate-700 font-medium">{zone}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveZone(zone)}
                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700">AI Communication Tone</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {['friendly', 'formal', 'direct'].map((tone) => (
                            <button
                              key={tone}
                              type="button"
                              onClick={() => setFormData({ ...formData, aiTone: tone as any })}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center capitalize ${formData.aiTone === tone
                                ? 'bg-lawn-50 border-lawn-600 text-lawn-700'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                }`}
                            >
                              {tone}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-4">
                        <div className="mt-1 p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
                          <RefreshCcw size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-indigo-900 text-sm">Auto-Create Recurring Jobs</h4>
                            <button
                              type="button"
                              onClick={() => handleToggle('autoCreateRecurring')}
                              className={`w-10 h-6 rounded-full transition-colors relative ${formData.autoCreateRecurring ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.autoCreateRecurring ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                          <p className="text-xs text-indigo-700/70 mt-1 leading-relaxed">
                            Automatically schedule the next visit based on frequency setting when a job is completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }

              {
                activeTab === 'team' && (
                  <div className="animate-in fade-in duration-300">
                    <TeamSettings />
                  </div>
                )
              }



            </div >

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setFormData(settings)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                Reset Changes
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={`px-6 py-2 bg-lawn-600 hover:bg-lawn-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-lawn-200 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <>
                    <RefreshCcw size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </form >
        </div >
      </div >
    </div >
  );
};

export default Settings;
