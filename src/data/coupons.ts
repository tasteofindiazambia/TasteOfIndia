import { CouponCode } from '../types';

export const coupons: CouponCode[] = [
  {
    code: 'PANIPURI6',
    discount: 40,
    minOrderValue: 100,
    validUntil: '2025-12-31',
    usageLimit: 100,
    currentUsage: 0
  },
  {
    code: 'WELCOME10',
    discount: 10,
    minOrderValue: 200,
    validUntil: '2025-12-31',
    usageLimit: 500,
    currentUsage: 0
  },
  {
    code: 'BIRYANI20',
    discount: 20,
    minOrderValue: 300,
    validUntil: '2025-12-31',
    usageLimit: 50,
    currentUsage: 0
  }
];