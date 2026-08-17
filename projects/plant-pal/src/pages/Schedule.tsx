import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, addDays, startOfWeek, isSameDay, isBefore } from 'date-fns';
import { Plant, HEALTH_EMOJIS } from '@/types/plant';
import { getNextWateringDate, getNextFertilizingDate } from '@/hooks/usePlants';
import { cn } from '@/lib/utils';

interface Props {
  activePlants: Plant[];
}

export const Schedule = ({ activePlants }: Props) => {
  const [showAll, setShowAll] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const days = useMemo(() => Array.from({ length: 21 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getPlantsForDay = (day: Date) => {
    return activePlants.filter(plant => {
      const nextWater = getNextWateringDate(plant);
      if (nextWater) {
        // For recurring schedules, check all occurrences in the 3-week window
        let checkDate = new Date(nextWater);
        while (isBefore(checkDate, addDays(day, 1))) {
          if (isSameDay(checkDate, day)) return true;
          checkDate = addDays(checkDate, plant.wateringFrequencyDays);
        }
      }
      if (showAll) {
        const nextFert = getNextFertilizingDate(plant);
        if (nextFert && isSameDay(nextFert, day)) return true;
      }
      return false;
    });
  };

  const isWatered = (plant: Plant, day: Date) => {
    return plant.careLog.some(l => l.type === 'watered' && isSameDay(new Date(l.date), day));
  };

  const isPast = (day: Date) => isBefore(day, today);
  const isToday = (day: Date) => isSameDay(day, today);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-bold">Watering Schedule</h1>
        <button
          onClick={() => setShowAll(!showAll)}
          className={cn('text-sm px-3 py-1.5 rounded-full border transition-colors',
            showAll ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/50'
          )}
        >
          {showAll ? 'All Care' : 'Watering Only'}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[700px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {days.map(day => {
            const plantsToday = getPlantsForDay(day);
            return (
              <div key={day.toISOString()}
                className={cn(
                  'border border-border rounded-xl p-2 min-h-[100px] transition-colors',
                  isToday(day) && 'border-primary bg-primary/5',
                  isPast(day) && !isToday(day) && 'opacity-60'
                )}
              >
                <div className={cn('text-xs font-medium mb-1', isToday(day) ? 'text-primary' : 'text-muted-foreground')}>
                  {format(day, 'd MMM')}
                </div>
                <div className="space-y-1">
                  {plantsToday.map(p => (
                    <Link key={p.id} to={`/plant/${p.id}`}
                      className={cn(
                        'block text-xs px-1.5 py-0.5 rounded-md truncate transition-colors hover:opacity-80',
                        p.healthStatus === 'thriving' ? 'bg-primary/20 text-foreground' :
                        p.healthStatus === 'okay' ? 'bg-accent/20 text-foreground' :
                        'bg-destructive/20 text-foreground'
                      )}
                    >
                      {isPast(day) && (isWatered(p, day) ? '✅' : '❌')} {p.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
