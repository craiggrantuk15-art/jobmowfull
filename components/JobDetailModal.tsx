import React, { useState, useEffect } from 'react';
import { Job, JobStatus, CommunicationType } from '../types';
import { useJobs } from '../context/JobContext';
import { generateETAMessage } from '../services/geminiService';
import { X, MapPin, Calendar, Clock, DollarSign, FileText, CheckCircle, PoundSterling, Tag, Camera, Image as ImageIcon, MessageCircle, Loader2, Copy, Smartphone, Timer, Play, Square, CloudRain } from 'lucide-react';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job: initialJob, onClose }) => {
  const { jobs, updateJobStatus, updateJob, addCommunication, toggleJobTimer, settings } = useJobs();
  
  const job = jobs.find(j => j.id === initialJob.id) || initialJob;

  const [notes, setNotes] = useState(job.notes || '');
  const [isGeneratingETA, setIsGeneratingETA] = useState(false);
  const [generatedETA, setGeneratedETA] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const baseSeconds = Math.floor((job.actualDurationMinutes || 0) * 60);
    setElapsedSeconds(baseSeconds);

    let interval: any;
    if (job.isTimerRunning && job.timerStartTime) {
        const startTime = new Date(job.timerStartTime).getTime();
        const update = () => {
            const now = Date.now();
            const sessionSeconds = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(baseSeconds + sessionSeconds);
        };
        update();
        interval = setInterval(update, 1000);
    } else {
        setElapsedSeconds(baseSeconds);
    }
    
    return () => clearInterval(interval);
  }, [job.isTimerRunning, job.timerStartTime, job.actualDurationMinutes]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMarkComplete = () => {
      if (job.isTimerRunning) toggleJobTimer(job.id);
      updateJobStatus(job.id, JobStatus.COMPLETED);
      onClose();
  };

  const handleNotesBlur = () => {
      if (notes !== job.notes) updateJob(job.id, { notes });
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateJob(job.id, { zone: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
               const base64 = reader.result as string;
               const currentPhotos = job.photos || [];
               updateJob(job.id, { photos: [...currentPhotos, base64] });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGenerateETA = async () => {
      if (!job.phone) return;
      setIsGeneratingETA(true);
      const message = await generateETAMessage(job);
      setGeneratedETA(message);
      setIsGeneratingETA(false);
  };

  const handleCopyETA = () => {
      if (generatedETA) {
          navigator.clipboard.writeText(generatedETA);
          setCopySuccess(true);
          addCommunication({
            customerId: `${job.customerName}-${job.address}`,
            jobId: job.id,
            type: CommunicationType.SMS,
            subject: 'ETA Notification Sent',
            body: generatedETA
          });
          setTimeout(() => setCopySuccess(false), 2000);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="relative px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <button onClick={onClose} className="absolute top-5 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors z-10">
                <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-1 pr-8">
                <h2 className="text-xl font-bold text-slate-900 truncate">{job.customerName}</h2>
                <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                job.status === JobStatus.PENDING ? 'bg-blue-50 text-blue-700 border-blue-200' :
                job.status === JobStatus.SCHEDULED ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                job.status === JobStatus.COMPLETED ? 'bg-slate-100 text-slate-600 border-slate-200' :
                'bg-red-50 text-red-700 border-red-200'
                }`}>
                {job.status}
                </span>
                {job.isRainDelayed && (
                    <span className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <CloudRain size={10} /> Rain Delayed
                    </span>
                )}
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
                <MapPin size={14} /> {job.address}
            </p>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <PoundSterling size={16} /> <span className="text-xs font-medium uppercase tracking-wide">Quote</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{settings.currency}{job.priceQuote}</p>
              </div>
              <p className="text-xs text-slate-500 mt-2">{job.frequency} • {job.lawnSize}</p>
            </div>

            <div className={`p-4 rounded-lg border flex flex-col justify-between ${job.isTimerRunning ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Timer size={16} className={job.isTimerRunning ? "animate-pulse text-indigo-600" : ""} /> 
                        <span className="text-xs font-medium uppercase tracking-wide">Job Timer</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-2xl font-mono font-bold ${job.isTimerRunning ? 'text-indigo-700' : 'text-slate-900'}`}>
                        {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-400">/ {job.durationMinutes}m est.</span>
                </div>
                <button
                    onClick={() => toggleJobTimer(job.id)}
                    disabled={job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED}
                    className={`w-full py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        job.isTimerRunning 
                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    }`}
                >
                    {job.isTimerRunning ? <><Square size={12} fill="currentColor" /> Stop</> : <><Play size={12} fill="currentColor" /> Start</>}
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Service Area</h4>
                  <select 
                    value={job.zone || ''}
                    onChange={handleZoneChange}
                    className="w-full text-sm p-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-lawn-200"
                  >
                      <option value="">No Area Assigned</option>
                      {settings.zones.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</h4>
                  <p className="text-sm font-medium text-slate-700 truncate">{job.phone || 'No phone number'}</p>
              </div>
          </div>

          <div>
             <h3 className="text-sm font-medium text-slate-900 mb-2 flex items-center gap-2">
               <FileText size={16} className="text-slate-400" /> Notes & Instructions
             </h3>
             <textarea
               className="w-full bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed focus:ring-2 focus:ring-amber-400 outline-none resize-none"
               rows={3}
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               onBlur={handleNotesBlur}
               placeholder="Add job details here..."
             />
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors flex-1">
              Close
            </button>
            {job.status === JobStatus.SCHEDULED && (
                <button onClick={handleMarkComplete} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 flex-1 shadow-sm">
                  <CheckCircle size={18} /> Complete Job
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;