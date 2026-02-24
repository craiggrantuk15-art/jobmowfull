import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Building, ArrowRight, Loader2, User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login, signup, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Invite State
    const [inviteToken, setInviteToken] = useState<string | null>(null);
    const [inviteDetails, setInviteDetails] = useState<{ organization_name: string, email: string } | null>(null);
    const [checkingInvite, setCheckingInvite] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/admin');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const token = searchParams.get('invite');
        const loginParam = searchParams.get('isLogin');

        if (token) {
            verifyInvite(token);
        } else if (loginParam === 'false') {
            setIsLogin(false);
        } else if (loginParam === 'true') {
            setIsLogin(true);
        }
    }, [searchParams]);

    const verifyInvite = async (token: string) => {
        setCheckingInvite(true);
        try {
            const { data, error } = await supabase.rpc('get_invite_details', { token });
            if (error) throw error;

            if (data.valid) {
                setInviteToken(token);
                setInviteDetails(data);
                setEmail(data.email);
                setIsLogin(false); // Switch to signup
            } else {
                setError(data.error || 'Invalid or expired invitation link.');
            }
        } catch (err: any) {
            console.error(err);
            setError('Failed to verify invitation.');
        } finally {
            setCheckingInvite(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await login(email, password);
                if (error) throw new Error(error);
            } else {
                // If invite token exists, businessName field acts as "Your Name"
                const { error } = await signup(email, password, businessName, inviteToken || undefined);
                if (error) throw new Error(error);
            }
            // Navigation handled by auth state change
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (checkingInvite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin h-8 w-8 text-lawn-600 mx-auto mb-4" />
                    <p className="text-slate-500">Verifying invitation...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-lawn-500 p-3 rounded-xl shadow-lg shadow-lawn-200">
                        <Leaf className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
                    {inviteToken ? `Join ${inviteDetails?.organization_name}` : (isLogin ? 'Sign in to JobMow' : 'Start your free trial')}
                </h2>
                {inviteToken && (
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Create an account to accept your invitation.
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-slate-700">
                                    {inviteToken ? 'Full Name' : 'Business Name'}
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        {inviteToken ? <User className="h-5 w-5 text-slate-400" /> : <Building className="h-5 w-5 text-slate-400" />}
                                    </div>
                                    <input
                                        id="businessName"
                                        name="businessName"
                                        type="text"
                                        required
                                        className="focus:ring-lawn-500 focus:border-lawn-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2.5"
                                        placeholder={inviteToken ? "John Doe" : "Acme Landscaping"}
                                        value={businessName}
                                        onChange={(e) => setBusinessName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    disabled={!!inviteToken} // Lock email if invite
                                    className={`focus:ring-lawn-500 focus:border-lawn-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2.5 ${inviteToken ? 'bg-slate-50 text-slate-500' : ''}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="focus:ring-lawn-500 focus:border-lawn-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-2.5"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        {isLogin ? 'Sign In' : (inviteToken ? 'Join Organization' : 'Start Free Trial')} <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {!inviteToken && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">
                                        {isLogin ? 'New to JobMow?' : 'Already have an account?'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null);
                                    }}
                                    className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lawn-500 transition-all"
                                >
                                    {isLogin ? 'Create an account' : 'Sign in'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
