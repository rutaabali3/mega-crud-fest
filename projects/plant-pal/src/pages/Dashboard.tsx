import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, AlertTriangle, Droplets, Flower2, Archive } from 'lucide-react';
import { Plant } from '@/types/plant';
import { isOverdue, needsWaterToday, needsFertilizingToday } from '@/hooks/usePlants';
import { PlantCard } from '@/components/PlantCard';
import { AddPlantModal } from '@/components/AddPlantModal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  plants: Plant[];
  activePlants: Plant[];
  archivedPlants: Plant[];
  onAddPlant: (data: any) => any;
}

export const Dashboard = ({ plants, activePlants, archivedPlants, onAddPlant }: Props) => {
  const [showAdd, setShowAdd] = useState(false);

  const overdue = activePlants.filter(isOverdue);
  const needsWater = activePlants.filter(needsWaterToday);
  const needsFert = activePlants.filter(needsFertilizingToday);
  const todaysCare = [...new Map([...needsWater, ...needsFert].map(p => [p.id, p])).values()];

  const stats = [
    { label: 'Total Plants', value: activePlants.length, icon: Flower2, color: 'text-primary' },
    { label: 'Needs Water', value: needsWater.length, icon: Droplets, color: 'text-blue-500' },
    { label: 'Overdue', value: overdue.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'RIP Archive', value: archivedPlants.length, icon: Archive, color: 'text-muted-foreground' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
          >
            <s.icon className={`h-8 w-8 ${s.color}`} />
            <div>
              <div className="text-2xl font-bold font-serif">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4"
        >
          <h3 className="font-serif font-semibold text-destructive flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4" /> Overdue Care
          </h3>
          <div className="flex flex-wrap gap-2">
            {overdue.map(p => (
              <Link key={p.id} to={`/plant/${p.id}`} className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-medium px-3 py-1.5 rounded-full transition-colors">
                {p.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Today's Care */}
      <div>
        <h2 className="text-lg font-serif font-bold mb-3">Today's Care</h2>
        {todaysCare.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            <span className="text-3xl block mb-2">✨</span>
            All caught up! Your plants are happy.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {todaysCare.map((p, i) => <PlantCard key={p.id} plant={p} index={i} />)}
          </div>
        )}
      </div>

      {/* Empty state */}
      {activePlants.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <span className="text-5xl block mb-4">🌱</span>
          <h3 className="font-serif text-xl font-bold mb-2">Start your garden</h3>
          <p className="text-muted-foreground mb-4">Add your first plant to begin tracking its care.</p>
          <Button onClick={() => setShowAdd(true)}>Add Your First Plant</Button>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddPlantModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={(data) => { onAddPlant(data); toast.success(`🌱 ${data.name} added to your garden!`); }}
      />
    </div>
  );
};
