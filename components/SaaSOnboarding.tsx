
import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle, MapPin, DollarSign, Briefcase, Globe, Phone, Building, Cloud, Mail, Sparkles, Rocket, PartyPopper, Leaf } from 'lucide-react';

const SaaSOnboarding: React.FC = () => {
    const { settings, updateSettings, loadData } = useJobs();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isCelebrating, setIsCelebrating] = useState(false);

    const [formData, setFormData] = useState({
        businessName: settings.businessName || '',
        phone: settings.phone || '',
        website: settings.website || '',
        email: settings.email || user?.email || '',
        basePostcode: settings.businessBasePostcode || '',
        weatherCity: settings.weatherCity || '',
        currency: settings.currency || '£',
        baseHourlyRate: settings.baseHourlyRate || 35,
        taxRate: settings.taxRate || 0
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleComplete = async () => {
        setLoading(true);
        try {
            await updateSettings({
                businessName: formData.businessName,
                phone: formData.phone,
                website: formData.website,
                email: formData.email,
                businessBasePostcode: formData.basePostcode,
                weatherCity: formData.weatherCity,
                currency: formData.currency,
                baseHourlyRate: Number(formData.baseHourlyRate),
                taxRate: Number(formData.taxRate),
                onboardingCompleted: true
            });
            setIsCelebrating(true);
            // Give time for celebration animation before closing (handled by Layout state update)
            setTimeout(async () => {
                await loadData();
            }, 2500);
        } catch (error) {
            console.error("Failed to save onboarding settings", error);
        } finally {
            setLoading(false);
        }
    };

    // Validation
    const isStep1Valid = formData.businessName && formData.phone;
    const isStep2Valid = formData.basePostcode.length >= 5;
    const isStep3Valid = formData.baseHourlyRate > 0;

    if (isCelebrating) {
        return (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-90 duration-500 overflow-hidden relative">
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-lawn-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-lawn-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-lawn-500/30 animate-bounce">
                            <Rocket size={48} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">You're All Set!</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                            Your lawn care command center is ready. Let's start growing your business.
                        </p>
                        <div className="flex justify-center gap-2">
                            {[...Array(5)].map((_, i) => (
                                <Sparkles key={i} className={`text-lawn-500 animate-pulse delay-${i * 200}`} size={20} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4">
            <div className="max-w-5xl w-full bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-4rem)] md:min-h-[650px] animate-in fade-in zoom-in-95 duration-500">

                {/* Sidebar */}
                <div className="w-full md:w-[320px] bg-slate-900 text-white p-6 md:p-10 flex flex-col md:justify-between relative overflow-hidden shrink-0">
                    {/* Vibrant Background Decorations */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-lawn-500 rounded-full mix-blend-screen filter blur-[90px] opacity-30 transform translate-x-1/3 -translate-y-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500 rounded-full mix-blend-screen filter blur-[70px] opacity-10 transform -translate-x-1/2 -translate-y-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-gradient-to-br from-lawn-400 to-lawn-600 p-2 rounded-xl text-white shadow-lg shadow-lawn-500/20">
                                <Leaf size={24} />
                            </div>
                            <span className="font-black text-xl tracking-tight uppercase">JobMow</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight tracking-tight">Welcome, <br /><span className="text-lawn-400">{user?.name?.split(' ')[0] || 'Pro'}!</span></h2>
                        <p className="text-sm md:text-base text-slate-400 mb-10 leading-relaxed font-medium hidden md:block">Let's fine-tune your workspace. We'll have you quoting in less than 2 minutes.</p>

                        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:space-y-0 relative">
                            {/* Vertical Line for Desktop */}
                            <div className="hidden md:block absolute left-5 top-5 bottom-5 w-0.5 bg-slate-800"></div>

                            <StepIndicator step={step} target={1} icon={<Building size={18} />} label="Business Info" />
                            <StepIndicator step={step} target={2} icon={<MapPin size={18} />} label="Location" />
                            <StepIndicator step={step} target={3} icon={<DollarSign size={18} />} label="Financials" />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 relative z-10 mt-10 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <div className="w-10 h-10 rounded-full bg-lawn-500/20 flex items-center justify-center text-lawn-400">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Onboarding Status</p>
                            <p className="text-sm font-bold text-white">{Math.round((step / 3) * 100)}% Complete</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 sm:p-10 md:p-16 flex flex-col overflow-y-auto min-h-0 bg-white">
                    <div className="flex-1 max-w-2xl mx-auto w-full">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-12 fade-in duration-500">
                                <div className="space-y-2">
                                    <div className="inline-flex px-3 py-1 rounded-full bg-lawn-50 text-lawn-700 text-[10px] font-black uppercase tracking-widest border border-lawn-100">Step 01</div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">The Essentials</h3>
                                    <p className="text-slate-500 font-medium">This is how your customers will see your brand.</p>
                                </div>

                                <div className="space-y-6">
                                    <FormGroup label="Business Name" icon={<Building size={18} />}>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none transition-all font-semibold text-slate-800"
                                            placeholder="e.g. Green Leaf Landscaping"
                                            value={formData.businessName}
                                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                        />
                                    </FormGroup>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormGroup label="Business Phone" icon={<Phone size={18} />}>
                                            <input
                                                type="tel"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none transition-all font-semibold text-slate-800"
                                                placeholder="07700 900..."
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </FormGroup>
                                        <FormGroup label="Professional Email" icon={<Mail size={18} />}>
                                            <input
                                                type="email"
                                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none transition-all font-semibold text-slate-800"
                                                placeholder="accounts@..."
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </FormGroup>
                                    </div>

                                    <FormGroup label="Website URL (Optional)" icon={<Globe size={18} />}>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none transition-all font-semibold text-slate-800"
                                            placeholder="www.yourbusiness.co.uk"
                                            value={formData.website}
                                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-12 fade-in duration-500">
                                <div className="space-y-2">
                                    <div className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100">Step 02</div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Base of Operations</h3>
                                    <p className="text-slate-500 font-medium">We use this to optimize your daily route and track weather.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 shadow-inner group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                                        <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">HQ Postcode</label>
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-lawn-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none text-xl font-black tracking-widest uppercase transition-all"
                                                    placeholder="SW1A 1AA"
                                                    value={formData.basePostcode}
                                                    onChange={e => setFormData({ ...formData, basePostcode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-4 font-medium flex items-center gap-2">
                                            <Sparkles size={12} className="text-amber-400" />
                                            Used to calculate fuel efficiency and travel time between jobs.
                                        </p>
                                    </div>

                                    <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/60 shadow-inner group hover:bg-white hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-500">
                                        <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">Weather City</label>
                                        <div className="flex gap-4">
                                            <div className="flex-1 relative">
                                                <Cloud className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={20} />
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-lg font-bold transition-all"
                                                    placeholder="e.g. York, UK"
                                                    value={formData.weatherCity}
                                                    onChange={e => setFormData({ ...formData, weatherCity: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-blue-400 mt-4 font-medium flex items-center gap-2">
                                            <Sparkles size={12} className="text-amber-400" />
                                            Required for MowCast™ smart weather scheduling.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right-12 fade-in duration-500">
                                <div className="space-y-2">
                                    <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest border border-amber-100">Step 03</div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Growth & Financials</h3>
                                    <p className="text-slate-500 font-medium">Set your default rates to generate quotes in seconds.</p>
                                </div>

                                <div className="space-y-8">
                                    <FormGroup label="Default Currency" icon={<DollarSign size={18} />}>
                                        <select
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-lawn-500/10 focus:border-lawn-500 outline-none bg-white font-bold text-slate-800 appearance-none transition-all"
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="£">British Pound (GBP)</option>
                                            <option value="$">US Dollar (USD)</option>
                                            <option value="€">Euro (EUR)</option>
                                        </select>
                                    </FormGroup>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 shadow-inner">
                                            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Base Hourly Rate</label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 font-black text-3xl">{formData.currency}</span>
                                                <input
                                                    type="number"
                                                    className="w-full pl-10 pr-4 bg-transparent outline-none font-black text-4xl text-slate-900"
                                                    value={formData.baseHourlyRate === 0 ? '' : formData.baseHourlyRate}
                                                    onChange={e => setFormData({ ...formData, baseHourlyRate: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                />
                                            </div>
                                            <div className="h-1 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                                                <div className="h-full bg-lawn-500 w-2/3"></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold">Standard Pro rate</p>
                                        </div>

                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200/60 shadow-inner">
                                            <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">Tax Rate (VAT/GST)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full pr-10 bg-transparent outline-none font-black text-4xl text-slate-900"
                                                    value={formData.taxRate === 0 ? '' : formData.taxRate}
                                                    onChange={e => setFormData({ ...formData, taxRate: e.target.value === '' ? 0 : Number(e.target.value) })}
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 font-black text-3xl">%</span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                                                <div className="h-full bg-indigo-500 w-1/4"></div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold">Applied to all quotes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Actions */}
                    <div className="pt-10 mt-10 border-t border-slate-100 flex justify-between items-center max-w-2xl mx-auto w-full">
                        {step > 1 ? (
                            <button
                                onClick={handleBack}
                                className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                            >
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex items-center gap-4">
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-900/20 active:scale-95 group"
                                >
                                    Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={!isStep3Valid || loading}
                                    className="px-12 py-5 bg-gradient-to-r from-lawn-600 to-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:shadow-2xl hover:shadow-lawn-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                                    {loading ? (
                                        <>Configuring Dashboard...</>
                                    ) : (
                                        <>Go to Command Center <Sparkles size={18} /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormGroup: React.FC<{ label: string, icon: React.ReactNode, children: React.ReactNode }> = ({ label, icon, children }) => (
    <div className="space-y-2 group">
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-lawn-600">{label}</label>
        <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lawn-500 transition-colors">
                {icon}
            </span>
            {children}
        </div>
    </div>
);

const StepIndicator: React.FC<{ step: number, target: number, icon: React.ReactNode, label: string }> = ({ step, target, icon, label }) => {
    const isActive = step === target;
    const isCompleted = step > target;

    return (
        <div className={`flex flex-col md:flex-row items-center gap-2 md:gap-5 relative z-10 transition-all duration-500 ${isActive ? 'scale-105' : 'opacity-60 grayscale'}`}>
            <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'border-lawn-500 bg-lawn-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                isCompleted ? 'border-lawn-500/50 bg-slate-900 text-lawn-500' :
                    'border-slate-800 bg-slate-800/50 text-slate-500'
                }`}>
                {isCompleted ? <CheckCircle size={22} className="animate-in zoom-in duration-300" /> : icon}
            </div>
            <div className="hidden md:block">
                <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isActive ? 'text-lawn-400' : 'text-slate-500'}`}>Step 0{target}</p>
                <p className={`text-base font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-500'}`}>{label}</p>
            </div>
        </div>
    );
}

export default SaaSOnboarding;
