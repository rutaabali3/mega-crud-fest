import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Metronome } from './Metronome';

describe('Metronome Component Accessibility', () => {
  const defaultSettings = {
    metronomeBPM: 120,
    metronomeBeatsPerMeasure: 4,
    theme: 'system' as const,
  };

  const dummyOnUpdate = vi.fn();

  it('renders closed floating button with proper aria-label', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={dummyOnUpdate} />);
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
  });

  it('opens panel and renders all metronome controls with proper aria attributes', () => {
    render(<Metronome settings={defaultSettings} onUpdateSettings={dummyOnUpdate} />);
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openBtn);

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /start metronome/i });
    expect(startBtn).toBeInTheDocument();
    expect(startBtn).toHaveAttribute('aria-pressed', 'false');

    expect(screen.getByRole('button', { name: /tap to set tempo/i })).toBeInTheDocument();

    const presetBtn = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(presetBtn).toBeInTheDocument();
    expect(presetBtn).toHaveAttribute('aria-pressed', 'true');

    const timeSigBtn = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(timeSigBtn).toBeInTheDocument();
    expect(timeSigBtn).toHaveAttribute('aria-pressed', 'true');
  });
});
