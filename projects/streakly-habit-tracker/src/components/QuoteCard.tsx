import { useState } from "react";
import { getRandomQuote } from "@/lib/quotes";
import { RefreshCw, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuoteCard() {
  const [quote, setQuote] = useState(getRandomQuote);

  return (
    <div className="rounded-xl bg-card border p-5 relative overflow-hidden">
      <div className="absolute top-3 right-3 opacity-5">
        <Quote className="w-16 h-16" />
      </div>
      <p className="text-sm italic text-card-foreground leading-relaxed relative z-10">
        "{quote.text}"
      </p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-muted-foreground font-medium">— {quote.author}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setQuote(getRandomQuote())}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
