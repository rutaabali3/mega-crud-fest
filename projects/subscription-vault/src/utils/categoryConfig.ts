import { Category } from '@/types/subscription';

export interface CategoryMeta {
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryMeta> = {
  streaming: { label: 'Streaming', emoji: '🎬', color: '#E879F9' },
  software: { label: 'Software', emoji: '💻', color: '#818CF8' },
  gaming: { label: 'Gaming', emoji: '🎮', color: '#34D399' },
  fitness: { label: 'Fitness', emoji: '💪', color: '#FB923C' },
  finance: { label: 'Finance', emoji: '💰', color: '#FBBF24' },
  utilities: { label: 'Utilities', emoji: '⚡', color: '#38BDF8' },
  other: { label: 'Other', emoji: '📦', color: '#94A3B8' },
};

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  PKR: '₨',
};
