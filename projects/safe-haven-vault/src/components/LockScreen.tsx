import { useState, useEffect, useRef } from "react";
import { useVault } from "@/contexts/VaultContext";
import { Lock, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LockScreen() {
  const { isPinConfigured, unlock, setupPin, failedAttempts, lockoutUntil, wipeVault, loadSeedData } = useVault();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "confirm" | "seed">(isPinConfigured ? "enter" : "enter");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!lockoutUntil) { setLockoutSeconds(0); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setLockoutSeconds(remaining);
      if (remaining <= 0) setLockoutSeconds(0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async () => {
    if (lockoutSeconds > 0) return;

    if (!isPinConfigured) {
      if (step === "enter") {
        if (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
          setError("PIN must be 4–6 digits"); triggerShake(); return;
        }
        setStep("confirm"); setConfirmPin(""); setError(""); return;
      }
      if (step === "confirm") {
        if (confirmPin !== pin) {
          setError("PINs don't match"); triggerShake(); setConfirmPin(""); return;
        }
        await setupPin(pin);
        setStep("seed");
        return;
      }
    } else {
      if (pin.length < 4) { setError("Enter your PIN"); triggerShake(); return; }
      const ok = await unlock(pin);
      if (!ok) {
        setError("Wrong PIN"); triggerShake(); setPin(""); return;
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleSeedChoice = async (load: boolean) => {
    if (load) await loadSeedData();
  };

  if (step === "seed") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50 animate-fade-in">
        <div className="w-full max-w-sm mx-auto p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Load Sample Entries?</h2>
          <p className="text-sm text-muted-foreground">
            Add 5 demo entries so you can explore the vault immediately.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => handleSeedChoice(false)}>
              Skip
            </Button>
            <Button className="flex-1" onClick={() => handleSeedChoice(true)}>
              Load Samples
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSetup = !isPinConfigured;
  const title = isSetup
    ? step === "confirm" ? "Confirm Your PIN" : "Set Your Master PIN"
    : "Unlock VaultX";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 animate-fade-in">
      <div className="w-full max-w-sm mx-auto p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground">VaultX</h1>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>

        <div className={`space-y-4 ${shake ? "animate-shake" : ""}`}>
          <div className="flex justify-center gap-2 cursor-text" onClick={() => inputRef.current?.focus()}>
            {Array.from({ length: 6 }).map((_, i) => {
              const val = step === "confirm" ? confirmPin : pin;
              return (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-mono transition-all ${
                    i < val.length
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {i < val.length ? "●" : ""}
                </div>
              );
            })}
          </div>

          <input
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className="sr-only"
            value={step === "confirm" ? confirmPin : pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              if (step === "confirm") setConfirmPin(v);
              else setPin(v);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={lockoutSeconds > 0}
          >
            {lockoutSeconds > 0
              ? `Locked (${lockoutSeconds}s)`
              : isSetup
              ? step === "confirm" ? "Confirm PIN" : "Set PIN"
              : "Unlock"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {failedAttempts > 0 && failedAttempts < 3 && (
            <p className="text-xs text-muted-foreground">{3 - failedAttempts} attempts remaining</p>
          )}
        </div>

        {isPinConfigured && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 mx-auto">
                <Trash2 className="w-3 h-3" /> Forgot PIN? Clear all data
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe All Vault Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all saved passwords and reset your PIN. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={wipeVault}
                >
                  Wipe Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
