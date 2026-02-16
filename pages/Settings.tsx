
import React, { useState, useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { BusinessSettings } from '../types';
// Add AlertCircle to the imported icons from lucide-react to fix missing reference error
import { Building, CreditCard, PoundSterling, Brain, ShieldCheck, Save, RefreshCcw, Download, CheckCircle, ChevronRight, Upload, Clock, Calendar, AlertTriangle, MapPin, Plus, Trash2, Fuel, Scissors, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, jobs, expenses, communications, loadData } = useJobs();
  const [activeTab, setActiveTab] = useState<'profile' | 'pricing' | 'schedule' | 'ai' | 'system'>('profile');
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [newZone, setNewZone] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
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

  const tabs = [
    { id: 'profile', label: 'Business Profile', icon: <Building size={18} /> },
    { id: 'pricing', label: 'Pricing & Financials', icon: <PoundSterling size={18} /> },
    { id: 'schedule', label: 'Schedule & Hours', icon: <Clock size={18} /> },
    { id: 'ai', label: 'AI & Automation', icon: <Brain size={18} /> },
    { id: 'system', label: 'System & Safety', icon: <ShieldCheck size={18} /> },
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
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                  activeTab === tab.id
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
                        <input 
                          type="text" 
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Sort Code</label>
                        <input 
                          type="text" 
                          name="sortCode"
                          value={formData.sortCode}
                          onChange={handleInputChange}
                          placeholder="00-00-00"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none text-center font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">Account Number</label>
                        <input 
                          type="text" 
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none text-center font-mono"
                        />
                      </div>
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

                    <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-4">
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

                        {/* Dynamic Pricing Section */}
                        <div className="pt-6 border-t border-slate-100">
                             <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                                <AlertCircle size={16} className="text-amber-500" />
                                Dynamic Rules & Surcharges
                             </h4>
                             <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Scissors size={18} className="text-lawn-600" />
                                            <span className="text-sm font-bold text-slate-700">Overgrown Grass</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Time Threshold (Mins)</label>
                                                <input 
                                                    type="number" 
                                                    name="overgrownThreshold"
                                                    value={formData.overgrownThreshold}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-lawn-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Flat Surcharge ({formData.currency})</label>
                                                <input 
                                                    type="number" 
                                                    name="overgrownSurcharge"
                                                    value={formData.overgrownSurcharge}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-lawn-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Fuel size={18} className="text-blue-600" />
                                            <span className="text-sm font-bold text-slate-700">Travel/Fuel Surcharge</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Max Free Radius (KM)</label>
                                                <input 
                                                    type="number" 
                                                    name="fuelSurchargeRadius"
                                                    value={formData.fuelSurchargeRadius}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Fuel Fee ({formData.currency})</label>
                                                <input 
                                                    type="number" 
                                                    name="fuelSurchargeAmount"
                                                    value={formData.fuelSurchargeAmount}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Business Base Location (Postcode)</label>
                                    <input 
                                        type="text" 
                                        name="businessBasePostcode"
                                        value={formData.businessBasePostcode}
                                        onChange={handleInputChange}
                                        placeholder="e.g. SW1A 1AA"
                                        className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-lawn-500 outline-none uppercase font-mono"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Used to automatically calculate travel distance for the fuel surcharge.</p>
                                </div>
                             </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                             <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3">Financials</h4>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Tax Rate (VAT)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            name="taxRate"
                                            value={formData.taxRate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                        />
                                        <span className="absolute right-3 top-2 text-slate-400 text-sm font-bold">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Currency Symbol</label>
                                    <input 
                                        type="text" 
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                    />
                                </div>
                             </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
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
                                             {[6,7,8,9,10,11].map(h => <option key={h} value={h}>{h}:00 AM</option>)}
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
                                             {[14,15,16,17,18,19,20].map(h => <option key={h} value={h}>{h > 12 ? h-12 : h}:00 PM</option>)}
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
                                                     className={`w-12 h-12 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                                                         isActive 
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
              )}

              {activeTab === 'ai' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                   <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">AI & Heatmap Automation</h3>
                    <p className="text-sm text-slate-500">Control Gemini and the Profit Heatmap efficiency logic.</p>
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
                                    onClick={() => setFormData({...formData, aiTone: tone as any})}
                                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all text-center capitalize ${
                                        formData.aiTone === tone 
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
              )}

              {activeTab === 'system' && (
                 <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">System & Data</h3>
                        <p className="text-sm text-slate-500">Manage your database and application state.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            type="button"
                            onClick={exportData}
                            className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-lawn-400 group transition-all"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-lawn-600 shadow-sm mb-3 transition-colors">
                                <Download size={24} />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Backup Database</h4>
                            <p className="text-xs text-slate-500 mt-1">Download all jobs, expenses, and settings as a JSON file.</p>
                        </button>

                        <button 
                            type="button"
                            onClick={handleImportClick}
                            className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-blue-400 group transition-all"
                        >
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm mb-3 transition-colors">
                                <Upload size={24} />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Import Data</h4>
                            <p className="text-xs text-slate-500 mt-1">Restore from a JSON backup file.</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImportFile} 
                                className="hidden" 
                                accept=".json" 
                            />
                        </button>
                    </div>
                 </div>
              )}

            </div>

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
                className="px-6 py-2 bg-lawn-600 hover:bg-lawn-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-lawn-200 flex items-center gap-2"
              >
                <Save size={18} /> Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
