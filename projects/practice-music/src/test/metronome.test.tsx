import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';

const mockSettings = {
  instrument: 'Piano',
  defaultSessionDurationMinutes: 30,
  metronomeBPM: 120,
  metronomeBeatsPerMeasure: 4,
};

describe('Metronome Accessibility', () => {
  it('renders open metronome button with aria-label', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={vi.fn()} />);
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    expect(openBtn).toBeInTheDocument();
  });

  it('renders controls with proper aria-labels and pressed states when opened', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={vi.fn()} />);
    const openBtn = screen.getByRole('button', { name: /open metronome/i });
    fireEvent.click(openBtn);

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease tempo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase tempo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();

    const bpm120Btn = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(bpm120Btn).toHaveAttribute('aria-pressed', 'true');

    const bpm100Btn = screen.getByRole('button', { name: /set bpm to 100/i });
    expect(bpm100Btn).toHaveAttribute('aria-pressed', 'false');

    const ts44Btn = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(ts44Btn).toHaveAttribute('aria-pressed', 'true');
  });
});
