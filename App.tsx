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
import { JobProvider } from './context/JobContext';

const App: React.FC = () => {
  return (
    <JobProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Customer Facing */}
            <Route path="/" element={<Booking />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/schedule" element={<Schedule />} />
            <Route path="/admin/leads" element={<Leads />} />
            <Route path="/admin/jobs" element={<Jobs />} />
            <Route path="/admin/customers" element={<Customers />} />
            <Route path="/admin/invoices" element={<Invoices />} />
            <Route path="/admin/expenses" element={<Expenses />} />
            <Route path="/admin/settings" element={<Settings />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </JobProvider>
  );
};

export default App;