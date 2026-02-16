import React, { useState, useEffect } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus } from '../types';
import { TrendingUp, Users, CalendarCheck, Clock, ArrowUpRight, Wallet, Bell, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';
import ProfitHeatmap from '../components/ProfitHeatmap';
import { getNotificationPermissionState, requestNotificationPermission } from '../services/notificationService';

const data = [
  { name: 'Mon', revenue: 400 },
  { name: 'Tue', revenue: 300 },
  { name: 'Wed', revenue: 550 },
  { name: 'Thu', revenue: 450 },
  { name: 'Fri', revenue: 700 },
  { name: 'Sat', revenue: 200 },
  { name: 'Sun', revenue: 100 },
];

const Dashboard: React.FC = () => {
  const { jobs, getJobStats } = useJobs();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const stats = getJobStats();
  
  useEffect(() => {
    // Check if we should show the notification setup prompt
    if (getNotificationPermissionState() === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setShowNotificationPrompt(false);
    }
  };

  const activeJobsList = jobs.filter(j => j.status === JobStatus.SCHEDULED || j.status === JobStatus.COMPLETED);
  
  return (
    <div className="space-y-6">
      {/* Notification Onboarding Banner */}
      {showNotificationPrompt && (
        <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-sm">Don't miss a lead!</p>
                <p className="text-xs text-indigo-100">Enable push notifications to get alerted instantly when customers request quotes.</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={handleEnableNotifications}
                className="px-4 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Enable Notifications
              </button>
              <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    System Operational
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/admin/leads" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-lawn-300 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Users size={20} />
                    </div>
                    {stats.pending > 0 && (
                        <span className="text-xs font-medium text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">Action Required</span>
                    )}
                </div>
                <p className="text-sm text-slate-500">Pending Leads</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
                </Link>

                <Link to="/admin/schedule" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-lawn-300 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <CalendarCheck size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">Today</span>
                </div>
                <p className="text-sm text-slate-500">Scheduled Jobs</p>
                <h3 className="text-2xl font-bold text-slate-900">{stats.scheduled}</h3>
                </Link>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <TrendingUp size={20} />
                    </div>
                </div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900">£{stats.revenue}</h3>
                </div>

                <Link to="/admin/expenses" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-lawn-300 transition-colors group">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100">
                    <Wallet size={20} />
                    </div>
                </div>
                <p className="text-sm text-slate-500">Net Profit</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">£{stats.netProfit.toFixed(0)}</h3>
                    <span className="text-xs text-slate-400 font-medium">(-£{stats.totalExpenses.toFixed(0)} exp)</span>
                </div>
                </Link>
            </div>
        </div>

        <div className="hidden xl:block w-80 flex-shrink-0">
             <WeatherWidget />
        </div>
      </div>
      
      <div className="xl:hidden">
         <WeatherWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Revenue Overview</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `£${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                  formatter={(value) => [`£${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-full">
            <ProfitHeatmap />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            <Link to="/admin/jobs" className="text-sm text-lawn-600 hover:text-lawn-700 font-medium flex items-center">
              View All <ArrowUpRight size={14} className="ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {jobs.slice(-5).reverse().map((job) => (
              <div key={job.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  job.status === JobStatus.PENDING ? 'bg-blue-500' :
                  job.status === JobStatus.SCHEDULED ? 'bg-emerald-500' : 
                  job.status === JobStatus.CANCELLED ? 'bg-red-400' : 'bg-slate-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{job.customerName}</p>
                  <p className="text-xs text-slate-500">{job.status === JobStatus.PENDING ? 'New lead created' : `Job ${job.status.toLowerCase()}`}</p>
                  <p className="text-xs text-slate-400 mt-1">{job.address}</p>
                </div>
                <div className="ml-auto text-xs font-medium text-slate-600">
                  £{job.priceQuote}
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;