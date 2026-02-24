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

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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

export enum PropertyType {
  DETACHED = 'Detached',
  SEMI_DETACHED = 'Semi-Detached',
  TERRACED = 'Terraced / Townhouse',
  COMMERCIAL = 'Commercial / Other'
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
  EMAIL = 'EMAIL',
  CALL = 'CALL',
  SYSTEM = 'SYSTEM'
}

export interface Communication {
  id: string;
  customer_id: string; // Foreign key to customers table
  job_id?: string; // Optional FK to jobs
  organization_id: string;
  type: CommunicationType;
  subject: string;
  body: string;
  sent_at: string; // ISO string
  created_at?: string;
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
  // Manual Pricing Settings (Replacing AI)
  smallLawnPrice: number;
  mediumLawnPrice: number;
  largeLawnPrice: number;
  estateLawnPrice: number;
  extraFertilizerPrice: number;
  extraEdgingPrice: number;
  extraWeedingPrice: number;
  extraLeafCleanupPrice: number;
  // Weather Integration
  weatherApiKey?: string;
  weatherCity?: string;
  latitude?: number;
  longitude?: number;
  // Mowability Settings
  mowabilityRainThreshold?: number; // % chance
  mowabilityWindThreshold?: number; // km/h
  mowabilityTempMin?: number; // Celsius
  mowabilityTempMax?: number; // Celsius
  // API Settings
  postcodeApiUrl?: string;
  temperatureUnit?: 'C' | 'F';
  onboardingCompleted?: boolean;
  monthlyGoal?: number;
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
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  created_at?: string;
}

export interface Job {
  id: string;
  organization_id: string; // Added to match likely DB schema

  // Service Details
  service_id?: string;
  service_name?: string;

  customer_id: string;
  customer_name: string;
  email?: string; // Contact info
  phone?: string; // Contact info
  address: string;
  postcode: string;
  zone?: string;
  frequency: Frequency;
  lawn_size?: LawnSize; // Optional for non-mowing
  property_type?: PropertyType;
  price_quote: number;
  duration_minutes: number;
  status: JobStatus;
  payment_status?: PaymentStatus;
  scheduled_date?: string; // ISO date string
  completed_date?: string; // ISO date string
  notes?: string;
  lead_source?: string;
  payment_method?: string;
  photos?: string[]; // Array of base64 strings
  actual_duration_minutes?: number;
  timer_start_time?: string; // ISO string
  is_timer_running?: boolean;
  is_rain_delayed?: boolean;
}


export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'Outdoor' | 'Indoor' | 'Maintenance';
  active: boolean;
}

export interface QuoteRequest {
  service_id: string;
  service_name: string;
  lawn_size?: LawnSize; // Optional for non-mowing services
  frequency: Frequency;
  property_type: PropertyType;
  address: string;
  extras: string[];
  description?: string; // For custom service details
}

export interface QuoteResponse {
  estimatedPrice: number;
  estimatedDurationMinutes: number;
  explanation: string;
  surchargesApplied: string[];
  priceBreakdown: {
    base: number;
    extras: number;
    surcharges: number;
    discount: number;
  };
}

export interface OptimizationResult {
  orderedJobIds: string[];
  reasoning: string;
  efficiencyScore: number;
  groundingUrls?: string[];
}

export interface JobStats {
  pending: number;
  scheduled: number;
  scheduledToday: number;
  completed: number;
  revenue: number;
  outstanding: number;
  unpaid: number;
  avgJobValue: number;
  totalExpenses: number;
  netProfit: number;
}

export interface Lead {
  id: string;
  type: 'lead_magnet' | 'founders_waitlist';
  name: string;
  email: string;
  business_name?: string;
  crew_size?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}