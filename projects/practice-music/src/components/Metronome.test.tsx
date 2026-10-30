import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from './Metronome';
import type { Settings } from '../utils/storage';

describe('Metronome Component Accessibility', () => {
  const defaultSettings: Settings = {
    weeklyGoalMinutes: 120,
    defaultInstrument: 'Piano',
    metronomeBPM: 100,
    metronomeBeatsPerMeasure: 4,
  };

  it('renders open metronome button with aria-label', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={vi.fn()} />);
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
  });

  it('opens panel and displays controls with correct accessible labels and pressed states', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={vi.fn()} />);

    // Open panel
    fireEvent.click(screen.getByRole('button', { name: /open metronome/i }));

    // Check header close button
    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();

    // Check BPM controls
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();

    // Check play button initial state
    const playBtn = screen.getByRole('button', { name: /start metronome/i });
    expect(playBtn).toBeInTheDocument();
    expect(playBtn).toHaveAttribute('aria-pressed', 'false');

    // Check presets
    const preset100 = screen.getByRole('button', { name: /set bpm to 100/i });
    expect(preset100).toHaveAttribute('aria-pressed', 'true');

    // Check time signature button
    const timeSig44 = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(timeSig44).toHaveAttribute('aria-pressed', 'true');
  });
});
