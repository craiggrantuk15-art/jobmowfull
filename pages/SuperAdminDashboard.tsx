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
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, gradient, iconBg, subtitle }) => (
    <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
        <div className="relative">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg} transition-transform group-hover:scale-110 duration-300`}>
                    {icon}
                </div>
                <span className="text-sm text-slate-500 font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
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
        mrr: organizations.filter(o => o.subscription_status === 'active').length * subscriptionPrice,
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
        <div className="space-y-6">
            {/* ─── Hero Header ─────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Zap size={20} className="text-emerald-400" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Command Center</h1>
                        </div>
                        <p className="text-slate-400 text-sm ml-12">Platform analytics & global administration</p>
                    </div>
                    <div className="flex items-center gap-3 ml-12 sm:ml-0">
                        <Link
                            to="/super-admin/services"
                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-xl text-sm font-medium text-emerald-400 transition-all duration-200 flex items-center gap-2"
                        >
                            <ShieldCheck size={14} />
                            Manage Services
                        </Link>
                        <Link
                            to="/super-admin/help"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-all duration-200 flex items-center gap-2"
                        >
                            <BookOpen size={14} />
                            Manage Help
                        </Link>
                        <Link
                            to="/super-admin/settings"
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 transition-all duration-200 flex items-center gap-2"
                        >
                            <Settings size={14} />
                            Platform Settings
                        </Link>
                        <span className="text-xs text-slate-500 hidden lg:inline">
                            Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                            onClick={() => fetchAllData(true)}
                            disabled={refreshing}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium text-white transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                    <strong>Error:</strong> {error}. Check RLS policies if you are seeing this.
                </div>
            )}

            {/* ─── Stats Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={<Building size={20} className="text-blue-600" />}
                    label="Total Orgs"
                    value={stats.totalOrgs}
                    gradient="bg-gradient-to-br from-blue-50/50 to-transparent"
                    iconBg="bg-blue-100 text-blue-600"
                    subtitle="All tenants"
                />
                <StatCard
                    icon={<CreditCard size={20} className="text-emerald-600" />}
                    label="Active Subs"
                    value={stats.activeSubs}
                    gradient="bg-gradient-to-br from-emerald-50/50 to-transparent"
                    iconBg="bg-emerald-100 text-emerald-600"
                    subtitle={`${stats.totalOrgs > 0 ? ((stats.activeSubs / stats.totalOrgs) * 100).toFixed(0) : 0}% conv.`}
                />
                <StatCard
                    icon={<TrendingUp size={20} className="text-purple-600" />}
                    label="Revenue"
                    value={`£${stats.mrr}`}
                    gradient="bg-gradient-to-br from-purple-50/50 to-transparent"
                    iconBg="bg-purple-100 text-purple-600"
                    subtitle="Est. MRR"
                />
                <StatCard
                    icon={<UserPlus size={20} className="text-amber-600" />}
                    label="Total Leads"
                    value={stats.totalLeads}
                    gradient="bg-gradient-to-br from-amber-50/50 to-transparent"
                    iconBg="bg-amber-100 text-amber-600"
                    subtitle={`${stats.founderLeads} F · ${stats.magnetLeads} M`}
                />
                <StatCard
                    icon={<Mail size={20} className="text-blue-500" />}
                    label="New Tickets"
                    value={stats.newTickets}
                    gradient="bg-gradient-to-br from-blue-50/50 to-transparent"
                    iconBg="bg-blue-100 text-blue-500"
                    subtitle={`${tickets.length - stats.newTickets} active`}
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
                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                                        formatter={(value: any) => [value, 'Signups']}
                                    />
                                    <Area type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSignups)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                            No signup data to display yet.
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
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Tab Toggles */}
                    <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button
                            onClick={() => { setActiveTab('organizations'); setSearchTerm(''); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'organizations'
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Building size={14} className="inline -mt-0.5 mr-1.5" />
                            Organizations ({organizations.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('leads'); setSearchTerm(''); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'leads'
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users size={14} className="inline -mt-0.5 mr-1.5" />
                            Leads ({leads.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('tickets'); setSearchTerm(''); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'tickets'
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Mail size={14} className="inline -mt-0.5 mr-1.5" />
                            Support Tickets ({tickets.length})
                        </button>
                        <button
                            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'users'
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Users size={14} className="inline -mt-0.5 mr-1.5" />
                            Users ({allUsers.length})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                {activeTab === 'organizations' ? (
                                    <>
                                        <th className="px-5 py-3.5 w-8"></th>
                                        <th className="px-5 py-3.5">Organization</th>
                                        <th className="px-5 py-3.5 hidden md:table-cell">Members</th>
                                        <th className="px-5 py-3.5 hidden sm:table-cell">Created</th>
                                        <th className="px-5 py-3.5">Status</th>
                                    </>
                                ) : activeTab === 'leads' ? (
                                    <>
                                        <th className="px-5 py-3.5">Source</th>
                                        <th className="px-5 py-3.5">Name / Business</th>
                                        <th className="px-5 py-3.5 hidden sm:table-cell">Email</th>
                                        <th className="px-5 py-3.5 hidden md:table-cell">Crew Size</th>
                                        <th className="px-5 py-3.5">Date</th>
                                    </>
                                ) : activeTab === 'tickets' ? (
                                    <>
                                        <th className="px-5 py-3.5 w-8"></th>
                                        <th className="px-5 py-3.5">Contact</th>
                                        <th className="px-5 py-3.5">Subject / Preview</th>
                                        <th className="px-5 py-3.5 hidden sm:table-cell">Submitted</th>
                                        <th className="px-5 py-3.5">Status</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="px-5 py-3.5">User</th>
                                        <th className="px-5 py-3.5">Email</th>
                                        <th className="px-5 py-3.5">Created</th>
                                        <th className="px-5 py-3.5">Role</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredItems.map((item: any) => (
                                <React.Fragment key={item.id}>
                                    <tr
                                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${expandedOrgId === item.id ? 'bg-blue-50/40' : ''}`}
                                        onClick={() => {
                                            if (activeTab === 'organizations' || activeTab === 'tickets') {
                                                setExpandedOrgId(expandedOrgId === item.id ? null : item.id);
                                            }
                                        }}
                                    >
                                        {activeTab === 'organizations' ? (
                                            <>
                                                <td className="px-5 py-4 text-slate-400">
                                                    {expandedOrgId === item.id
                                                        ? <ChevronDown size={16} />
                                                        : <ChevronRight size={16} />
                                                    }
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                            {(item.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                                            <p className="text-xs text-slate-400 font-mono">{item.id.slice(0, 8)}…</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 hidden md:table-cell">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Users size={14} className="text-slate-400" />
                                                        {getMemberCount(item.id)}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-slate-400" />
                                                        {relativeTime(item.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.subscription_status === 'active'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.subscription_status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                        {item.subscription_status || 'free'}
                                                    </span>
                                                </td>
                                            </>
                                        ) : activeTab === 'leads' ? (
                                            <>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.type === 'founders_waitlist'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {item.type === 'founders_waitlist' ? (
                                                            <><Star size={11} /> Founder</>
                                                        ) : (
                                                            <><Zap size={11} /> Magnet</>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">{item.business_name || item.name}</p>
                                                    {item.business_name && <p className="text-xs text-slate-400">{item.name}</p>}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 hidden sm:table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail size={13} className="text-slate-400" />
                                                        {item.email}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{item.crew_size || '—'}</td>
                                                <td className="px-5 py-4 text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-slate-400" />
                                                        {relativeTime(item.created_at)}
                                                    </div>
                                                </td>
                                            </>
                                        ) : activeTab === 'tickets' ? (
                                            <>
                                                <td className="px-5 py-4 text-slate-400">
                                                    {expandedOrgId === item.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{item.first_name} {item.last_name}</p>
                                                        <p className="text-xs text-slate-400">{item.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="text-slate-700 font-medium">{item.subject || 'No Subject'}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-xs">{item.message}</p>
                                                </td>
                                                <td className="px-5 py-4 hidden sm:table-cell text-slate-500">
                                                    {relativeTime(item.created_at)}
                                                </td>
                                                <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleUpdateTicketStatus(item.id, e.target.value as any)}
                                                        className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border-none outline-none appearance-none cursor-pointer ${item.status === 'new'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : item.status === 'in_progress'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                            }`}
                                                    >
                                                        <option value="new">New</option>
                                                        <option value="in_progress">Working</option>
                                                        <option value="resolved">Resolved</option>
                                                    </select>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                                                            {(item.first_name || item.full_name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-slate-900">{item.first_name} {item.last_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">{item.email}</td>
                                                <td className="px-5 py-4 text-slate-500">{relativeTime(item.created_at)}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${item.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
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
