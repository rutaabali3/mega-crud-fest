import React from 'react';
import { motion } from 'framer-motion';
import { differenceInDays, format } from 'date-fns';
import { Plant } from '@/types/plant';
import { PlantImage } from '@/components/PlantImage';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  archivedPlants: Plant[];
  restorePlant: (id: string) => void;
  deletePlant: (id: string) => void;
}

export const RIPArchive = ({ archivedPlants, restorePlant, deletePlant }: Props) => {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif font-bold">🪦 RIP Archive</h1>

      {archivedPlants.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <span className="text-5xl block mb-4">🌱</span>
          <h3 className="font-serif text-xl font-bold mb-2">No fallen friends</h3>
          <p className="text-muted-foreground">All your plants are alive and well!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedPlants.map((plant, i) => (
            <motion.div
              key={plant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="h-36 overflow-hidden grayscale opacity-70">
                <PlantImage src={plant.photoUrl} name={plant.name} className="w-full h-full" />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-serif font-semibold">{plant.name}</h3>
                <p className="text-sm text-muted-foreground italic">
                  Here rests {plant.name} 🌱 — loved and cared for.
                </p>
                <p className="text-xs text-muted-foreground">
                  {plant.species} · Owned {differenceInDays(new Date(), new Date(plant.purchaseDate))} days
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1"
                    onClick={() => { restorePlant(plant.id); toast.success(`${plant.name} has been restored!`); }}>
                    Restore
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1"
                    onClick={() => { deletePlant(plant.id); toast('Plant deleted permanently'); }}>
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
