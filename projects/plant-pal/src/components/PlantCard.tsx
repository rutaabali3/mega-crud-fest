import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plant, HEALTH_EMOJIS } from '@/types/plant';
import { PlantImage } from '@/components/PlantImage';
import { getNextWateringDate, getDaysUntil } from '@/hooks/usePlants';

export const PlantCard = ({ plant, index = 0 }: { plant: Plant; index?: number }) => {
  const navigate = useNavigate();
  const nextWater = getNextWateringDate(plant);
  const daysUntil = nextWater ? getDaysUntil(nextWater) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/plant/${plant.id}`)}
      className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-40 overflow-hidden">
        <PlantImage src={plant.photoUrl} name={plant.name} className="w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium">
          {HEALTH_EMOJIS[plant.healthStatus]} {plant.healthStatus}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-serif font-semibold text-foreground truncate">{plant.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{plant.species || 'Unknown species'}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{plant.location}</span>
          {daysUntil !== null && (
            <span className={`text-xs font-medium ${daysUntil < 0 ? 'text-destructive' : daysUntil === 0 ? 'text-accent' : 'text-muted-foreground'}`}>
              {daysUntil < 0 ? `⚠️ Overdue ${Math.abs(daysUntil)}d` : daysUntil === 0 ? '💧 Today' : `💧 ${daysUntil}d`}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
