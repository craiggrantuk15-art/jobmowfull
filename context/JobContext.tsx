import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Job, JobStatus, PaymentStatus, QuoteRequest, Expense, ExpenseCategory, Frequency, BusinessSettings, Communication, CommunicationType, Customer, JobStats } from '../types';
import { MOCK_JOBS } from '../constants';
import { sendNotification } from '../services/notificationService';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { generateUUID } from '../utils';

interface JobContextType {
  jobs: Job[];
  customers: Customer[];
  expenses: Expense[];
  communications: Communication[];
  settings: BusinessSettings;
  subscriptionStatus: string | undefined;
  billingCustomerId: string | undefined;
  loading: boolean;
  addJob: (job: Job) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  updateJobOrder: (orderedIds: string[]) => void;
  updateSettings: (updates: Partial<BusinessSettings>) => Promise<void>;
  addCommunication: (comm: Omit<Communication, 'id' | 'created_at'>) => Promise<void>;
  loadData: (data: any) => void;
  toggleJobTimer: (id: string) => void;
  getJobStats: () => JobStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'organization_id'>) => Promise<Customer>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: 'JobMow Lawn Care',
  email: 'hello@jobmow.co.uk',
  phone: '07700 900123',
  website: 'www.jobmow.co.uk',
  bankName: 'Monzo',
  sortCode: '12-34-56',
  accountNumber: '12345678',
  baseHourlyRate: 35,
  weeklyDiscount: 15,
  fortnightlyDiscount: 10,
  monthlyDiscount: 0,
  taxRate: 0,
  scheduleStartHour: 8,
  scheduleEndHour: 17,
  workingDays: [1, 2, 3, 4, 5], // Default Mon-Fri
  aiTone: 'friendly',
  autoCreateRecurring: true,
  currency: '£',
  efficiencyThresholdHigh: 60,
  efficiencyThresholdLow: 30,
  zones: ['Westside', 'Northside', 'Eastside', 'Southside', 'City Centre'],
  overgrownThreshold: 90,
  overgrownSurcharge: 15,
  fuelSurchargeRadius: 15,
  fuelSurchargeAmount: 5,
  businessBasePostcode: 'SW1A 1AA',
  smallLawnPrice: 20,
  mediumLawnPrice: 35,
  largeLawnPrice: 60,
  estateLawnPrice: 100,
  extraFertilizerPrice: 15,
  extraEdgingPrice: 10,
  extraWeedingPrice: 25,
  extraLeafCleanupPrice: 20,
  postcodeApiUrl: 'https://api.postcodes.io',
  onboardingCompleted: false,
  monthlyGoal: 5000
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { organizationId, user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>(undefined);
  const [billingCustomerId, setBillingCustomerId] = useState<string | undefined>(undefined);
  const [publicOrganizationId, setPublicOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      fetchData();
    } else {
      setJobs([]);
      setCustomers([]);
      setExpenses([]);
      setSubscriptionStatus(undefined);
      setBillingCustomerId(undefined);
      fetchPublicOrg();
    }
  }, [organizationId]);

  const fetchPublicOrg = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('organizations').select('id, settings').limit(1).single();
      if (error) throw error;
      if (data) {
        setPublicOrganizationId(data.id);
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
      }
    } catch (e) {
      console.error("JobContext: Error fetching public org:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!organizationId) return;
    setLoading(true);

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: customersData } = await supabase
      .from('customers')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: expensesData } = await supabase
      .from('expenses')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: communicationsData } = await supabase
      .from('communications')
      .select('*')
      .eq('organization_id', organizationId)
      .order('sent_at', { ascending: false });

    const { data: orgData } = await supabase
      .from('organizations')
      .select('settings, subscription_status, billing_customer_id')
      .eq('id', organizationId)
      .single();

    if (jobsData) setJobs(jobsData as unknown as Job[]);
    if (customersData) setCustomers(customersData as Customer[]);
    if (expensesData) setExpenses(expensesData as unknown as Expense[]);
    if (communicationsData) setCommunications(communicationsData as Communication[]);
    if (orgData) {
      if (orgData.settings && Object.keys(orgData.settings).length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...orgData.settings });
      }
      setSubscriptionStatus(orgData.subscription_status || undefined);
      setBillingCustomerId(orgData.billing_customer_id || undefined);
    }
    setLoading(false);
  };

  const addJob = async (job: Job) => {
    let targetOrgId = organizationId || publicOrganizationId || job.organization_id;

    // Last resort fetch if still missing
    if (!targetOrgId || targetOrgId === '') {

      const { data } = await supabase.from('organizations').select('id').limit(1).single();
      if (data) {
        targetOrgId = data.id;
        setPublicOrganizationId(data.id);
      }
    }

    if (!targetOrgId || targetOrgId === '') {
      const error = new Error("addJob: No organization context found. Please ensure you are logged in or the site settings have loaded.");
      console.error(error);
      throw error;
    }

    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (!isUUID(targetOrgId)) {
      const error = new Error(`addJob: Invalid organization UUID: "${targetOrgId}". Please check your site configuration.`);
      console.error(error);
      throw error;
    }



    // Check if customer exists by ID first (if provided)
    // or by name/address if not found or ID not provided?
    // For now, assume job.customerId is authoritative if created via new logic.
    // If we want to deduplicate, we should check `customers` state or DB.

    let customerId = job.customer_id;
    const existingCustomer = customers.find(c =>
      c.id === job.customer_id ||
      (c.name === job.customer_name && c.address === job.address)
    );

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // If reusing existing customer, we might want to update their details if changed?
      // skipping for simplicity now.
    } else {
      // Create new customer
      const newCustomerPayload = {
        id: customerId, // Use provided UUID
        organization_id: targetOrgId,
        name: job.customer_name,
        email: job.email || null,
        phone: job.phone || null,
        address: job.address,
        postcode: job.postcode
      };

      const { error: custError } = await supabase
        .from('customers')
        .insert(newCustomerPayload);

      if (custError) {
        // If customer already exists (PK violation), we can ignore and move to job insert
        if (custError.code === '23505') {

        } else {
          console.error('Error creating customer:', custError);
          throw custError;
        }
      } else {
        setCustomers(prev => [...prev, newCustomerPayload as Customer]);
      }
    }

    // Optimistic update
    setJobs((prev) => [...prev, { ...job, customer_id: customerId }]);

    // 2. Create Job
    try {
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...job,
          customer_id: customerId, // Ensure consistent ID
          organization_id: targetOrgId
        });

      if (jobError) {
        console.error('Error creating job:', jobError);
        // Rollback optimistic update
        setJobs(prev => prev.filter(j => j.id !== job.id));
        throw jobError;
      }
    } catch (e) {
      console.error('Exception creating job:', e);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      throw e;
    }

    if (job.status === JobStatus.PENDING) {
      try {
        // ... notification logic ...
        sendNotification(
          'New Lead Received! 🌿',
          `${job.customer_name} requested a quote for ${job.address}`
        );
        await addCommunication({
          customer_id: customerId, // Use consistent ID
          job_id: job.id,
          organization_id: targetOrgId,
          type: CommunicationType.SYSTEM,
          subject: 'Lead Created',
          body: `New lead received from ${job.lead_source || 'Website'}. Quote: £${job.price_quote}.`,
          sent_at: new Date().toISOString()
        });
      } catch (commError) {
        console.error('JobContext: Error in post-insertion logic:', commError);
        // We don't throw here to avoid failing the whole booking if just communication fails
      }
    }
  };

  const addCommunication = async (comm: Omit<Communication, 'id' | 'created_at'>) => {
    const targetOrgId = comm.organization_id || organizationId;

    if (!targetOrgId) {
      console.error('JobContext: Cannot add communication without organizationId');
      return;
    }

    const newComm: Communication = {
      ...comm,
      organization_id: targetOrgId,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setCommunications(prev => [newComm, ...prev]);

    try {
      // Persist to DB
      const { error } = await supabase
        .from('communications')
        .insert(newComm);

      if (error) {
        console.error('Error adding communication:', error);
        // Revert optimistic update
        setCommunications(prev => prev.filter(c => c.id !== newComm.id));
      }
    } catch (e) {
      console.error('Exception in addCommunication:', e);
      setCommunications(prev => prev.filter(c => c.id !== newComm.id));
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'organization_id'>): Promise<Customer> => {
    if (!organizationId) throw new Error("No organization ID found");

    const newCustomer: Customer = {
      ...customer,
      id: generateUUID(),
      organization_id: organizationId,
      created_at: new Date().toISOString()
    };

    // Optimistic update
    setCustomers(prev => [...prev, newCustomer]);

    const { error } = await supabase
      .from('customers')
      .insert(newCustomer);

    if (error) {
      console.error('Error adding customer:', error);
      throw error;
    }

    setCustomers(prev => [...prev, newCustomer]);

    return newCustomer;
  };

  const addExpense = async (expense: Expense) => {
    if (!organizationId) return;
    setExpenses(prev => [expense, ...prev]);

    try {
      const { error } = await supabase
        .from('expenses')
        .insert({
          ...expense,
          organization_id: organizationId
        });

      if (error) {
        console.error("Error adding expense", error);
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
      }
    } catch (e) {
      console.error("Exception adding expense", e);
      setExpenses(prev => prev.filter(e => e.id !== expense.id));
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await supabase.from('expenses').delete().eq('id', id);
  };

  const updateJob = async (id: string, updates: Partial<Job>) => {
    const oldJobs = [...jobs];
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)));
    try {
      const { error } = await supabase.from('jobs').update(updates).eq('id', id);
      if (error) {
        console.error('Error updating job:', error);
        setJobs(oldJobs);
        throw error;
      }
    } catch (e) {
      console.error('Exception updating job:', e);
      setJobs(oldJobs);
      throw e;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    const previousCustomers = [...customers];

    // Optimistic update
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

    try {
      const { error: custError } = await supabase.from('customers').update(updates).eq('id', id);
      if (custError) {
        console.error('Error updating customer:', custError);
        setCustomers(previousCustomers); // Rollback
        throw custError;
      }

      // Update denormalized jobs
      if (updates.name || updates.address) {
        const jobUpdates: any = {};
        if (updates.name) jobUpdates.customer_name = updates.name;
        if (updates.address) jobUpdates.address = updates.address;

        setJobs(prev => prev.map(j => j.customer_id === id ? { ...j, ...jobUpdates } : j));
        const { error: jobError } = await supabase.from('jobs').update(jobUpdates).eq('customer_id', id);
        if (jobError) console.error('Error updating denormalized jobs:', jobError);
      }
    } catch (e) {
      console.error('Exception updating customer:', e);
      setCustomers(previousCustomers); // Rollback
      throw e;
    }
  };

  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    const newSettings = { ...settings, ...updates };

    // Optimistic update
    setSettings(newSettings);

    if (organizationId) {
      try {
        const dbUpdates: any = { settings: newSettings };

        // Sync business name to organization name column if changed
        if (updates.businessName) {
          dbUpdates.name = updates.businessName;
        }

        const { error } = await supabase.from('organizations')
          .update(dbUpdates)
          .eq('id', organizationId);

        if (error) {
          console.error('Error saving settings:', error);
          // Revert optimistic update on error
          // We'd need the old settings, but for now just throw and let UI handle it
          throw error;
        }
      } catch (error) {
        console.error('Catch error saving settings:', error);
        throw error;
      }
    }
  };

  const loadData = (data: { jobs?: Job[], expenses?: Expense[], settings?: BusinessSettings, communications?: Communication[] }) => {
    if (data.jobs) setJobs(data.jobs);
    if (data.expenses) setExpenses(data.expenses);
    if (data.settings) setSettings(data.settings);
    if (data.communications) setCommunications(data.communications);
  };

  const updateJobStatus = async (id: string, status: JobStatus) => {
    setJobs((prev) => {
      const jobIndex = prev.findIndex((j) => j.id === id);
      if (jobIndex === -1) return prev;

      const currentJob = prev[jobIndex];
      const newJobs = [...prev];

      const updates: Partial<Job> = { status };

      addCommunication({
        customer_id: currentJob.customer_id,
        job_id: currentJob.id,
        organization_id: organizationId!,
        type: CommunicationType.SYSTEM,
        subject: `Status Update: ${status}`,
        body: `Job status changed from ${currentJob.status} to ${status}.`,
        sent_at: new Date().toISOString()
      });

      if (status === JobStatus.COMPLETED && currentJob.status !== JobStatus.COMPLETED) {
        updates.completed_date = new Date().toISOString();
        updates.payment_status = PaymentStatus.UNPAID;

        if (settings.autoCreateRecurring && currentJob.frequency !== Frequency.ONE_OFF) {
          const nextDate = new Date();
          if (currentJob.frequency === Frequency.WEEKLY) {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (currentJob.frequency === Frequency.FORTNIGHTLY) {
            nextDate.setDate(nextDate.getDate() + 14);
          } else if (currentJob.frequency === Frequency.MONTHLY) {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }

          const nextJob: Job = {
            ...currentJob,
            id: generateUUID(),
            status: JobStatus.SCHEDULED,
            scheduled_date: nextDate.toISOString().split('T')[0],
            completed_date: undefined,
            payment_status: undefined,
            notes: `Auto-generated recurrence from job on ${new Date().toLocaleDateString()}`
          };

          newJobs.push(nextJob);

          sendNotification(
            'Recurring Job Created 📅',
            `Next visit for ${currentJob.customer_name} scheduled for ${nextDate.toLocaleDateString()}`
          );

          addCommunication({
            customer_id: currentJob.customer_id,
            job_id: nextJob.id,
            organization_id: organizationId!,
            type: CommunicationType.SYSTEM,
            subject: 'Recurring Job Scheduled',
            body: `Automated ${currentJob.frequency.toLowerCase()} visit created for ${nextDate.toLocaleDateString()}.`,
            sent_at: new Date().toISOString()
          });
        }
      }

      newJobs[jobIndex] = { ...currentJob, ...updates };
      // Async update
      supabase.from('jobs').update(updates).eq('id', id).then();

      return newJobs;
    });
  };

  const updatePaymentStatus = async (id: string, status: PaymentStatus) => {
    setJobs((prev) => {
      const job = prev.find(j => j.id === id);
      if (job) {
        addCommunication({
          customer_id: job.customer_id,
          job_id: job.id,
          organization_id: organizationId!,
          type: CommunicationType.SYSTEM,
          subject: `Payment ${status}`,
          body: `Job marked as ${status.toLowerCase()}.`,
          sent_at: new Date().toISOString()
        });
      }
      return prev.map((job) => (job.id === id ? { ...job, payment_status: status } : job));
    });
    try {
      const { error } = await supabase.from('jobs').update({ payment_status: status }).eq('id', id);
      if (error) {
        console.error('Error updating payment status:', error);
        // Revert? 
      }
    } catch (e) {
      console.error('Exception updating payment status:', e);
    }
  };

  const updateJobOrder = (orderedIds: string[]) => {
    setJobs((prev) => {
      const jobMap = new Map(prev.map(j => [j.id, j]));
      const orderedJobs = orderedIds
        .map(id => jobMap.get(id))
        .filter((j): j is Job => !!j);

      const seenIds = new Set(orderedIds);
      const remainingJobs = prev.filter(j => !seenIds.has(j.id));

      return [...orderedJobs, ...remainingJobs];
    });
  };

  const toggleJobTimer = (id: string) => {
    setJobs((prev) => {
      return prev.map((j) => {
        if (j.id !== id) return j;

        if (j.isTimerRunning) {
          // Stopping
          const start = new Date(j.timerStartTime!).getTime();
          const now = new Date().getTime();
          const sessionDuration = (now - start) / 60000; // minutes

          const updates = {
            is_timer_running: false as boolean, // Explicit cast
            timer_start_time: undefined,
            actual_duration_minutes: (j.actual_duration_minutes || 0) + sessionDuration
          };

          supabase.from('jobs').update({
            is_timer_running: false,
            timer_start_time: null,
            actual_duration_minutes: updates.actual_duration_minutes
          }).eq('id', id).then();

          return { ...j, ...updates };
        } else {
          // Starting
          const updates = {
            is_timer_running: true,
            timer_start_time: new Date().toISOString()
          };

          supabase.from('jobs').update(updates).eq('id', id).then();

          return { ...j, ...updates };
        }
      });
    });
  };

  const jobStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const scheduledToday = jobs.filter(j =>
      j.status === JobStatus.SCHEDULED &&
      j.scheduled_date?.startsWith(today)
    ).length;

    const revenue = jobs.reduce(
      (acc, j) => acc + (j.status === JobStatus.COMPLETED && j.payment_status === PaymentStatus.PAID ? j.price_quote : 0),
      0
    );

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const unpaid = jobs.reduce(
      (acc, j) => acc + (j.status === JobStatus.COMPLETED && j.payment_status === PaymentStatus.UNPAID ? j.price_quote : 0),
      0
    );

    const jobsWithQuotes = jobs.filter(j => j.price_quote > 0);
    const avgJobValue = jobsWithQuotes.length > 0
      ? jobsWithQuotes.reduce((acc, j) => acc + j.price_quote, 0) / jobsWithQuotes.length
      : 35; // Default fallback

    return {
      pending: jobs.filter((j) => j.status === JobStatus.PENDING).length,
      scheduled: jobs.filter((j) => j.status === JobStatus.SCHEDULED).length,
      scheduledToday,
      completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      revenue,
      outstanding: unpaid,
      unpaid,
      avgJobValue,
      totalExpenses,
      netProfit: revenue - totalExpenses
    };
  }, [jobs, expenses]);

  const getJobStats = (): JobStats => jobStats;

  return (
    <JobContext.Provider value={{
      jobs,
      customers,
      expenses,
      communications,
      settings,
      addJob,
      addExpense,
      deleteExpense,
      updateJobStatus,
      updatePaymentStatus,
      updateJob,
      updateCustomer,
      updateJobOrder,
      updateSettings,
      addCommunication,
      loadData,
      toggleJobTimer,
      getJobStats,
      addCustomer,
      subscriptionStatus,
      billingCustomerId,
      loading
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};