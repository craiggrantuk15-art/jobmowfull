import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Building, Users, CreditCard, TrendingUp, Search, RefreshCw, Zap, UserPlus, ChevronDown, ChevronRight, Mail, Calendar, Star, BarChart3, PieChart as PieChartIcon, Database, Save, Download, Upload, Globe, Settings, ShieldCheck, BookOpen, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Lead, SupportTicket } from '../types';
import { PLATFORM_SUBSCRIPTION_PRICE_STARTER } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Organization {
    id: string;
    name: string;
    created_at: string;
    subscription_status: string;
    billing_customer_id?: string;
    plan_level?: string;
}

interface OrgMemberCount {
    organization_id: string;
    count: number;
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-200" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-8 w-16 bg-slate-200 rounded" />
    </div>
);

const SkeletonRow: React.FC = () => (
    <tr className="animate-pulse">
        <td className="px-5 py-4"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
        <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
        <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
        <td className="px-5 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
    </tr>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
    iconBg: string;
    subtitle?: string;
    trend?: { value: string; positive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient, iconBg, subtitle, trend }) => (
    <div className="group bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:border-slate-300/50 transition-all duration-500 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${gradient}`} />
        <div className="relative">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${iconBg} shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend.value}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            </div>
            {subtitle && <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">{subtitle}</p>}
        </div>
    </div>
);

// ─── Pie Label ───────────────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const SuperAdminDashboard: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [memberCounts, setMemberCounts] = useState<OrgMemberCount[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'organizations' | 'leads' | 'tickets' | 'users'>('organizations');
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [platformSettings, setPlatformSettings] = useState<any>({
        weatherApiKey: '',
        weatherCity: '',
        postcodeApiUrl: 'https://api.postcodes.io'
    });
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [subscriptionPrice, setSubscriptionPrice] = useState(PLATFORM_SUBSCRIPTION_PRICE_STARTER);
    const [prices, setPrices] = useState({
        starter: PLATFORM_SUBSCRIPTION_PRICE_STARTER,
        pro: 79, // Fallbacks
        enterprise: 199
    });

    // ─── Data Fetching ───────────────────────────────────────────────────
    const fetchAllData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true); else setLoading(true);
            setError(null);

            const [orgsResult, leadsResult, membersResult, ticketsResult, settingsResult] = await Promise.all([
                supabase.from('organizations').select('*').order('created_at', { ascending: false }),
                supabase.from('leads').select('*').order('created_at', { ascending: false }),
                supabase.from('organization_members').select('organization_id'),
                supabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
                supabase.from('platform_settings').select('*').eq('key', 'platform_subscription_price_starter').single()
            ]);

            if (orgsResult.error) throw orgsResult.error;
            if (leadsResult.error) throw leadsResult.error;
            if (ticketsResult.error) throw ticketsResult.error;

            setOrganizations(orgsResult.data || []);
            setLeads(leadsResult.data || []);
            setTickets(ticketsResult.data || []);

            if (settingsResult.data) {
                setSubscriptionPrice(Number(settingsResult.data.value));
            }

            // Count members per org
            if (membersResult.data) {
                const counts: Record<string, number> = {};
                membersResult.data.forEach((m: any) => {
                    counts[m.organization_id] = (counts[m.organization_id] || 0) + 1;
                });
                setMemberCounts(Object.entries(counts).map(([organization_id, count]) => ({ organization_id, count })));
            }

            setLastRefreshed(new Date());

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    // ─── Computed Stats ──────────────────────────────────────────────────
    const stats = useMemo(() => ({
        totalOrgs: organizations.length,
        activeSubs: organizations.filter(o => o.subscription_status === 'active').length,
        mrr: organizations.reduce((acc, o) => {
            if (o.subscription_status !== 'active') return acc;
            const plan = o.plan_level || 'starter';
            const price = plan === 'pro' ? 79 : (plan === 'enterprise' ? 199 : subscriptionPrice);
            return acc + price;
        }, 0),
        totalLeads: leads.length,
        founderLeads: leads.filter(l => l.type === 'founders_waitlist').length,
        magnetLeads: leads.filter(l => l.type === 'lead_magnet').length,
        newTickets: tickets.filter(t => t.status === 'new').length,
    }), [organizations, leads, tickets]);

    // ─── Chart Data ──────────────────────────────────────────────────────
    const growthData = useMemo(() => {
        const monthMap: Record<string, number> = {};
        organizations.forEach(org => {
            const d = new Date(org.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthMap[key] = (monthMap[key] || 0) + 1;
        });
        return Object.entries(monthMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, count]) => {
                const [y, m] = month.split('-');
                return { name: new Date(+y, +m - 1).toLocaleString('default', { month: 'short', year: '2-digit' }), signups: count };
            });
    }, [organizations]);

    const leadSourceData = useMemo(() => {
        if (stats.founderLeads === 0 && stats.magnetLeads === 0) return [];
        return [
            { name: 'Founders Waitlist', value: stats.founderLeads },
            { name: 'Lead Magnet', value: stats.magnetLeads },
        ].filter(d => d.value > 0);
    }, [stats]);

    const planDistributionData = useMemo(() => {
        const counts: Record<string, number> = { starter: 0, pro: 0, enterprise: 0 };
        organizations.forEach(o => {
            const level = (o.plan_level || 'starter').toLowerCase();
            if (counts[level] !== undefined) counts[level]++;
        });
        return [
            { name: 'Starter', value: counts.starter, color: '#94a3b8' },
            { name: 'Pro', value: counts.pro, color: '#22c55e' },
            { name: 'Enterprise', value: counts.enterprise, color: '#10b981' }
        ].filter(d => d.value > 0);
    }, [organizations]);


    const handleUpdateTicketStatus = async (ticketId: string, newStatus: 'new' | 'in_progress' | 'resolved') => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ status: newStatus })
                .eq('id', ticketId);

            if (error) throw error;
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        } catch (err: any) {
            setError(`Failed to update ticket status: ${err.message}`);
        }
    };

    const handleUpdateInternalNotes = async (ticketId: string, notes: string) => {
        try {
            const { error } = await supabase
                .from('support_tickets')
                .update({ internal_notes: notes })
                .eq('id', ticketId);

            if (error) throw error;
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, internal_notes: notes } : t));
        } catch (err: any) {
            console.error('Failed to update internal notes:', err);
        }
    };


    const PIE_COLORS = ['#f59e0b', '#3b82f6'];

    const filteredItems = useMemo(() => {
        const items = activeTab === 'organizations' ? organizations : (activeTab === 'leads' ? leads : (activeTab === 'tickets' ? tickets : allUsers));
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter((item: any) =>
            (item.name?.toLowerCase() || '').includes(term) ||
            (item.first_name?.toLowerCase() || '').includes(term) ||
            (item.last_name?.toLowerCase() || '').includes(term) ||
            (item.email?.toLowerCase() || '').includes(term) ||
            (item.subject?.toLowerCase() || '').includes(term) ||
            (item.id?.toLowerCase() || '').includes(term)
        );
    }, [activeTab, organizations, leads, tickets, allUsers, searchTerm]);

    useEffect(() => {
        if (activeTab === 'users' && allUsers.length === 0) {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchUsers = async () => {
        setSearchingUsers(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAllUsers(data || []);
        } catch (err: any) {
            console.error('Error fetching users:', err);
        } finally {
            setSearchingUsers(false);
        }
    };

    const getMemberCount = (orgId: string) => memberCounts.find(m => m.organization_id === orgId)?.count || 0;

    const relativeTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString();
    };

    // ─── Loading State ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8">
                    <div className="h-8 w-64 bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-slate-700/60 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            {/* ─── Hero Header ─────────────────────────────────────────── */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900 rounded-[2rem] p-8 md:p-10 overflow-hidden border border-white/10 shadow-2xl">
                    {/* Dynamic Background Elements */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                        Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Center</span>
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Platform Administration v1.2</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-300">SYSTEM STABLE</span>
                            </div>

                            <div className="h-10 w-px bg-white/10 mx-2 hidden lg:block" />

                            <div className="flex items-center gap-2">
                                <Link
                                    to="/super-admin/services"
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all duration-300 flex items-center gap-2 group/btn"
                                >
                                    <ShieldCheck size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                                    Services
                                </Link>
                                <Link
                                    to="/super-admin/help"
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all duration-300 flex items-center gap-2 group/btn"
                                >
                                    <BookOpen size={16} className="text-blue-400 group-hover/btn:scale-110 transition-transform" />
                                    Help
                                </Link>
                                <Link
                                    to="/super-admin/settings"
                                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white transition-all duration-300 flex items-center gap-2 group/btn"
                                >
                                    <Settings size={16} className="text-slate-400 group-hover/btn:rotate-90 transition-transform duration-500" />
                                    Settings
                                </Link>
                                <button
                                    onClick={() => fetchAllData(true)}
                                    disabled={refreshing}
                                    className="ml-2 p-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-all duration-300 shadow-lg shadow-emerald-500/20 disabled:opacity-50 group/refresh"
                                >
                                    <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : 'group-hover/refresh:rotate-180 transition-transform duration-700'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <strong>Error:</strong> {error}. Check RLS policies if you are seeing this.
                </div>
            )}

            {/* ─── Stats Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    icon={<Building size={22} className="text-blue-600" />}
                    label="Total Orgs"
                    value={stats.totalOrgs}
                    gradient="from-blue-500/10 to-transparent"
                    iconBg="bg-blue-50 text-blue-600"
                    subtitle="Propulsion Hub"
                    trend={{ value: '+4%', positive: true }}
                />
                <StatCard
                    icon={<CreditCard size={22} className="text-emerald-600" />}
                    label="Active Subs"
                    value={stats.activeSubs}
                    gradient="from-emerald-500/10 to-transparent"
                    iconBg="bg-emerald-50 text-emerald-600"
                    subtitle={`${stats.totalOrgs > 0 ? ((stats.activeSubs / stats.totalOrgs) * 100).toFixed(0) : 0}% CONVERSION`}
                    trend={{ value: '+12%', positive: true }}
                />
                <StatCard
                    icon={<TrendingUp size={22} className="text-indigo-600" />}
                    label="MRR"
                    value={`£${stats.mrr.toLocaleString()}`}
                    gradient="from-indigo-500/10 to-transparent"
                    iconBg="bg-indigo-50 text-indigo-600"
                    subtitle="STABLE GROWTH"
                    trend={{ value: '+8%', positive: true }}
                />
                <StatCard
                    icon={<UserPlus size={22} className="text-amber-600" />}
                    label="Leads"
                    value={stats.totalLeads}
                    gradient="from-amber-500/10 to-transparent"
                    iconBg="bg-amber-50 text-amber-600"
                    subtitle={`${stats.founderLeads} FOUNDER · ${stats.magnetLeads} MAG`}
                />
                <StatCard
                    icon={<Mail size={22} className="text-rose-500" />}
                    label="Support"
                    value={stats.newTickets}
                    gradient="from-rose-500/10 to-transparent"
                    iconBg="bg-rose-50 text-rose-500"
                    subtitle={`${tickets.length - stats.newTickets} ARCHIVED`}
                    trend={{ value: 'NEW', positive: true }}
                />
            </div>

            {/* ─── Charts Row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 size={18} className="text-slate-400" />
                        <h3 className="font-semibold text-slate-900">Signup Growth</h3>
                    </div>
                    {growthData.length > 0 ? (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(8px)',
                                            borderRadius: '16px',
                                            border: '1px solid #f1f5f9',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ color: '#64748b', fontWeight: 800, fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 900, fontSize: '14px' }}
                                        formatter={(value: any) => [value, 'DEPLOYMENTS']}
                                    />
                                    <Area type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSignups)" animationDuration={2000} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                            No signup data to display yet.
                        </div>
                    )}
                </div>

                {/* Plan Distribution Pie */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Database size={18} className="text-slate-400" />
                        <h3 className="font-semibold text-slate-900">Plan Distribution</h3>
                    </div>
                    {planDistributionData.length > 0 ? (
                        <>
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={planDistributionData}
                                            cx="50%" cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                            cornerRadius={6}
                                        >
                                            {planDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-4 mt-3">
                                {planDistributionData.map((entry) => (
                                    <div key={entry.name} className="flex flex-col items-center">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{entry.name}</span>
                                        <span className="text-sm font-bold text-slate-900">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
                            No plan data available.
                        </div>
                    )}
                </div>

                {/* Lead Source Pie */}
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon size={18} className="text-slate-400" />
                        <h3 className="font-semibold text-slate-900">Lead Sources</h3>
                    </div>
                    {leadSourceData.length > 0 ? (
                        <>
                            <div className="h-44 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={leadSourceData}
                                            cx="50%" cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {leadSourceData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-3">
                                {leadSourceData.map((entry, i) => (
                                    <div key={entry.name} className="flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
                            No leads captured yet.
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Data Table ──────────────────────────────────────────── */}
            <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    {/* Tab Toggles */}
                    <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex flex-wrap gap-1">
                        {[
                            { id: 'organizations', label: 'Organizations', icon: <Building size={14} />, count: organizations.length },
                            { id: 'leads', label: 'Leads', icon: <Users size={14} />, count: leads.length },
                            { id: 'tickets', label: 'Tickets', icon: <Mail size={14} />, count: tickets.length },
                            { id: 'users', label: 'Users', icon: <Users size={14} />, count: allUsers.length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
                                className={`px-5 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full xl:w-96 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-0 group-focus-within:opacity-10 transition duration-500"></div>
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder={`Filter ${activeTab} records...`}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:ring-0 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] border-b border-slate-100">
                            <tr>
                                {activeTab === 'organizations' ? (
                                    <>
                                        <th className="px-6 py-5 w-12 text-center"></th>
                                        <th className="px-6 py-5">Organization Entity</th>
                                        <th className="px-6 py-5 hidden md:table-cell">Tier</th>
                                        <th className="px-6 py-5 hidden md:table-cell">Fleet Size</th>
                                        <th className="px-6 py-5 hidden sm:table-cell">Registry Date</th>
                                        <th className="px-6 py-5">Status</th>
                                    </>
                                ) : activeTab === 'leads' ? (
                                    <>
                                        <th className="px-6 py-5">Intel Source</th>
                                        <th className="px-6 py-5">Prospect / Business</th>
                                        <th className="px-6 py-5 hidden sm:table-cell">Communication</th>
                                        <th className="px-6 py-5 hidden md:table-cell">Crew</th>
                                        <th className="px-6 py-5">Captured</th>
                                    </>
                                ) : activeTab === 'tickets' ? (
                                    <>
                                        <th className="px-6 py-5 w-12"></th>
                                        <th className="px-6 py-5">Originator</th>
                                        <th className="px-6 py-5">Subject Intelligence</th>
                                        <th className="px-6 py-5 hidden sm:table-cell">Dispatched</th>
                                        <th className="px-6 py-5">Priority</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-6 py-5">Identity</th>
                                        <th className="px-6 py-5">Authentication</th>
                                        <th className="px-6 py-5">Registry Date</th>
                                        <th className="px-6 py-5">Access Level</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredItems.map((item: any) => (
                                <React.Fragment key={item.id}>
                                    <tr
                                        className={`hover:bg-slate-50/50 transition-all duration-300 cursor-pointer group/row ${expandedOrgId === item.id ? 'bg-slate-50' : ''}`}
                                        onClick={() => {
                                            if (activeTab === 'organizations' || activeTab === 'tickets') {
                                                setExpandedOrgId(expandedOrgId === item.id ? null : item.id);
                                            }
                                        }}
                                    >
                                        {activeTab === 'organizations' ? (
                                            <>
                                                <td className="px-6 py-5 text-center">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${expandedOrgId === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover/row:bg-slate-200'}`}>
                                                        {expandedOrgId === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-900 font-black text-sm shadow-inner group-hover/row:scale-105 transition-transform">
                                                            {(item.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-none mb-1.5">{item.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded leading-none">{item.id.slice(0, 8)}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Global ID</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 hidden md:table-cell">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${item.plan_level === 'enterprise' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                        item.plan_level === 'pro' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                            'bg-slate-100 text-slate-500 border-slate-200'
                                                        }`}>
                                                        {item.plan_level || 'starter'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                                            <Users size={14} className="text-slate-400" />
                                                        </div>
                                                        <span className="font-black text-slate-900">{getMemberCount(item.id)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-500 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={13} className="text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">{relativeTime(item.created_at)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${item.subscription_status === 'active'
                                                        ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.subscription_status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                                                        {item.subscription_status || 'free'}
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'leads' ? (
                                            <>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${item.type === 'founders_waitlist'
                                                        ? 'bg-amber-100/50 text-amber-800 border border-amber-200'
                                                        : 'bg-blue-100/50 text-blue-800 border border-blue-200'
                                                        }`}>
                                                        {item.type === 'founders_waitlist' ? (
                                                            <><Star size={12} className="text-amber-600" /> Founder</>
                                                        ) : (
                                                            <><Zap size={12} className="text-blue-600" /> Lead Mag</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="font-black text-slate-900 mb-0.5">{item.business_name || item.name}</p>
                                                    {item.business_name && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{item.name}</p>}
                                                </td>
                                                <td className="px-6 py-5 text-slate-600 hidden sm:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
                                                            <Mail size={13} />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">{item.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-slate-600 hidden md:table-cell">
                                                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">{item.crew_size || '0'}</span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-500">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                        <Calendar size={13} className="text-slate-300" />
                                                        {relativeTime(item.created_at)}
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'tickets' ? (
                                            <>
                                                <td className="px-6 py-5 text-center">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${expandedOrgId === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 group-hover/row:bg-slate-200'}`}>
                                                        {expandedOrgId === item.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-600 text-xs">
                                                            {item.first_name[0]}{item.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 leading-none mb-1">{item.first_name} {item.last_name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-slate-900 font-black text-sm mb-0.5">{item.subject || 'UNTITLED INTELLIGENCE'}</p>
                                                    <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">{item.message}</p>
                                                </td>
                                                <td className="px-6 py-5 hidden sm:table-cell">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{relativeTime(item.created_at)}</span>
                                                </td>
                                                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateTicketStatus(item.id, e.target.value as any)}
                                                        className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-2xl border-none outline-none appearance-none cursor-pointer shadow-sm transition-all hover:scale-105 active:scale-95 ${item.status === 'new'
                                                            ? 'bg-blue-600 text-white shadow-blue-500/20'
                                                            : item.status === 'in_progress'
                                                                ? 'bg-amber-500 text-white shadow-amber-500/20'
                                                                : 'bg-emerald-600 text-white shadow-emerald-500/20'
                                                            }`}
                                                    >
                                                        <option value="new">INCOMING</option>
                                                        <option value="in_progress">PROCESSING</option>
                                                        <option value="resolved">RESOLVED</option>
                                                    </select>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg">
                                                            {(item.first_name || item.full_name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-black text-slate-900 uppercase tracking-tighter">{item.first_name} {item.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-xs font-bold text-slate-600">{item.email}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{relativeTime(item.created_at)}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] ${item.role === 'super_admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {item.role || 'user'}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>

                                    {/* Expanded Row Detail */}
                                    {expandedOrgId === item.id && (
                                        <tr>
                                            <td colSpan={5} className="bg-gradient-to-r from-blue-50/60 to-indigo-50/30 px-5 py-4 border-t border-blue-100/50">
                                                {activeTab === 'organizations' ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full ID</p>
                                                            <p className="font-mono text-xs text-slate-600 break-all">{item.id}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Created</p>
                                                            <p className="text-slate-700">{new Date(item.created_at).toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Members</p>
                                                            <p className="text-slate-700 flex items-center gap-1">
                                                                <Users size={14} className="text-blue-500" />
                                                                {getMemberCount(item.id)} member{getMemberCount(item.id) !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : activeTab === 'tickets' ? (
                                                    <div className="max-w-3xl py-4">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Message Content</h4>
                                                                <p className="text-lg font-bold text-slate-900">{item.subject || 'No Subject'}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => window.open(`mailto:${item.email}?subject=Re: ${item.subject || 'JobMow Support'}`)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md"
                                                            >
                                                                <Mail size={14} /> Reply to Customer
                                                            </button>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
                                                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.message}</p>
                                                        </div>

                                                        {/* Internal Notes */}
                                                        <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                                                            <div className="flex items-center gap-2 mb-4 text-slate-400">
                                                                <Edit size={14} />
                                                                <h5 className="text-xs font-black uppercase tracking-widest">Internal Admin Notes</h5>
                                                            </div>
                                                            <textarea
                                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder:text-slate-500 h-24 font-medium"
                                                                placeholder="Add internal notes about this ticket..."
                                                                defaultValue={item.internal_notes || ''}
                                                                onBlur={(e) => handleUpdateInternalNotes(item.id, e.target.value)}
                                                            />
                                                            <p className="mt-2 text-[10px] text-slate-500 font-mono text-right">AUTO-SAVES ON BLUR</p>
                                                        </div>

                                                        <div className="mt-6 flex items-center gap-6 text-xs text-slate-400 font-mono">
                                                            <span>ID: {item.id}</span>
                                                            <span>TIME: {new Date(item.created_at).toISOString()}</span>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 && (
                    <div className="py-16 px-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                            <Search size={24} className="text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No {activeTab} found</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {searchTerm ? `No results matching "${searchTerm}"` : `No ${activeTab} have been recorded yet.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
