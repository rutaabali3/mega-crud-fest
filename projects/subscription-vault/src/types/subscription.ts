export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type Category = 'streaming' | 'software' | 'gaming' | 'fitness' | 'finance' | 'utilities' | 'other';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'PKR';
export type Status = 'active' | 'paused';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  category: Category;
  renewalDate: string;
  logoUrl?: string;
  color: string;
  status: Status;
  currency: Currency;
  notes?: string;
  createdAt: string;
  lastEditedAt: string;
}
