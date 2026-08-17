import { useState, useEffect } from "react";
import { VocabEntry } from "@/lib/types";
import { useVocabContext } from "@/lib/VocabContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/TagInput";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: VocabEntry | null;
  allTags: string[];
  languages: string[];
}

export function AddEditDrawer({ open, onOpenChange, entry, allTags, languages }: Props) {
  const { addEntry, updateEntry, entries } = useVocabContext();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [tags, setTags] = useState<string[]>([]);
  const [source, setSource] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (entry) {
      setWord(entry.word);
      setTranslation(entry.translation);
      setTargetLanguage(entry.targetLanguage);
      setExampleSentence(entry.exampleSentence);
      setDifficulty(entry.difficulty);
      setTags([...entry.tags]);
      setSource(entry.source);
    } else {
      setWord(""); setTranslation(""); setTargetLanguage(""); setExampleSentence("");
      setDifficulty("beginner"); setTags([]); setSource("");
    }
    setErrors({});
  }, [entry, open]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!word.trim()) errs.word = "Word is required";
    if (!translation.trim()) errs.translation = "Translation is required";
    if (!targetLanguage.trim()) errs.targetLanguage = "Language is required";
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    // Check duplicate
    const duplicate = entries.find(
      e => e.word.toLowerCase() === word.trim().toLowerCase() &&
        e.targetLanguage.toLowerCase() === targetLanguage.trim().toLowerCase() &&
        e.id !== entry?.id
    );

    const data = {
      word: word.trim(),
      translation: translation.trim(),
      targetLanguage: targetLanguage.trim(),
      exampleSentence: exampleSentence.trim(),
      difficulty,
      tags,
      source: source.trim(),
    };

    if (entry) {
      updateEntry(entry.id, data);
      toast({ title: "Word updated ✏️", description: `"${word}" has been updated.` });
    } else {
      addEntry(data);
      toast({
        title: duplicate ? "Word added (duplicate exists)" : "Word added! 🎉",
        description: duplicate
          ? `"${word}" already exists in ${targetLanguage} but was saved anyway.`
          : `"${word}" added to your vocabulary.`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{entry ? "Edit Word" : "Add New Word"}</SheetTitle>
          <SheetDescription>
            {entry ? "Update this vocabulary entry" : "Add a new word to your vocabulary bank"}
          </SheetDescription>
        </SheetHeader>

        <div className={cn("space-y-4 mt-6", shaking && "animate-shake")}>
          <div>
            <Label>Word / Phrase *</Label>
            <Input value={word} onChange={e => { setWord(e.target.value); setErrors(p => ({ ...p, word: "" })); }} placeholder="e.g. bonjour" className="mt-1" />
            {errors.word && <p className="text-xs text-destructive mt-1">{errors.word}</p>}
          </div>

          <div>
            <Label>Translation *</Label>
            <Input value={translation} onChange={e => { setTranslation(e.target.value); setErrors(p => ({ ...p, translation: "" })); }} placeholder="e.g. hello" className="mt-1" />
            {errors.translation && <p className="text-xs text-destructive mt-1">{errors.translation}</p>}
          </div>

          <div>
            <Label>Target Language *</Label>
            <Input
              value={targetLanguage}
              onChange={e => { setTargetLanguage(e.target.value); setErrors(p => ({ ...p, targetLanguage: "" })); }}
              placeholder="e.g. French"
              list="lang-suggestions"
              className="mt-1"
            />
            <datalist id="lang-suggestions">
              {languages.map(l => <option key={l} value={l} />)}
            </datalist>
            {errors.targetLanguage && <p className="text-xs text-destructive mt-1">{errors.targetLanguage}</p>}
          </div>

          <div>
            <Label>Example Sentence</Label>
            <Textarea value={exampleSentence} onChange={e => setExampleSentence(e.target.value)} placeholder="Use the word in context..." rows={3} className="mt-1" />
          </div>

          <div>
            <Label>Difficulty</Label>
            <div className="flex gap-1 mt-1">
              {(["beginner", "intermediate", "advanced"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "flex-1 py-2 text-xs rounded-lg capitalize transition-default font-medium",
                    difficulty === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={setTags} suggestions={allTags} className="mt-1" />
          </div>

          <div>
            <Label>Source</Label>
            <Input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Duolingo, textbook..." className="mt-1" />
          </div>

          <Button onClick={handleSubmit} className="w-full mt-4">
            {entry ? "Update Word" : "Save Word"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
