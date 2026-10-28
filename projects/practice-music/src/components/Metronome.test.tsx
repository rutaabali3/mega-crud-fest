import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Metronome } from './Metronome';

describe('Metronome Accessibility & Controls', () => {
  const initialSettings = {
    metronomeBPM: 100,
    metronomeBeatsPerMeasure: 4,
    theme: 'light' as const,
  };

  beforeEach(() => {
    // Mock AudioContext for jsdom
    window.AudioContext = vi.fn().mockImplementation(() => ({
      state: 'suspended',
      resume: vi.fn(),
      createOscillator: vi.fn().mockReturnValue({
        connect: vi.fn(),
        type: 'square',
        frequency: { value: 440 },
        start: vi.fn(),
        stop: vi.fn(),
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      }),
      destination: {},
      currentTime: 0,
    })) as unknown as typeof AudioContext;
  });

  it('renders open metronome button with aria-label when collapsed', () => {
    const handleUpdate = vi.fn();
    render(<Metronome settings={initialSettings} onUpdateSettings={handleUpdate} />);

    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
  });

  it('opens panel and renders accessible control buttons with aria-labels and aria-pressed states', () => {
    const handleUpdate = vi.fn();
    render(<Metronome settings={initialSettings} onUpdateSettings={handleUpdate} />);

    // Open metronome widget
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openBtn);

    // Verify accessible action buttons
    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();

    // Verify preset buttons have aria-pressed state
    const preset100 = screen.getByRole('button', { name: 'Set BPM to 100' });
    expect(preset100).toHaveAttribute('aria-pressed', 'true');

    const preset120 = screen.getByRole('button', { name: 'Set BPM to 120' });
    expect(preset120).toHaveAttribute('aria-pressed', 'false');

    // Click 120 BPM preset
    fireEvent.click(preset120);
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    // Verify time signature button state
    const ts34 = screen.getByRole('button', { name: 'Set time signature to 3/4' });
    expect(ts34).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(ts34);
    expect(ts34).toHaveAttribute('aria-pressed', 'true');
  });
});
