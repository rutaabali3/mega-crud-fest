import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useSubscriptions - importData security validation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const createMockFile = (content: string, name = 'subscriptions.json'): File => {
    return new File([content], name, { type: 'application/json' });
  };

  it('successfully imports valid subscription data', async () => {
    const { result } = renderHook(() => useSubscriptions());
    const initialCount = result.current.subscriptions.length;

    const validSubscription = [
      {
        id: 'test-id-1',
        name: 'Test Service',
        amount: 10,
        billingCycle: 'monthly',
        category: 'software',
        renewalDate: '2025-01-01T00:00:00.000Z',
        color: '#818CF8',
        status: 'active',
        currency: 'USD',
        createdAt: '2025-01-01T00:00:00.000Z',
        lastEditedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    const file = createMockFile(JSON.stringify(validSubscription));

    act(() => {
      result.current.importData(file);
    });

    await waitFor(() => {
      expect(result.current.subscriptions.length).toBe(initialCount + 1);
    });
    expect(result.current.subscriptions.find((s) => s.id === 'test-id-1')).toBeDefined();
    expect(toast.success).toHaveBeenCalledWith('Imported 1 new subscriptions');
  });

  it('rejects invalid JSON structure (object instead of array)', async () => {
    const { result } = renderHook(() => useSubscriptions());
    const initialCount = result.current.subscriptions.length;

    const invalidStructure = {
      id: 'test-id-1',
      name: 'Invalid Payload',
    };

    const file = createMockFile(JSON.stringify(invalidStructure));

    act(() => {
      result.current.importData(file);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format');
    });
    expect(result.current.subscriptions.length).toBe(initialCount);
  });

  it('rejects subscription objects missing required schema fields', async () => {
    const { result } = renderHook(() => useSubscriptions());
    const initialCount = result.current.subscriptions.length;

    const invalidFields = [
      {
        id: 'test-id-2',
        name: 'Incomplete Service',
        // missing amount, billingCycle, category, renewalDate, color, status, currency, createdAt, lastEditedAt
      },
    ];

    const file = createMockFile(JSON.stringify(invalidFields));

    act(() => {
      result.current.importData(file);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format');
    });
    expect(result.current.subscriptions.length).toBe(initialCount);
  });

  it('rejects subscription objects with invalid enum values', async () => {
    const { result } = renderHook(() => useSubscriptions());
    const initialCount = result.current.subscriptions.length;

    const invalidEnum = [
      {
        id: 'test-id-3',
        name: 'Bad Enum Service',
        amount: 15,
        billingCycle: 'invalid_cycle', // Invalid enum
        category: 'software',
        renewalDate: '2025-01-01T00:00:00.000Z',
        color: '#818CF8',
        status: 'active',
        currency: 'USD',
        createdAt: '2025-01-01T00:00:00.000Z',
        lastEditedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    const file = createMockFile(JSON.stringify(invalidEnum));

    act(() => {
      result.current.importData(file);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format');
    });
    expect(result.current.subscriptions.length).toBe(initialCount);
  });

  it('handles non-JSON file content gracefully', async () => {
    const { result } = renderHook(() => useSubscriptions());
    const initialCount = result.current.subscriptions.length;

    const file = createMockFile('Not valid json string {{{');

    act(() => {
      result.current.importData(file);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid file format');
    });
    expect(result.current.subscriptions.length).toBe(initialCount);
  });
});
