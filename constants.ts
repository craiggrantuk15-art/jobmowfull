import { Job, JobStatus, Frequency, LawnSize } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    organization_id: 'mock-org-id',
    service_id: 'mowing',
    service_name: 'Lawn Mowing',
    customer_id: 'c1',
    customer_name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '07700 900123',
    address: '12 Oak Street, Westside',
    postcode: 'WS1 2AA',
    frequency: Frequency.FORTNIGHTLY,
    lawn_size: LawnSize.MEDIUM,
    price_quote: 45,
    duration_minutes: 45,
    status: JobStatus.SCHEDULED,
    scheduled_date: new Date().toISOString().split('T')[0], // Today
    notes: 'Watch out for the dog.'
  },
  {
    id: '2',
    organization_id: 'mock-org-id',
    service_id: 'mowing',
    service_name: 'Lawn Mowing',
    customer_id: 'c2',
    customer_name: 'Bob Smith',
    email: 'bob.smith@test.co.uk',
    phone: '07700 900456',
    address: '45 Maple Ave, Northside',
    postcode: 'NS3 9BB',
    frequency: Frequency.MONTHLY,
    lawn_size: LawnSize.LARGE,
    price_quote: 80,
    duration_minutes: 90,
    status: JobStatus.PENDING,
    notes: 'Gate code is 1234.'
  },
  {
    id: '3',
    organization_id: 'mock-org-id',
    service_id: 'mowing',
    service_name: 'Lawn Mowing',
    customer_id: 'c3',
    customer_name: 'Charlie Brown',
    email: 'charlie@peanuts.com',
    phone: '07700 900789',
    address: '8 Pine Lane, Westside',
    postcode: 'WS1 2AB',
    frequency: Frequency.ONE_OFF,
    lawn_size: LawnSize.SMALL,
    price_quote: 30,
    duration_minutes: 30,
    status: JobStatus.SCHEDULED,
    scheduled_date: new Date().toISOString().split('T')[0], // Today
  },
  {
    id: '4',
    organization_id: 'mock-org-id',
    service_id: 'mowing',
    service_name: 'Lawn Mowing',
    customer_id: 'c4',
    customer_name: 'Diana Prince',
    email: 'diana@themyscira.net',
    phone: '07700 900999',
    address: '99 The Parade, Eastside',
    postcode: 'ES4 1CC',
    frequency: Frequency.FORTNIGHTLY,
    lawn_size: LawnSize.ESTATE,
    price_quote: 120,
    duration_minutes: 120,
    status: JobStatus.SCHEDULED,
    scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  }
];

export const APP_NAME = 'JobMow';
export const APP_VERSION = '0.0.1';

export const SUPER_ADMIN_EMAILS = ['craig@jobmow.com']; // Replace with your actual email

// Extras Options
export const EXTRAS_OPTIONS = [
  'Fertilizer Application',
  'Edging',
  'Weeding (Flower beds)',
  'Leaf Cleanup',
];

export const SERVICE_TYPES = [
  "Edging",
  "Clipping Removal",
  "Weeding",
  "Hedge Trimming"
];

export const DEFAULT_SERVICES = [
  {
    id: 'mowing-std',
    name: 'Standard Lawn Mowing',
    description: 'Regular professional grass cutting service including clipping management.',
    category: 'Outdoor',
    active: true
  },
  {
    id: 'hedge-trim',
    name: 'Hedge Trimming',
    description: 'Trimming and shaping of hedges, shrubs and ornamental bushes.',
    category: 'Outdoor',
    active: true
  },
  {
    id: 'pressure-wash',
    name: 'Path Pressure Washing',
    description: 'High-pressure cleaning of driveways, patios, and garden paths.',
    category: 'Outdoor',
    active: true
  },
  {
    id: 'garden-clearance',
    name: 'Garden Clearance',
    description: 'Removal of overgrowth, waste, and debris.',
    category: 'Outdoor',
    active: true
  },
  {
    id: 'ground-maintenance',
    name: 'Ground Maintenance',
    description: 'General upkeep of outdoor spaces.',
    category: 'Maintenance',
    active: true
  },
  {
    id: 'seasonal-maintenance',
    name: 'Seasonal Maintenance',
    description: 'Spring/Autumn cleanup, leaf clearing, etc.',
    category: 'Maintenance',
    active: true
  },
  {
    id: 'fence-installation',
    name: 'Fence Installation',
    description: 'Repair or installation of new fencing.',
    category: 'Outdoor',
    active: true
  },
  {
    id: 'interior-painting',
    name: 'Interior Painting & Decorating',
    description: 'Professional painting for walls, ceilings, and trim.',
    category: 'Indoor',
    active: true
  },
  {
    id: 'exterior-painting',
    name: 'Exterior House Painting',
    description: 'Painting of exterior walls, rendering, and woodwork.',
    category: 'Outdoor',
    active: true
  }
];