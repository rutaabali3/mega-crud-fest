import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from './Metronome';
import type { Settings } from '../utils/storage';

describe('Metronome Accessibility', () => {
  const mockSettings: Settings = {
    targetDailyMinutes: 30,
    primaryInstrument: 'Piano',
    metronomeBPM: 120,
    metronomeBeatsPerMeasure: 4,
    theme: 'system',
  };

  it('renders open metronome button with accessible label', () => {
    const handleUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={handleUpdateSettings} />);

    const openBtn = screen.getByRole('button', { name: 'Open metronome' });
    expect(openBtn).toBeInTheDocument();
  });

  it('opens metronome panel and renders controls with proper aria attributes', () => {
    const handleUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={handleUpdateSettings} />);

    // Click open metronome button
    const openBtn = screen.getByRole('button', { name: 'Open metronome' });
    fireEvent.click(openBtn);

    // Check region and close button
    expect(screen.getByRole('region', { name: 'Metronome controls' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close metronome' })).toBeInTheDocument();

    // Check playback and tempo adjustment controls
    expect(screen.getByRole('button', { name: 'Start metronome' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease BPM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase BPM' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tap tempo' })).toBeInTheDocument();

    // Check preset buttons have aria-pressed
    const preset120 = screen.getByRole('button', { name: 'Set tempo to 120 BPM' });
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    const preset60 = screen.getByRole('button', { name: 'Set tempo to 60 BPM' });
    expect(preset60).toHaveAttribute('aria-pressed', 'false');

    // Check time signature buttons
    const timeSig44 = screen.getByRole('button', { name: 'Set time signature to 4/4' });
    expect(timeSig44).toHaveAttribute('aria-pressed', 'true');
  });
});
