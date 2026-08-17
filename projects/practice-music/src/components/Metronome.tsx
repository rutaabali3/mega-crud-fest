import { useState, useRef, useCallback, useEffect } from 'react';
import { Music2, Minus, Plus, Play, Square } from 'lucide-react';
import type { Settings } from '../utils/storage';
import { Button } from '@/components/ui/button';

interface Props {
  settings: Settings;
  onUpdateSettings: (s: Settings) => void;
}

const PRESETS = [60, 80, 100, 120, 140, 160];
const TIME_SIGS = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '6/8', beats: 6 },
];

export function Metronome({ settings, onUpdateSettings }: Props) {
  const [open, setOpen] = useState(false);
  const [bpm, setBpm] = useState(settings.metronomeBPM);
  const [beats, setBeats] = useState(settings.metronomeBeatsPerMeasure);
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const lookahead = 25; // ms
  const scheduleAheadTime = 0.1; // s

  const scheduleBeat = useCallback((time: number, beat: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    const isDownbeat = beat === 0;
    osc.frequency.value = isDownbeat ? 880 : 440;
    const duration = isDownbeat ? 0.03 : 0.02;
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.start(time);
    osc.stop(time + duration);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleBeat(nextNoteTimeRef.current, currentBeatRef.current);
      const beatToSet = currentBeatRef.current;
      setTimeout(() => setCurrentBeat(beatToSet), (nextNoteTimeRef.current - ctx.currentTime) * 1000);
      nextNoteTimeRef.current += 60.0 / bpm;
      currentBeatRef.current = (currentBeatRef.current + 1) % beats;
    }
  }, [bpm, beats, scheduleBeat]);

  const start = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;
    setPlaying(true);
    const id = window.setInterval(scheduler, lookahead);
    timerRef.current = id;
  }, [scheduler]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPlaying(false);
    setCurrentBeat(-1);
  }, []);

  // Restart scheduler when bpm/beats change while playing
  useEffect(() => {
    if (playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      const id = window.setInterval(scheduler, lookahead);
      timerRef.current = id;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bpm, beats, playing, scheduler]);

  // Save BPM on change
  useEffect(() => {
    onUpdateSettings({ ...settings, metronomeBPM: bpm, metronomeBeatsPerMeasure: beats });
  }, [bpm, beats]);

  const handleTap = () => {
    const now = Date.now();
    const newTaps = [...tapTimes, now].slice(-4);
    setTapTimes(newTaps);
    if (newTaps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTaps.length; i++) intervals.push(newTaps[i] - newTaps[i - 1]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const tapBpm = Math.round(60000 / avg);
      if (tapBpm >= 20 && tapBpm <= 300) setBpm(tapBpm);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Music2 size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40 w-72 bg-card border border-border rounded-2xl shadow-2xl shadow-primary/10 animate-fade-in">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-heading font-semibold text-foreground text-sm">Metronome</span>
          <button onClick={() => { stop(); setOpen(false); }} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
        </div>

        {/* BPM */}
        <div className="text-center">
          <p className="text-5xl font-heading font-bold text-primary">{bpm}</p>
          <p className="text-xs text-muted-foreground">BPM</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setBpm(b => Math.max(20, b - 1))} className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Minus size={14} />
          </button>
          <button onClick={playing ? stop : start} className={`w-14 h-14 rounded-full flex items-center justify-center text-primary-foreground shadow-lg transition-all ${playing ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'}`}>
            {playing ? <Square size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button onClick={() => setBpm(b => Math.min(300, b + 1))} className="w-8 h-8 rounded-lg bg-muted text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Plus size={14} />
          </button>
        </div>

        {/* Tap Tempo */}
        <button onClick={handleTap} className="w-full text-xs bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary py-2 rounded-lg transition-colors font-medium">
          Tap Tempo
        </button>

        {/* Presets */}
        <div className="flex gap-1 flex-wrap justify-center">
          {PRESETS.map(p => (
            <button key={p} onClick={() => setBpm(p)} className={`text-[10px] px-2 py-1 rounded-md transition-colors ${bpm === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{p}</button>
          ))}
        </div>

        {/* Time signature */}
        <div className="flex gap-1 justify-center">
          {TIME_SIGS.map(ts => (
            <button key={ts.label} onClick={() => setBeats(ts.beats)} className={`text-xs px-2 py-1 rounded-md transition-colors ${beats === ts.beats ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{ts.label}</button>
          ))}
        </div>

        {/* Beat indicator */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: beats }).map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-100 ${
              currentBeat === i
                ? i === 0 ? 'bg-secondary scale-125' : 'bg-primary scale-125'
                : 'bg-muted'
            }`} />
          ))}
        </div>
      </div>
    </div>
  );
}
