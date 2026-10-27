import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from './Metronome';

const mockSettings = {
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
  practiceGoalMinutesDaily: 30,
  instrument: 'Piano',
};

describe('Metronome Component UX & Accessibility', () => {
  it('renders open button with proper aria-label initially', () => {
    const onUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={onUpdateSettings} />);

    const openButton = screen.getByRole('button', { name: /open metronome/i });
    expect(openButton).toBeInTheDocument();
  });

  it('opens panel and renders accessible controls with aria-labels and pressed states', () => {
    const onUpdateSettings = vi.fn();
    render(<Metronome settings={mockSettings} onUpdateSettings={onUpdateSettings} />);

    const openButton = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openButton);

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tap to set tempo/i })).toBeInTheDocument();

    const preset120 = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    const ts44 = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(ts44).toHaveAttribute('aria-pressed', 'true');
  });
});
