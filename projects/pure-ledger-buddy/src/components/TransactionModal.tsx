import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/types/transaction";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<Transaction, "id">) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ open, onOpenChange, onSave, editingTransaction }: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open && editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setCustomCategory("");
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
    } else if (open && !editingTransaction) {
      setType("expense");
      setAmount("");
      setCategory("");
      setCustomCategory("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setNote("");
    }
  }, [open, editingTransaction]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isCustom = category === "__custom__";

  const handleSave = () => {
    const finalCategory = isCustom ? customCategory : category;
    if (!amount || !finalCategory) return;
    onSave({
      type,
      amount: parseFloat(amount),
      category: finalCategory,
      date,
      note,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {editingTransaction ? "Update the transaction details." : "Record a new income or expense."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              onClick={() => { setType("expense"); setCategory(""); }}
              className={type === "expense" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              onClick={() => { setType("income"); setCategory(""); }}
              className={type === "income" ? "bg-success text-success-foreground hover:bg-success/90" : ""}
            >
              Income
            </Button>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
                <SelectItem value="__custom__">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {isCustom && (
              <Input
                className="mt-2"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Optional note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1"
              rows={2}
            />
          </div>

          <Button onClick={handleSave} className="w-full" disabled={!amount || (!category || (isCustom && !customCategory))}>
            {editingTransaction ? "Update" : "Add"} Transaction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
