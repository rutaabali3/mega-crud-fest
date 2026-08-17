import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Decision, ALL_CATEGORIES, ALL_STATUSES, ALL_BIAS_TAGS, DecisionCategory, DecisionStatus, BiasTag } from "@/types/decision";
import { format } from "date-fns";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type SortOption = "newest" | "oldest" | "quality_high" | "confidence_low";

function StatusBadge({ status }: { status: Decision["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-warning/15 text-warning" },
    decided: { label: "Decided", cls: "bg-primary/15 text-primary" },
    outcome_recorded: { label: "Reviewed", cls: "bg-success/15 text-success" },
  };
  const s = map[status];
  return <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", s.cls)}>{s.label}</span>;
}

export default function AllDecisions({ decisions, settings }: { decisions: Decision[]; settings: { showConfidence: boolean; showBiasTags: boolean } }) {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DecisionCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState<DecisionStatus[]>([]);
  const [biasFilter, setBiasFilter] = useState<BiasTag[]>([]);
  const [qualityRange, setQualityRange] = useState([1]);
  const [sort, setSort] = useState<SortOption>("newest");

  const toggleItem = <T,>(arr: T[], item: T, set: (v: T[]) => void) =>
    set(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const filtered = useMemo(() => {
    let result = decisions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.reasoning.toLowerCase().includes(q) ||
        d.expectedOutcome.toLowerCase().includes(q) ||
        (d.actualOutcome || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter.length) result = result.filter(d => categoryFilter.includes(d.category));
    if (statusFilter.length) result = result.filter(d => statusFilter.includes(d.status));
    if (biasFilter.length) result = result.filter(d => d.biasTags.some(b => biasFilter.includes(b)));
    if (qualityRange[0] > 1) result = result.filter(d => d.qualityScore && d.qualityScore >= qualityRange[0]);

    result.sort((a, b) => {
      switch (sort) {
        case "oldest": return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case "quality_high": return (b.qualityScore || 0) - (a.qualityScore || 0);
        case "confidence_low": return a.confidenceScore - b.confidenceScore;
        default: return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      }
    });
    return result;
  }, [decisions, search, categoryFilter, statusFilter, biasFilter, qualityRange, sort]);

  // Group by month/year
  const grouped = useMemo(() => {
    const map = new Map<string, Decision[]>();
    filtered.forEach(d => {
      const key = format(new Date(d.dateCreated), "MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold gradient-text">All Decisions</h1>
        <p className="text-muted-foreground text-sm mt-1">{decisions.length} decisions total</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search decisions..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon" onClick={() => setFiltersOpen(!filtersOpen)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent>
          <div className="glass-card p-4 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map(c => (
                  <Badge key={c} variant={categoryFilter.includes(c) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleItem(categoryFilter, c, setCategoryFilter)}>{c}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map(s => (
                  <Badge key={s} variant={statusFilter.includes(s) ? "default" : "outline"} className="cursor-pointer text-xs capitalize" onClick={() => toggleItem(statusFilter, s, setStatusFilter)}>{s.replace("_", " ")}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Bias Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_BIAS_TAGS.map(b => (
                  <Badge key={b} variant={biasFilter.includes(b) ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => toggleItem(biasFilter, b, setBiasFilter)}>{b}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Min Quality Score: {qualityRange[0]}</p>
              <Slider value={qualityRange} onValueChange={setQualityRange} min={1} max={5} step={1} className="max-w-xs" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Sort</p>
              <div className="flex flex-wrap gap-1.5">
                {([["newest", "Newest"], ["oldest", "Oldest"], ["quality_high", "Highest Quality"], ["confidence_low", "Lowest Confidence"]] as const).map(([val, label]) => (
                  <Badge key={val} variant={sort === val ? "default" : "outline"} className="cursor-pointer text-xs" onClick={() => setSort(val)}>{label}</Badge>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter([]); setStatusFilter([]); setBiasFilter([]); setQualityRange([1]); setSort("newest"); }}>
              <X className="h-3 w-3 mr-1" /> Clear filters
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No decisions found</p>
          <Link to="/create" className="text-primary hover:underline text-sm">Create your first decision</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([month, items]) => (
            <div key={month}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background/80 backdrop-blur-sm py-1 z-10">{month}</h3>
              <div className="border-l-2 border-border ml-3 space-y-4 pl-6">
                {items.map(d => (
                  <Link key={d.id} to={`/decision/${d.id}`} className="glass-card p-4 block hover:border-primary/30 transition-colors relative">
                    <div className="absolute -left-[31px] top-5 w-3 h-3 rounded-full gradient-bg border-2 border-background" />
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-serif font-semibold text-base">{d.title}</h4>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="bg-secondary px-2 py-0.5 rounded-full">{d.category}</span>
                      <span>{format(new Date(d.dateCreated), "MMM d")}</span>
                      {settings.showConfidence && <span>Confidence: {d.confidenceScore}/10</span>}
                      {d.qualityScore && <span className="text-success">★ {d.qualityScore}/5</span>}
                    </div>
                    {settings.showBiasTags && d.biasTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.biasTags.map(b => (
                          <span key={b} className="text-[10px] bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded">{b}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
