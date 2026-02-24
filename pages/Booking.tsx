import React, { useState } from 'react';
import { LawnSize, Frequency, PropertyType, QuoteRequest, QuoteResponse, JobStatus, Job } from '../types';
import { EXTRAS_OPTIONS } from '../constants';
import { calculateManualQuote } from '../services/quoteService';
import { useJobs } from '../context/JobContext';
import { Loader2, CheckCircle, ArrowRight, MapPin, Home, Building2, Warehouse, TreePine, Info, ChevronRight, PoundSterling, Clock, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../context/ServiceContext';
import PostcodeLookup from '../components/PostcodeLookup';
import { generateUUID } from '../utils';

interface BookingFormData {
  serviceId: string;
  serviceName: string;
  address: string;
  propertyType: PropertyType;
  lawnSize: LawnSize;
  frequency: Frequency;
  extras: string[];
  name: string;
  email: string;
  phone: string;
  postcode: string;
}

const Booking: React.FC = () => {
  const navigate = useNavigate();
  const { addJob, settings, loading: contextLoading } = useJobs();
  const { services } = useServices();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: '',
    serviceName: '',
    address: '',
    propertyType: PropertyType.DETACHED,
    lawnSize: LawnSize.MEDIUM,
    frequency: Frequency.FORTNIGHTLY,
    extras: [],
    name: '',
    email: '',
    phone: '',
    postcode: ''
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
    setError(null);

    const request: QuoteRequest = {
      service_id: formData.serviceId,
      service_name: formData.serviceName,
      address: formData.address,
      property_type: formData.propertyType,
      lawn_size: formData.lawnSize,
      frequency: formData.frequency,
      extras: formData.extras
    };

    try {
      // Manual Calculation (Replacing AI)
      const result = calculateManualQuote(request, settings);

      // Simulate a small delay for premium feel
      await new Promise(resolve => setTimeout(resolve, 800));

      if (result) {
        setQuote(result);
        setStep(3);
      } else {
        setError("Our system couldn't generate a quote for this address. Please try again or contact us directly.");
        setStep(3);
      }
    } catch (err) {
      console.error("Booking: Error in handleGetQuote", err);
      setError("An unexpected error occurred while generating your quote.");
      setStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!quote) return;
    setIsLoading(true);

    try {
      const jobId = generateUUID();
      const customerId = generateUUID();

      const newJob: Job = {
        id: jobId,
        organization_id: '', // Handled by JobContext fallback
        service_id: formData.serviceId,
        service_name: formData.serviceName,
        customer_id: customerId,
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        property_type: formData.propertyType,
        postcode: formData.postcode,
        frequency: formData.frequency,
        lawn_size: formData.lawnSize,
        price_quote: quote.estimatedPrice || 0,
        duration_minutes: quote.estimatedDurationMinutes || 45,
        status: JobStatus.PENDING,
        lead_source: 'Website',
        notes: `Extras: ${formData.extras.join(', ')}`
      };

      console.log("Confirming booking with payload:", newJob);
      await addJob(newJob);
      setStep(4);
    } catch (error: any) {
      console.error('Confirmation failed in handleConfirm:', error);
      const message = error?.message || 'Something went wrong while saving your booking. Please try again.';
      setError(message);
      alert(`Booking Failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyIcon = (type: PropertyType) => {
    switch (type) {
      case PropertyType.DETACHED: return <Home size={20} />;
      case PropertyType.SEMI_DETACHED: return <Building2 size={20} />;
      case PropertyType.TERRACED: return <Warehouse size={20} />;
      case PropertyType.COMMERCIAL: return <TreePine size={20} />;
      default: return <Home size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lawn-50 text-lawn-700 text-xs font-bold mb-4 border border-lawn-100">
          <TreePine size={14} /> Professional Lawn Care
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Your Perfect Lawn. <span className="text-lawn-600">Simplified.</span></h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">Get an instant, professional quote for your property in under 60 seconds.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
        {/* Progress Stepper */}
        <div className="flex bg-slate-50/50 border-b border-slate-100 px-8 py-6 overflow-x-auto">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-3 min-w-[80px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all duration-500 ${step >= s
                ? 'bg-lawn-600 text-white shadow-lg shadow-lawn-200 scale-110'
                : 'bg-slate-200 text-slate-500'
                }`}>
                {step > s ? <CheckCircle size={16} /> : s + 1}
              </div>
              <div className={`h-1.5 flex-1 rounded-full mr-4 transition-all duration-700 ${step > s ? 'bg-lawn-600' : 'bg-slate-200'
                }`} />
            </div>
          ))}
        </div>

        <div className="p-8 md:p-14">
          {step === 0 && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select your service</h3>
                <p className="text-slate-500">What help does your lawn need today?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services.filter(s => s.active).map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, serviceId: service.id, serviceName: service.name }));
                      setStep(1);
                    }}
                    className={`p-6 rounded-3xl border-2 text-left transition-all hover:scale-[1.03] group ${formData.serviceId === service.id
                      ? 'bg-lawn-50 border-lawn-600 ring-4 ring-lawn-100'
                      : 'bg-white border-slate-100 hover:border-lawn-300 hover:shadow-xl'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${formData.serviceId === service.id ? 'bg-lawn-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-lawn-100 group-hover:text-lawn-600'}`}>
                      <TreePine size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{service.name}</h4>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-3 leading-relaxed">{service.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Where is the property?</h3>
                <p className="text-slate-500">Search by postcode or enter address manually below.</p>
              </div>

              <div className="space-y-8 bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                <PostcodeLookup
                  onAddressSelected={(address, postcode) => {
                    setFormData(prev => ({ ...prev, address, postcode }));
                  }}
                />

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Verified Address</label>
                  <textarea
                    rows={2}
                    placeholder="Enter property address..."
                    className="w-full px-6 py-5 text-lg border-2 border-slate-200/60 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none transition-all shadow-sm resize-none bg-white font-medium"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Property style affects complexity</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.values(PropertyType).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, propertyType: type }))}
                      className={`flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all group ${formData.propertyType === type
                        ? 'bg-lawn-50 border-lawn-600 text-lawn-700 shadow-lg scale-105'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                    >
                      <div className={`p-3 rounded-2xl transition-all duration-300 ${formData.propertyType === type ? 'bg-lawn-600 text-white shadow-md shadow-lawn-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'}`}>
                        {getPropertyIcon(type)}
                      </div>
                      <span className="text-xs font-black whitespace-nowrap uppercase tracking-wider">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button onClick={() => setStep(0)} className="px-8 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.address}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-30"
                >
                  Continue to Details <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tailor your service</h3>
                <p className="text-slate-500">Select size and frequency for the best pricing.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {formData.serviceName?.toLowerCase().includes('mow') ? 'Estimated Lawn Size' : 'Estimated Area Size'}
                  </label>
                  <select
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none bg-white font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                    value={formData.lawnSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, lawnSize: e.target.value as LawnSize }))}
                  >
                    {Object.values(LawnSize).map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visit Frequency</label>
                  <select
                    className="w-full px-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none bg-white font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as Frequency }))}
                  >
                    {Object.values(Frequency).map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pro Enhancements</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EXTRAS_OPTIONS.map((extra) => (
                    <button
                      key={extra}
                      onClick={() => handleExtraToggle(extra)}
                      className={`text-sm py-5 px-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${formData.extras.includes(extra)
                        ? 'bg-lawn-50 border-lawn-600 text-lawn-700 font-black shadow-md'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                      <span>{extra}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${formData.extras.includes(extra) ? 'bg-lawn-600 text-white scale-110' : 'bg-slate-100 text-slate-300 group-hover:bg-slate-200'}`}>
                        {formData.extras.includes(extra) ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-white opacity-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setStep(1)} className="px-8 py-5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Back</button>
                <button
                  onClick={handleGetQuote}
                  disabled={isLoading}
                  className="flex-1 bg-lawn-600 hover:bg-lawn-700 text-white font-black py-5 px-8 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-lawn-200 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={24} /> : <>Generate Smart Quote <ArrowRight size={24} /></>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && !quote && error && (
            <div className="p-12 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                <Info size={48} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Quote Unavailable</h2>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed">{error}</p>
              <button
                onClick={() => setStep(2)}
                className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 mx-auto shadow-xl"
              >
                Return to Details
              </button>
            </div>
          )}

          {step === 3 && quote && !error && (
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-1.5 shadow-2xl overflow-hidden group">
                <div className="bg-white/95 backdrop-blur-md rounded-[2.8rem] p-8 md:p-14 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-lawn-50 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-125 duration-1000"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-lawn-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-lawn-400 shadow-md shadow-lawn-200">
                          Verified Pricing
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Optimized by Gemini AI</span>
                      </div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Estimated Investment</h3>
                      <div className="flex items-baseline gap-2">
                        <div className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter flex items-start">
                          <span className="text-4xl mt-3 mr-1 font-bold text-lawn-600 leading-none">{settings.currency}</span>
                          {(quote.estimatedPrice || 0).toFixed(2)}
                        </div>
                        <div className="text-xl font-bold text-slate-400 mb-3">/ visit</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 md:flex-col md:items-end">
                      <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <Clock size={20} className="text-lawn-600" />
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</div>
                          <div className="text-base font-black text-slate-800 leading-none">{quote.estimatedDurationMinutes || 45} mins</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <Calendar size={20} className="text-lawn-600" />
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Frequency</div>
                          <div className="text-base font-black text-slate-800 leading-none">{formData.frequency}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 items-start relative z-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Info size={16} className="text-lawn-600" />
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex-1">Pro Analysis</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed italic text-xl font-medium">
                          "{quote.explanation}"
                        </p>
                      </div>

                      {quote.surchargesApplied && quote.surchargesApplied.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price Adjustments</h4>
                          <div className="flex flex-wrap gap-2">
                            {quote.surchargesApplied.map((s, idx) => (
                              <span key={idx} className="bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-100 uppercase tracking-wider">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border-2 border-slate-100/50 shadow-inner">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center">Cost Breakdown</h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="font-bold">Base Service Rate</span>
                          <span className="font-black text-slate-900">{settings.currency}{(quote.priceBreakdown?.base || 0).toFixed(2)}</span>
                        </div>
                        {(quote.priceBreakdown?.extras || 0) > 0 && (
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="font-bold">Add-ons & Extras</span>
                            <span className="font-black text-slate-900">+{settings.currency}{quote.priceBreakdown.extras.toFixed(2)}</span>
                          </div>
                        )}
                        {(quote.priceBreakdown?.surcharges || 0) > 0 && (
                          <div className="flex justify-between items-center text-amber-600">
                            <span className="font-bold">Applied Surcharges</span>
                            <span className="font-black">+{settings.currency}{quote.priceBreakdown.surcharges.toFixed(2)}</span>
                          </div>
                        )}
                        {(quote.priceBreakdown?.discount || 0) > 0 && (
                          <div className="flex justify-between items-center text-emerald-600">
                            <span className="font-bold">{formData.frequency} Discount</span>
                            <span className="font-black">-{settings.currency}{quote.priceBreakdown.discount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-xl font-black text-slate-900">Final Rate</span>
                          <span className="text-3xl font-black text-slate-900">
                            {settings.currency}{(quote.estimatedPrice || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10 bg-slate-50/80 p-10 md:p-14 rounded-[3rem] border border-slate-200/50">
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Reserve your visit</h3>
                  <p className="text-slate-500">Enter your details and we'll confirm your slot today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Smith"
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none font-bold text-slate-700 transition-all bg-white"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none font-bold text-slate-700 transition-all bg-white"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">UK Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="07XXX XXXXXX"
                    className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-lawn-100 focus:border-lawn-500 outline-none font-bold text-slate-700 transition-all bg-white"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-5 pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-10 py-5 text-slate-500 font-black hover:bg-slate-200/50 rounded-2xl transition-all uppercase tracking-widest text-xs"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isLoading || contextLoading || !formData.name || !formData.email || !formData.phone}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-5 px-10 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {isLoading || contextLoading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        {contextLoading ? 'Syncing...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        Book My Service Now <CheckCircle size={24} />
                      </>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">No payment required until work is completed</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-20 md:py-32 animate-in zoom-in-95 duration-700">
              <div className="relative inline-flex mb-12">
                <div className="absolute inset-0 bg-lawn-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                <div className="relative z-10 w-28 h-28 md:w-32 md:h-32 bg-lawn-100 text-lawn-600 rounded-[3rem] flex items-center justify-center shadow-2xl shadow-lawn-200">
                  <CheckCircle size={64} />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Booking Requested!</h2>
              <p className="text-xl text-slate-500 mb-12 max-w-lg mx-auto leading-relaxed">
                Excellent choice, <strong>{formData.name}</strong>. We've sent your detailed quote breakdown to <strong>{formData.email}</strong>. Our team will verify the slot and text you at <strong>{formData.phone}</strong> shortly.
              </p>

              <button
                onClick={() => {
                  setStep(0);
                  setQuote(null);
                  setError(null);
                  setIsLoading(false);
                  setFormData({
                    serviceId: '',
                    serviceName: '',
                    address: '',
                    propertyType: PropertyType.DETACHED,
                    lawnSize: LawnSize.MEDIUM,
                    frequency: Frequency.FORTNIGHTLY,
                    extras: [],
                    name: '',
                    email: '',
                    phone: '',
                    postcode: ''
                  });
                  window.scrollTo(0, 0);
                }}
                className="inline-flex items-center justify-center gap-4 px-10 py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-slate-300"
              >
                Return to Homepage <ArrowRight size={24} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;