import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    organizationId: string | null;
    login: (email: string, password?: string) => Promise<{ error: string | null }>;
    signup: (email: string, password: string, businessName: string, inviteToken?: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
    updateProfile: (name: string) => Promise<{ error: string | null }>;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Only act on specific events to avoid redundant mapping
            // INITIAL_SESSION, SIGNED_IN, and TOKEN_REFRESH (if user data changed) are key
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
                if (session?.user) {
                    await mapSupabaseUser(session.user);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setOrganizationId(null);
            }

            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const mapSupabaseUser = async (sbUser: any) => {
        const newUser: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            role: sbUser.user_metadata?.role as UserRole || UserRole.USER
        };
        setUser(newUser);

        // Fetch Organization
        const { data, error } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', sbUser.id)
            .single();

        if (data) {

            setOrganizationId(data.organization_id);
        } else {
            console.warn('AuthContext: No organization found for user', sbUser.id);
            if (error) console.error('AuthContext: Error fetching organization:', error);
            setOrganizationId(null);
        }
    };

    const login = async (email: string, password?: string) => {
        if (!password) {
            return { error: "Password required" };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        return { error: error?.message || null };
    };

    const signup = async (email: string, password: string, businessName: string, inviteToken?: string) => {
        let metaData: any = {
            name: businessName,
            role: inviteToken ? 'member' : 'owner'
        };

        // 1. If Invite Token, fetch details first to get the correct name
        if (inviteToken) {
            const { data: inviteDetails } = await supabase.rpc('get_invite_details', { token: inviteToken });
            if (inviteDetails && inviteDetails.valid && inviteDetails.full_name) {
                metaData.name = inviteDetails.full_name;
            }
        }

        // 2. Sign up auth user (Only call this once)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });

        if (authError) return { error: authError.message };
        if (!authData.user) return { error: "No user returned" };

        // 3. Handle invitation acceptance if applicable
        if (inviteToken) {
            const { data: acceptData, error: acceptError } = await supabase.rpc('accept_invitation', { token: inviteToken });

            if (acceptError) {
                return { error: `Failed to accept invitation: ${acceptError.message}` };
            }

            // Force refresh session/user
            await login(email, password);
            return { error: null };
        }

        // 4. Initialize Organization and Membership atomically
        const { data: initData, error: initError } = await supabase.rpc('initialize_new_organization', {
            business_name: businessName
        });

        if (initError || !initData?.success) {
            return { error: initError?.message || initData?.error || "Failed to initialize organization" };
        }

        // Force refresh session/user
        await login(email, password);

        return { error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setOrganizationId(null);
    };

    const updateProfile = async (name: string) => {
        if (!user) return { error: "No user logged in" };

        // 1. Update auth.users metadata
        const { error: authError } = await supabase.auth.updateUser({
            data: { name }
        });

        if (authError) return { error: authError.message };

        // 2. Update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ full_name: name })
            .eq('id', user.id);

        if (profileError) return { error: profileError.message };

        // Update local state
        setUser(prev => prev ? { ...prev, name } : null);
        return { error: null };
    };

    return (
        <AuthContext.Provider value={{
            user,
            organizationId,
            login,
            signup,
            logout,
            updateProfile,
            isAuthenticated: !!user,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
