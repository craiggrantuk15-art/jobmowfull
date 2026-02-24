import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lead, Job, JobStatus, CommunicationType } from '../types';
import { Search, Mail, Building, Users as UsersIcon, Calendar, ArrowRight, UserPlus, Trash, Filter, Briefcase, MapPin, Clock, Globe } from 'lucide-react';
import CustomerOnboardingWizard from '../components/CustomerOnboardingWizard';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const Leads: React.FC = () => {
  const { organizationId } = useAuth();
  const { jobs, updateJobStatus } = useJobs();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [embedSubmissions, setEmbedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'booking_request' | 'founders_waitlist' | 'lead_magnet' | 'website_quote'>('all');

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  const pendingJobs = jobs.filter(j => j.status === JobStatus.PENDING);

  useEffect(() => {
    if (organizationId) {
      fetchLeads();
      fetchEmbedSubmissions();
    }
  }, [organizationId]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'new')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
    } else {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  const fetchEmbedSubmissions = async () => {
    if (!organizationId) return;
    const { data, error } = await supabase
      .from('embed_submissions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'new') // Only show new ones as leads
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching embed submissions:', error);
    } else {
      setEmbedSubmissions(data || []);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) {
        setLeads(prev => prev.filter(l => l.id !== id));
      }
    }
  };

  const handleConvert = (lead: any) => {
    setSelectedLead(lead);
    setIsWizardOpen(true);
  };

  const handleScheduleJob = async (id: string) => {
    await updateJobStatus(id, JobStatus.SCHEDULED);
    // Maybe redirect to schedule or show success
  };

  const handleOnboardingSuccess = async (jobId?: string) => {
    if (selectedLead && selectedLead.isEmbed) {
      const { error } = await supabase
        .from('embed_submissions')
        .update({
          status: 'converted',
          converted_job_id: jobId
        })
        .eq('id', selectedLead.id);

      if (error) {
        console.error('Error updating submission status:', error);
      } else {
        fetchEmbedSubmissions();
      }
    } else if (selectedLead && !selectedLead.isJob) {
      // Handle standard leads
      const { error } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_job_id: jobId
        })
        .eq('id', selectedLead.id);

      if (error) {
        console.error('Error updating lead status:', error);
      }
    }

    fetchLeads();
  };

  const combinedLeads = [
    ...leads.map(l => ({ ...l, isJob: false, isEmbed: false })),
    ...embedSubmissions.map(s => ({
      id: s.id,
      type: 'website_quote' as const,
      name: s.name,
      email: s.email,
      address: s.address,
      postcode: s.postcode,
      created_at: s.created_at,
      isJob: false,
      isEmbed: true,
      submission: s
    })),
    ...pendingJobs.map(j => ({
      id: j.id,
      type: 'booking_request' as const,
      name: j.customer_name,
      email: j.email || '',
      address: j.address,
      postcode: j.postcode,
      created_at: j.created_at || new Date().toISOString(),
      isJob: true,
      isEmbed: false,
      job: j
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredLeads = combinedLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.isJob ? lead.address.toLowerCase().includes(searchTerm.toLowerCase()) : (lead as any).business_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'all' || lead.type === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads & Waitlist</h1>
          <p className="text-slate-500">Manage incoming inquiries and convert them to customers.</p>
        </div>
        {/* <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold shadow-md hover:bg-slate-800 transition-colors">
                    <Download size={20} /> Export CSV
                </button> */}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lawn-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('booking_request')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'booking_request' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Booking Requests
          </button>
          <button
            onClick={() => setFilter('founders_waitlist')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'founders_waitlist' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Waitlist
          </button>
          <button
            onClick={() => setFilter('lead_magnet')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'lead_magnet' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Toolkit
          </button>
          <button
            onClick={() => setFilter('website_quote')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === 'website_quote' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Website Quotes
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Filter size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No leads found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="p-5 hover:bg-slate-50 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 text-lg">{lead.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${lead.type === 'booking_request' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        lead.type === 'founders_waitlist' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                          lead.type === 'website_quote' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                        {lead.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-6 text-sm text-slate-500 mt-2">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>

                      {lead.isJob && lead.job ? (
                        <>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-700">{lead.job.address}</span>
                          </div>
                          <div className="flex items-center gap-6 mt-1 sm:col-span-2">
                            <div className="flex items-center gap-2">
                              <Briefcase size={14} className="text-slate-400" />
                              <span className="font-bold text-slate-900">£{lead.job.price_quote}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              <span>{lead.job.duration_minutes} mins</span>
                            </div>
                          </div>
                        </>
                      ) : lead.isEmbed && lead.submission ? (
                        <>
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-700">{lead.submission.address}</span>
                          </div>
                          <div className="flex items-center gap-6 mt-1 sm:col-span-2">
                            <div className="flex items-center gap-2">
                              <Briefcase size={14} className="text-slate-400" />
                              <span className="font-bold text-slate-900">£{lead.submission.estimated_price}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe size={14} className="text-slate-400" />
                              <span className="truncate">
                                {lead.submission.service_name} • Website
                                {lead.submission.source_url && ` (${new URL(lead.submission.source_url).hostname})`}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {(lead as any).business_name && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Building size={14} className="text-slate-400" />
                              <span className="font-medium text-slate-700">{(lead as any).business_name}</span>
                            </div>
                          )}
                          {(lead as any).crew_size && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <UsersIcon size={14} className="text-slate-400" />
                              <span>Crew Size: {(lead as any).crew_size}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                    {!lead.isJob ? (
                      <>
                        {lead.isEmbed ? (
                          <button
                            onClick={() => handleConvert({
                              id: lead.id,
                              isEmbed: true,
                              name: lead.name,
                              email: lead.email,
                              address: lead.address,
                              postcode: lead.postcode,
                              service_name: lead.submission.service_name,
                              estimated_price: lead.submission.estimated_price
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-pink-600/10 text-pink-700 font-bold rounded-lg hover:bg-pink-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                          >
                            <UserPlus size={18} /> Convert Quote <ArrowRight size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => handleDelete(lead.id, e)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash size={18} />
                            </button>
                            <button
                              onClick={() => handleConvert(lead)}
                              className="flex items-center gap-2 px-4 py-2 bg-lawn-600/10 text-lawn-700 font-bold rounded-lg hover:bg-lawn-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                            >
                              <UserPlus size={18} /> Convert to Customer <ArrowRight size={16} />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleScheduleJob(lead.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md"
                        >
                          <Calendar size={18} /> Quick Schedule <ArrowRight size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Onboarding Wizard */}
      <CustomerOnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedLead(null);
        }}
        onSuccess={handleOnboardingSuccess}
        initialData={selectedLead ? {
          name: selectedLead.name,
          email: selectedLead.email,
          business_name: selectedLead.business_name,
          address: selectedLead.address,
          postcode: selectedLead.postcode,
          priceQuote: selectedLead.priceQuote || selectedLead.estimated_price,
          description: selectedLead.description || selectedLead.service_name
        } : undefined}
      />
    </div>
  );
};

export default Leads;