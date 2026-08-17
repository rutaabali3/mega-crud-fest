import { useParams, Link } from 'react-router-dom';
import { usePetCare } from '@/contexts/PetCareContext';
import { calculateAge, calculateHumanAge, formatDate } from '@/lib/pet-utils';
import { SPECIES_EMOJIS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Utensils, Scale, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const { pets, vetVisits, vaccinations, feedingSchedules, feedingLogs, weights, medications } = usePetCare();
  const pet = pets.find(p => p.id === id);

  if (!pet) return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🔍</p>
      <h2 className="text-xl font-semibold mb-2">Pet not found</h2>
      <Link to="/pets"><Button variant="outline" className="rounded-xl mt-2">Back to Pets</Button></Link>
    </div>
  );

  const petVisits = vetVisits.filter(v => v.petId === id);
  const petVaccines = vaccinations.filter(v => v.petId === id);
  const petWeights = weights.filter(w => w.petId === id).sort((a, b) => b.date.localeCompare(a.date));
  const petMeds = medications.filter(m => m.petId === id);
  const petSchedules = feedingSchedules.filter(s => s.petId === id && s.active);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/pets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Pets
      </Link>

      {/* Pet Header */}
      <Card className="rounded-2xl">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-5xl shrink-0">
            {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} className="h-20 w-20 rounded-2xl object-cover" /> : (pet.emoji || SPECIES_EMOJIS[pet.species])}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pet.name}</h1>
              <Badge variant="secondary">{pet.species}</Badge>
              <Badge variant="outline">{pet.sex}</Badge>
            </div>
            {pet.breed && <p className="text-muted-foreground">{pet.breed}</p>}
            {pet.dateOfBirth && (
              <p className="text-sm mt-1">
                {calculateAge(pet.dateOfBirth)} old • ~{calculateHumanAge(pet.dateOfBirth, pet.species)} human years
              </p>
            )}
            {pet.notes && <p className="text-sm text-muted-foreground mt-2">{pet.notes}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4" /> Health Records</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{petVisits.length} vet visit{petVisits.length !== 1 ? 's' : ''} • {petVaccines.length} vaccination{petVaccines.length !== 1 ? 's' : ''}</p>
            {petVisits.slice(0, 3).map(v => (
              <div key={v.id} className="text-sm p-2 rounded-xl bg-muted/50">{v.reason} — {formatDate(v.visitDate)}</div>
            ))}
            <Link to="/health"><Button variant="ghost" size="sm" className="w-full rounded-xl">View All →</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Utensils className="h-4 w-4" /> Feeding</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{petSchedules.length} active schedule{petSchedules.length !== 1 ? 's' : ''}</p>
            {petSchedules.slice(0, 3).map(s => (
              <div key={s.id} className="text-sm p-2 rounded-xl bg-muted/50">{s.foodType} — {s.amount}{s.unit} × {s.timesPerDay}/day</div>
            ))}
            <Link to="/feeding"><Button variant="ghost" size="sm" className="w-full rounded-xl">View All →</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4" /> Weight</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {petWeights.length === 0 ? <p className="text-sm text-muted-foreground">No entries</p> : (
              <p className="text-sm">Latest: <span className="font-semibold">{petWeights[0].weight} {petWeights[0].unit}</span> on {formatDate(petWeights[0].date)}</p>
            )}
            <Link to="/weight"><Button variant="ghost" size="sm" className="w-full rounded-xl">View All →</Button></Link>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4" /> Medications</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{petMeds.length} medication{petMeds.length !== 1 ? 's' : ''}</p>
            {petMeds.slice(0, 3).map(m => (
              <div key={m.id} className="text-sm p-2 rounded-xl bg-muted/50" style={{ borderLeft: `3px solid ${m.colorTag}` }}>{m.name} — {m.dosage}</div>
            ))}
            <Link to="/medications"><Button variant="ghost" size="sm" className="w-full rounded-xl">View All →</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
