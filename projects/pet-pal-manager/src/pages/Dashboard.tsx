import { format } from 'date-fns';
import { PawPrint, Heart, Utensils, Scale, Pill, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePetCare } from '@/contexts/PetCareContext';
import { getUpcomingAppointments, getMedsDueToday, formatDate } from '@/lib/pet-utils';
import { SPECIES_EMOJIS } from '@/lib/types';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const MotionCard = motion(Card);

export default function Dashboard() {
  const { pets, vetVisits, feedingSchedules, feedingLogs, weights, medications } = usePetCare();
  const activePets = pets.filter(p => !p.archived);
  const upcomingAppts = getUpcomingAppointments(vetVisits);
  const medsDue = getMedsDueToday(medications);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [dismissed, setDismissed] = useLocalStorage<string>('petcare_med_dismissed', '');
  const showMedBanner = medsDue.length > 0 && dismissed !== todayStr;

  const recentWeights = [...weights].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // Today's feeding progress
  const todayLogs = feedingLogs.filter(l => l.dateTime.startsWith(todayStr));
  const totalMeals = feedingSchedules.filter(s => s.active).reduce((sum, s) => sum + s.timesPerDay, 0);
  const mealsGiven = todayLogs.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Med Banner */}
      <AnimatePresence>
        {showMedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-accent/15 border border-accent/30 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-accent" />
              <span className="font-medium text-sm">
                💊 {medsDue.length} medication{medsDue.length > 1 ? 's' : ''} due today
                {activePets.length > 0 && ` for ${[...new Set(medsDue.map(m => pets.find(p => p.id === m.petId)?.name))].filter(Boolean).join(' & ')}`}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDismissed(todayStr)}>Dismiss</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{greeting()} 👋</h1>
        <p className="text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <PawPrint className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activePets.length}</p>
              <p className="text-xs text-muted-foreground">Active Pets</p>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{mealsGiven}/{totalMeals}</p>
              <p className="text-xs text-muted-foreground">Meals Today</p>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingAppts.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming Appts</p>
            </div>
          </CardContent>
        </MotionCard>

        <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{medsDue.length}</p>
              <p className="text-xs text-muted-foreground">Meds Due</p>
            </div>
          </CardContent>
        </MotionCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Upcoming Appointments</span>
              <Link to="/health" className="text-xs text-primary hover:underline flex items-center">View all <ChevronRight className="h-3 w-3" /></Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments 🎉</p>
            ) : upcomingAppts.slice(0, 4).map(appt => {
              const pet = pets.find(p => p.id === appt.petId);
              return (
                <div key={appt.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <span className="text-xl">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pet?.name} — {appt.reason}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(appt.nextAppointmentDate)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Weights */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2"><Scale className="h-4 w-4" /> Recent Weight Entries</span>
              <Link to="/weight" className="text-xs text-primary hover:underline flex items-center">View all <ChevronRight className="h-3 w-3" /></Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWeights.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No weight entries yet 📊</p>
            ) : recentWeights.map(w => {
              const pet = pets.find(p => p.id === w.petId);
              return (
                <div key={w.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <span className="text-xl">{pet ? SPECIES_EMOJIS[pet.species] : '🐾'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pet?.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(w.date)}</p>
                  </div>
                  <span className="text-sm font-semibold">{w.weight} {w.unit}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
