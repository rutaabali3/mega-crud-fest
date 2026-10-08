import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';
import type { Settings } from '../utils/storage';

const mockSettings: Settings = {
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  instrument: 'Piano',
  defaultView: 'dashboard',
  theme: 'dark',
};

describe('Metronome Accessibility & Functionality', () => {
  it('renders closed metronome button with accessible label', () => {
    const handleUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={handleUpdateSettings} />);

    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
    expect(openBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens panel and renders accessible controls with proper aria labels and states', () => {
    const handleUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={handleUpdateSettings} />);

    // Open metronome
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openBtn);

    // Verify close button
    const closeBtn = screen.getByRole('button', { name: /close metronome/i });
    expect(closeBtn).toBeInTheDocument();

    // Verify BPM adjustment buttons
    const decBtn = screen.getByRole('button', { name: /decrease bpm/i });
    const incBtn = screen.getByRole('button', { name: /increase bpm/i });
    expect(decBtn).toBeInTheDocument();
    expect(incBtn).toBeInTheDocument();

    // Verify Start/Stop toggle button
    const startBtn = screen.getByRole('button', { name: /start metronome/i });
    expect(startBtn).toBeInTheDocument();
    expect(startBtn).toHaveAttribute('aria-pressed', 'false');

    // Verify Preset buttons have aria-pressed
    const preset120 = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    // Verify Time signature buttons have aria-pressed
    const ts44 = screen.getByRole('button', { name: /time signature 4\/4/i });
    expect(ts44).toHaveAttribute('aria-pressed', 'true');

    // Verify status region
    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-label', 'Metronome stopped');
  });
});
