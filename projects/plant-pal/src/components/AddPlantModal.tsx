import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Plant, LOCATIONS, SOIL_TYPES, HealthStatus } from '@/types/plant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/components/PhotoUpload';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  species: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  location: z.string().optional().default('Living Room'),
  soilType: z.string().optional().default('Well-draining'),
  purchaseDate: z.string().optional().default(''),
  wateringFrequencyDays: z.number().min(1).max(60).default(7),
  fertilizingFrequencyDays: z.number().min(0).max(180).default(30),
  healthStatus: z.enum(['thriving', 'okay', 'struggling', 'rip']).default('okay'),
  notes: z.string().optional().default(''),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Plant, 'id' | 'archived' | 'careLog' | 'growthPhotos'>) => void;
  initial?: Plant;
}

export const AddPlantModal = ({ open, onClose, onSave, initial }: Props) => {
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    initial?.purchaseDate ? new Date(initial.purchaseDate) : undefined
  );

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initial ? {
      name: initial.name,
      species: initial.species,
      photoUrl: initial.photoUrl,
      location: initial.location,
      soilType: initial.soilType,
      purchaseDate: initial.purchaseDate,
      wateringFrequencyDays: initial.wateringFrequencyDays,
      fertilizingFrequencyDays: initial.fertilizingFrequencyDays,
      healthStatus: initial.healthStatus,
      notes: initial.notes,
    } : {
      wateringFrequencyDays: 7,
      fertilizingFrequencyDays: 30,
      healthStatus: 'okay',
      location: 'Living Room',
      soilType: 'Well-draining',
    },
  });

  const photoUrl = watch('photoUrl');
  const healthStatus = watch('healthStatus');

  const onSubmit = (data: FormData) => {
    onSave({
      name: data.name,
      species: data.species || '',
      photoUrl: data.photoUrl || '',
      notes: data.notes || '',
      location: data.location || 'Living Room',
      soilType: data.soilType || 'Well-draining',
      purchaseDate: data.purchaseDate || new Date().toISOString(),
      wateringFrequencyDays: data.wateringFrequencyDays,
      fertilizingFrequencyDays: data.fertilizingFrequencyDays,
      healthStatus: data.healthStatus,
      lastWatered: initial?.lastWatered || null,
      lastFertilized: initial?.lastFertilized || null,
      lastRepotted: initial?.lastRepotted || null,
    });
    reset();
    onClose();
  };

  if (!open) return null;

  const healthOptions: { value: HealthStatus; label: string; emoji: string }[] = [
    { value: 'thriving', label: 'Thriving', emoji: '🟢' },
    { value: 'okay', label: 'Okay', emoji: '🟡' },
    { value: 'struggling', label: 'Struggling', emoji: '🔴' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 md:mx-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold">{initial ? 'Edit Plant' : 'Add New Plant'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Plant Name *</label>
            <Input {...register('name')} placeholder="e.g. Monstera" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Species</label>
            <Input {...register('species')} placeholder="e.g. Monstera deliciosa" />
          </div>

          <PhotoUpload
            value={photoUrl || ''}
            onChange={(dataUrl) => setValue('photoUrl', dataUrl)}
            label="Plant Photo"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Select defaultValue={watch('location')} onValueChange={v => setValue('location', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Soil Type</label>
              <Select defaultValue={watch('soilType')} onValueChange={v => setValue('soilType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOIL_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Purchase Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !purchaseDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {purchaseDate ? format(purchaseDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={(d) => { setPurchaseDate(d); setValue('purchaseDate', d?.toISOString() || ''); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Water every X days</label>
              <Input type="number" min={1} max={60} {...register('wateringFrequencyDays', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Fertilize every X days</label>
              <Input type="number" min={0} max={180} {...register('fertilizingFrequencyDays', { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Health Status</label>
            <div className="flex gap-2">
              {healthOptions.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setValue('healthStatus', o.value)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                    healthStatus === o.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <Textarea {...register('notes')} placeholder="Any special care notes..." rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">{initial ? 'Update Plant' : 'Add Plant'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
