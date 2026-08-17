import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { Plus, CalendarDays, MapPin, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useShoots } from '@/hooks/use-shoots-context';
import { ShootFormDialog } from '@/components/ShootFormDialog';
import { Shoot } from '@/types';
import { toast } from 'sonner';

const ShootsList = () => {
  const { shoots, addShoot, deleteShoot } = useShoots();
  const [showNew, setShowNew] = useState(false);

  const today = startOfDay(new Date());
  const upcoming = useMemo(
    () => shoots.filter(s => isAfter(new Date(s.date), today) || format(new Date(s.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [shoots, today]
  );
  const past = useMemo(
    () => shoots.filter(s => isBefore(new Date(s.date), today) && format(new Date(s.date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [shoots, today]
  );

  const handleSave = (shoot: Shoot) => {
    addShoot(shoot);
    toast.success('Shoot created!');
  };

  const handleDelete = (shoot: Shoot, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const ShootCard = ({ shoot }: { shoot: Shoot }) => (
    <Link to={`/shoots/${shoot.id}`}>
      <Card className="group relative transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold leading-tight">{shoot.client}</h3>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs capitalize">{shoot.type}</Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={e => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{shoot.client}"?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete this shoot and all its shots. This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={(e) => { e.preventDefault(); deleteShoot(shoot.id); toast.success('Shoot deleted'); }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(new Date(shoot.date), 'MMM d, yyyy')}
            </div>
            {shoot.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {shoot.location}
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{shoot.shots.filter(s => s.captured).length}/{shoot.shots.length} shots</span>
            <span>·</span>
            <span>{shoot.gear.filter(g => g.packed).length}/{shoot.gear.length} gear</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Camera className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Shoots</h1>
        <Button onClick={() => setShowNew(true)}><Plus className="mr-1.5 h-4 w-4" />New Shoot</Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          {upcoming.length === 0 ? <EmptyState message="No upcoming shoots" /> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{upcoming.map(s => <ShootCard key={s.id} shoot={s} />)}</div>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-4">
          {past.length === 0 ? <EmptyState message="No past shoots yet" /> : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{past.map(s => <ShootCard key={s.id} shoot={s} />)}</div>
          )}
        </TabsContent>
      </Tabs>

      <ShootFormDialog open={showNew} onOpenChange={setShowNew} onSave={handleSave} />
    </div>
  );
};

export default ShootsList;
