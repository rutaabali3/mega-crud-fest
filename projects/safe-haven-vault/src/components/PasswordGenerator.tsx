import { useState, useEffect } from "react";
import { generatePassword, type PasswordGenOptions } from "@/lib/crypto";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";

interface Props {
  onUse: (password: string) => void;
  onClose: () => void;
}

export default function PasswordGenerator({ onUse, onClose }: Props) {
  const [opts, setOpts] = useState<PasswordGenOptions>({
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeAmbiguous: false,
  });
  const [preview, setPreview] = useState("");

  const regen = () => setPreview(generatePassword(opts));

  useEffect(() => { regen(); }, [opts]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Password Generator</span>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <div className="bg-muted rounded-lg p-3 font-mono text-sm text-foreground break-all select-all min-h-[40px]">
        {preview}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Length: {opts.length}</span>
        </div>
        <Slider
          value={[opts.length]}
          min={8} max={64} step={1}
          onValueChange={([v]) => setOpts((o) => ({ ...o, length: v }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "uppercase" as const, label: "Uppercase (A–Z)" },
          { key: "lowercase" as const, label: "Lowercase (a–z)" },
          { key: "numbers" as const, label: "Numbers (0–9)" },
          { key: "symbols" as const, label: "Symbols (!@#$)" },
          { key: "excludeAmbiguous" as const, label: "No ambiguous (0OlI)" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox
              checked={opts[key]}
              onCheckedChange={(c) => setOpts((o) => ({ ...o, [key]: !!c }))}
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={regen} className="flex-1 gap-1">
          <RefreshCw className="w-3 h-3" /> Regenerate
        </Button>
        <Button size="sm" onClick={() => { onUse(preview); onClose(); }} className="flex-1 gap-1">
          <Check className="w-3 h-3" /> Use This
        </Button>
      </div>
    </div>
  );
}
