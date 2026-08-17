import { useState, useRef } from "react";
import { useVault } from "@/contexts/VaultContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getStorageUsed } from "@/lib/vault-store";
import { toast } from "sonner";
import { Download, Upload, Trash2, Key, HardDrive } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsPanel({ open, onOpenChange }: Props) {
  const { entries, autoLockMinutes, setAutoLockMinutes, exportVault, importVault, changePin, wipeVault } = useVault();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [wipePin, setWipePin] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChangePin = async () => {
    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      setPinError("New PIN must be 4–6 digits"); return;
    }
    const ok = await changePin(oldPin, newPin);
    if (!ok) { setPinError("Current PIN is incorrect"); return; }
    toast.success("PIN changed successfully");
    setOldPin(""); setNewPin(""); setPinError("");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const ok = await importVault(text);
    toast[ok ? "success" : "error"](ok ? "Vault imported" : "Invalid file");
    e.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Change PIN */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2"><Key className="w-4 h-4" /> Change PIN</h3>
            <Input type="tel" inputMode="numeric" maxLength={6} placeholder="Current PIN" value={oldPin} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))} />
            <Input type="tel" inputMode="numeric" maxLength={6} placeholder="New PIN (4–6 digits)" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} />
            {pinError && <p className="text-xs text-destructive">{pinError}</p>}
            <Button size="sm" onClick={handleChangePin} disabled={!oldPin || !newPin}>Change PIN</Button>
          </div>

          {/* Auto-lock */}
          <div className="space-y-2">
            <Label>Auto-lock timer</Label>
            <Select value={String(autoLockMinutes)} onValueChange={(v) => setAutoLockMinutes(parseInt(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="0">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export/Import */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Backup</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={exportVault}>
                <Download className="w-3 h-3" /> Export
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => fileRef.current?.click()}>
                <Upload className="w-3 h-3" /> Import
              </Button>
              <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground"><HardDrive className="w-3 h-3" /> Storage</div>
            <p className="text-foreground">{entries.length} entries · {getStorageUsed()} used</p>
          </div>

          {/* Wipe */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full gap-2">
                <Trash2 className="w-4 h-4" /> Wipe All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Wipe All Vault Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete everything. Enter your PIN to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input type="tel" inputMode="numeric" maxLength={6} placeholder="Enter PIN" value={wipePin} onChange={(e) => setWipePin(e.target.value.replace(/\D/g, ""))} />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setWipePin("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    const { verifyPin } = await import("@/lib/crypto");
                    const ok = await verifyPin(wipePin);
                    if (ok) { wipeVault(); toast.success("All data wiped"); }
                    else toast.error("Wrong PIN");
                    setWipePin("");
                  }}
                >
                  Wipe Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
