import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';

describe('Metronome Accessibility', () => {
  const defaultSettings = {
    weeklyGoalMinutes: 120,
    metronomeBPM: 120,
    metronomeBeatsPerMeasure: 4,
  };

  it('renders open trigger button with proper aria-label', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={vi.fn()} />);
    const openButton = screen.getByRole('button', { name: /open metronome/i });
    expect(openButton).toBeInTheDocument();
  });

  it('opens metronome modal and displays controls with explicit aria-labels', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={vi.fn()} />);
    const openButton = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openButton);

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();
  });
});
