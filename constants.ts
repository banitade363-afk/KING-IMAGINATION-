
import { Plan } from './types';

export const ADMIN_EMAIL = 'king@admin.com';
export const ADMIN_PASSWORD = '6205';

export const INITIAL_CREDITS = 25;
export const IMAGE_GENERATION_COST = 5;

export const UPI_ID = 'your-upi-id@okhdfcbank';
export const UPI_QR_IMAGE_URL = 'https://picsum.photos/300/300?random=1';

export const SEED_PLANS: Plan[] = [
  {
    id: 'plan_1',
    name: 'Starter Pack',
    credits: 100,
    priceINR: 99,
    description: 'Perfect for getting started.',
    isActive: true,
  },
  {
    id: 'plan_2',
    name: 'Pro Pack',
    credits: 300,
    priceINR: 249,
    description: 'For frequent creators.',
    isActive: true,
  },
  {
    id: 'plan_3',
    name: 'Ultra Pack',
    credits: 1000,
    priceINR: 699,
    description: 'Best value for power users.',
    isActive: true,
  },
];
