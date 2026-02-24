import React, { useState } from 'react';
import { JobStatus, Job } from '../types';
import { optimizeRoute, generateETAMessage, generateRainDelayMessage } from '../services/geminiService';
import { useJobs } from '../context/JobContext';
import JobDetailModal from '../components/JobDetailModal';
import { Calendar, MapPin, Truck, BrainCircuit, Loader2, ArrowRight, MessageCircle, Copy, CheckCircle, X, Smartphone, CloudRain, AlertTriangle, Send, Map } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';

interface EtaPreviewState {
    job: Job;
    text: string;
}

const Schedule: React.FC = () => {
    const { jobs, updateJobOrder, updateJobStatus, updateJob, settings } = useJobs();
    const scheduledJobs = jobs.filter(j => j.status === JobStatus.SCHEDULED);
    const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationReasoning, setOptimizationReasoning] = useState<string | null>(null);
    const [groundingUrls, setGroundingUrls] = useState<string[]>([]);
    const [viewJob, setViewJob] = useState<Job | null>(null);
    const [loadingEtaId, setLoadingEtaId] = useState<string | null>(null);
    const [etaPreview, setEtaPreview] = useState<EtaPreviewState | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Rain Delay State
    const [isRainModalOpen, setIsRainModalOpen] = useState(false);
    const [rainRescheduleDate, setRainRescheduleDate] = useState<string>('');
    const [rainMessage, setRainMessage] = useState('');
    const [rainStep, setRainStep] = useState<'config' | 'notify'>('config');
    const [affectedJobs, setAffectedJobs] = useState<Job[]>([]);
    const [isGeneratingRainMsg, setIsGeneratingRainMsg] = useState(false);
    const [isSavingRainDelay, setIsSavingRainDelay] = useState(false);
    const [rainError, setRainError] = useState<string | null>(null);

    const handleOptimizeRoute = async () => {
        setIsOptimizing(true);
        setOptimizationReasoning(null);
        setGroundingUrls([]);

        // Pass settings to use scheduleStartHour for traffic estimation
        const result = await optimizeRoute(scheduledJobs, settings);

        if (result) {
            updateJobOrder(result.orderedJobIds);
            setOptimizationReasoning(result.reasoning);
            if (result.groundingUrls) setGroundingUrls(result.groundingUrls);
        }

        setIsOptimizing(false);
    };

    const handleQuickAdd = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        updateJobStatus(id, JobStatus.SCHEDULED);
    };

    const handleGenerateETA = async (e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        if (!job.phone) {
            alert("No phone number for this customer.");
            return;
        }

        setLoadingEtaId(job.id);
        const message = await generateETAMessage(job);
        setLoadingEtaId(null);

        setEtaPreview({ job, text: message });
    };

    const handleCopyETA = () => {
        if (etaPreview) {
            navigator.clipboard.writeText(etaPreview.text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    // --- Rain Delay Logic ---
    const handleOpenRainMode = async () => {
        // Detect today's scheduled jobs
        const today = new Date().toISOString().split('T')[0];
        const todayJobs = jobs.filter(j =>
            j.status === JobStatus.SCHEDULED &&
            (j.scheduled_date?.split('T')[0] === today)
        );

        setAffectedJobs(todayJobs);

        // Default reschedule to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setRainRescheduleDate(tomorrowStr);

        // Generate AI draft
        setIsGeneratingRainMsg(true);
        const draft = await generateRainDelayMessage(tomorrowStr);
        setRainMessage(draft);
        setIsGeneratingRainMsg(false);

        setRainStep('config');
        setIsRainModalOpen(true);
    };

    const confirmRainReschedule = async () => {
        if (affectedJobs.length === 0) return;
        setIsSavingRainDelay(true);
        setRainError(null);

        try {
            // Batch update jobs using Promise.all for speed/reliability
            await Promise.all(affectedJobs.map(job =>
                updateJob(job.id, {
                    scheduled_date: rainRescheduleDate,
                    is_rain_delayed: true,
                    // Append a system note
                    notes: (job.notes ? job.notes + '\n' : '') + `[System] Rescheduled due to rain to ${rainRescheduleDate}`
                })
            ));

            setRainStep('notify');
        } catch (err: any) {
            console.error('Batch reschedule failed:', err);
            setRainError(err.message || 'Failed to reschedule some jobs. Please check your connection.');
        } finally {
            setIsSavingRainDelay(false);
        }
    };

    const regenerateRainMessage = async () => {
        if (!rainRescheduleDate) return;
        setIsGeneratingRainMsg(true);
        const draft = await generateRainDelayMessage(rainRescheduleDate);
        setRainMessage(draft);
        setIsGeneratingRainMsg(false);
    };

    // Helper to calculate time slots
    const startTime = 8 * 60; // 8:00 AM in minutes
    let currentTime = startTime;

    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-8rem)]">
            {/* Sidebar / Controls */}
            <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Daily Route</h1>
                    <p className="text-slate-500">Today's Active Schedule</p>
                </div>

                {/* MowCast Widget */}
                <WeatherWidget />

                {/* Rain Delay Button */}
                <button
                    onClick={handleOpenRainMode}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-xl shadow-md flex items-center justify-between group transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors">
                            <CloudRain size={20} className="text-blue-300" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-sm">Rain Delay Mode</h3>
                            <p className="text-xs text-slate-400">Reschedule Today's Route</p>
                        </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors" />
                </button>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Truck size={18} className="text-slate-400" />
                            Route Efficiency
                        </h3>
                        {optimizationReasoning && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Optimized</span>}
                    </div>

                    <p className="text-sm text-slate-500 mb-4">
                        {optimizationReasoning
                            ? optimizationReasoning
                            : "Current route is based on booking order. Use AI to optimize travel time based on traffic."}
                    </p>

                    {groundingUrls.length > 0 && (
                        <div className="mb-4 text-xs bg-slate-50 p-2 rounded border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                                <Map size={12} /> Traffic Data Sources
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {groundingUrls.map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline truncate max-w-[200px]"
                                    >
                                        Google Maps {i + 1}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleOptimizeRoute}
                        disabled={isOptimizing || scheduledJobs.length < 2}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-indigo-200 shadow-lg group"
                    >
                        {isOptimizing ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                        {isOptimizing ? 'Analyzing Traffic...' : 'Smart Route Optimize'}
                    </button>
                </div>

                <div className="flex-1 bg-slate-100 rounded-xl p-4 min-h-[300px] lg:min-h-0">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pending Leads / Unscheduled</h4>
                    <div className="space-y-3">
                        {pendingJobs.map(job => (
                            <div
                                key={job.id}
                                onClick={() => setViewJob(job)}
                                className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-90 hover:opacity-100 group cursor-pointer hover:border-blue-300 transition-all"
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-slate-800 text-sm">{job.customer_name}</span>
                                    <button
                                        onClick={(e) => handleQuickAdd(e, job.id)}
                                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1 truncate">{job.address}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{job.duration_minutes}m</span>
                                </div>
                            </div>
                        ))}
                        {pendingJobs.length === 0 && (
                            <p className="text-sm text-slate-400 italic text-center py-4">No pending jobs.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Schedule Timeline */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px] lg:min-h-0">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Timeline</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span>Job</span>
                        <span className="w-3 h-3 rounded-full bg-slate-300 ml-2"></span>
                        <span>Travel</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 relative">
                    <div className="absolute left-16 top-0 bottom-0 w-px bg-slate-100"></div>

                    {scheduledJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Calendar size={48} className="mb-4 opacity-50" />
                            <p>No jobs scheduled for today.</p>
                        </div>
                    ) : (
                        scheduledJobs.map((job, idx) => {
                            const jobStart = currentTime;
                            const jobEnd = jobStart + job.duration_minutes;

                            // Format times
                            const startStr = `${Math.floor(jobStart / 60)}:${(jobStart % 60).toString().padStart(2, '0')}`;

                            // Update time for next job (add 15 mins travel time mock)
                            currentTime = jobEnd + 15;

                            return (
                                <div key={job.id} className="relative pl-24 pb-8 group">
                                    {/* Time Label */}
                                    <div className="absolute left-0 top-0 w-16 text-right text-xs font-medium text-slate-400">
                                        {startStr}
                                    </div>

                                    {/* Job Card */}
                                    <div
                                        onClick={() => setViewJob(job)}
                                        className={`relative border rounded-lg p-4 transition-all cursor-pointer ${job.is_rain_delayed
                                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                                            : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
                                            }`}
                                    >
                                        <div className="absolute top-0 bottom-0 -left-[33px] w-0.5 bg-slate-200 group-last:bg-transparent">
                                            <div className={`absolute top-4 -left-[5px] w-[11px] h-[11px] rounded-full border-2 border-white ring-1 ${job.is_rain_delayed ? 'bg-blue-500 ring-blue-100' : 'bg-emerald-500 ring-emerald-100'}`}></div>
                                        </div>

                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                {job.is_rain_delayed && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100/50 px-1.5 py-0.5 rounded border border-blue-200 mb-1 w-fit">
                                                        <CloudRain size={10} /> Rain Delayed
                                                    </span>
                                                )}
                                                <h4 className={`font-semibold ${job.is_rain_delayed ? 'text-blue-900' : 'text-emerald-900'}`}>{job.customer_name}</h4>
                                            </div>
                                            <div className="flex gap-2">
                                                {job.phone && (
                                                    <button
                                                        onClick={(e) => handleGenerateETA(e, job)}
                                                        className={`${job.is_rain_delayed ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-200' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200'} p-0.5 rounded transition-colors`}
                                                        title="Draft ETA SMS"
                                                    >
                                                        {loadingEtaId === job.id ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
                                                    </button>
                                                )}
                                                <span className={`text-xs font-bold ${job.is_rain_delayed ? 'text-blue-700 bg-white/50' : 'text-emerald-700 bg-white/50'} px-2 py-0.5 rounded`}>
                                                    £{job.price_quote}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-4 text-sm ${job.is_rain_delayed ? 'text-blue-800/80' : 'text-emerald-800/80'} mb-2`}>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} />
                                                <span className="truncate max-w-[200px]">{job.address}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{job.duration_minutes} min</span>
                                            </div>
                                        </div>

                                        {job.notes && (
                                            <div className={`text-xs p-2 rounded truncate ${job.is_rain_delayed ? 'text-blue-700 bg-blue-100/50' : 'text-emerald-700 bg-emerald-100/50'}`}>
                                                Note: {job.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Travel Indicator (don't show after last item) */}
                                    {idx < scheduledJobs.length - 1 && (
                                        <div className="ml-4 mt-2 mb-2 flex items-center gap-2 text-xs text-slate-400">
                                            <div className="h-6 w-0.5 border-l-2 border-dashed border-slate-300 mx-auto absolute left-[26px]"></div>
                                            <ArrowRight size={12} className="rotate-90 text-slate-300 ml-[2px]" />
                                            <span>~15 mins travel</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {viewJob && (
                <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />
            )}

            {/* ETA Preview Modal for Quick Actions */}
            {etaPreview && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <MessageCircle size={20} className="text-blue-500" /> Draft ETA
                            </h3>
                            <button onClick={() => setEtaPreview(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <textarea
                            className="w-full text-sm p-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 mb-4 focus:ring-2 focus:ring-blue-100 outline-none"
                            rows={4}
                            value={etaPreview.text}
                            onChange={(e) => setEtaPreview({ ...etaPreview, text: e.target.value })}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyETA}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${copySuccess ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
                                    }`}
                            >
                                {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
                                {copySuccess ? 'Copied!' : 'Copy Text'}
                            </button>
                            <a
                                href={`sms:${etaPreview.job.phone?.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(etaPreview.text)}`}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Smartphone size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Rain Delay Modal */}
            {isRainModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className={`px-6 py-5 border-b ${rainStep === 'config' ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} flex justify-between items-center`}>
                            <h3 className={`font-bold text-lg flex items-center gap-2 ${rainStep === 'config' ? 'text-indigo-800' : 'text-emerald-800'}`}>
                                {rainStep === 'config' ? <CloudRain size={20} /> : <CheckCircle size={20} />}
                                {rainStep === 'config' ? 'Rain Delay Rescheduler' : 'Reschedule Complete'}
                            </h3>
                            <button onClick={() => setIsRainModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {rainStep === 'config' ? (
                            <div className="p-6">
                                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                                    <AlertTriangle size={20} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-orange-800">
                                        <span className="font-bold">{affectedJobs.length} jobs found</span> for today. This action will move them all to a new date.
                                    </div>
                                </div>

                                {rainError && (
                                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-start gap-3 mb-6">
                                        <AlertTriangle size={20} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-rose-800">
                                            {rainError}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Reschedule to</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={rainRescheduleDate}
                                            onChange={(e) => {
                                                setRainRescheduleDate(e.target.value);
                                                // Slight delay to allow state update before regenerating
                                                setTimeout(regenerateRainMessage, 100);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <label className="block text-sm font-medium text-slate-700">Notification Message (SMS)</label>
                                            {isGeneratingRainMsg && <span className="text-xs text-indigo-500 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> AI Drafting...</span>}
                                        </div>
                                        <textarea
                                            className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                                            value={rainMessage}
                                            onChange={(e) => setRainMessage(e.target.value)}
                                        />
                                        <p className="text-xs text-slate-400 mt-1">This message will be copied for each customer.</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsRainModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmRainReschedule}
                                        disabled={affectedJobs.length === 0 || !rainRescheduleDate || isSavingRainDelay}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isSavingRainDelay ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Rescheduling...
                                            </>
                                        ) : (
                                            'Confirm & Reschedule'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col h-full overflow-hidden">
                                <p className="text-sm text-slate-600 mb-4">
                                    All jobs have been moved to <strong>{new Date(rainRescheduleDate).toLocaleDateString()}</strong>.
                                    Use the list below to notify customers.
                                </p>

                                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 mb-4">
                                    {affectedJobs.map(job => (
                                        <div key={job.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                            <div>
                                                <p className="font-semibold text-slate-900 text-sm">{job.customer_name}</p>
                                                <p className="text-xs text-slate-500">{job.phone || 'No phone number'}</p>
                                            </div>

                                            {job.phone ? (
                                                <a
                                                    href={`sms:${job.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(rainMessage)}`}
                                                    className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Send size={12} /> Send SMS
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">No contact</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsRainModalOpen(false)}
                                    className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedule;