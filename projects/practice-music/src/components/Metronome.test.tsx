import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from './Metronome';

describe('Metronome Component Accessibility', () => {
  const mockSettings = {
    metronomeBPM: 120,
    metronomeBeatsPerMeasure: 4,
    instrument: 'Piano',
    practiceGoalMinutes: 30,
  };
  const mockOnUpdateSettings = vi.fn();

  it('renders closed metronome button with aria-label and opens on click', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={mockOnUpdateSettings} />);

    const openButton = screen.getByRole('button', { name: /open metronome/i });
    expect(openButton).toBeInTheDocument();

    fireEvent.click(openButton);

    expect(screen.getByText('Metronome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
  });

  it('provides accessible controls and aria-pressed attributes when open', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={mockOnUpdateSettings} />);

    // Open metronome
    fireEvent.click(screen.getByRole('button', { name: /open metronome/i }));

    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();

    const startButton = screen.getByRole('button', { name: /start metronome/i });
    expect(startButton).toBeInTheDocument();

    const preset120 = screen.getByRole('button', { name: /set bpm to 120/i });
    expect(preset120).toHaveAttribute('aria-pressed', 'true');

    const preset80 = screen.getByRole('button', { name: /set bpm to 80/i });
    expect(preset80).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(preset80);
    expect(preset80).toHaveAttribute('aria-pressed', 'true');
    expect(preset120).toHaveAttribute('aria-pressed', 'false');
  });

  it('includes focus-visible utility classes on interactive elements', () => {
    render(<Metronome settings={mockSettings} onUpdateSettings={mockOnUpdateSettings} />);

    fireEvent.click(screen.getByRole('button', { name: /open metronome/i }));

    const decreaseBtn = screen.getByRole('button', { name: /decrease bpm/i });
    expect(decreaseBtn.className).toContain('focus-visible:ring-2');
  });
});
