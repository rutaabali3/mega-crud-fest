import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Decision, DecisionOption, ALL_CATEGORIES, ALL_BIAS_TAGS, BIAS_DEFINITIONS, DecisionCategory, BiasTag } from "@/types/decision";
import { saveDraft, loadDraft, clearDraft } from "@/hooks/useDecisions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, HelpCircle, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import ReactMarkdown from "react-markdown";

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const STEPS = ["Basics", "Options", "Decision", "Review"];

interface Props {
  existingDecision?: Decision;
  onSave: (decision: Decision) => void;
}

export default function CreateDecision({ existingDecision, onSave }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showMdPreview, setShowMdPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("Career");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [confidence, setConfidence] = useState([5]);
  const [options, setOptions] = useState<DecisionOption[]>([
    { id: generateId(), text: "", pros: [], cons: [] },
    { id: generateId(), text: "", pros: [], cons: [] },
  ]);
  const [chosenOption, setChosenOption] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [biasTags, setBiasTags] = useState<BiasTag[]>([]);

  // Load existing or draft
  useEffect(() => {
    if (existingDecision) {
      setTitle(existingDecision.title);
      setCategory(existingDecision.category);
      setDeadline(existingDecision.deadline ? new Date(existingDecision.deadline) : undefined);
      setConfidence([existingDecision.confidenceScore]);
      setOptions(existingDecision.options);
      setChosenOption(existingDecision.chosenOption);
      setReasoning(existingDecision.reasoning);
      setExpectedOutcome(existingDecision.expectedOutcome);
      setBiasTags(existingDecision.biasTags);
    } else {
      const draft = loadDraft();
      if (draft) {
        if (draft.title) setTitle(draft.title);
        if (draft.category) setCategory(draft.category);
        if (draft.deadline) setDeadline(new Date(draft.deadline));
        if (draft.confidenceScore) setConfidence([draft.confidenceScore]);
        if (draft.options?.length) setOptions(draft.options);
        if (draft.chosenOption) setChosenOption(draft.chosenOption);
        if (draft.reasoning) setReasoning(draft.reasoning);
        if (draft.expectedOutcome) setExpectedOutcome(draft.expectedOutcome);
        if (draft.biasTags) setBiasTags(draft.biasTags);
      }
    }
  }, [existingDecision]);

  // Auto-save draft every 30s
  useEffect(() => {
    if (existingDecision) return;
    const interval = setInterval(() => {
      saveDraft({
        title, category, deadline: deadline?.toISOString() || null,
        confidenceScore: confidence[0], options, chosenOption,
        reasoning, expectedOutcome, biasTags,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [title, category, deadline, confidence, options, chosenOption, reasoning, expectedOutcome, biasTags, existingDecision]);

  // Options management
  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, { id: generateId(), text: "", pros: [], cons: [] }]);
  };
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
    if (chosenOption === id) setChosenOption(null);
  };
  const updateOption = (id: string, updates: Partial<DecisionOption>) =>
    setOptions(options.map(o => o.id === id ? { ...o, ...updates } : o));

  const [tagInput, setTagInput] = useState<Record<string, { pros: string; cons: string }>>({});

  const addTag = (optionId: string, type: "pros" | "cons") => {
    const val = tagInput[optionId]?.[type]?.trim();
    if (!val) return;
    updateOption(optionId, { [type]: [...(options.find(o => o.id === optionId)?.[type] || []), val] });
    setTagInput(prev => ({ ...prev, [optionId]: { ...prev[optionId], [type]: "" } }));
  };

  const removeTag = (optionId: string, type: "pros" | "cons", index: number) => {
    const opt = options.find(o => o.id === optionId);
    if (!opt) return;
    updateOption(optionId, { [type]: opt[type].filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    const decision: Decision = {
      id: existingDecision?.id || generateId(),
      title,
      category,
      dateCreated: existingDecision?.dateCreated || new Date().toISOString(),
      deadline: deadline?.toISOString() || null,
      status: chosenOption ? "decided" : "pending",
      options,
      chosenOption,
      reasoning,
      expectedOutcome,
      confidenceScore: confidence[0],
      actualOutcome: existingDecision?.actualOutcome || null,
      actualOutcomeDate: existingDecision?.actualOutcomeDate || null,
      reflectionNotes: existingDecision?.reflectionNotes || null,
      qualityScore: existingDecision?.qualityScore || null,
      biasTags,
      isTrashed: false,
    };
    onSave(decision);
    clearDraft();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    toast.success(existingDecision ? "Decision updated!" : "Decision saved!");
    setTimeout(() => navigate(`/decision/${decision.id}`), 800);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return title.trim().length > 0;
      case 1: return options.filter(o => o.text.trim()).length >= 2;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold gradient-text">
          {existingDecision ? "Edit Decision" : "New Decision"}
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i <= step && setStep(i)}
              className={cn(
                "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors",
                i === step ? "gradient-bg text-primary-foreground font-medium" :
                  i < step ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? <Check className="h-3 w-3" /> : <span className="w-4 text-center">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="glass-card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Decision Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you deciding?" className="text-lg font-serif" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category</label>
              <Select value={category} onValueChange={v => setCategory(v as DecisionCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Deadline (optional)</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left", !deadline && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={deadline} onSelect={setDeadline} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Confidence Score: {confidence[0]}/10
              </label>
              <p className="text-xs text-muted-foreground mb-3">How confident are you in making a good decision?</p>
              <Slider value={confidence} onValueChange={setConfidence} min={1} max={10} step={1} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Options ({options.length}/5)</label>
              {options.length < 5 && (
                <Button variant="outline" size="sm" onClick={addOption}><Plus className="h-3 w-3 mr-1" /> Add Option</Button>
              )}
            </div>
            {options.map((opt, idx) => {
              const prosCount = opt.pros.length;
              const consCount = opt.cons.length;
              const total = prosCount + consCount;
              const prosPct = total > 0 ? (prosCount / total) * 100 : 50;
              return (
                <div key={opt.id} className="border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">#{idx + 1}</span>
                    <Input value={opt.text} onChange={e => updateOption(opt.id, { text: e.target.value })} placeholder="Option name" className="flex-1" />
                    {options.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeOption(opt.id)}><X className="h-3 w-3" /></Button>}
                  </div>
                  {/* Balance bar */}
                  {total > 0 && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                      <div className="bg-success transition-all" style={{ width: `${prosPct}%` }} />
                      <div className="bg-destructive transition-all" style={{ width: `${100 - prosPct}%` }} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-success font-medium mb-1">Pros</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {opt.pros.map((p, i) => (
                          <span key={i} className="text-xs bg-success/15 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                            {p} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeTag(opt.id, "pros", i)} />
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          value={tagInput[opt.id]?.pros || ""}
                          onChange={e => setTagInput(prev => ({ ...prev, [opt.id]: { ...prev[opt.id], pros: e.target.value } }))}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(opt.id, "pros"))}
                          placeholder="Add pro..."
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-destructive font-medium mb-1">Cons</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {opt.cons.map((c, i) => (
                          <span key={i} className="text-xs bg-destructive/15 text-destructive px-2 py-0.5 rounded-full flex items-center gap-1">
                            {c} <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeTag(opt.id, "cons", i)} />
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <Input
                          value={tagInput[opt.id]?.cons || ""}
                          onChange={e => setTagInput(prev => ({ ...prev, [opt.id]: { ...prev[opt.id], cons: e.target.value } }))}
                          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag(opt.id, "cons"))}
                          placeholder="Add con..."
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Your Option</label>
              <div className="grid gap-2">
                {options.filter(o => o.text.trim()).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setChosenOption(opt.id === chosenOption ? null : opt.id)}
                    className={cn(
                      "text-left p-3 rounded-xl border-2 transition-all",
                      chosenOption === opt.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {chosenOption === opt.id && <Check className="h-4 w-4 text-primary" />}
                      <span className="font-medium">{opt.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Reasoning</label>
                <button onClick={() => setShowMdPreview(!showMdPreview)} className="text-xs text-primary hover:underline">
                  {showMdPreview ? "Edit" : "Preview"}
                </button>
              </div>
              {showMdPreview ? (
                <div className="prose prose-sm dark:prose-invert max-w-none p-3 border border-border rounded-lg min-h-[120px]">
                  <ReactMarkdown>{reasoning || "*No reasoning yet*"}</ReactMarkdown>
                </div>
              ) : (
                <Textarea value={reasoning} onChange={e => setReasoning(e.target.value)} placeholder="Walk through your thinking process..." rows={5} />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Expected Outcome</label>
              <Textarea value={expectedOutcome} onChange={e => setExpectedOutcome(e.target.value)} placeholder="What does success look like in 6 months?" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Bias Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_BIAS_TAGS.map(bias => (
                  <Tooltip key={bias}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant={biasTags.includes(bias) ? "default" : "outline"}
                        className="cursor-pointer text-xs gap-1"
                        onClick={() => setBiasTags(biasTags.includes(bias) ? biasTags.filter(b => b !== bias) : [...biasTags, bias])}
                      >
                        {bias} <HelpCircle className="h-2.5 w-2.5" />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent><p className="max-w-xs text-xs">{BIAS_DEFINITIONS[bias]}</p></TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Bias check panel */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Bias Check Reminder</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Before finalizing, consider: Are you choosing based on evidence or emotion?
                Common traps include Confirmation Bias (seeking info that supports what you already believe)
                and Sunk Cost (sticking with something because of past investment).
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-serif text-xl font-semibold">{title}</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-secondary px-2 py-0.5 rounded-full">{category}</span>
              {deadline && <span className="bg-secondary px-2 py-0.5 rounded-full">Due: {format(deadline, "MMM d, yyyy")}</span>}
              <span className="bg-secondary px-2 py-0.5 rounded-full">Confidence: {confidence[0]}/10</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Options</p>
              <div className="space-y-2">
                {options.filter(o => o.text.trim()).map(o => (
                  <div key={o.id} className={cn("p-3 rounded-lg border", o.id === chosenOption ? "border-primary bg-primary/5" : "border-border")}>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      {o.id === chosenOption && <Check className="h-3 w-3 text-primary" />}
                      {o.text}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="text-success">{o.pros.length} pros</span>
                      <span className="text-destructive">{o.cons.length} cons</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {reasoning && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Reasoning</p>
                <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown>{reasoning}</ReactMarkdown>
                </div>
              </div>
            )}
            {expectedOutcome && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expected Outcome</p>
                <p className="text-sm">{expectedOutcome}</p>
              </div>
            )}
            {biasTags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Bias Tags</p>
                <div className="flex flex-wrap gap-1">{biasTags.map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {step > 0 ? "Back" : "Cancel"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gradient-bg text-primary-foreground">
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSave} className="gradient-bg text-primary-foreground">
            <Sparkles className="h-4 w-4 mr-1" /> {existingDecision ? "Update" : "Save"} Decision
          </Button>
        )}
      </div>
    </div>
  );
}
