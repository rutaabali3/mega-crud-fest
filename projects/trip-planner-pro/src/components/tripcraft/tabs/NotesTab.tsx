import React, { useState, useEffect, useRef } from "react";
import { Trip } from "@/types/trip";

interface Props {
  trip: Trip;
  updateTrip: (t: Trip) => void;
}

export default function NotesTab({ trip, updateTrip }: Props) {
  const [text, setText] = useState(trip.notes);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setText(trip.notes);
  }, [trip.id]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (text !== trip.notes) {
        updateTrip({ ...trip, notes: text });
        setLastSaved(new Date());
      }
    }, 500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text]);

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-primary">Notes</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your travel notes here..."
        className="min-h-[400px] w-full rounded-xl border bg-card/80 p-4 text-sm leading-relaxed outline-none backdrop-blur focus:ring-2 focus:ring-secondary resize-y"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{text.length} characters</span>
        {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
