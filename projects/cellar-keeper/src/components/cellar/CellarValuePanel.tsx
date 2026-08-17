import { useMemo } from "react";
import { Bottle, BOTTLE_TYPES, TYPE_ICONS } from "@/types/bottle";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface CellarValuePanelProps {
  open: boolean;
  onClose: () => void;
  bottles: Bottle[];
}

export function CellarValuePanel({ open, onClose, bottles }: CellarValuePanelProps) {
  const active = useMemo(() => bottles.filter(b => !b.isFinished), [bottles]);
  const totalValue = useMemo(() => active.reduce((s, b) => s + b.pricePaid * b.quantity, 0), [active]);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    active.forEach(b => { map[b.type] = (map[b.type] || 0) + b.pricePaid * b.quantity; });
    return map;
  }, [active]);

  const mostValuable = useMemo(() => {
    if (!active.length) return null;
    return active.reduce((best, b) => (b.pricePaid > best.pricePaid ? b : best));
  }, [active]);

  const avgValue = active.length ? totalValue / active.reduce((s, b) => s + b.quantity, 0) : 0;

  const expiringValue = useMemo(() => {
    const cutoff = Date.now() + 90 * 86400000;
    return active
      .filter(b => b.drinkByDate && new Date(b.drinkByDate).getTime() <= cutoff)
      .reduce((s, b) => s + b.pricePaid * b.quantity, 0);
  }, [active]);

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="border-border bg-card w-80">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <SheetTitle className="font-display text-lg">Cellar Value</SheetTitle>
          <SheetDescription>Overview of your cellar's total value</SheetDescription>
        </div>

        <div className="space-y-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-display font-bold text-primary">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground">Total Cellar Value</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">By Type</h4>
            {BOTTLE_TYPES.filter(t => byType[t]).map(t => (
              <div key={t} className="flex items-center justify-between text-sm">
                <span>{TYPE_ICONS[t]} {t}</span>
                <span className="text-muted-foreground">${byType[t]?.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {mostValuable && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Most Valuable</h4>
              <p className="text-sm">{mostValuable.name} ({mostValuable.vintage})</p>
              <p className="text-xs text-primary">${mostValuable.pricePaid.toFixed(2)}</p>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Avg Bottle Value</span>
            <span>${avgValue.toFixed(2)}</span>
          </div>

          {expiringValue > 0 && (
            <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
              ⚠️ ${expiringValue.toFixed(2)} worth of bottles expiring within 90 days
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
