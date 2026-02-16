import React, { useState } from 'react';
import { LawnSize, Frequency, PropertyType, QuoteRequest, QuoteResponse, JobStatus, Job } from '../types';
import { EXTRAS_OPTIONS } from '../constants';
import { generateQuote } from '../services/geminiService';
import { useJobs } from '../context/JobContext';
import { Loader2, CheckCircle, ArrowRight, MapPin, Home, Building2, Warehouse, TreePine, Info, ChevronRight, PoundSterling, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingFormData {
  address: string;
  propertyType: PropertyType;
  lawnSize: LawnSize;
  frequency: Frequency;
  extras: string[];
  name: string;
  email: string;
  phone: string;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { addJob, settings } = useJobs();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    address: '',
    propertyType: PropertyType.DETACHED,
    lawnSize: LawnSize.MEDIUM,
    frequency: Frequency.FORTNIGHTLY,
    extras: [],
    name: '',
    email: '',
    phone: ''
  });

  const handleExtraToggle = (extra: string) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }));
  };

  const handleGetQuote = async () => {
    if (!formData.address) return;
    setIsLoading(true);
    
    const request: QuoteRequest = {
      address: formData.address,
      propertyType: formData.propertyType,
      lawnSize: formData.lawnSize,
      frequency: formData.frequency,
      extras: formData.extras
    };

    const result = await generateQuote(request, settings);
    setQuote(result);
    setIsLoading(false);
    setStep(3);
  };

  const handleConfirm = () => {
    if (!quote) return;

    const newJob: Job = {
      id: crypto.randomUUID(),
      customerId: crypto.randomUUID(),
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      propertyType: formData.propertyType,
      postcode: '',
      frequency: formData.frequency,
      lawnSize: formData.lawnSize,
      priceQuote: quote.estimatedPrice,
      durationMinutes: quote.estimatedDurationMinutes,
      status: JobStatus.PENDING,
      leadSource: 'Website',
      notes: `Extras: ${formData.extras.join(', ')}`
    };

    addJob(newJob);
    setStep(4);
  };

  const getPropertyIcon = (type: PropertyType) => {
    switch(type) {
      case PropertyType.DETACHED: return <Home size={20} />;
      case PropertyType.SEMI_DETACHED: return <Building2 size={20} />;
      case PropertyType.TERRACED: return <Warehouse size={20} />;
      case PropertyType.COMMERCIAL: return <TreePine size={20} />;
      default: return <Home size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Precision Lawn Care.</h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto">Instant AI-driven quoting based on your unique property and needs.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden relative">
        {/* Progress Stepper */}
        <div className="flex bg-slate-50/50 border-b border-slate-100 px-6 py-4">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        step >= s ? 'bg-lawn-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {s}
                    </div>
                    <div className={`h-1 flex-1 rounded-full mr-4 ${
                        step > s ? 'bg-lawn-600' : 'bg-slate-200'
                    }`} />
                </div>
            ))}
        </div>

        <div className="p-8 md:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="text-lawn-600" /> Start with your location
                  </h3>
                  <div className="relative">
                    <input
                        type="text"
                        placeholder="Enter property address..."
                        className="w-full pl-6 pr-4 py-4 text-lg border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none transition-all shadow-sm"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
              </div>

              <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">Property Style</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.values(PropertyType).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFormData({ ...formData, propertyType: type })}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group ${
                                formData.propertyType === type
                                ? 'bg-lawn-50 border-lawn-600 text-lawn-700 shadow-md'
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            <div className={`p-2 rounded-xl transition-colors ${formData.propertyType === type ? 'bg-lawn-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                                {getPropertyIcon(type)}
                            </div>
                            <span className="text-xs font-bold whitespace-nowrap">{type}</span>
                          </button>
                      ))}
                  </div>
              </div>

              <div className="pt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.address}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Continue to Lawn Details <ChevronRight size={20} />
                  </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">Estimated Size</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none bg-white font-medium"
                    value={formData.lawnSize}
                    onChange={(e) => setFormData({ ...formData, lawnSize: e.target.value as LawnSize })}
                  >
                    {Object.values(LawnSize).map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">Visit Frequency</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none bg-white font-medium"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  >
                    {Object.values(Frequency).map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest">Add Finishing Touches</label>
                <div className="grid grid-cols-2 gap-3">
                  {EXTRAS_OPTIONS.map((extra) => (
                    <button
                      key={extra}
                      onClick={() => handleExtraToggle(extra)}
                      className={`text-sm py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        formData.extras.includes(extra)
                          ? 'bg-lawn-50 border-lawn-600 text-lawn-700 font-bold'
                          : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                      }`}
                    >
                      {extra}
                      {formData.extras.includes(extra) && <CheckCircle size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(1)} className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Back</button>
                <button
                    onClick={handleGetQuote}
                    disabled={isLoading}
                    className="flex-1 bg-lawn-600 hover:bg-lawn-700 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-lawn-200"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Get Instant Quote <ArrowRight size={20} /></>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && quote && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">AI Verified Quote</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-400 uppercase tracking-wider mb-6">Estimated Investment</h3>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="text-6xl font-black text-slate-900 flex items-start gap-1">
                            <span className="text-2xl mt-2 font-bold text-lawn-600">{settings.currency}</span>
                            {quote.estimatedPrice.toFixed(2)}
                            <span className="text-lg font-medium text-slate-400 self-end mb-2 ml-1">/ visit</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-100">
                                <Clock size={14} className="text-lawn-600" /> {quote.estimatedDurationMinutes} mins
                            </span>
                            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-100">
                                <Calendar size={14} className="text-lawn-600" /> {formData.frequency}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 bg-white/50 p-6 rounded-2xl border border-white/80">
                    <div className="flex justify-between text-sm text-slate-500 font-medium">
                        <span>Base Service Fee</span>
                        <span>{settings.currency}{quote.priceBreakdown.base.toFixed(2)}</span>
                    </div>
                    {quote.priceBreakdown.extras > 0 && (
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>Finishing Extras</span>
                            <span>{settings.currency}{quote.priceBreakdown.extras.toFixed(2)}</span>
                        </div>
                    )}
                    {quote.priceBreakdown.surcharges > 0 && (
                        <div className="flex justify-between text-sm text-amber-600 font-bold">
                            <span>Travel/Access Surcharge</span>
                            <span>+{settings.currency}{quote.priceBreakdown.surcharges.toFixed(2)}</span>
                        </div>
                    )}
                    {quote.priceBreakdown.discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 font-black">
                            <span>Frequency Loyalty Discount</span>
                            <span>-{settings.currency}{quote.priceBreakdown.discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="pt-3 border-t border-slate-200 flex justify-between font-black text-slate-900">
                        <span>Grand Total</span>
                        <span>{settings.currency}{quote.estimatedPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-6 flex gap-3 p-4 bg-lawn-50/50 rounded-xl border border-lawn-100 text-sm text-lawn-800 italic leading-relaxed">
                   <Info size={18} className="shrink-0 text-lawn-600" />
                   "{quote.explanation}"
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Reserve your first visit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Smith"
                            className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 outline-none font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email Address</label>
                        <input
                            type="email"
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 outline-none font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">UK Mobile Number</label>
                    <input
                        type="tel"
                        placeholder="07XXX XXXXXX"
                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 outline-none font-medium"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Edit Options
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!formData.name || !formData.email || !formData.phone}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  Confirm Booking <CheckCircle size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
              <div className="relative inline-flex mb-10">
                  <div className="absolute inset-0 bg-lawn-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative z-10 w-24 h-24 bg-lawn-100 text-lawn-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={48} />
                  </div>
              </div>
              
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Booking Requested!</h2>
              <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
                Excellent choice, <strong>{formData.name}</strong>. We've sent your detailed quote breakdown to <strong>{formData.email}</strong>. Our team will verify the date and text you at <strong>{formData.phone}</strong> shortly.
              </p>
              
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
              >
                Return Home <ArrowRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;