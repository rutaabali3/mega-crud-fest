import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Droplets, Sprout, Flower, PenLine, Trash2, RotateCcw, Camera, X } from 'lucide-react';
import { Plant, HealthStatus, HEALTH_EMOJIS } from '@/types/plant';
import { getNextWateringDate, getDaysUntil, getNextFertilizingDate } from '@/hooks/usePlants';
import { PlantImage } from '@/components/PlantImage';
import { CareLogModal } from '@/components/CareLogModal';
import { AddPlantModal } from '@/components/AddPlantModal';
import { PhotoUpload } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  plants: Plant[];
  updatePlant: (id: string, data: Partial<Plant>) => void;
  addCareLog: (plantId: string, entry: any) => void;
  deleteCareLog: (plantId: string, logId: string) => void;
  archivePlant: (id: string) => void;
  deletePlant: (id: string) => void;
  addGrowthPhoto: (plantId: string, photo: any) => void;
  deleteGrowthPhoto: (plantId: string, photoId: string) => void;
  onSavePlant: (data: any) => void;
}

const careLogIcons: Record<string, string> = {
  watered: '💧', fertilized: '🌿', repotted: '🪴', note: '📝',
};

export const PlantDetail = ({ plants, updatePlant, addCareLog, deleteCareLog, archivePlant, deletePlant, addGrowthPhoto, deleteGrowthPhoto, onSavePlant }: Props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plant = plants.find(p => p.id === id);

  const [careModal, setCareModal] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRIP, setConfirmRIP] = useState(false);

  if (!plant) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Plant not found.</p>
        <Button variant="outline" onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  const nextWater = getNextWateringDate(plant);
  const nextFert = getNextFertilizingDate(plant);
  const daysUntilWater = nextWater ? getDaysUntil(nextWater) : null;
  const ownedDays = differenceInDays(new Date(), new Date(plant.purchaseDate));
  const waterProgress = plant.wateringFrequencyDays > 0 && daysUntilWater !== null
    ? Math.max(0, Math.min(1, (plant.wateringFrequencyDays - Math.max(0, daysUntilWater)) / plant.wateringFrequencyDays))
    : 0;

  const healthOptions: { value: HealthStatus; label: string }[] = [
    { value: 'thriving', label: '🟢 Thriving' },
    { value: 'okay', label: '🟡 Okay' },
    { value: 'struggling', label: '🔴 Struggling' },
  ];

  const handleCareLog = (type: string) => (date: string, note: string) => {
    addCareLog(plant.id, { type, date, note });
    toast.success(`${careLogIcons[type]} ${type.charAt(0).toUpperCase() + type.slice(1)} logged for ${plant.name}!`);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-56 md:h-72 overflow-hidden relative">
          <PlantImage src={plant.photoUrl} name={plant.name} className="w-full h-full" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold">{plant.name}</h1>
              <p className="text-muted-foreground">{plant.species || 'Unknown species'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-muted px-2 py-1 rounded-full">{plant.location}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">{plant.soilType}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded-full">Owned {ownedDays} days</span>
          </div>
        </div>
      </motion.div>

      {/* Health Status */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-serif font-semibold mb-3">Health Status</h3>
        <div className="flex gap-2">
          {healthOptions.map(o => (
            <button key={o.value} onClick={() => { updatePlant(plant.id, { healthStatus: o.value }); toast.success(`Status updated to ${o.value}`); }}
              className={cn('flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                plant.healthStatus === o.value ? 'border-primary bg-primary/10' : 'border-border text-muted-foreground hover:border-primary/50'
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Care Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: 'watered', label: 'Log Watering', icon: '💧' },
          { type: 'fertilized', label: 'Log Fertilizing', icon: '🌿' },
          { type: 'repotted', label: 'Log Repotting', icon: '🪴' },
          { type: 'note', label: 'Add Note', icon: '📝' },
        ].map(a => (
          <button key={a.type} onClick={() => setCareModal(a.type)}
            className="bg-card border border-border rounded-2xl p-4 text-center hover:bg-muted transition-colors">
            <span className="text-2xl block mb-1">{a.icon}</span>
            <span className="text-xs font-medium">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Care Schedule */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-serif font-semibold mb-3">Care Schedule</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${waterProgress * 97.4} 97.4`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {daysUntilWater !== null ? (daysUntilWater < 0 ? `${Math.abs(daysUntilWater)}d late` : `${daysUntilWater}d`) : '?'}
            </span>
          </div>
          <div className="flex-1 space-y-1 text-sm">
            <p>Water every <strong>{plant.wateringFrequencyDays}</strong> days</p>
            <p className="text-muted-foreground">Last: {plant.lastWatered ? format(new Date(plant.lastWatered), 'MMM d') : 'Never'}</p>
            {nextWater && <p className="text-muted-foreground">Next: {format(nextWater, 'MMM d')}</p>}
            {plant.fertilizingFrequencyDays > 0 && (
              <p className="text-muted-foreground">Fertilize every {plant.fertilizingFrequencyDays}d — Next: {nextFert ? format(nextFert, 'MMM d') : 'Never done'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Care Log */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-serif font-semibold mb-3">Care Log</h3>
        {plant.careLog.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No care events logged yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {plant.careLog.map(log => (
              <div key={log.id} className="flex items-center gap-3 text-sm py-2 border-b border-border last:border-0">
                <span className="text-lg">{careLogIcons[log.type]}</span>
                <div className="flex-1">
                  <span className="font-medium capitalize">{log.type}</span>
                  {log.note && <span className="text-muted-foreground"> — {log.note}</span>}
                  <div className="text-xs text-muted-foreground">{format(new Date(log.date), 'MMM d, yyyy')}</div>
                </div>
                <button onClick={() => { deleteCareLog(plant.id, log.id); toast('Entry deleted'); }}
                  className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Growth Photos */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif font-semibold">Growth Photos</h3>
          <Button variant="outline" size="sm" onClick={() => setShowPhotoModal(true)}>
            <Camera className="h-3 w-3 mr-1" /> Add Photo
          </Button>
        </div>
        {plant.growthPhotos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No growth photos yet.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {plant.growthPhotos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(ph => (
              <div key={ph.id} className="relative group rounded-xl overflow-hidden aspect-square">
                <img src={ph.url} alt={ph.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-primary-foreground p-2">
                  <span className="text-xs">{format(new Date(ph.date), 'MMM d')}</span>
                  <span className="text-xs truncate w-full text-center">{ph.caption}</span>
                  <button onClick={() => deleteGrowthPhoto(plant.id, ph.id)} className="mt-1 text-xs underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/30 rounded-2xl p-4">
        <h3 className="font-serif font-semibold text-destructive mb-3">Danger Zone</h3>
        <div className="flex gap-3">
          {!plant.archived && (
            <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmRIP(true)}>
              🪦 Mark as RIP
            </Button>
          )}
          <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete Forever
          </Button>
        </div>
      </div>

      {/* Care Log Modals */}
      {['watered', 'fertilized', 'repotted', 'note'].map(type => (
        <CareLogModal key={type} open={careModal === type} onClose={() => setCareModal(null)}
          title={type === 'note' ? 'Add Note' : `Log ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          icon={careLogIcons[type]} onSave={handleCareLog(type)} />
      ))}

      {/* Edit modal */}
      <AddPlantModal open={showEdit} onClose={() => setShowEdit(false)} initial={plant}
        onSave={(data) => { updatePlant(plant.id, data); toast.success('Plant updated!'); }} />

      {/* Photo modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-3">
            <h3 className="font-serif font-bold">Add Growth Photo</h3>
            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} label="Growth Photo" />
            <Input placeholder="Caption" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} />
            <Button className="w-full" onClick={() => {
              if (photoUrl) {
                addGrowthPhoto(plant.id, { url: photoUrl, date: new Date().toISOString(), caption: photoCaption });
                setPhotoUrl(''); setPhotoCaption(''); setShowPhotoModal(false);
                toast.success('Photo added!');
              }
            }}>Add Photo</Button>
          </div>
        </div>
      )}

      {/* Confirm RIP */}
      {confirmRIP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setConfirmRIP(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center space-y-4">
            <span className="text-4xl">🪦</span>
            <h3 className="font-serif font-bold">Mark {plant.name} as RIP?</h3>
            <p className="text-sm text-muted-foreground">This will move it to the archive.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmRIP(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { archivePlant(plant.id); navigate('/archive'); toast('🪦 Rest in peace, ' + plant.name); }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center space-y-4">
            <span className="text-4xl">⚠️</span>
            <h3 className="font-serif font-bold">Delete {plant.name} permanently?</h3>
            <p className="text-sm text-muted-foreground">This cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { deletePlant(plant.id); navigate('/garden'); toast('Plant deleted'); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
