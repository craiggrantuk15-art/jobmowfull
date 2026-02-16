import React, { createContext, useContext, useState, useEffect } from 'react';
import { Job, JobStatus, PaymentStatus, QuoteRequest, Expense, ExpenseCategory, Frequency, BusinessSettings, Communication, CommunicationType } from '../types';
import { MOCK_JOBS } from '../constants';
import { sendNotification } from '../services/notificationService';

interface JobContextType {
  jobs: Job[];
  expenses: Expense[];
  communications: Communication[];
  settings: BusinessSettings;
  addJob: (job: Job) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  updatePaymentStatus: (id: string, status: PaymentStatus) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateCustomer: (oldKey: string, updates: { name: string, address: string, email?: string, phone?: string, zone?: string }) => void;
  updateJobOrder: (orderedIds: string[]) => void;
  updateSettings: (updates: Partial<BusinessSettings>) => void;
  addCommunication: (comm: Omit<Communication, 'id' | 'date'>) => void;
  loadData: (data: { jobs?: Job[], expenses?: Expense[], settings?: BusinessSettings, communications?: Communication[] }) => void;
  toggleJobTimer: (id: string) => void;
  getJobStats: () => {
    pending: number;
    scheduled: number;
    completed: number;
    revenue: number;
    outstanding: number;
    totalExpenses: number;
    netProfit: number;
  };
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
  businessBasePostcode: 'SW1A 1AA'
};

const MOCK_EXPENSES: Expense[] = [
  { id: '1', title: 'Weekly Fuel', amount: 45.50, category: ExpenseCategory.CAR_TRAVEL, date: new Date().toISOString() },
  { id: '2', title: 'New Mower Blades', amount: 28.99, category: ExpenseCategory.OFFICE_EQUIPMENT, date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: '3', title: 'Facebook Ads', amount: 15.00, category: ExpenseCategory.MARKETING, date: new Date(Date.now() - 86400000 * 5).toISOString() },
];

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>(() => {
    return MOCK_JOBS.map(job => ({
      ...job,
      zone: job.address.includes(',') ? job.address.split(',')[1].trim() : 'Westside',
      paymentStatus: job.paymentStatus || (job.status === JobStatus.COMPLETED ? PaymentStatus.UNPAID : undefined)
    }));
  });

  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);

  const addJob = (job: Job) => {
    setJobs((prev) => [...prev, job]);
    
    if (job.status === JobStatus.PENDING) {
        sendNotification(
            'New Lead Received! 🌿', 
            `${job.customerName} requested a quote for ${job.address}`
        );
        addCommunication({
          customerId: `${job.customerName}-${job.address}`,
          jobId: job.id,
          type: CommunicationType.SYSTEM,
          subject: 'Lead Created',
          body: `New lead received from ${job.leadSource || 'Website'}. Quote: £${job.priceQuote}.`
        });
    }
  };

  const addCommunication = (comm: Omit<Communication, 'id' | 'date'>) => {
    const newComm: Communication = {
      ...comm,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };
    setCommunications(prev => [newComm, ...prev]);
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, ...updates } : job)));
  };

  const updateCustomer = (oldKey: string, updates: { name: string, address: string, email?: string, phone?: string, zone?: string }) => {
    setJobs((prev) => prev.map((job) => {
      const jobKey = `${job.customerName}-${job.address}`;
      if (jobKey === oldKey) {
        return {
          ...job,
          customerName: updates.name,
          address: updates.address,
          email: updates.email,
          phone: updates.phone,
          zone: updates.zone
        };
      }
      return job;
    }));
    
    const newKey = `${updates.name}-${updates.address}`;
    if (newKey !== oldKey) {
        setCommunications((prev) => prev.map(comm => 
            comm.customerId === oldKey ? { ...comm, customerId: newKey } : comm
        ));
    }
  };

  const updateSettings = (updates: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const loadData = (data: { jobs?: Job[], expenses?: Expense[], settings?: BusinessSettings, communications?: Communication[] }) => {
    if (data.jobs) setJobs(data.jobs);
    if (data.expenses) setExpenses(data.expenses);
    if (data.settings) setSettings(data.settings);
    if (data.communications) setCommunications(data.communications);
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    setJobs((prev) => {
      const jobIndex = prev.findIndex((j) => j.id === id);
      if (jobIndex === -1) return prev;
      
      const currentJob = prev[jobIndex];
      const newJobs = [...prev];
      
      const updates: Partial<Job> = { status };

      addCommunication({
        customerId: `${currentJob.customerName}-${currentJob.address}`,
        jobId: currentJob.id,
        type: CommunicationType.SYSTEM,
        subject: `Status Update: ${status}`,
        body: `Job status changed from ${currentJob.status} to ${status}.`
      });
      
      if (status === JobStatus.COMPLETED && currentJob.status !== JobStatus.COMPLETED) {
          updates.completedDate = new Date().toISOString();
          updates.paymentStatus = PaymentStatus.UNPAID;

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
                  id: crypto.randomUUID(),
                  status: JobStatus.SCHEDULED,
                  scheduledDate: nextDate.toISOString().split('T')[0],
                  completedDate: undefined,
                  paymentStatus: undefined,
                  notes: `Auto-generated recurrence from job on ${new Date().toLocaleDateString()}`
              };

              newJobs.push(nextJob);
              
              sendNotification(
                  'Recurring Job Created 📅', 
                  `Next visit for ${currentJob.customerName} scheduled for ${nextDate.toLocaleDateString()}`
              );

              addCommunication({
                customerId: `${currentJob.customerName}-${currentJob.address}`,
                jobId: nextJob.id,
                type: CommunicationType.SYSTEM,
                subject: 'Recurring Job Scheduled',
                body: `Automated ${currentJob.frequency.toLowerCase()} visit created for ${nextDate.toLocaleDateString()}.`
              });
          }
      }

      newJobs[jobIndex] = { ...currentJob, ...updates };
      return newJobs;
    });
  };

  const updatePaymentStatus = (id: string, status: PaymentStatus) => {
    setJobs((prev) => {
      const job = prev.find(j => j.id === id);
      if (job) {
        addCommunication({
          customerId: `${job.customerName}-${job.address}`,
          jobId: job.id,
          type: CommunicationType.SYSTEM,
          subject: `Payment ${status}`,
          body: `Job marked as ${status.toLowerCase()}.`
        });
      }
      return prev.map((job) => (job.id === id ? { ...job, paymentStatus: status } : job));
    });
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
           
           return {
               ...j,
               isTimerRunning: false,
               timerStartTime: undefined,
               actualDurationMinutes: (j.actualDurationMinutes || 0) + sessionDuration
           };
        } else {
            // Starting
            return {
                ...j,
                isTimerRunning: true,
                timerStartTime: new Date().toISOString()
            };
        }
      });
    });
  };

  const getJobStats = () => {
    const revenue = jobs.reduce(
      (acc, j) => acc + (j.paymentStatus === PaymentStatus.PAID ? j.priceQuote : 0),
      0
    );

    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    return {
      pending: jobs.filter((j) => j.status === JobStatus.PENDING).length,
      scheduled: jobs.filter((j) => j.status === JobStatus.SCHEDULED).length,
      completed: jobs.filter((j) => j.status === JobStatus.COMPLETED).length,
      revenue,
      outstanding: jobs.reduce(
        (acc, j) => acc + (j.paymentStatus === PaymentStatus.UNPAID && j.status === JobStatus.COMPLETED ? j.priceQuote : 0),
        0
      ),
      totalExpenses,
      netProfit: revenue - totalExpenses
    };
  };

  return (
    <JobContext.Provider value={{ 
      jobs, 
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
      getJobStats 
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