import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus, Job, LawnSize, Frequency } from '../types';
import { generateCustomerResponse } from '../services/geminiService';
import JobDetailModal from '../components/JobDetailModal';
import { Check, X, MessageSquare, Loader2, MapPin, DollarSign, Calendar, Eye, PoundSterling, Plus, Tag, Phone, Mail } from 'lucide-react';

interface NewLeadState {
  customerName: string;
  address: string;
  email: string;
  phone: string;
  zone: string;
  frequency: Frequency;
  lawnSize: LawnSize;
  priceQuote: number;
  durationMinutes: number;
  leadSource: string;
  notes: string;
}

const Leads: React.FC = () => {
  const { jobs, updateJobStatus, addJob, settings } = useJobs();
  const leads = jobs.filter(j => j.status === JobStatus.PENDING);
  
  const [selectedLead, setSelectedLead] = useState<Job | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewLead, setViewLead] = useState<Job | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState<NewLeadState>({
    customerName: '',
    address: '',
    email: '',
    phone: '',
    zone: settings.zones[0] || '',
    frequency: Frequency.FORTNIGHTLY,
    lawnSize: LawnSize.MEDIUM,
    priceQuote: 35,
    durationMinutes: 45,
    leadSource: 'Referral',
    notes: ''
  });

  const handleActionClick = async (lead: Job, type: 'accept' | 'reject') => {
    setSelectedLead(lead);
    setActionType(type);
    setIsGenerating(true);
    setAiResponse('');
    
    const response = await generateCustomerResponse(lead, type);
    setAiResponse(response);
    setIsGenerating(false);
  };

  const handleConfirmAction = () => {
    if (selectedLead && actionType) {
      updateJobStatus(selectedLead.id, actionType === 'accept' ? JobStatus.SCHEDULED : JobStatus.CANCELLED);
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setSelectedLead(null);
    setActionType(null);
    setAiResponse('');
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.customerName || !newLead.address) return;

    const job: Job = {
      id: crypto.randomUUID(),
      customerId: crypto.randomUUID(),
      customerName: newLead.customerName,
      address: newLead.address,
      email: newLead.email,
      phone: newLead.phone,
      zone: newLead.zone,
      postcode: '',
      frequency: newLead.frequency,
      lawnSize: newLead.lawnSize,
      priceQuote: newLead.priceQuote || 0,
      durationMinutes: newLead.durationMinutes || 0,
      status: JobStatus.PENDING,
      leadSource: newLead.leadSource,
      notes: newLead.notes
    };

    addJob(job);
    setIsAddModalOpen(false);
    setNewLead({
      customerName: '',
      address: '',
      email: '',
      phone: '',
      zone: settings.zones[0] || '',
      frequency: Frequency.FORTNIGHTLY,
      lawnSize: LawnSize.MEDIUM,
      priceQuote: 35,
      durationMinutes: 45,
      leadSource: 'Referral',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
           <p className="text-slate-500">Review and action incoming quote requests.</p>
        </div>
        <div className="flex gap-3 items-center">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {leads.length} Pending
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-lawn-600 hover:bg-lawn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <Plus size={18} /> New Lead
            </button>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <MessageSquare size={24} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No pending leads</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-1">
            New quote requests from the booking page or manually added leads will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => setViewLead(lead)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-lawn-600 transition-colors">{lead.customerName}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">New</span>
                    {lead.zone && (
                         <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                            <MapPin size={10} /> {lead.zone}
                        </span>
                    )}
                    {lead.leadSource && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                            <Tag size={10} /> {lead.leadSource}
                        </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 mt-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-slate-400 shrink-0" />
                       <span className="truncate">{lead.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <PoundSterling size={16} className="text-slate-400 shrink-0" />
                       £{lead.priceQuote} / {lead.frequency}
                    </div>
                    <div className="flex items-center gap-2">
                       <Calendar size={16} className="text-slate-400 shrink-0" />
                       {lead.lawnSize} ({lead.durationMinutes}m)
                    </div>
                    <div className="flex items-center gap-2">
                       <Phone size={16} className="text-slate-400 shrink-0" />
                       {lead.phone || 'No phone'}
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                       <Mail size={16} className="text-slate-400 shrink-0" />
                       <span className="truncate">{lead.email || 'No email'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button 
                    onClick={() => setViewLead(lead)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  <button 
                    onClick={() => handleActionClick(lead, 'reject')}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject Lead"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={() => handleActionClick(lead, 'accept')}
                    className="flex items-center gap-2 bg-lawn-600 hover:bg-lawn-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap"
                  >
                    <Check size={18} /> Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewLead && (
        <JobDetailModal job={viewLead} onClose={() => setViewLead(null)} />
      )}

      {/* Create Lead Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Add Manual Lead</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateLead} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            value={newLead.customerName}
                            onChange={e => setNewLead({...newLead, customerName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            value={newLead.address}
                            onChange={e => setNewLead({...newLead, address: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Service Area (Zone)</label>
                            <select 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newLead.zone}
                                onChange={e => setNewLead({...newLead, zone: e.target.value})}
                            >
                                <option value="">Select an area...</option>
                                {settings.zones.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Lead Source</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newLead.leadSource}
                                onChange={e => setNewLead({...newLead, leadSource: e.target.value})}
                            >
                                <option value="Referral">Referral</option>
                                <option value="Walk-in">Walk-in</option>
                                <option value="Flyer">Flyer</option>
                                <option value="Facebook">Facebook</option>
                                <option value="Google Search">Google Search</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Opt)</label>
                            <input 
                                type="email" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newLead.email}
                                onChange={e => setNewLead({...newLead, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone (Opt)</label>
                            <input 
                                type="tel" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newLead.phone}
                                onChange={e => setNewLead({...newLead, phone: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newLead.frequency}
                                onChange={e => setNewLead({...newLead, frequency: e.target.value as Frequency})}
                            >
                                {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Lawn Size</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newLead.lawnSize}
                                onChange={e => setNewLead({...newLead, lawnSize: e.target.value as LawnSize})}
                            >
                                {Object.values(LawnSize).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Est. Price ({settings.currency})</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newLead.priceQuote}
                                onChange={e => setNewLead({...newLead, priceQuote: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Est. Duration (min)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newLead.durationMinutes}
                                onChange={e => setNewLead({...newLead, durationMinutes: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            rows={3}
                            value={newLead.notes}
                            onChange={e => setNewLead({...newLead, notes: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                        <button 
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-lawn-600 hover:bg-lawn-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Create Lead
                        </button>
                    </div>
                </form>
             </div>
          </div>
      )}

      {selectedLead && actionType && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`px-6 py-4 border-b ${actionType === 'accept' ? 'bg-lawn-50 border-lawn-100' : 'bg-red-50 border-red-100'}`}>
              <h3 className={`text-lg font-bold ${actionType === 'accept' ? 'text-lawn-800' : 'text-red-800'}`}>
                {actionType === 'accept' ? 'Accept Job' : 'Decline Lead'}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                Review the AI-generated response for <strong>{selectedLead.customerName}</strong> below.
              </p>
              
              <div className="relative">
                {isGenerating ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
                    <Loader2 className="animate-spin mb-2" size={24} />
                    <span className="text-sm">Drafting email...</span>
                  </div>
                ) : (
                  <textarea 
                    className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none text-sm leading-relaxed"
                    value={aiResponse}
                    onChange={(e) => setAiResponse(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmAction}
                disabled={isGenerating}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  actionType === 'accept' 
                    ? 'bg-lawn-600 hover:bg-lawn-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'accept' ? 'Confirm & Schedule' : 'Decline & Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;