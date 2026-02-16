import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { Job, PaymentStatus, JobStatus, CommunicationType, Communication } from '../types';
import { Search, MapPin, Phone, Mail, Users, ArrowUpRight, PoundSterling, X, Calendar, Clock, CheckCircle, AlertCircle, Tag, MessageSquare, Mail as MailIcon, PhoneIncoming, Info, History, Edit2, Save } from 'lucide-react';

interface AggregatedCustomer {
  id: string; // Aggregated ID: name-address
  name: string;
  address: string;
  email: string | undefined;
  phone: string | undefined;
  totalJobs: number;
  totalSpent: number;
  lastVisit: string | undefined;
  status: 'Active' | 'Lead' | 'Churned';
}

interface CustomerMap {
  [key: string]: AggregatedCustomer;
}

const Customers: React.FC = () => {
  const { jobs, communications, addCommunication, updateCustomer, settings } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'communications'>('history');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
      name: '',
      email: '',
      phone: '',
      address: ''
  });

  // Call Logging State
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [callNotes, setCallNotes] = useState('');

  const initialCustomerMap: CustomerMap = {};
  const customersMap = jobs.reduce((acc, job) => {
    const key = `${job.customerName}-${job.address}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: job.customerName,
        address: job.address,
        email: job.email,
        phone: job.phone,
        totalJobs: 0,
        totalSpent: 0,
        lastVisit: undefined,
        status: 'Lead',
      };
    }
    const customer = acc[key];
    customer.totalJobs += 1;
    
    // Only count revenue from COMPLETED and PAID jobs as per requirements
    if (job.status === JobStatus.COMPLETED && job.paymentStatus === PaymentStatus.PAID) {
        customer.totalSpent += job.priceQuote;
    }
    
    if (job.status === JobStatus.SCHEDULED || job.status === JobStatus.COMPLETED) {
        customer.status = 'Active';
    }
    if (job.completedDate) {
        if (!customer.lastVisit || new Date(job.completedDate) > new Date(customer.lastVisit)) {
            customer.lastVisit = job.completedDate;
        }
    }
    if (!customer.email && job.email) customer.email = job.email;
    if (!customer.phone && job.phone) customer.phone = job.phone;
    return acc;
  }, initialCustomerMap);

  const allCustomers: AggregatedCustomer[] = Object.values(customersMap);
  const filteredCustomers = allCustomers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedCustomer = selectedCustomerId ? customersMap[selectedCustomerId] : null;
  const customerHistory = selectedCustomerId 
    ? jobs
        .filter(j => `${j.customerName}-${j.address}` === selectedCustomerId)
        .sort((a, b) => {
            const dateA = a.completedDate || a.scheduledDate || '1970-01-01';
            const dateB = b.completedDate || b.scheduledDate || '1970-01-01';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
    : [];

  const customerCommunications = selectedCustomerId
    ? communications
        .filter(c => c.customerId === selectedCustomerId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleOpenEdit = () => {
    if (selectedCustomer) {
        setEditFormData({
            name: selectedCustomer.name,
            email: selectedCustomer.email || '',
            phone: selectedCustomer.phone || '',
            address: selectedCustomer.address
        });
        setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedCustomerId && editFormData.name && editFormData.address) {
          updateCustomer(selectedCustomerId, {
              name: editFormData.name,
              address: editFormData.address,
              email: editFormData.email,
              phone: editFormData.phone
          });
          
          // Update the active ID so the modal stays open on the updated identity
          const newKey = `${editFormData.name}-${editFormData.address}`;
          setSelectedCustomerId(newKey);
          setIsEditModalOpen(false);
      }
  };

  const handleLogCall = () => {
    if (selectedCustomerId && callNotes.trim()) {
      addCommunication({
        customerId: selectedCustomerId,
        type: CommunicationType.CALL,
        subject: 'Inbound/Outbound Call',
        body: callNotes
      });
      setCallNotes('');
      setIsLogCallModalOpen(false);
    }
  };

  const getCommIcon = (type: CommunicationType) => {
    switch(type) {
      case CommunicationType.EMAIL: return <MailIcon size={14} className="text-blue-500" />;
      case CommunicationType.SMS: return <MessageSquare size={14} className="text-emerald-500" />;
      case CommunicationType.CALL: return <PhoneIncoming size={14} className="text-purple-500" />;
      default: return <Info size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
           <p className="text-slate-500">Directory of all clients and their lifetime value.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={20} />
                </div>
                <span className="text-sm text-slate-500 font-medium">Total Clients</span>
             </div>
             <p className="text-2xl font-bold text-slate-900">{allCustomers.length}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <PoundSterling size={20} />
                </div>
                <div>
                  <span className="text-sm text-slate-500 font-medium block leading-none">Avg. Lifetime Value</span>
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Paid & Completed</span>
                </div>
             </div>
             <p className="text-2xl font-bold text-slate-900">
                 {settings.currency}{(allCustomers.reduce((acc, c) => acc + c.totalSpent, 0) / (allCustomers.length || 1)).toFixed(2)}
             </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Users size={20} />
                </div>
                <span className="text-sm text-slate-500 font-medium">Active Now</span>
             </div>
             <p className="text-2xl font-bold text-slate-900">
                {allCustomers.filter(c => c.status === 'Active').length}
             </p>
          </div>
      </div>

      <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input 
             type="text" 
             placeholder="Search by name, address or email..."
             className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lawn-500 shadow-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
             <div className="text-center py-16">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Users size={24} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No customers found</h3>
             </div>
        ) : (
             <div className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => (
                    <div 
                        key={customer.id} 
                        onClick={() => setSelectedCustomerId(customer.id)}
                        className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-lawn-600 transition-colors">{customer.name}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                        customer.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        customer.status === 'Lead' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {customer.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="truncate">{customer.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" />
                                        <span className="truncate">{customer.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400" />
                                        <span>{customer.phone || 'No phone'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Spent</p>
                                    <p className="font-bold text-slate-900">{settings.currency}{customer.totalSpent.toFixed(0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Jobs</p>
                                    <p className="font-bold text-slate-900">{customer.totalJobs}</p>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-lawn-600 hover:bg-lawn-50 rounded-full transition-colors">
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        )}
      </div>

      {selectedCustomer && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                 <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                     <div>
                         <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                            <button 
                                onClick={handleOpenEdit}
                                className="p-1.5 text-slate-400 hover:text-lawn-600 hover:bg-lawn-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                            >
                                <Edit2 size={14} /> Edit Profile
                            </button>
                         </div>
                         <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm">
                             <MapPin size={14} /> {selectedCustomer.address}
                         </p>
                     </div>
                     <button 
                        onClick={() => setSelectedCustomerId(null)} 
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                     >
                         <X size={24} />
                     </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-6">
                     <div className="flex flex-col sm:flex-row gap-6 mb-8">
                         <div className="flex-1 space-y-3">
                             <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-2">Contact Details</h4>
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm">
                                     <Mail size={18} />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Email</p>
                                     <p className="text-sm font-medium text-slate-700">{selectedCustomer.email || 'Not provided'}</p>
                                 </div>
                             </div>
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <div className="p-2 bg-white rounded-full text-slate-400 shadow-sm">
                                     <Phone size={18} />
                                 </div>
                                 <div>
                                     <p className="text-xs text-slate-400">Phone</p>
                                     <p className="text-sm font-medium text-slate-700">{selectedCustomer.phone || 'Not provided'}</p>
                                 </div>
                             </div>
                         </div>

                         <div className="flex-1">
                             <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Lifetime Stats</h4>
                             <div className="grid grid-cols-2 gap-3">
                                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                     <p className="text-emerald-600 text-xs font-bold uppercase mb-1">Revenue</p>
                                     <p className="text-2xl font-bold text-emerald-800">{settings.currency}{selectedCustomer.totalSpent}</p>
                                 </div>
                                 <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                     <p className="text-blue-600 text-xs font-bold uppercase mb-1">Jobs Done</p>
                                     <p className="text-2xl font-bold text-blue-800">{selectedCustomer.totalJobs}</p>
                                 </div>
                             </div>
                             <button 
                                onClick={() => setIsLogCallModalOpen(true)}
                                className="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                             >
                                 <Phone size={16} /> Log Call Note
                             </button>
                         </div>
                     </div>

                     {/* Tab System for History vs Communications */}
                     <div className="flex items-center gap-6 border-b border-slate-100 mb-6">
                        <button 
                            onClick={() => setActiveSubTab('history')}
                            className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeSubTab === 'history' ? 'border-lawn-600 text-lawn-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2"><History size={16} /> Job History</span>
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('communications')}
                            className={`pb-2 text-sm font-bold transition-all border-b-2 ${activeSubTab === 'communications' ? 'border-lawn-600 text-lawn-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <span className="flex items-center gap-2">
                                <MessageSquare size={16} /> Comm Log
                                {customerCommunications.length > 0 && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">{customerCommunications.length}</span>}
                            </span>
                        </button>
                     </div>

                     {activeSubTab === 'history' ? (
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                            {customerHistory.map((job) => (
                                <div key={job.id} className="relative pl-8">
                                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                        job.status === JobStatus.COMPLETED ? 'bg-emerald-500' :
                                        job.status === JobStatus.SCHEDULED ? 'bg-blue-500' :
                                        job.status === JobStatus.CANCELLED ? 'bg-red-400' : 'bg-slate-400'
                                    }`}></div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-slate-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        job.status === JobStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                                                        job.status === JobStatus.SCHEDULED ? 'bg-blue-100 text-blue-700' :
                                                        job.status === JobStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar size={12} /> {job.completedDate?.split('T')[0] || job.scheduledDate?.split('T')[0] || 'Undated'}
                                                    </span>
                                                </div>
                                                <h5 className="font-medium text-slate-900">{job.frequency} Mowing</h5>
                                            </div>
                                            <span className="font-bold text-slate-900">{settings.currency}{job.priceQuote}</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} /> {job.durationMinutes} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Tag size={12} /> {job.lawnSize}
                                            </div>
                                        </div>

                                        {job.notes && (
                                            <div className="text-xs bg-slate-50 p-2 rounded text-slate-600 italic border border-slate-100">
                                                "{job.notes}"
                                            </div>
                                        )}

                                        {job.status === JobStatus.COMPLETED && (
                                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                <span className={`text-xs font-medium flex items-center gap-1 ${
                                                    job.paymentStatus === PaymentStatus.PAID ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                    {job.paymentStatus === PaymentStatus.PAID ? (
                                                        <><CheckCircle size={12} /> Paid</>
                                                    ) : (
                                                        <><AlertCircle size={12} /> Payment Pending</>
                                                    )}
                                                </span>
                                                {job.paymentMethod && (
                                                    <span className="text-xs text-slate-400">Via {job.paymentMethod}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="space-y-4 pb-4">
                            {customerCommunications.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                                    <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-slate-500 text-sm">No recorded communications for this customer.</p>
                                </div>
                            ) : (
                                customerCommunications.map(comm => (
                                    <div key={comm.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                {getCommIcon(comm.type)}
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{comm.type}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {new Date(comm.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <h5 className="text-sm font-bold text-slate-800 mb-1">{comm.subject}</h5>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{comm.body}</p>
                                        {comm.jobId && (
                                            <div className="mt-2 text-[10px] text-lawn-600 font-medium flex items-center gap-1">
                                                <Tag size={10} /> Linked to Job #{comm.jobId.split('-')[0]}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                     )}
                 </div>
             </div>
          </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800">Edit Customer Profile</h3>
                      <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 transition-all"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                            <input 
                                type="email" 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 transition-all"
                                value={editFormData.email}
                                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                            <input 
                                type="tel" 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 transition-all"
                                value={editFormData.phone}
                                onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            />
                        </div>
                      </div>

                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-lawn-100 focus:border-lawn-400 transition-all"
                            value={editFormData.address}
                            onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                          />
                          <p className="text-[10px] text-slate-400 italic mt-1">Changing the address will update it for all associated jobs.</p>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-2 bg-lawn-600 text-white rounded-lg text-sm font-bold hover:bg-lawn-700 transition-colors shadow-md flex items-center justify-center gap-2"
                          >
                              <Save size={16} /> Save Changes
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Log Call Modal */}
      {isLogCallModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <Phone size={20} className="text-purple-500" /> Log Call Note
                      </h3>
                      <button onClick={() => setIsLogCallModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  <textarea 
                    className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Briefly describe the outcome of the call..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                  />
                  <div className="mt-4 flex gap-3">
                    <button 
                        onClick={() => setIsLogCallModalOpen(false)}
                        className="flex-1 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleLogCall}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                        Save Entry
                    </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Customers;