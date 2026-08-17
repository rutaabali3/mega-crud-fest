import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { Plant, LOCATIONS } from '@/types/plant';
import { PlantCard } from '@/components/PlantCard';
import { AddPlantModal } from '@/components/AddPlantModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { needsWaterToday } from '@/hooks/usePlants';
import { toast } from 'sonner';

interface Props {
  activePlants: Plant[];
  onAddPlant: (data: any) => any;
}

export const Garden = ({ activePlants, onAddPlant }: Props) => {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(() => {
    let result = activePlants.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.species.toLowerCase().includes(search.toLowerCase());
      const matchLocation = locationFilter === 'all' || p.location === locationFilter;
      const matchHealth = healthFilter === 'all' || p.healthStatus === healthFilter;
      return matchSearch && matchLocation && matchHealth;
    });

    result.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'recent') return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
      if (sort === 'water') return (needsWaterToday(a) ? -1 : 0) - (needsWaterToday(b) ? -1 : 0);
      return 0;
    });

    return result;
  }, [activePlants, search, locationFilter, healthFilter, sort]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif font-bold">My Garden</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plants..." className="pl-9" />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={healthFilter} onValueChange={setHealthFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Health" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="thriving">🟢 Thriving</SelectItem>
            <SelectItem value="okay">🟡 Okay</SelectItem>
            <SelectItem value="struggling">🔴 Struggling</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="name">A–Z</SelectItem>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="water">Needs Water</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <span className="text-5xl block mb-4">🌿</span>
          <h3 className="font-serif text-xl font-bold mb-2">{activePlants.length === 0 ? 'Your garden is empty' : 'No plants match filters'}</h3>
          <p className="text-muted-foreground mb-4">{activePlants.length === 0 ? 'Add your first green friend!' : 'Try adjusting your filters.'}</p>
          {activePlants.length === 0 && <Button onClick={() => setShowAdd(true)}>Add Plant</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => <PlantCard key={p.id} plant={p} index={i} />)}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110"
      >
        <Plus className="h-6 w-6" />
      </button>

      <AddPlantModal open={showAdd} onClose={() => setShowAdd(false)} onSave={(data) => { onAddPlant(data); toast.success(`🌱 ${data.name} added!`); }} />
    </div>
  );
};
