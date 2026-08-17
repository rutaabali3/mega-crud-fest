import React from 'react';
import { motion } from 'framer-motion';
import { Plant } from '@/types/plant';

interface Props {
  activePlants: Plant[];
}

const getSeason = (): { name: string; tips: { icon: string; title: string; desc: string; plantTypes: string[] }[] } => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return {
    name: 'Spring',
    tips: [
      { icon: '🪴', title: 'Repotting Season', desc: 'Spring is the best time to repot root-bound plants. Check if roots are circling the bottom.', plantTypes: ['Monstera', 'Pothos', 'Ficus'] },
      { icon: '💧', title: 'Increase Watering', desc: 'Plants are waking up! Gradually increase watering as days get longer.', plantTypes: ['All tropical plants'] },
      { icon: '🌱', title: 'Start Fertilizing', desc: 'Resume fertilizing with diluted solution. Plants are hungry after winter dormancy.', plantTypes: ['All plants'] },
      { icon: '✂️', title: 'Prune & Propagate', desc: 'Trim leggy growth and use cuttings to propagate new plants.', plantTypes: ['Pothos', 'Philodendron', 'Tradescantia'] },
    ]
  };
  if (month >= 5 && month <= 7) return {
    name: 'Summer',
    tips: [
      { icon: '☀️', title: 'Sun Protection', desc: 'Move sensitive plants away from direct afternoon sun to prevent leaf burn.', plantTypes: ['Ferns', 'Calathea', 'Peace Lily'] },
      { icon: '💧', title: 'Watch for Overwatering', desc: 'Despite heat, check soil before watering. Many plants suffer from too much water.', plantTypes: ['Succulents', 'Snake Plant', 'ZZ Plant'] },
      { icon: '🌡️', title: 'Humidity Check', desc: 'AC can dry indoor air. Group plants together or use a pebble tray for humidity.', plantTypes: ['Tropical plants', 'Ferns', 'Calathea'] },
      { icon: '🐛', title: 'Pest Watch', desc: 'Warm weather brings pests. Regularly inspect leaves for spider mites and aphids.', plantTypes: ['All plants'] },
    ]
  };
  if (month >= 8 && month <= 10) return {
    name: 'Autumn',
    tips: [
      { icon: '🍂', title: 'Reduce Fertilizing', desc: 'Start tapering off fertilizer as growth slows. Stop completely by late autumn.', plantTypes: ['All plants'] },
      { icon: '📍', title: 'Bring Plants Inside', desc: 'Before first frost, bring outdoor plants inside. Acclimate gradually.', plantTypes: ['Outdoor plants', 'Herbs'] },
      { icon: '💡', title: 'Adjust Light', desc: 'As days shorten, move plants closer to windows for maximum light exposure.', plantTypes: ['All light-loving plants'] },
      { icon: '💧', title: 'Reduce Watering', desc: 'Plants need less water as growth slows. Let soil dry more between waterings.', plantTypes: ['All plants'] },
    ]
  };
  return {
    name: 'Winter',
    tips: [
      { icon: '❄️', title: 'Minimal Watering', desc: 'Most plants are dormant. Water sparingly — overwatering is the #1 winter killer.', plantTypes: ['All plants'] },
      { icon: '🚫', title: 'No Fertilizer', desc: 'Stop fertilizing entirely. Plants can\'t absorb nutrients during dormancy.', plantTypes: ['All plants'] },
      { icon: '🐛', title: 'Pest Prevention', desc: 'Dry indoor air attracts spider mites. Mist leaves or use a humidifier.', plantTypes: ['Tropical plants', 'Ferns'] },
      { icon: '🌡️', title: 'Avoid Cold Drafts', desc: 'Keep plants away from cold windows, doors, and heating vents.', plantTypes: ['Tropical plants', 'Orchids'] },
    ]
  };
};

export const SeasonalTips = ({ activePlants }: Props) => {
  const season = getSeason();

  const findRelevantPlants = (plantTypes: string[]) => {
    if (plantTypes.includes('All plants') || plantTypes.includes('All tropical plants') || plantTypes.includes('All light-loving plants')) {
      return activePlants.slice(0, 3);
    }
    return activePlants.filter(p =>
      plantTypes.some(t => p.name.toLowerCase().includes(t.toLowerCase()) || p.species.toLowerCase().includes(t.toLowerCase()))
    ).slice(0, 3);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">🌤️ Seasonal Care Tips</h1>
        <p className="text-muted-foreground mt-1">Current season: <strong>{season.name}</strong></p>
      </div>

      <div className="space-y-4">
        {season.tips.map((tip, i) => {
          const relevant = findRelevantPlants(tip.plantTypes);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tip.desc}</p>
                  {relevant.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-xs text-muted-foreground">Your plants:</span>
                      {relevant.map(p => (
                        <span key={p.id} className="text-xs bg-primary/10 text-foreground px-2 py-0.5 rounded-full">{p.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
