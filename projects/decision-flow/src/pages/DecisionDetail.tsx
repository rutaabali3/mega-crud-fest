import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Decision } from "@/types/decision";
import { format, differenceInDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Edit, Trash2, Share2, CalendarIcon, Check, X, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";

function StatusBadge({ status }: { status: Decision["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-warning/15 text-warning" },
    decided: { label: "Decided", cls: "bg-primary/15 text-primary" },
    outcome_recorded: { label: "Reviewed", cls: "bg-success/15 text-success" },
  };
  const s = map[status];
  return <span className={cn("text-sm px-3 py-1 rounded-full font-medium", s.cls)}>{s.label}</span>;
}

interface Props {
  decisions: Decision[];
  onUpdate: (id: string, updates: Partial<Decision>) => void;
  onTrash: (id: string) => void;
}

export default function DecisionDetail({ decisions, onUpdate, onTrash }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const decision = decisions.find(d => d.id === id);

  const [actualOutcome, setActualOutcome] = useState(decision?.actualOutcome || "");
  const [outcomeDate, setOutcomeDate] = useState<Date | undefined>(
    decision?.actualOutcomeDate ? new Date(decision.actualOutcomeDate) : undefined
  );
  const [reflectionNotes, setReflectionNotes] = useState(decision?.reflectionNotes || "");
  const [qualityScore, setQualityScore] = useState(decision?.qualityScore || 0);

  if (!decision) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Decision not found</p>
        <Link to="/" className="text-primary hover:underline text-sm">Back to Dashboard</Link>
      </div>
    );
  }

  const handleRecordOutcome = () => {
    onUpdate(decision.id, {
      actualOutcome,
      actualOutcomeDate: outcomeDate?.toISOString() || new Date().toISOString(),
      reflectionNotes,
      qualityScore: qualityScore || null,
      status: "outcome_recorded",
    });
    toast.success("Outcome recorded!");
  };

  const handleShare = () => {
    const text = `📋 Decision: ${decision.title}\n📁 ${decision.category}\n📅 ${format(new Date(decision.dateCreated), "MMM d, yyyy")}\n\n💭 Reasoning: ${decision.reasoning}\n\n🎯 Expected: ${decision.expectedOutcome}${decision.actualOutcome ? `\n\n✅ Actual: ${decision.actualOutcome}` : ""}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTrash = () => {
    onTrash(decision.id);
    toast.success("Moved to trash");
    navigate("/");
  };

  const chosenOpt = decision.options.find(o => o.id === decision.chosenOption);

  const getVerdict = () => {
    if (!decision.qualityScore) return null;
    if (decision.qualityScore >= 4) return { label: "Better Than Expected", emoji: "✅", cls: "text-success bg-success/10" };
    if (decision.qualityScore >= 3) return { label: "As Expected", emoji: "🟡", cls: "text-warning bg-warning/10" };
    return { label: "Worse Than Expected", emoji: "❌", cls: "text-destructive bg-destructive/10" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-2">{decision.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge status={decision.status} />
              <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">{decision.category}</span>
              <span className="text-muted-foreground text-xs">{format(new Date(decision.dateCreated), "MMMM d, yyyy")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${decision.id}`)}><Edit className="h-3 w-3 mr-1" /> Edit</Button>
            <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="h-3 w-3 mr-1" /> Share</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={handleTrash}><Trash2 className="h-3 w-3 mr-1" /> Trash</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="options">Options Analysis</TabsTrigger>
          <TabsTrigger value="outcome" disabled={decision.status === "pending"}>Outcome & Reflection</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="glass-card p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Confidence</p>
                <p className="font-semibold">{decision.confidenceScore}/10</p>
              </div>
              {decision.deadline && (
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="font-semibold">{format(new Date(decision.deadline), "MMM d, yyyy")}</p>
                </div>
              )}
              {decision.qualityScore && (
                <div>
                  <p className="text-xs text-muted-foreground">Quality Score</p>
                  <p className="font-semibold text-success">{"★".repeat(decision.qualityScore)}{"☆".repeat(5 - decision.qualityScore)}</p>
                </div>
              )}
            </div>
            {decision.biasTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bias Tags</p>
                <div className="flex flex-wrap gap-1">{decision.biasTags.map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}</div>
              </div>
            )}
            {decision.reasoning && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reasoning</p>
                <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{decision.reasoning}</ReactMarkdown></div>
              </div>
            )}
            {decision.expectedOutcome && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expected Outcome</p>
                <p className="text-sm">{decision.expectedOutcome}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="options" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {decision.options.map(opt => (
              <div key={opt.id} className={cn("glass-card p-4", opt.id === decision.chosenOption && "ring-2 ring-primary border-primary/30")}>
                <div className="flex items-center gap-2 mb-3">
                  {opt.id === decision.chosenOption && <div className="bg-primary text-primary-foreground rounded-full p-0.5"><Check className="h-3 w-3" /></div>}
                  <h4 className="font-semibold text-sm">{opt.text}</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-success font-medium mb-1">Pros</p>
                    <div className="flex flex-wrap gap-1">
                      {opt.pros.map((p, i) => <span key={i} className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full">{p}</span>)}
                      {opt.pros.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-destructive font-medium mb-1">Cons</p>
                    <div className="flex flex-wrap gap-1">
                      {opt.cons.map((c, i) => <span key={i} className="text-xs bg-destructive/15 text-destructive px-2 py-0.5 rounded-full">{c}</span>)}
                      {opt.cons.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  </div>
                </div>
                {/* Decision matrix score */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Score</span>
                    <span className="font-medium text-foreground">{opt.pros.length - opt.cons.length > 0 ? "+" : ""}{opt.pros.length - opt.cons.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="outcome" className="space-y-4 mt-4">
          {decision.status === "outcome_recorded" ? (
            <div className="space-y-4">
              {/* Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">Expected Outcome</p>
                  <p className="text-sm">{decision.expectedOutcome}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-2">Actual Outcome</p>
                  <p className="text-sm">{decision.actualOutcome}</p>
                </div>
              </div>
              {(() => {
                const verdict = getVerdict();
                return verdict ? (
                  <div className={cn("text-center py-3 rounded-xl font-medium", verdict.cls)}>
                    {verdict.emoji} {verdict.label}
                  </div>
                ) : null;
              })()}
              {decision.reflectionNotes && (
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Reflection Notes</p>
                  <p className="text-sm">{decision.reflectionNotes}</p>
                </div>
              )}
              {decision.qualityScore && (
                <div className="glass-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Quality Rating</p>
                  <p className="text-lg">{"★".repeat(decision.qualityScore)}{"☆".repeat(5 - decision.qualityScore)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-medium">Record Outcome</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block">What actually happened?</label>
                <Textarea value={actualOutcome} onChange={e => setActualOutcome(e.target.value)} placeholder="Describe the actual outcome..." rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Outcome Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left", !outcomeDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {outcomeDate ? format(outcomeDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={outcomeDate} onSelect={setOutcomeDate} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Reflection Notes</label>
                <Textarea value={reflectionNotes} onChange={e => setReflectionNotes(e.target.value)} placeholder="What did you learn?" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quality Score</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setQualityScore(n)} className="text-2xl transition-transform hover:scale-110">
                      {n <= qualityScore ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleRecordOutcome} disabled={!actualOutcome.trim()} className="gradient-bg text-primary-foreground">
                Save Outcome
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
