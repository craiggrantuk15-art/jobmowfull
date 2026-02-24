import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useJobs } from '../context/JobContext';
import { Users, Mail, Trash2, Shield, Clock, CheckCircle, Plus, X, Copy } from 'lucide-react';

interface Member {
    id: string; // organization_member id
    user_id: string;
    role: string;
    profile?: {
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}

interface Invitation {
    id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    token: string;
}

const TeamSettings: React.FC = () => {
    const { organizationId, user } = useJobs();
    const [members, setMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteFullName, setInviteFullName] = useState('');
    const [inviteRole, setInviteRole] = useState('member');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (organizationId) {
            fetchTeamData();
        }
    }, [organizationId]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);

            // Fetch Members
            const { data: orgMembers, error: orgError } = await supabase
                .from('organization_members')
                .select('*')
                .eq('organization_id', organizationId);

            if (orgError) throw orgError;

            if (orgMembers && orgMembers.length > 0) {
                const userIds = orgMembers.map(m => m.user_id);
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                const combinedMembers = orgMembers.map(member => ({
                    ...member,
                    profile: profilesData?.find(p => p.id === member.user_id) || { email: 'Unknown', full_name: 'Unknown User' }
                }));
                setMembers(combinedMembers);
            } else {
                setMembers([]);
            }

            // Fetch Invitations
            const { data: invitesData, error: invitesError } = await supabase
                .from('invitations')
                .select('*')
                .eq('organization_id', organizationId)
                .is('status', 'pending');

            if (invitesError) throw invitesError;
            setInvitations(invitesData || []);

        } catch (err: any) {
            console.error('Error fetching team:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            if (!inviteEmail || !inviteFullName) return;

            // 1. Check if user already exists in profiles
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('email', inviteEmail)
                .single();

            if (existingProfile) {
                // 2. Add directly to organization_members
                const { error: memberError } = await supabase
                    .from('organization_members')
                    .insert({
                        organization_id: organizationId,
                        user_id: existingProfile.id,
                        role: inviteRole
                    });

                if (memberError) {
                    if (memberError.code === '23505') {
                        throw new Error('User is already a member of this organization.');
                    }
                    throw memberError;
                }

                setSuccess(`${inviteFullName} has been added to the team.`);
            } else {
                // 3. Create Invitation
                const { error } = await supabase
                    .from('invitations')
                    .insert({
                        organization_id: organizationId,
                        email: inviteEmail,
                        full_name: inviteFullName,
                        role: inviteRole,
                        created_by: user?.id
                    });

                if (error) throw error;
                setSuccess(`Invitation sent to ${inviteEmail}`);
            }

            setInviteEmail('');
            setInviteFullName('');
            setInviteRole('member');
            setIsInviteModalOpen(false);
            fetchTeamData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCancelInvite = async (id: string) => {
        try {
            await supabase.from('invitations').delete().eq('id', id);
            fetchTeamData();
        } catch (err) {
            console.error(err);
        }
    }

    const handleRemoveMember = async (id: string) => {
        if (!confirm('Are you sure you want to remove this member?')) return;
        try {
            await supabase.from('organization_members').delete().eq('id', id);
            fetchTeamData();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Team Management</h3>
                    <p className="text-slate-500">Manage access to your organization.</p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
                >
                    <Plus size={16} /> Add Team Member
                </button>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}
            {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100">{success}</div>}

            {/* Members List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 text-sm">Active Members ({members.length})</h4>
                </div>
                <div className="divide-y divide-slate-100">
                    {members.map(member => (
                        <div key={member.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                                    {member.profile?.avatar_url ? (
                                        <img src={member.profile.avatar_url} alt={member.profile.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        member.profile?.full_name?.charAt(0).toUpperCase() || 'U'
                                    )}

                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{member.profile?.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-slate-500">{member.profile?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${member.role === 'owner' ? 'bg-purple-100 text-purple-700' : member.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {member.role}
                                </span>
                                {member.user_id !== user?.id && (
                                    <button onClick={() => handleRemoveMember(member.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invitations List */}
            {invitations.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 text-sm">Pending Invitations ({invitations.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {invitations.map(invite => (
                            <div key={invite.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{invite.full_name || invite.email}</p>
                                        <p className="text-xs text-slate-500">{invite.email} • Sent {new Date(invite.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-mono uppercase">Role: {invite.role}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/login?invite=${invite.token}`);
                                                    alert('Invite link copied to clipboard!');
                                                }}
                                                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
                                            >
                                                <Copy size={12} /> Copy Link
                                            </button>
                                        </div>
                                        <span className="text-[10px] text-slate-400">Expires {new Date(new Date(invite.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <button onClick={() => handleCancelInvite(invite.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-900">Add Team Member</h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                                    placeholder="Jane Doe"
                                    value={inviteFullName}
                                    onChange={e => setInviteFullName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-shadow"
                                    placeholder="colleague@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={e => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition-shadow bg-white"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700 flex gap-2">
                                    <Shield size={14} className="shrink-0" />
                                    <span>If the user already has an account, they will be added immediately. Otherwise, an invitation link will be created.</span>
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Add Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamSettings;
