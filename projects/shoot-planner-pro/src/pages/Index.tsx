import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isAfter, startOfDay } from 'date-fns';
import { Plus, Camera, CalendarDays, MapPin, ChevronRight, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useShoots } from '@/hooks/use-shoots-context';
import { ShootFormDialog } from '@/components/ShootFormDialog';
import { Shoot } from '@/types';
import { toast } from 'sonner';

const Dashboard = () => {
  const { shoots, addShoot, exportData, importData } = useShoots();
  const [showNew, setShowNew] = useState(false);

  const today = startOfDay(new Date());
  const upcoming = useMemo(
    () => shoots.filter(s => isAfter(new Date(s.date), today) || format(new Date(s.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [shoots, today]
  );
  const totalShots = shoots.reduce((a, s) => a + s.shots.length, 0);
  const capturedShots = shoots.reduce((a, s) => a + s.shots.filter(sh => sh.captured).length, 0);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shotlist-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (importData(reader.result as string)) {
          toast.success('Data imported!');
        } else {
          toast.error('Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = (shoot: Shoot) => {
    addShoot(shoot);
    toast.success('Shoot created!');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Your photography command center</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}><Upload className="mr-1.5 h-4 w-4" />Import</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1.5 h-4 w-4" />Export</Button>
          <Button onClick={() => setShowNew(true)}><Plus className="mr-1.5 h-4 w-4" />New Shoot</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{shoots.length}</p>
              <p className="text-sm text-muted-foreground">Total Shoots</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-success/10">
              <Camera className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{capturedShots}/{totalShots}</p>
              <p className="text-sm text-muted-foreground">Shots Captured</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Shoots */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Upcoming Shoots</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shoots">View all <ChevronRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Camera className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No upcoming shoots</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowNew(true)}>
                <Plus className="mr-1.5 h-4 w-4" />Create your first shoot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(0, 6).map(shoot => (
              <Link key={shoot.id} to={`/shoots/${shoot.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold leading-tight">{shoot.client}</h3>
                      <Badge variant="secondary" className="text-xs capitalize">{shoot.type}</Badge>
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
            ))}
          </div>
        )}
      </div>

      <ShootFormDialog open={showNew} onOpenChange={setShowNew} onSave={handleSave} />
    </div>
  );
};

export default Dashboard;
