export enum Frequency {
  ONE_OFF = 'One-off',
  WEEKLY = 'Weekly',
  FORTNIGHTLY = 'Fortnightly',
  MONTHLY = 'Monthly',
}

export enum JobStatus {
  PENDING = 'Pending', // Lead
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid'
}

export enum LawnSize {
  SMALL = 'Small (< 100m²)',
  MEDIUM = 'Medium (100-300m²)',
  LARGE = 'Large (300-600m²)',
  ESTATE = 'Estate (600m²+)'
}

export enum ExpenseCategory {
  CAR_TRAVEL = 'Car, Van & Travel Expenses',
  OFFICE_EQUIPMENT = 'Office, Property & Equipment',
  RESELLING = 'Reselling Goods (Materials)',
  LEGAL_FINANCIAL = 'Legal & Financial Costs',
  MARKETING = 'Advertising & Marketing',
  CLOTHING = 'Clothing Expenses',
  STAFF = 'Staff Costs',
  OTHER = 'Other Business Expenses'
}

export enum CommunicationType {
  SMS = 'SMS',
  EMAIL = 'Email',
  CALL = 'Call',
  SYSTEM = 'System'
}

export interface Communication {
  id: string;
  customerId: string; // Aggregated ID: name-address
  jobId?: string;
  type: CommunicationType;
  subject: string;
  body: string;
  date: string; // ISO string
}

export interface BusinessSettings {
  businessName: string;
  email: string;
  phone: string;
  website: string;
  bankName: string;
  sortCode: string;
  accountNumber: string;
  baseHourlyRate: number;
  weeklyDiscount: number;
  fortnightlyDiscount: number;
  monthlyDiscount: number;
  taxRate: number;
  scheduleStartHour: number;
  scheduleEndHour: number;
  workingDays: number[]; // 0 = Sun, 1 = Mon, etc.
  aiTone: 'friendly' | 'formal' | 'direct';
  autoCreateRecurring: boolean;
  currency: string;
  efficiencyThresholdHigh: number;
  efficiencyThresholdLow: number;
  zones: string[];
  // Dynamic Pricing Rules
  overgrownThreshold: number; // minutes
  overgrownSurcharge: number; // currency amount
  fuelSurchargeRadius: number; // km
  fuelSurchargeAmount: number; // currency amount
  businessBasePostcode: string; // Used for distance check
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO date string
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  email?: string; // Contact info
  phone?: string; // Contact info
  address: string;
  postcode: string;
  zone?: string;
  frequency: Frequency;
  lawnSize: LawnSize;
  priceQuote: number;
  durationMinutes: number;
  status: JobStatus;
  paymentStatus?: PaymentStatus;
  scheduledDate?: string; // ISO date string
  completedDate?: string; // ISO date string
  notes?: string;
  leadSource?: string;
  paymentMethod?: string;
  photos?: string[]; // Array of base64 strings
  actualDurationMinutes?: number;
  timerStartTime?: string; // ISO string
  isTimerRunning?: boolean;
  isRainDelayed?: boolean;
}

export interface QuoteRequest {
  lawnSize: LawnSize;
  frequency: Frequency;
  address: string;
  extras: string[];
}

export interface QuoteResponse {
  estimatedPrice: number;
  estimatedDurationMinutes: number;
  explanation: string;
  surchargesApplied: string[];
}

export interface OptimizationResult {
  orderedJobIds: string[];
  reasoning: string;
  efficiencyScore: number;
  groundingUrls?: string[];
}