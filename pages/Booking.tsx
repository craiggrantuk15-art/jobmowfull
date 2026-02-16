import React, { useState } from 'react';
import { LawnSize, Frequency, QuoteRequest, QuoteResponse, JobStatus, Job } from '../types';
import { EXTRAS_OPTIONS } from '../constants';
import { generateQuote } from '../services/geminiService';
import { useJobs } from '../context/JobContext';
import { Loader2, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BookingFormData {
  address: string;
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const [formData, setFormData] = useState<BookingFormData>({
    address: '',
    lawnSize: LawnSize.MEDIUM,
    frequency: Frequency.WEEKLY,
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
      lawnSize: formData.lawnSize,
      frequency: formData.frequency,
      extras: formData.extras
    };

    const result = await generateQuote(request, settings);
    setQuote(result);
    setIsLoading(false);
    setStep(2);
  };

  const handleConfirm = () => {
    if (!quote) return;

    // Create the new job in Context
    const newJob: Job = {
      id: crypto.randomUUID(), // In a real app, DB assigns ID
      customerId: crypto.randomUUID(),
      customerName: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postcode: '', // We didn't ask for this specifically, could extract from address
      frequency: formData.frequency,
      lawnSize: formData.lawnSize,
      priceQuote: quote.estimatedPrice,
      durationMinutes: quote.estimatedDurationMinutes,
      status: JobStatus.PENDING, // Start as a Lead
      leadSource: 'Website',
      notes: `Extras: ${formData.extras.join(', ')}`
    };

    addJob(newJob);
    
    setStep(3);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Get Your Lawns Sorted</h1>
        <p className="text-slate-500">Instant quotes. Professional service. No hassle.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-100">
          <div 
            className="h-full bg-lawn-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Where is the property?</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Enter street address and suburb"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lawn Size</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                    value={formData.lawnSize}
                    onChange={(e) => setFormData({ ...formData, lawnSize: e.target.value as LawnSize })}
                  >
                    {Object.values(LawnSize).map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                  <select
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
                  >
                    {Object.values(Frequency).map((freq) => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Extras</label>
                <div className="grid grid-cols-2 gap-3">
                  {EXTRAS_OPTIONS.map((extra) => (
                    <button
                      key={extra}
                      onClick={() => handleExtraToggle(extra)}
                      className={`text-sm py-2 px-3 rounded-md border transition-all ${
                        formData.extras.includes(extra)
                          ? 'bg-lawn-50 border-lawn-500 text-lawn-700 font-medium'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {extra}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGetQuote}
                disabled={!formData.address || isLoading}
                className="w-full bg-lawn-600 hover:bg-lawn-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Get Instant Quote'}
              </button>
            </div>
          )}

          {step === 2 && quote && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 text-center">
                <h3 className="text-lg font-medium text-slate-600 mb-2">Estimated Price</h3>
                <div className="text-4xl font-bold text-lawn-700 mb-2">
                  £{quote.estimatedPrice} <span className="text-base font-normal text-slate-500">/ mow</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">Approx. {quote.estimatedDurationMinutes} mins duration</p>
                <div className="text-sm bg-white p-3 rounded border border-slate-200 text-slate-600 italic">
                  "{quote.explanation}"
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Your Details to Book</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!formData.name || !formData.email || !formData.phone}
                  className="flex-1 bg-lawn-600 hover:bg-lawn-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-lawn-100 text-lawn-600 rounded-full mb-6">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Requested!</h2>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                Thanks {formData.name}. We've sent a confirmation to {formData.email}. We'll be in touch shortly to confirm the first date.
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-lawn-600 font-medium hover:text-lawn-700 flex items-center justify-center gap-2 mx-auto"
              >
                Return Home <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;