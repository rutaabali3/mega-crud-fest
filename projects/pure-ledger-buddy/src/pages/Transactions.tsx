import { useState, useMemo, useRef } from "react";
import { format, parseISO } from "date-fns";
import { Search, Plus, Pencil, Trash2, Download, Upload, AlertTriangle } from "lucide-react";
import { Transaction, DEFAULT_CATEGORIES } from "@/types/transaction";
import { categoryIconMap } from "@/lib/categoryIcons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionModal } from "@/components/TransactionModal";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TransactionsProps {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  importTransactions: (data: Transaction[], merge: boolean) => void;
}

const Transactions = ({
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  clearAll,
  importTransactions,
}: TransactionsProps) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    return result.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [transactions, search, typeFilter, categoryFilter]);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fintrack_backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          importTransactions(data, true);
          toast.success(`Imported ${data.length} transactions (merged).`);
        } else {
          toast.error("Invalid file format.");
        }
      } catch {
        toast.error("Failed to parse file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveEdit = (data: Omit<Transaction, "id">) => {
    if (editingTxn) {
      updateTransaction(editingTxn.id, data);
      setEditingTxn(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Transactions</h1>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {transactions.length > 0 && (
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setClearConfirm(true)}>
              <AlertTriangle className="h-4 w-4 mr-1" /> Clear All
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by note or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No transactions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => {
            const Icon = categoryIconMap[t.category] || categoryIconMap.Other;
            return (
              <Card key={t.id} className="glass hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    t.type === "income" ? "bg-success/15" : "bg-destructive/15"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      t.type === "income" ? "text-success" : "text-destructive"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.category}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.note || "No note"} · {format(parseISO(t.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <p className={cn(
                    "font-semibold whitespace-nowrap",
                    t.type === "income" ? "text-success" : "text-destructive"
                  )}>
                    {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTxn(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TransactionModal open={addOpen} onOpenChange={setAddOpen} onSave={addTransaction} />
      <TransactionModal
        open={!!editingTxn}
        onOpenChange={(o) => !o && setEditingTxn(null)}
        onSave={handleSaveEdit}
        editingTransaction={editingTxn}
      />
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteTransaction(deleteId);
          setDeleteId(null);
        }}
      />
      <DeleteConfirmDialog
        open={clearConfirm}
        onOpenChange={setClearConfirm}
        onConfirm={() => {
          clearAll();
          setClearConfirm(false);
          toast.success("All data cleared.");
        }}
        title="Clear All Data"
        description="This will permanently delete all your transactions. This cannot be undone."
      />
    </div>
  );
};

export default Transactions;
