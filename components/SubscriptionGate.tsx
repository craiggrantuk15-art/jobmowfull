import React from 'react';
import { useJobs } from '../context/JobContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, ArrowRight } from 'lucide-react';

interface SubscriptionGateProps {
    children: React.ReactNode;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ children }) => {
    const { subscriptionStatus, loading } = useJobs();
    const navigate = useNavigate();

    // Allow access if loading or status is active/trialing
    // Also allow if status is null/undefined (fallback to free tier or loading)
    // Adjust logic based on strictness.
    // If strict: !['active', 'trialing'].includes(status) -> Block

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Checking subscription...</div>;
    }

    const allowedStatuses = ['active', 'trialing'];
    const isAllowed = !subscriptionStatus || allowedStatuses.includes(subscriptionStatus);

    if (isAllowed) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscription Required</h2>
                <p className="text-slate-500 mb-8">
                    Your subscription is currently <strong>{subscriptionStatus}</strong>.
                    Please update your billing information to continue using JobMow.
                </p>
                <button
                    onClick={() => navigate('/admin/settings')}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                    <CreditCard size={20} />
                    Update Billing
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default SubscriptionGate;
