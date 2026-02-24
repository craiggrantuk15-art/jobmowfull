import React, { useState, useEffect, useMemo } from 'react';
import { useJobs } from '../context/JobContext';
import { JobStatus, PaymentStatus } from '../types';
import { TrendingUp, Users, CalendarCheck, Clock, ArrowUpRight, Wallet, Bell, X, ArrowUp, ArrowDown, Plus, PieChart as PieChartIcon, BarChart3, ListFilter, Map as MapIcon, Zap, Sparkles, Brain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';
import ProfitHeatmap from '../components/ProfitHeatmap';
import { getNotificationPermissionState, requestNotificationPermission } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { jobs, getJobStats, settings, expenses } = useJobs();
  const { user } = useAuth();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [greeting, setGreeting] = useState('Welcome back');
  const stats = getJobStats();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

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

  // Calculate 7-day revenue data
  const revenueChartData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dailyRevenue = jobs
        .filter(j =>
          j.status === JobStatus.COMPLETED &&
          j.payment_status === PaymentStatus.PAID &&
          j.completed_date?.startsWith(dateStr)
        )
        .reduce((sum, j) => sum + j.price_quote, 0);

      data.push({
        name: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        revenue: dailyRevenue,
        rawDate: dateStr
      });
    }
    return data;
  }, [jobs]);

  // Calculate revenue trend (last 7 days vs previous 7 days)
  const revenueTrend = useMemo(() => {
    const today = new Date();
    const last7DaysTotal = jobs
      .filter(j => {
        if (j.status !== JobStatus.COMPLETED || j.payment_status !== PaymentStatus.PAID || !j.completed_date) return false;
        const jobDate = new Date(j.completed_date);
        const diffDays = (today.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays < 7;
      })
      .reduce((sum, j) => sum + j.price_quote, 0);

    const prev7DaysTotal = jobs
      .filter(j => {
        if (j.status !== JobStatus.COMPLETED || j.payment_status !== PaymentStatus.PAID || !j.completed_date) return false;
        const jobDate = new Date(j.completed_date);
        const diffDays = (today.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 7 && diffDays < 14;
      })
      .reduce((sum, j) => sum + j.price_quote, 0);

    if (prev7DaysTotal === 0) return last7DaysTotal > 0 ? 100 : 0;
    return ((last7DaysTotal - prev7DaysTotal) / prev7DaysTotal) * 100;
  }, [jobs]);

  // Calculate weekly profit (last 7 days)
  const weeklyMetrics = useMemo(() => {
    const today = new Date();
    const last7DaysJobs = jobs.filter(j => {
      if (j.status !== JobStatus.COMPLETED || j.payment_status !== PaymentStatus.PAID || !j.completed_date) return false;
      const jobDate = new Date(j.completed_date);
      const diffDays = (today.getTime() - jobDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    const last7DaysExpenses = expenses.filter(e => {
      const expDate = new Date(e.date);
      const diffDays = (today.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays < 7;
    });

    const weeklyRevenue = last7DaysJobs.reduce((sum, j) => sum + j.price_quote, 0);
    const weeklyExpenses = last7DaysExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      revenue: weeklyRevenue,
      expenses: weeklyExpenses,
      profit: weeklyRevenue - weeklyExpenses
    };
  }, [jobs, expenses]);

  // Job Status Distribution Data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      counts[j.status] = (counts[j.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const STATUS_COLORS: Record<string, string> = {
    [JobStatus.PENDING]: '#6366f1', // Indigo
    [JobStatus.SCHEDULED]: '#10b981', // Emerald
    [JobStatus.COMPLETED]: '#94a3b8', // Slate
    [JobStatus.CANCELLED]: '#f87171'  // Red
  };

  // Lead Source Data
  const leadSourceData = useMemo(() => {
    const sources: Record<string, number> = {};
    jobs.forEach(j => {
      const source = j.lead_source || 'Website';
      sources[source] = (sources[source] || 0) + 1;
    });
    return Object.entries(sources)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  // Expense Category Data
  const expenseData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories)
      .map(([name, value]) => ({
        name: name.split(' ')[0], // Short name for display
        fullName: name,
        value
      }))
      .filter(d => d.value > 0);
  }, [expenses]);

  const CATEGORY_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // Upcoming Schedule Data (next 3 jobs)
  const upcomingJobs = useMemo(() => {
    return jobs
      .filter(j => j.status === JobStatus.SCHEDULED)
      .sort((a, b) => {
        if (!a.scheduled_date || !b.scheduled_date) return 0;
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      })
      .slice(0, 3);
  }, [jobs]);

  // Monthly Revenue Goal (Example: £5000)
  const monthlyRevenueGoal = settings?.monthlyGoal || 5000;
  const monthlyRevenue = useMemo(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return jobs
      .filter(j =>
        j.status === JobStatus.COMPLETED &&
        j.payment_status === PaymentStatus.PAID &&
        j.completed_date && new Date(j.completed_date) >= startOfMonth
      )
      .reduce((sum, j) => sum + j.price_quote, 0);
  }, [jobs]);

  const goalProgress = Math.min(100, (monthlyRevenue / monthlyRevenueGoal) * 100);

  // MowVision AI Insights Logic
  const aiInsight = useMemo(() => {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
    const pendingCount = stats.pending;
    const scheduledToday = stats.scheduled;

    if (scheduledToday === 0 && pendingCount > 0) {
      return {
        title: "Growth Opportunity",
        message: `You have ${pendingCount} pending leads waiting for a quote. Converting just two could add £${(2 * stats.avgJobValue).toFixed(0)} to your weekly revenue.`,
        type: "tip" as const
      };
    }

    if (revenueTrend > 20) {
      return {
        title: "Peak Performance",
        message: "Your revenue is up 20% vs last week! Great time to review your premium pricing rules for the upcoming busy season.",
        type: "success" as const
      };
    }

    if (stats.unpaid > 0) {
      return {
        title: "Cash Flow Alert",
        message: `You have £${stats.unpaid.toFixed(0)} in completed jobs that are still unpaid. Sending a quick reminder could help secure your weekly profit goal.`,
        type: "warning" as const
      };
    }

    return {
      title: "Business Pulse",
      message: "Schedule looks steady for the week. Consider offering a 'Mid-Week Refresh' discount to fill those remaining Wednesday slots.",
      type: "tip" as const
    };
  }, [stats, revenueTrend]);

  return (
    <div className="space-y-6 pb-12">
      {/* Notification Onboarding Banner */}
      {showNotificationPrompt && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 border border-white/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-xl">
              <Bell size={22} className="animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-base">Don't miss a lead!</p>
              <p className="text-sm text-indigo-100">Enable push notifications to get alerted instantly when customers request quotes.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEnableNotifications}
              className="px-5 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-all shadow-md active:scale-95"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setShowNotificationPrompt(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative mb-10 group/hero">
        {/* Main Hero Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md rounded-[2.5rem] border border-white/50 shadow-sm p-8 md:p-12 transition-all duration-500 hover:shadow-xl hover:shadow-lawn-500/5">
          {/* Animated Background Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-lawn-500/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover/hero:bg-lawn-500/10 transition-colors duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-24 -mb-24"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 mb-6 animate-in fade-in slide-in-from-left-8 duration-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Intelligence Active
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {greeting}, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">{user?.name?.split(' ')[0] || settings.businessName.split(' ')[0]}</span>
              </h1>

              <p className="text-slate-500 text-lg md:text-xl mb-8 leading-relaxed max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 font-medium">
                Your business is performing <span className="text-emerald-600 font-bold italic">at peak efficiency</span> today with <span className="text-slate-900 font-black underline decoration-emerald-500/30 decoration-4 underline-offset-4">{stats.scheduledToday} jobs</span> on the schedule.
              </p>

              <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <Link to="/admin/jobs" className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95 group/btn">
                  <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
                  CREATE NEW JOB
                </Link>
                <Link to="/admin/schedule" className="flex items-center gap-3 px-8 py-4 bg-white/50 hover:bg-white text-slate-700 border border-slate-200 rounded-2xl font-black transition-all hover:shadow-md active:scale-95">
                  <MapIcon size={20} className="text-blue-500" />
                  Route Map
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid within Hero */}
            <div className="grid grid-cols-2 gap-4 lg:w-[400px] animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
              <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group/stat">
                <Users size={20} className="text-indigo-500 mb-3 group-hover/stat:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Leads</p>
                <p className="text-2xl font-black text-slate-900">{stats.pending}</p>
              </div>
              <div className="bg-white/50 p-6 rounded-3xl border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group/stat">
                <TrendingUp size={20} className="text-emerald-500 mb-3 group-hover/stat:scale-110 transition-transform" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                <p className="text-2xl font-black text-slate-900">£{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl group/stat relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/stat:opacity-20 transition-opacity">
                  <Sparkles size={40} className="text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Goal Progress</p>
                  <div className="flex items-end justify-between mb-2">
                    <p className="text-2xl font-black text-white">{goalProgress.toFixed(0)}%</p>
                    <p className="text-xs font-bold text-slate-400">Target: £{monthlyRevenueGoal.toLocaleString()}</p>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-lawn-400 rounded-full transition-all duration-1000"
                      style={{ width: `${goalProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MowVision™ AI Insight Card */}
      <div className={`relative overflow-hidden p-8 rounded-[2rem] border shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 group backdrop-blur-xl ${aiInsight.type === 'success' ? 'bg-gradient-to-br from-emerald-600/90 via-emerald-500/80 to-teal-600/90 text-white border-emerald-400/40' :
        aiInsight.type === 'warning' ? 'bg-gradient-to-br from-amber-500/90 via-orange-500/80 to-amber-600/90 text-white border-amber-400/40' : 'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 text-white border-slate-700/60'
        }`}>
        {/* Animated Orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-1000"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/20 rounded-full blur-[80px]"></div>

        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl transform group-hover:scale-110 transition-transform duration-500 ${aiInsight.type === 'success' ? 'bg-white text-emerald-600' :
            aiInsight.type === 'warning' ? 'bg-white text-amber-600' : 'bg-gradient-to-tr from-lawn-500 to-emerald-600 text-white'
            }`}>
            <Brain size={32} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${aiInsight.type === 'success' ? 'bg-emerald-400/20 border-emerald-300/30' :
                aiInsight.type === 'warning' ? 'bg-amber-400/20 border-amber-300/30' : 'bg-white/10 border-white/10'
                }`}>
                MowVision™ Active Intelligence
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-bold opacity-60">High Confidence</span>
              </div>
            </div>
            <h4 className="text-2xl font-black mb-2 tracking-tight">{aiInsight.title}</h4>
            <p className="text-white/80 text-sm leading-relaxed max-w-4xl font-medium">
              "{aiInsight.message}"
            </p>
          </div>
          <div className="shrink-0">
            <button className="px-8 py-3.5 bg-white text-slate-900 rounded-[1.25rem] text-sm font-black shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 group/btn">
              Take AI Action
              <ArrowUpRight size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/leads" className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Users size={22} />
            </div>
            {stats.pending > 0 && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Leads</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.pending}</h3>
            <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
              Manage <ArrowUpRight size={14} className="ml-1" />
            </div>
          </div>
        </Link>

        <Link to="/admin/schedule" className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <CalendarCheck size={22} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Scheduled Jobs</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{stats.scheduled}</h3>
            <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              View <ArrowUpRight size={14} className="ml-1" />
            </div>
          </div>
        </Link>

        <div className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <TrendingUp size={22} />
            </div>
            {(jobs.length > 0 || stats.revenue > 0) && (
              <span className="bg-gradient-to-r from-lawn-500 to-emerald-600 text-[10px] font-black text-white px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">Pro</span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-slate-900">£{stats.revenue.toLocaleString()}</h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs font-medium text-slate-400">
                Goal: £{monthlyRevenueGoal.toLocaleString()}
              </p>
              <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${revenueTrend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {revenueTrend >= 0 ? <ArrowUp size={10} className="mr-0.5" /> : <ArrowDown size={10} className="mr-0.5" />}
                {Math.abs(revenueTrend).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <Link to="/admin/expenses" className="group bg-white/70 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-sm hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Wallet size={22} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Net Profit</p>
          <div className="flex flex-col">
            <h3 className="text-3xl font-black text-slate-900">£{stats.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs font-medium text-slate-400">
                Weekly: £{weeklyMetrics.profit.toFixed(0)}
              </p>
              <p className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                Profit
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <Clock size={18} className="text-slate-400" />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900">Revenue Performance</h3>
            <p className="text-slate-500 text-sm">Last 7 days revenue breakdown based on completed & paid jobs.</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                  tickFormatter={(val) => `£${val}`}
                />
                <Tooltip
                  cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 800, fontSize: '14px' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px', fontWeight: 600 }}
                  formatter={(value) => [`£${value}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <WeatherWidget />
          <ProfitHeatmap />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Job Status Distribution */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PieChartIcon size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Workload Balance</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as JobStatus] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Lead Sources</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSourceData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ListFilter size={20} />
            </div>
            <h3 className="font-bold text-slate-900">Expenses by Category</h3>
          </div>
          <div className="h-64 w-full text-center">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => `£${value}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Wallet size={40} className="mb-2 opacity-20" />
                <p className="text-sm">No expenses recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Schedule Preview */}
      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-sm relative overflow-hidden group/schedule">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CalendarCheck size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Next Up</h3>
              <p className="text-slate-500 text-sm">Your immediate upcoming appointments.</p>
            </div>
          </div>
          <Link to="/admin/schedule" className="text-sm font-black text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
            Full Schedule
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingJobs.length > 0 ? (
            upcomingJobs.map((job) => (
              <div key={job.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group/job">
                <div className="flex justify-between items-start mb-3">
                  <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString([], { day: '2-digit', month: 'short' }) : 'TBD'}
                  </div>
                  <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover/job:bg-blue-50 group-hover/job:text-blue-600 transition-colors">
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <h4 className="font-black text-slate-900 mb-1 truncate">{job.customer_name}</h4>
                <p className="text-xs font-bold text-slate-400 mb-4 truncate">{job.address}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/3"></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">EN ROUTE</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <CalendarCheck size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-bold">No jobs scheduled for the next 24 hours.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white/50 shadow-sm relative overflow-hidden group/activity">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-slate-900">Recent Activity</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-tighter">Live Updates</span>
            </div>
            <p className="text-slate-500 text-sm">Real-time status tracking for your last 5 customers.</p>
          </div>
          <Link to="/admin/jobs" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex items-center transition-all shadow-lg shadow-slate-900/10 active:scale-95">
            View Full Log <ArrowUpRight size={16} className="ml-2" />
          </Link>
        </div>
        <div className="space-y-8 relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-[2px] bg-slate-100 group-hover/activity:bg-indigo-100 transition-colors duration-500"></div>

          {jobs.slice(-5).reverse().map((job) => (
            <div key={job.id} className="flex gap-6 group/item cursor-pointer relative z-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm group-hover/item:scale-110 group-hover/item:shadow-md ${job.status === JobStatus.PENDING ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-100' :
                job.status === JobStatus.SCHEDULED ? 'bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100' :
                  job.status === JobStatus.CANCELLED ? 'bg-red-50 text-red-600 ring-2 ring-red-100' : 'bg-slate-50 text-slate-600 ring-2 ring-slate-100'
                }`}>
                {job.status === JobStatus.PENDING ? (
                  <div className="relative">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-blue-50 animate-pulse"></span>
                  </div>
                ) :
                  job.status === JobStatus.SCHEDULED ? <CalendarCheck size={20} /> :
                    job.status === JobStatus.COMPLETED ? <TrendingUp size={20} /> : <X size={20} />}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors">{job.customer_name}</p>
                  <span className="text-sm font-black text-slate-900 tracking-tight">£{job.price_quote}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shadow-sm ${job.status === JobStatus.PENDING ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    job.status === JobStatus.SCHEDULED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      job.status === JobStatus.CANCELLED ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}>
                    {job.status}
                  </span>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-500 truncate group-hover/item:text-slate-700 transition-colors uppercase tracking-tight">{job.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
