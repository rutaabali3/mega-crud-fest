import { z } from 'zod';

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type Category = 'streaming' | 'software' | 'gaming' | 'fitness' | 'finance' | 'utilities' | 'other';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'PKR';
export type Status = 'active' | 'paused';

export const billingCycleSchema = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);
export const categorySchema = z.enum(['streaming', 'software', 'gaming', 'fitness', 'finance', 'utilities', 'other']);
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'PKR']);
export const statusSchema = z.enum(['active', 'paused']);

export const subscriptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  billingCycle: billingCycleSchema,
  category: categorySchema,
  renewalDate: z.string(),
  logoUrl: z.string().optional(),
  color: z.string(),
  status: statusSchema,
  currency: currencySchema,
  notes: z.string().optional(),
  createdAt: z.string(),
  lastEditedAt: z.string(),
});

export const subscriptionsSchema = z.array(subscriptionSchema);

export type Subscription = z.infer<typeof subscriptionSchema>;
