import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Metronome } from '../components/Metronome';

describe('Metronome Accessibility', () => {
  const initialSettings = {
    instrument: 'Piano',
    targetDailyGoal: 30,
    metronomeBPM: 100,
    metronomeBeatsPerMeasure: 4,
  };

  it('renders closed button with aria-label initially', () => {
    const onUpdateSettings = vi.fn();
    render(<Metronome settings={initialSettings} onUpdateSettings={onUpdateSettings} />);

    const openButton = screen.getByRole('button', { name: /open metronome/i });
    expect(openButton).toBeInTheDocument();
  });

  it('opens widget and displays accessible controls with ARIA labels and pressed states', () => {
    const onUpdateSettings = vi.fn();
    render(<Metronome settings={initialSettings} onUpdateSettings={onUpdateSettings} />);

    fireEvent.click(screen.getByRole('button', { name: /open metronome/i }));

    expect(screen.getByRole('button', { name: /close metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start metronome/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /increase bpm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decrease bpm/i })).toBeInTheDocument();

    const preset100 = screen.getByRole('button', { name: /set bpm to 100/i });
    expect(preset100).toHaveAttribute('aria-pressed', 'true');

    const preset80 = screen.getByRole('button', { name: /set bpm to 80/i });
    expect(preset80).toHaveAttribute('aria-pressed', 'false');

    const timeSig4 = screen.getByRole('button', { name: /set time signature to 4\/4/i });
    expect(timeSig4).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates BPM preset and notifies settings callback', () => {
    const onUpdateSettings = vi.fn();
    render(<Metronome settings={initialSettings} onUpdateSettings={onUpdateSettings} />);

    fireEvent.click(screen.getByRole('button', { name: /open metronome/i }));
    fireEvent.click(screen.getByRole('button', { name: /set bpm to 120/i }));

    expect(screen.getByRole('button', { name: /set bpm to 120/i })).toHaveAttribute('aria-pressed', 'true');
    expect(onUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ metronomeBPM: 120 })
    );
  });
});
