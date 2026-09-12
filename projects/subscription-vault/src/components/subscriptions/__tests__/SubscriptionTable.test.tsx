import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SubscriptionTable } from '../SubscriptionTable';
import { Subscription } from '@/types/subscription';

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Netflix',
    category: 'streaming',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    renewalDate: '2025-01-01',
    status: 'active',
    startDate: '2024-01-01',
    color: '#E50914',
  },
  {
    id: 'sub-2',
    name: 'Spotify',
    category: 'streaming',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    renewalDate: '2025-01-05',
    status: 'paused',
    startDate: '2024-01-01',
    color: '#1DB954',
  },
];

describe('SubscriptionTable accessibility', () => {
  it('renders action buttons with descriptive aria-labels', () => {
    render(
      <SubscriptionTable
        subscriptions={mockSubscriptions}
        onEdit={vi.fn()}
        onToggle={vi.fn()}
        onDelete={vi.fn()}
        sortKey="name"
        sortDir="asc"
        onSort={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit Netflix' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Pause Netflix' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Delete Netflix' })).toBeDefined();

    expect(screen.getByRole('button', { name: 'Edit Spotify' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Resume Spotify' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Delete Spotify' })).toBeDefined();
  });
});
