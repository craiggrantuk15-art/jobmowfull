import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { generateUUID } from '../utils';
import { JobStatus, Frequency, PaymentStatus, PropertyType, Job } from '../types';
import { X, CheckCircle, ArrowRight, ArrowLeft, User, MapPin, Briefcase, Calendar, ChevronRight, Plus } from 'lucide-react';
import PostcodeLookup from './PostcodeLookup';
import { useAuth } from '../context/AuthContext';

interface CustomerOnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: {
        name?: string;
        email?: string;
        business_name?: string;
        address?: string;
        postcode?: string;
        priceQuote?: number;
        description?: string;
    };
}

const CustomerOnboardingWizard: React.FC<CustomerOnboardingWizardProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
    const { addCustomer, addJob, settings } = useJobs();
    const { organizationId } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [savedCustomer, setSavedCustomer] = useState<any>(null);
    const [jobCreated, setJobCreated] = useState(false);

    // Form State
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        postcode: '',
    });

    const [serviceData, setServiceData] = useState({
        frequency: Frequency.FORTNIGHTLY,
        priceQuote: 35,
        description: 'Regular Lawn Mowing',
        propertyType: PropertyType.DETACHED,
        startDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (initialData) {
            setCustomerData(prev => ({
                ...prev,
                name: initialData.name || prev.name,
                email: initialData.email || prev.email,
                address: initialData.address || prev.address,
                postcode: initialData.postcode || prev.postcode,
            }));
            if (initialData.priceQuote || initialData.description) {
                setServiceData(prev => ({
                    ...prev,
                    priceQuote: initialData.priceQuote || prev.priceQuote,
                    description: initialData.description || prev.description,
                }));
            }
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async (createJob: boolean) => {
        setLoading(true);
        try {
            let currentCustomer = savedCustomer;

            // 1. Create Customer if not already saved
            if (!currentCustomer) {
                currentCustomer = await addCustomer({
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                    address: customerData.address,
                    postcode: customerData.postcode
                });
                setSavedCustomer(currentCustomer);
            }

            let jobId = undefined;

            if (createJob) {
                // 2. Create Initial Job
                const newJob: Job = {
                    id: generateUUID(),
                    organization_id: organizationId || '',
                    customer_id: currentCustomer.id,
                    customer_name: currentCustomer.name,
                    email: currentCustomer.email,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                    postcode: currentCustomer.postcode,
                    status: JobStatus.SCHEDULED,
                    frequency: serviceData.frequency,
                    price_quote: Number(serviceData.priceQuote),
                    duration_minutes: 60, // Default duration, could be editable
                    notes: serviceData.description,
                    property_type: serviceData.propertyType,
                    scheduled_date: serviceData.startDate,
                    payment_status: PaymentStatus.UNPAID
                };

                await addJob(newJob);
                jobId = newJob.id;
                setJobCreated(true);
            } else {
                setJobCreated(false);
            }

            setCompleted(true);
            if (onSuccess) onSuccess(jobId);

            // Only close automatically if we created both or if it's been explicitly saved
            // If they saved customer only, maybe let them see the success screen with choices
            if (createJob) {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }

        } catch (error) {
            console.error("Onboarding Error:", error);
            alert("Failed to save. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = customerData.name && (customerData.email || customerData.phone);
    const isStep2Valid = customerData.address && customerData.postcode;
    const isStep3Valid = serviceData.priceQuote > 0 && serviceData.startDate;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-none sm:rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-full sm:max-h-[90vh] h-full sm:h-[600px] animate-in slide-in-from-bottom-5 duration-300">

                {/* Sidebar / Progress */}
                <div className="w-full md:w-1/3 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 md:p-8 flex flex-row md:flex-col justify-between items-center md:items-start">
                    <div className="flex md:block items-center gap-4">
                        <h2 className="text-lg md:text-2xl font-bold text-slate-800 md:mb-2 whitespace-nowrap">New Customer</h2>
                        <p className="hidden md:block text-slate-500 text-sm mb-8">Follow the steps to onboard a new client and schedule their first job.</p>
                    </div>

                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6 mt-0 md:mt-0">
                        <div className="flex items-center gap-2 md:gap-4 text-lawn-600">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-lawn-600 bg-lawn-50' : 'border-slate-300'} transition-all`}>
                                {step > 1 ? <CheckCircle size={14} className="md:w-4 md:h-4" /> : <User size={14} className="md:w-4 md:h-4" />}
                            </div>
                            <span className={`text-xs md:text-sm font-medium ${step === 1 ? 'text-slate-900' : 'hidden md:block'}`}>Details</span>
                        </div>

                        <div className={`hidden md:block w-0.5 h-4 bg-slate-200 ml-3 md:ml-4 transition-colors ${step > 1 ? 'bg-lawn-200' : ''}`}></div>

                        <div className={`flex items-center gap-2 md:gap-4 ${step >= 2 ? 'text-lawn-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-lawn-600 bg-lawn-50' : 'border-slate-300'} transition-all`}>
                                {step > 2 ? <CheckCircle size={14} className="md:w-4 md:h-4" /> : <MapPin size={14} className="md:w-4 md:h-4" />}
                            </div>
                            <span className={`text-xs md:text-sm font-medium ${step === 2 ? 'text-slate-900' : 'hidden md:block'}`}>Property</span>
                        </div>

                        <div className={`hidden md:block w-0.5 h-4 bg-slate-200 ml-3 md:ml-4 transition-colors ${step > 2 ? 'bg-lawn-200' : ''}`}></div>

                        <div className={`flex items-center gap-2 md:gap-4 ${step >= 3 ? 'text-lawn-600' : 'text-slate-400'}`}>
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-lawn-600 bg-lawn-50' : 'border-slate-300'} transition-all`}>
                                <Briefcase size={14} className="md:w-4 md:h-4" />
                            </div>
                            <span className={`text-xs md:text-sm font-medium ${step === 3 ? 'text-slate-900' : 'hidden md:block'}`}>Service</span>
                        </div>
                    </div>

                    <div className="hidden md:block text-xs text-slate-400">
                        Step {step} of 3
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-8 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900">
                            {step === 1 && "Start with the basics"}
                            {step === 2 && "Where is the job?"}
                            {step === 3 && "Job Details & Schedule"}
                        </h3>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {completed ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <CheckCircle className="w-10 h-10 text-lawn-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    {jobCreated ? "Customer Saved & Job Scheduled!" : "Customer Profile Saved!"}
                                </h3>
                                <p className="text-slate-500 mb-8">
                                    {jobCreated
                                        ? "Everything is set up. They've been added to your schedule."
                                        : "The customer and property details are registered."}
                                </p>
                                <div className="flex flex-col gap-3 w-full max-w-xs">
                                    {!jobCreated && (
                                        <button
                                            onClick={() => {
                                                setCompleted(false);
                                                setStep(3);
                                            }}
                                            className="px-6 py-3 bg-lawn-600 text-white font-bold rounded-xl hover:bg-lawn-500 shadow-lg shadow-lawn-600/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={20} /> Schedule a Job Now
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                                {/* Step 1: Details */}
                                {step === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all"
                                                placeholder="John Doe"
                                                value={customerData.name}
                                                onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all"
                                                placeholder="john@example.com"
                                                value={customerData.email}
                                                onChange={e => setCustomerData({ ...customerData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all"
                                                placeholder="07700 123456"
                                                value={customerData.phone}
                                                onChange={e => setCustomerData({ ...customerData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Property */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <PostcodeLookup
                                            initialPostcode={customerData.postcode}
                                            onAddressSelected={(addr, post) => {
                                                setCustomerData(prev => ({
                                                    ...prev,
                                                    address: addr,
                                                    postcode: post
                                                }));
                                            }}
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Address</label>
                                            <textarea
                                                rows={3}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all resize-none"
                                                placeholder="123 Green Lane..."
                                                value={customerData.address}
                                                onChange={e => setCustomerData({ ...customerData, address: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.values(PropertyType).map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setServiceData({ ...serviceData, propertyType: type })}
                                                        className={`px-3 py-2 text-sm rounded-lg border text-left transition-all ${serviceData.propertyType === type
                                                            ? 'border-lawn-500 bg-lawn-50 text-lawn-700 font-medium ring-1 ring-lawn-500'
                                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Service */}
                                {step === 3 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                                                <select
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none bg-white"
                                                    value={serviceData.frequency}
                                                    onChange={e => setServiceData({ ...serviceData, frequency: e.target.value as Frequency })}
                                                >
                                                    {Object.values(Frequency).map(f => (
                                                        <option key={f} value={f}>{f}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none"
                                                    value={serviceData.startDate}
                                                    onChange={e => setServiceData({ ...serviceData, startDate: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Price Quote ({settings.currency})</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">{settings.currency}</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    className="w-full pl-8 pr-4 py-3 text-lg font-bold text-slate-900 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none transition-all"
                                                    value={serviceData.priceQuote}
                                                    onChange={e => setServiceData({ ...serviceData, priceQuote: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Job Description / Notes</label>
                                            <textarea
                                                rows={2}
                                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-lawn-500 focus:border-lawn-500 outline-none resize-none"
                                                value={serviceData.description}
                                                onChange={e => setServiceData({ ...serviceData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>

                    {!completed && (
                        <div className="pt-6 mt-2 border-t border-slate-100 flex justify-between items-center">
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                            ) : (
                                <div></div> // Spacer
                            )}

                            {step === 2 && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleSubmit(false)}
                                        disabled={!isStep2Valid || loading}
                                        className="px-6 py-2.5 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? <span className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin inline-block mr-2"></span> : null}
                                        Save Customer Only
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!isStep2Valid || loading}
                                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-slate-900/20"
                                    >
                                        Add Job Details <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}

                            {step === 1 && (
                                <button
                                    onClick={handleNext}
                                    disabled={!isStep1Valid}
                                    className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-slate-900/20"
                                >
                                    Next Step <ChevronRight size={18} />
                                </button>
                            )}

                            {step === 3 && (
                                <button
                                    onClick={() => handleSubmit(true)}
                                    disabled={!isStep3Valid || loading}
                                    className="px-8 py-2.5 bg-lawn-600 text-white font-bold rounded-lg hover:bg-lawn-500 shadow-lg shadow-lawn-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            Confirm & Save Customer + Job <CheckCircle size={18} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerOnboardingWizard;
