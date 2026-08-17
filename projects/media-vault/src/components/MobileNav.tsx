import { Book, Film, Gamepad2, LayoutGrid, Heart, Clock, CheckCircle2, Library } from "lucide-react";
import { MediaStatus, MediaType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Star } from "lucide-react";

interface Props {
  statusFilter: MediaStatus | "all";
  typeFilter: MediaType | "all";
  onStatusFilter: (s: MediaStatus | "all") => void;
  onTypeFilter: (t: MediaType | "all") => void;
  stats: { total: number; finished: number; avgRating: number };
}

const statusItems = [
  { value: "all" as const, label: "All", icon: LayoutGrid },
  { value: "want" as const, label: "Want", icon: Heart },
  { value: "in-progress" as const, label: "In Progress", icon: Clock },
  { value: "finished" as const, label: "Done", icon: CheckCircle2 },
];

const typeItems = [
  { value: "all" as const, label: "All", icon: Library },
  { value: "book" as const, label: "Books", icon: Book },
  { value: "movie" as const, label: "Movies", icon: Film },
  { value: "game" as const, label: "Games", icon: Gamepad2 },
];

export function MobileNav({ statusFilter, typeFilter, onStatusFilter, onTypeFilter, stats }: Props) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Library className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">MediaVault</h1>
            </div>
          </div>
          <nav className="px-3 space-y-6">
            <div>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Library</p>
              {statusItems.map(s => (
                <button key={s.value} onClick={() => onStatusFilter(s.value)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    statusFilter === s.value ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50")}>
                  <s.icon className="w-4 h-4" />{s.label}
                </button>
              ))}
            </div>
            <div>
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</p>
              {typeItems.map(t => (
                <button key={t.value} onClick={() => onTypeFilter(t.value)}
                  className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    typeFilter === t.value ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50")}>
                  <t.icon className="w-4 h-4" />{t.label}
                </button>
              ))}
            </div>
          </nav>
          <div className="p-4 mx-3 mt-6 rounded-xl bg-muted/50 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stats</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-lg font-bold">{stats.total}</p><p className="text-[10px] text-muted-foreground">Total</p></div>
              <div><p className="text-lg font-bold">{stats.finished}</p><p className="text-[10px] text-muted-foreground">Done</p></div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-[hsl(var(--status-want))] text-[hsl(var(--status-want))]" /><p className="text-lg font-bold">{stats.avgRating}</p></div>
                <p className="text-[10px] text-muted-foreground">Avg</p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
