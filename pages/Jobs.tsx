import React, { useState } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus, Job, LawnSize, Frequency } from '../types';
import JobDetailModal from '../components/JobDetailModal';
import { Search, Plus, MapPin, Calendar as CalendarIcon, Clock, Briefcase, Eye, XCircle, LayoutGrid, List, ChevronLeft, ChevronRight, PoundSterling, CloudRain } from 'lucide-react';

interface JobFormState {
  customerName: string;
  address: string;
  email?: string;
  phone?: string;
  zone: string;
  frequency: Frequency;
  lawnSize: LawnSize;
  priceQuote: number;
  durationMinutes: number;
  status: JobStatus;
  scheduledDate: string;
  notes?: string;
}

const Jobs: React.FC = () => {
  const { jobs, addJob, settings } = useJobs();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus.SCHEDULED | JobStatus.COMPLETED | JobStatus.CANCELLED>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewJob, setViewJob] = useState<Job | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [newJob, setNewJob] = useState<JobFormState>({
    customerName: '',
    address: '',
    zone: settings.zones[0] || '',
    frequency: Frequency.FORTNIGHTLY,
    lawnSize: LawnSize.MEDIUM,
    priceQuote: 40,
    durationMinutes: 60,
    status: JobStatus.SCHEDULED,
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  const nonLeadJobs = jobs.filter(j => j.status !== JobStatus.PENDING);
  
  const filteredJobs = nonLeadJobs
    .filter(j => statusFilter === 'ALL' ? true : j.status === statusFilter)
    .filter(j => 
        j.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        j.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
      const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
      return day === 0 ? 6 : day - 1; 
  };
  
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
  }

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.customerName || !newJob.address) return;

    const job: Job = {
        id: crypto.randomUUID(),
        customerId: crypto.randomUUID(),
        customerName: newJob.customerName,
        address: newJob.address,
        email: newJob.email,
        phone: newJob.phone,
        zone: newJob.zone,
        postcode: '',
        frequency: newJob.frequency,
        lawnSize: newJob.lawnSize,
        priceQuote: newJob.priceQuote,
        durationMinutes: newJob.durationMinutes,
        status: JobStatus.SCHEDULED,
        scheduledDate: newJob.scheduledDate,
        leadSource: 'Manual',
        notes: newJob.notes
    };

    addJob(job);
    setIsAddModalOpen(false);
    setNewJob({
        customerName: '',
        address: '',
        zone: settings.zones[0] || '',
        frequency: Frequency.FORTNIGHTLY,
        lawnSize: LawnSize.MEDIUM,
        priceQuote: 40,
        durationMinutes: 60,
        status: JobStatus.SCHEDULED,
        scheduledDate: new Date().toISOString().split('T')[0]
    });
  };

  const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(currentMonth);
      const firstDay = getFirstDayOfMonth(currentMonth);
      const days = [];

      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50 border border-slate-100/50"></div>);
      }

      for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          const dayJobs = nonLeadJobs.filter(j => 
              j.scheduledDate?.split('T')[0] === dateStr || 
              j.completedDate?.split('T')[0] === dateStr
          );

          const dayRevenue = dayJobs.reduce((acc, j) => acc + j.priceQuote, 0);

          days.push(
              <div key={day} className={`h-32 border border-slate-100 p-2 overflow-y-auto group hover:border-blue-200 transition-colors ${isToday(day) ? 'bg-blue-50/30' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                      <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                          {day}
                      </span>
                      {dayRevenue > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {settings.currency}{dayRevenue}
                          </span>
                      )}
                  </div>
                  
                  <div className="space-y-1">
                      {dayJobs.map(job => (
                          <div 
                            key={job.id}
                            onClick={() => setViewJob(job)}
                            className={`px-2 py-1 rounded text-[10px] font-medium truncate cursor-pointer border transition-colors ${
                                job.isRainDelayed && job.status !== JobStatus.COMPLETED
                                ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'
                                : job.status === JobStatus.COMPLETED 
                                ? 'bg-slate-100 text-slate-500 border-slate-200' 
                                : job.status === JobStatus.CANCELLED
                                ? 'bg-red-50 text-red-500 border-red-100 decoration-line-through'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300'
                            }`}
                          >
                              {job.isRainDelayed && <CloudRain size={8} className="inline mr-1" />}
                              {job.customerName}
                          </div>
                      ))}
                  </div>
              </div>
          );
      }

      return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
           <p className="text-slate-500">Manage scheduled and completed work.</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="List View"
                >
                    <List size={20} />
                </button>
                <button 
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Calendar View"
                >
                    <LayoutGrid size={20} />
                </button>
             </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
                <Plus size={18} /> Add Job
            </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    {['ALL', JobStatus.SCHEDULED, JobStatus.COMPLETED, JobStatus.CANCELLED].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                statusFilter === status ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {status === 'ALL' ? 'All Jobs' : status}
                        </button>
                    ))}
                </div>
                
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search jobs..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lawn-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No jobs found</h3>
                    </div>
                ) : (
                    filteredJobs.map(job => (
                        <div key={job.id} onClick={() => setViewJob(job)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-lawn-300 transition-all cursor-pointer group">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-lawn-700 transition-colors">{job.customerName}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                                                job.status === JobStatus.SCHEDULED ? 'bg-emerald-100 text-emerald-700' :
                                                job.status === JobStatus.COMPLETED ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {job.status}
                                            </span>
                                            {job.zone && (
                                                 <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1">
                                                    <MapPin size={10} /> {job.zone}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={16} className="text-slate-400" />
                                            {job.address}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon size={16} className="text-slate-400" />
                                            {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase">Quote</p>
                                        <p className="text-lg font-bold text-slate-900">{settings.currency}{job.priceQuote}</p>
                                    </div>
                                    <Eye size={20} className="text-slate-400" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
      ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">
                      {currentMonth.toLocaleDateString('en-UK', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex items-center gap-2">
                      <button onClick={prevMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                          <ChevronLeft size={20} />
                      </button>
                      <button onClick={nextMonth} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                          <ChevronRight size={20} />
                      </button>
                  </div>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {day}
                      </div>
                  ))}
              </div>
              <div className="grid grid-cols-7 bg-white">
                  {renderCalendar()}
              </div>
          </div>
      )}

      {viewJob && (
          <JobDetailModal job={viewJob} onClose={() => setViewJob(null)} />
      )}

      {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0">
                    <h3 className="text-lg font-bold text-slate-800">Add New Job</h3>
                    <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateJob} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            value={newJob.customerName}
                            onChange={e => setNewJob({...newJob, customerName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                            value={newJob.address}
                            onChange={e => setNewJob({...newJob, address: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Service Area (Zone)</label>
                            <select 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newJob.zone}
                                onChange={e => setNewJob({...newJob, zone: e.target.value})}
                            >
                                <option value="">Select an area...</option>
                                {settings.zones.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Frequency</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none bg-white"
                                value={newJob.frequency}
                                onChange={e => setNewJob({...newJob, frequency: e.target.value as Frequency})}
                            >
                                {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                            <input 
                                type="date" 
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newJob.scheduledDate}
                                onChange={e => setNewJob({...newJob, scheduledDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Price ({settings.currency})</label>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lawn-500 outline-none"
                                value={newJob.priceQuote}
                                onChange={e => setNewJob({...newJob, priceQuote: Number(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pb-2">
                        <button type="submit" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors">
                            Create Job
                        </button>
                    </div>
                </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default Jobs;