import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';
import type { Settings } from '../utils/storage';

const mockSettings: Settings = {
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  practiceGoalMinutesPerDay: 30,
  reminderEnabled: false,
};

describe('Metronome Component', () => {
  it('renders the open metronome floating button with correct aria-label', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={vi.fn()} />);
    const openButton = screen.getByRole('button', { name: /open metronome/i });
    expect(openButton).toBeDefined();
  });

  it('renders controls with proper aria-labels when metronome panel is open', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={vi.fn()} />);

    // Click floating button to open panel
    const openButton = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openButton);

    // Verify accessible labels on panel controls
    expect(screen.getByRole('button', { name: /close metronome/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeDefined();
  });
});
