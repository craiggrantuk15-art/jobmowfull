import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Code2, Copy, CheckCircle, ExternalLink, Inbox, Eye, UserPlus, Trash2, RefreshCcw, Globe, Clock, Mail, Phone, MapPin, ArrowRight, Palette, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface EmbedSubmission {
    id: string;
    organization_id: string;
    name: string;
    email: string;
    phone: string | null;
    address: string;
    postcode: string | null;
    service_name: string | null;
    property_type: string | null;
    lawn_size: string | null;
    frequency: string;
    extras: string[];
    estimated_price: number | null;
    estimated_duration: number | null;
    status: 'new' | 'contacted' | 'converted' | 'dismissed';
    source_url: string | null;
    notes: string | null;
    created_at: string;
    converted_job_id: string | null;
}

const EmbedWidget: React.FC = () => {
    const { settings } = useJobs();
    const { organizationId } = useAuth();
    const [activeTab, setActiveTab] = useState<'setup' | 'submissions'>('setup');
    const [codeCopied, setCodeCopied] = useState(false);
    const [submissions, setSubmissions] = useState<EmbedSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<EmbedSubmission | null>(null);
    const [accentColor, setAccentColor] = useState('#16a34a');
    const [showPreview, setShowPreview] = useState(false);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

    const embedCode = `<!-- JobMow Quote Widget -->
<div id="jobmow-quote-widget"></div>
<script src="${window.location.origin}/embed.js" data-org="${organizationId}" data-accent="${accentColor}"></script>`;

    const embedCodeCDN = `<!-- JobMow Quote Widget (Hosted) -->
<div id="jobmow-quote-widget"></div>
<script>
(function(){
  var s=document.createElement('script');
  s.src='${window.location.origin}/embed.js';
  s.setAttribute('data-org','${organizationId}');
  s.setAttribute('data-accent','${accentColor}');
  document.currentScript.parentNode.appendChild(s);
})();
</script>`;

    useEffect(() => {
        if (organizationId && activeTab === 'submissions') {
            fetchSubmissions();
        }
    }, [organizationId, activeTab]);

    const fetchSubmissions = async () => {
        if (!organizationId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('embed_submissions')
                .select('*')
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubmissions(data || []);
        } catch (e) {
            console.error('Error fetching embed submissions:', e);
        } finally {
            setLoading(false);
        }
    };

    const updateSubmissionStatus = async (id: string, status: 'new' | 'contacted' | 'converted' | 'dismissed') => {
        try {
            const { error } = await supabase
                .from('embed_submissions')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
            setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
            if (selectedSubmission?.id === id) {
                setSelectedSubmission(prev => prev ? { ...prev, status } : null);
            }
        } catch (e) {
            console.error('Error updating submission status:', e);
        }
    };

    const handleCopy = (text: string) => {
        const onSuccess = () => {
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2500);
        };

        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
                fallbackCopy(text, onSuccess);
            });
        } else {
            fallbackCopy(text, onSuccess);
        }
    };

    const fallbackCopy = (text: string, onSuccess: () => void) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            onSuccess();
        } catch (e) {
            console.error('Copy failed:', e);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'contacted': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'converted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'dismissed': return 'bg-slate-100 text-slate-500 border-slate-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const newCount = submissions.filter(s => s.status === 'new').length;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-lawn-100 rounded-xl text-lawn-600">
                            <Code2 size={20} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Embed Quote Widget</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Add a professional quote form to your website with a single code snippet.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white rounded-xl border border-slate-200 shadow-sm p-1 w-fit">
                <button
                    onClick={() => setActiveTab('setup')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'setup'
                        ? 'bg-lawn-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Code2 size={16} /> Setup & Embed
                </button>
                <button
                    onClick={() => setActiveTab('submissions')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all relative ${activeTab === 'submissions'
                        ? 'bg-lawn-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Inbox size={16} /> Submissions
                    {newCount > 0 && (
                        <span className={`ml-1 px-2 py-0.5 text-xs font-black rounded-full ${activeTab === 'submissions'
                            ? 'bg-white/20 text-white'
                            : 'bg-red-500 text-white animate-pulse'
                            }`}>{newCount}</span>
                    )}
                </button>
            </div>

            {/* ─── Setup Tab ─── */}
            {activeTab === 'setup' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    {/* How it works */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                <Sparkles size={20} className="text-lawn-600" /> How It Works
                            </h3>
                            <p className="text-sm text-slate-500 mb-6">Three simple steps to get your quote form live on your website.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-lawn-100 text-lawn-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-black">1</div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">Copy the Code</h4>
                                    <p className="text-xs text-slate-500">Copy the embed snippet below to your clipboard.</p>
                                </div>
                                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-lawn-100 text-lawn-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-black">2</div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">Paste on Your Site</h4>
                                    <p className="text-xs text-slate-500">Add it to any HTML page where you want the form.</p>
                                </div>
                                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-lawn-100 text-lawn-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-black">3</div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">Receive Leads</h4>
                                    <p className="text-xs text-slate-500">Quote submissions appear here automatically!</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customization */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                    <Palette size={20} className="text-purple-500" /> Customize
                                </h3>
                                <p className="text-sm text-slate-500">Match the widget to your brand colours.</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accent Colour</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="w-12 h-12 rounded-xl cursor-pointer border-2 border-slate-200 p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                            className="px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm w-28 uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    {['#16a34a', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0891b2'].map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setAccentColor(c)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${accentColor === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                                            style={{ background: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Embed Code */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                        <Code2 size={20} className="text-blue-500" /> Your Embed Code
                                    </h3>
                                    <p className="text-sm text-slate-500">Paste this HTML snippet into your website.</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(embedCode)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${codeCopied
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                                        }`}
                                >
                                    {codeCopied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
                                </button>
                            </div>

                            <div className="relative">
                                <pre className="bg-slate-900 text-slate-300 rounded-2xl p-6 text-xs leading-relaxed overflow-x-auto font-mono">
                                    <code>{embedCode}</code>
                                </pre>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="text-amber-600 mt-0.5 shrink-0">⚡</div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Pro Tip</p>
                                    <p className="text-xs text-amber-700 mt-0.5">
                                        The widget automatically uses your pricing from Settings &gt; Pricing. Update your pricing there to keep quotes accurate on your website.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Toggle */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Eye size={20} className="text-slate-400" />
                                <div className="text-left">
                                    <h3 className="text-base font-bold text-slate-900">Live Preview</h3>
                                    <p className="text-xs text-slate-500">See how the widget looks before embedding.</p>
                                </div>
                            </div>
                            {showPreview ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </button>
                        {showPreview && (
                            <div className="px-6 pb-6 border-t border-slate-100 pt-6">
                                <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
                                    <p className="text-center text-xs text-slate-400 mb-4 uppercase tracking-widest font-bold">Widget Preview</p>
                                    <div id="jm-preview-container" className="max-w-lg mx-auto">
                                        {/* Preview iframe placeholder */}
                                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                                            <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)` }}>
                                                <h2 className="text-white text-lg font-bold">Get an Instant Quote</h2>
                                                <p className="text-white/80 text-xs mt-1">Powered by {settings.businessName}</p>
                                            </div>
                                            <div className="flex gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200">
                                                <div className="flex-1 h-1 rounded-full" style={{ background: accentColor }} />
                                                <div className="flex-1 h-1 rounded-full bg-slate-200" />
                                                <div className="flex-1 h-1 rounded-full bg-slate-200" />
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800 mb-2">Select your service</div>
                                                    <div className="text-xs text-slate-500">What help does your property need?</div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-current transition-colors" style={{ color: accentColor }}>
                                                        <div className="text-xs font-bold text-slate-800">Standard Lawn Mowing</div>
                                                        <div className="text-[10px] text-slate-400 mt-1">Professional cutting service</div>
                                                    </div>
                                                    <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-current transition-colors" style={{ color: accentColor }}>
                                                        <div className="text-xs font-bold text-slate-800">Hedge Trimming</div>
                                                        <div className="text-[10px] text-slate-400 mt-1">Shape and maintain hedges</div>
                                                    </div>
                                                </div>
                                                <div className="text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                                                    Powered by <span className="font-bold" style={{ color: accentColor }}>JobMow</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Submissions Tab ─── */}
            {activeTab === 'submissions' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Actions bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-slate-900">
                                {submissions.length} Submission{submissions.length !== 1 ? 's' : ''}
                            </h3>
                            {newCount > 0 && (
                                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                                    {newCount} new
                                </span>
                            )}
                        </div>
                        <button
                            onClick={fetchSubmissions}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                        >
                            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                    </div>

                    {loading && submissions.length === 0 ? (
                        <div className="text-center py-20">
                            <RefreshCcw size={24} className="animate-spin text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">Loading submissions...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Inbox size={32} className="text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No submissions yet</h3>
                            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                                Embed the quote widget on your website and submissions will appear here automatically.
                            </p>
                            <button
                                onClick={() => setActiveTab('setup')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-lawn-600 text-white rounded-lg text-sm font-bold hover:bg-lawn-700 transition-colors shadow-md"
                            >
                                <Code2 size={16} /> Get Embed Code
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-6">
                            {/* Submissions List */}
                            <div className={`flex-1 space-y-3 ${selectedSubmission ? 'hidden md:block md:max-w-sm' : ''}`}>
                                {submissions.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className={`w-full text-left bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 group ${selectedSubmission?.id === sub.id
                                            ? 'border-lawn-500 ring-2 ring-lawn-100'
                                            : 'border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${sub.status === 'new' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                                <span className="font-bold text-slate-900 text-sm">{sub.name}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 mb-1.5 truncate">{sub.address}</div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                            {sub.service_name && <span>{sub.service_name}</span>}
                                            {sub.estimated_price && (
                                                <span className="font-bold text-slate-600">{settings.currency}{sub.estimated_price.toFixed(2)}</span>
                                            )}
                                            <span className="ml-auto">{new Date(sub.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Submission Detail */}
                            {selectedSubmission && (
                                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-8 duration-300">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{selectedSubmission.name}</h3>
                                            <p className="text-xs text-slate-400">
                                                Submitted {new Date(selectedSubmission.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedSubmission(null)}
                                            className="md:hidden text-sm text-slate-400 hover:text-slate-600"
                                        >✕</button>
                                    </div>

                                    <div className="p-6 space-y-6">
                                        {/* Status Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            {(['new', 'contacted', 'converted', 'dismissed'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateSubmissionStatus(selectedSubmission.id, s)}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all capitalize ${selectedSubmission.status === s
                                                        ? getStatusColor(s) + ' ring-2 ring-offset-1'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Quote */}
                                        {selectedSubmission.estimated_price && (
                                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quoted Price</div>
                                                <div className="text-4xl font-black">
                                                    <span className="text-lawn-400">{settings.currency}</span>
                                                    {selectedSubmission.estimated_price.toFixed(2)}
                                                </div>
                                                {selectedSubmission.estimated_duration && (
                                                    <div className="text-xs text-slate-400 mt-1">{selectedSubmission.estimated_duration} min estimated</div>
                                                )}
                                            </div>
                                        )}

                                        {/* Contact Details */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</h4>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail size={14} className="text-slate-400" />
                                                <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 font-medium hover:underline">{selectedSubmission.email}</a>
                                            </div>
                                            {selectedSubmission.phone && (
                                                <div className="flex items-center gap-3 text-sm">
                                                    <Phone size={14} className="text-slate-400" />
                                                    <a href={`tel:${selectedSubmission.phone}`} className="text-slate-700 font-medium">{selectedSubmission.phone}</a>
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3 text-sm">
                                                <MapPin size={14} className="text-slate-400 mt-0.5" />
                                                <div>
                                                    <div className="text-slate-700 font-medium">{selectedSubmission.address}</div>
                                                    {selectedSubmission.postcode && <div className="text-slate-400 text-xs">{selectedSubmission.postcode}</div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Service Details */}
                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Details</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedSubmission.service_name && (
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Service</div>
                                                        <div className="text-xs font-bold text-slate-700">{selectedSubmission.service_name}</div>
                                                    </div>
                                                )}
                                                {selectedSubmission.property_type && (
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Property</div>
                                                        <div className="text-xs font-bold text-slate-700">{selectedSubmission.property_type}</div>
                                                    </div>
                                                )}
                                                {selectedSubmission.lawn_size && (
                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Size</div>
                                                        <div className="text-xs font-bold text-slate-700">{selectedSubmission.lawn_size}</div>
                                                    </div>
                                                )}
                                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Frequency</div>
                                                    <div className="text-xs font-bold text-slate-700">{selectedSubmission.frequency}</div>
                                                </div>
                                            </div>
                                            {selectedSubmission.extras.length > 0 && (
                                                <div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Extras</div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {selectedSubmission.extras.map((ex, i) => (
                                                            <span key={i} className="text-[10px] bg-lawn-50 text-lawn-700 px-2 py-0.5 rounded-full border border-lawn-100 font-bold">{ex}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Source URL */}
                                        {selectedSubmission.source_url && (
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Globe size={12} />
                                                <span className="truncate">{selectedSubmission.source_url}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmbedWidget;
