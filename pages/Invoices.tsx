import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus, PaymentStatus, Job } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import { DollarSign, CheckCircle, AlertCircle, FileText, Calendar, Search, PoundSterling } from 'lucide-react';

const Invoices: React.FC = () => {
  const { jobs } = useJobs();
  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter jobs: Must be COMPLETED
  const completedJobs = jobs.filter(j => j.status === JobStatus.COMPLETED);
  
  const filteredJobs = completedJobs
    .filter(j => 
        activeTab === 'unpaid' 
            ? j.paymentStatus === PaymentStatus.UNPAID 
            : j.paymentStatus === PaymentStatus.PAID
    )
    .filter(j => 
        j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalOutstanding = completedJobs
    .filter(j => j.paymentStatus === PaymentStatus.UNPAID)
    .reduce((acc, j) => acc + j.priceQuote, 0);

  const totalCollected = completedJobs
    .filter(j => j.paymentStatus === PaymentStatus.PAID)
    .reduce((acc, j) => acc + j.priceQuote, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Invoices & Payments</h1>
           <p className="text-slate-500">Manage customer billing and track revenue.</p>
        </div>
      </div>

      {/* Financial Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Outstanding Card */}
          <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertCircle size={120} className="text-red-500" />
             </div>
             <div className="relative z-10">
                <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Total Outstanding
                </p>
                <h3 className="text-4xl font-bold text-slate-900 mb-1">£{totalOutstanding.toFixed(2)}</h3>
                <p className="text-sm text-slate-500">
                    Across <span className="font-semibold text-slate-700">{completedJobs.filter(j => j.paymentStatus === PaymentStatus.UNPAID).length}</span> unpaid invoices
                </p>
             </div>
             <div className="p-4 bg-red-50 text-red-600 rounded-full z-10 shadow-sm border border-red-100">
                <FileText size={32} />
             </div>
          </div>
          
          {/* Collected Card */}
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CheckCircle size={120} className="text-emerald-500" />
             </div>
             <div className="relative z-10">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle size={16} /> Total Collected
                </p>
                <h3 className="text-4xl font-bold text-slate-900 mb-1">£{totalCollected.toFixed(2)}</h3>
                <p className="text-sm text-slate-500">
                    From <span className="font-semibold text-slate-700">{completedJobs.filter(j => j.paymentStatus === PaymentStatus.PAID).length}</span> paid jobs
                </p>
             </div>
             <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full z-10 shadow-sm border border-emerald-100">
                <PoundSterling size={32} />
             </div>
          </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('unpaid')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'unpaid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  Unpaid
              </button>
              <button 
                onClick={() => setActiveTab('paid')}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'paid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                  Paid History
              </button>
          </div>
          
          <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                 type="text" 
                 placeholder="Search customer..."
                 className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lawn-500"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
         {filteredJobs.length === 0 ? (
             <div className="p-12 text-center text-slate-500">
                 <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                     <FileText size={32} className="text-slate-300" />
                 </div>
                 <p>No {activeTab} invoices found.</p>
             </div>
         ) : (
             <div className="divide-y divide-slate-100">
                 {filteredJobs.map(job => (
                     <div key={job.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div className="flex items-start gap-3">
                             <div className={`mt-1 p-2 rounded-lg ${activeTab === 'unpaid' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                 {activeTab === 'unpaid' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                             </div>
                             <div>
                                 <h3 className="font-semibold text-slate-900">{job.customerName}</h3>
                                 <p className="text-sm text-slate-500">{job.address}</p>
                                 <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                     <Calendar size={12} />
                                     <span>Completed: {job.completedDate?.split('T')[0] || 'N/A'}</span>
                                 </div>
                             </div>
                         </div>
                         
                         <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                             <div className="text-right mr-4">
                                 <p className="font-bold text-slate-900">£{job.priceQuote.toFixed(2)}</p>
                                 <p className="text-xs text-slate-500 capitalize">{job.frequency}</p>
                             </div>
                             <button 
                                onClick={() => setSelectedJob(job)}
                                className="px-4 py-2 bg-white border border-slate-200 hover:border-lawn-500 hover:text-lawn-600 text-slate-600 rounded-lg text-sm font-medium transition-all shadow-sm"
                             >
                                 View Invoice
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {selectedJob && (
          <InvoiceModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
};

export default Invoices;