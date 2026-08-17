import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, MapPin, Plus, Pencil, Trash2, Camera, Settings2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useShoots } from '@/hooks/use-shoots-context';
import { ShootFormDialog } from '@/components/ShootFormDialog';
import { ShotFormDialog } from '@/components/ShotFormDialog';
import { ActualSettingsDialog } from '@/components/ActualSettingsDialog';
import { GearChecklist } from '@/components/GearChecklist';
import { Shot, Shoot } from '@/types';
import { toast } from 'sonner';

const priorityColors: Record<string, string> = {
  'must-have': 'bg-destructive/10 text-destructive',
  'nice-to-have': 'bg-primary/10 text-primary',
  'creative': 'bg-success/10 text-success',
};

const ShootDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShoot, updateShoot, deleteShoot, addShot, updateShot, deleteShot, toggleGearItem, addGearItem, removeGearItem } = useShoots();

  const shoot = getShoot(id!);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddShot, setShowAddShot] = useState(false);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [settingsShot, setSettingsShot] = useState<Shot | null>(null);

  if (!shoot) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Camera className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">Shoot not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/shoots')}>Back to shoots</Button>
      </div>
    );
  }

  const sortedShots = [...shoot.shots].sort((a, b) => {
    const priorityOrder = { 'must-have': 0, 'nice-to-have': 1, 'creative': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority] || a.order - b.order;
  });

  const capturedCount = shoot.shots.filter(s => s.captured).length;

  const handleEditShoot = (updated: Shoot) => {
    updateShoot(shoot.id, updated);
    toast.success('Shoot updated!');
  };

  const handleAddShot = (shot: Shot) => {
    addShot(shoot.id, shot);
    toast.success('Shot added!');
  };

  const handleEditShot = (shot: Shot) => {
    updateShot(shoot.id, shot.id, shot);
    setEditingShot(null);
    toast.success('Shot updated!');
  };

  const handleDeleteShoot = () => {
    deleteShoot(shoot.id);
    navigate('/shoots');
    toast.success('Shoot deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{shoot.client}</h1>
            <Badge variant="secondary" className="capitalize">{shoot.type}</Badge>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{format(new Date(shoot.date), 'EEEE, MMMM d, yyyy')}</span>
            {shoot.location && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{shoot.location}</span>}
          </div>
          {shoot.notes && <p className="mt-2 text-sm text-muted-foreground">{shoot.notes}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this shoot?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete "{shoot.client}" and all its shots. This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteShoot} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="shots">
        <TabsList>
          <TabsTrigger value="shots">Shot List ({capturedCount}/{shoot.shots.length})</TabsTrigger>
          <TabsTrigger value="gear">Gear ({shoot.gear.filter(g => g.packed).length}/{shoot.gear.length})</TabsTrigger>
        </TabsList>

        {/* Shots Tab */}
        <TabsContent value="shots" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddShot(true)}><Plus className="mr-1.5 h-4 w-4" />Add Shot</Button>
          </div>
          {sortedShots.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <Camera className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">No shots yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddShot(true)}>
                  <Plus className="mr-1.5 h-4 w-4" />Add your first shot
                </Button>
              </CardContent>
            </Card>
          ) : (
            sortedShots.map(shot => (
              <Card key={shot.id} className={shot.captured ? 'opacity-70' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={shot.captured}
                      onCheckedChange={() => updateShot(shoot.id, shot.id, { captured: !shot.captured })}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={shot.captured ? 'line-through text-muted-foreground font-medium' : 'font-medium'}>
                          {shot.description}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[shot.priority]}`}>
                          {shot.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {shot.planned.lens && <span>🔭 {shot.planned.lens}</span>}
                        {shot.planned.aperture && <span>f/{shot.planned.aperture.replace('f/', '')}</span>}
                        {shot.planned.shutterSpeed && <span>⏱ {shot.planned.shutterSpeed}</span>}
                        {shot.planned.iso && <span>ISO {shot.planned.iso}</span>}
                      </div>
                      {shot.actual && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Actual: {shot.actual.lens} · {shot.actual.aperture} · {shot.actual.shutterSpeed} · ISO {shot.actual.iso}</span>
                          {shot.actual.notes && <span className="text-muted-foreground">— {shot.actual.notes}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsShot(shot)} title="Log actual settings">
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingShot(shot)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { deleteShot(shoot.id, shot.id); toast.success('Shot removed'); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Gear Tab */}
        <TabsContent value="gear" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gear Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <GearChecklist
                gear={shoot.gear}
                onToggle={(gearId) => toggleGearItem(shoot.id, gearId)}
                onAdd={(item) => addGearItem(shoot.id, item)}
                onRemove={(gearId) => removeGearItem(shoot.id, gearId)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ShootFormDialog open={showEdit} onOpenChange={setShowEdit} onSave={handleEditShoot} initial={shoot} />
      <ShotFormDialog open={showAddShot} onOpenChange={setShowAddShot} onSave={handleAddShot} nextOrder={shoot.shots.length} />
      {editingShot && <ShotFormDialog open={!!editingShot} onOpenChange={() => setEditingShot(null)} onSave={handleEditShot} initial={editingShot} nextOrder={0} />}
      {settingsShot && <ActualSettingsDialog open={!!settingsShot} onOpenChange={() => setSettingsShot(null)} shot={settingsShot} onSave={(actual) => updateShot(shoot.id, settingsShot.id, { actual })} />}
    </div>
  );
};

export default ShootDetail;
