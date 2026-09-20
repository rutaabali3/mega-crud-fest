import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';
import type { Settings } from '../utils/storage';

const mockSettings: Settings = {
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  instrument: 'Piano',
  weeklyGoalMinutes: 120,
};

describe('Metronome Accessibility', () => {
  it('renders trigger button with aria-label and expands when clicked', () => {
    const handleUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={handleUpdateSettings} />);

    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
    expect(openBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(openBtn);

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tap tempo/i })).toBeInTheDocument();

    const preset120 = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    const timeSig44 = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(timeSig44).toHaveAttribute('aria-pressed', 'true');
  });
});
