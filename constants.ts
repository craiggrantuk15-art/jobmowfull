import { Job, JobStatus, Frequency, LawnSize } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    customerId: 'c1',
    customerName: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '07700 900123',
    address: '12 Oak Street, Westside',
    postcode: 'WS1 2AA',
    frequency: Frequency.FORTNIGHTLY,
    lawnSize: LawnSize.MEDIUM,
    priceQuote: 45,
    durationMinutes: 45,
    status: JobStatus.SCHEDULED,
    scheduledDate: new Date().toISOString().split('T')[0], // Today
    notes: 'Watch out for the dog.'
  },
  {
    id: '2',
    customerId: 'c2',
    customerName: 'Bob Smith',
    email: 'bob.smith@test.co.uk',
    phone: '07700 900456',
    address: '45 Maple Ave, Northside',
    postcode: 'NS3 9BB',
    frequency: Frequency.MONTHLY,
    lawnSize: LawnSize.LARGE,
    priceQuote: 80,
    durationMinutes: 90,
    status: JobStatus.PENDING,
    notes: 'Gate code is 1234.'
  },
  {
    id: '3',
    customerId: 'c3',
    customerName: 'Charlie Brown',
    email: 'charlie@peanuts.com',
    phone: '07700 900789',
    address: '8 Pine Lane, Westside',
    postcode: 'WS1 2AB',
    frequency: Frequency.ONE_OFF,
    lawnSize: LawnSize.SMALL,
    priceQuote: 30,
    durationMinutes: 30,
    status: JobStatus.SCHEDULED,
    scheduledDate: new Date().toISOString().split('T')[0], // Today
  },
  {
    id: '4',
    customerId: 'c4',
    customerName: 'Diana Prince',
    email: 'diana@themyscira.net',
    phone: '07700 900999',
    address: '99 The Parade, Eastside',
    postcode: 'ES4 1CC',
    frequency: Frequency.FORTNIGHTLY,
    lawnSize: LawnSize.ESTATE,
    priceQuote: 120,
    durationMinutes: 120,
    status: JobStatus.SCHEDULED,
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
  }
];

export const EXTRAS_OPTIONS = [
  "Edging",
  "Clipping Removal",
  "Weeding",
  "Hedge Trimming"
];