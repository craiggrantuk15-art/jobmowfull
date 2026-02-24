import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import Leads from './pages/Leads';
import Jobs from './pages/Jobs';
import Invoices from './pages/Invoices';
import Expenses from './pages/Expenses';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import AdminServices from './pages/AdminServices';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSettings from './pages/SuperAdminSettings';
import AdminHelpCenter from './pages/AdminHelpCenter';
import Login from './pages/Login';
import LeadMagnet from './pages/LeadMagnet';
import LeadMagnetThankYou from './pages/LeadMagnetThankYou';
import FoundersWaitlist from './pages/FoundersWaitlist';
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import Features from './pages/Features';
import Docs from './pages/Docs';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import HelpCenter from './pages/HelpCenter';
import Status from './pages/Status';
import HelpArticle from './pages/HelpArticle';
import EmbedWidget from './pages/EmbedWidget';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import SubscriptionGate from './components/SubscriptionGate';
import { JobProvider } from './context/JobContext';
import { ServiceProvider } from './context/ServiceContext';
import { unlockAudio } from './services/notificationService';

const App: React.FC = () => {
  React.useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  return (
    <ServiceProvider>
      <AuthProvider>
        <JobProvider>
          <Router>
            <Layout>
              <Routes>
                {/* SaaS Website */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<Booking />} />
                <Route path="/login" element={<Login />} />
                <Route path="/toolkit" element={<LeadMagnet />} />
                <Route path="/toolkit/thank-you" element={<LeadMagnetThankYou />} />
                <Route path="/founders" element={<FoundersWaitlist />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/features" element={<Features />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/status" element={<Status />} />
                <Route path="/help/article/:id" element={<HelpArticle />} />

                {/* Admin Routes - Protected */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Dashboard />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/schedule" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Schedule />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/leads" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Leads />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/jobs" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Jobs />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/customers" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Customers />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/invoices" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Invoices />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/expenses" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Expenses />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/super-admin/services" element={
                  <SuperAdminRoute>
                    <AdminServices />
                  </SuperAdminRoute>
                } />

                <Route path="/admin/embed-widget" element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <EmbedWidget />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } />

                {/* Super Admin Routes */}
                <Route path="/super-admin" element={
                  <SuperAdminRoute>
                    <SuperAdminDashboard />
                  </SuperAdminRoute>
                } />
                <Route path="/super-admin/settings" element={
                  <SuperAdminRoute>
                    <SuperAdminSettings />
                  </SuperAdminRoute>
                } />
                <Route path="/super-admin/help" element={
                  <SuperAdminRoute>
                    <AdminHelpCenter />
                  </SuperAdminRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </JobProvider>
      </AuthProvider>
    </ServiceProvider >
  );
};

export default App;