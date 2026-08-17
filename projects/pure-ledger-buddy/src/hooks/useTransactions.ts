import { useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "@/types/transaction";
import { useLocalStorage } from "./useLocalStorage";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

const STORAGE_KEY = "fintrack_transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(STORAGE_KEY, []);

  const addTransaction = useCallback(
    (data: Omit<Transaction, "id">) => {
      setTransactions((prev) => [...prev, { ...data, id: uuidv4() }]);
    },
    [setTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, data: Omit<Transaction, "id">) => {
      setTransactions((prev) => prev.map((t) => (t.id === id ? { ...data, id } : t)));
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [setTransactions]
  );

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  const importTransactions = useCallback(
    (data: Transaction[], merge: boolean) => {
      if (merge) {
        setTransactions((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const newOnes = data.filter((t) => !existingIds.has(t.id));
          return [...prev, ...newOnes];
        });
      } else {
        setTransactions(data);
      }
    },
    [setTransactions]
  );

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return transactions.filter((t) => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start, end });
    });
  }, [transactions]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((sum, t) => (t.type === "income" ? sum + t.amount : sum - t.amount), 0);
  }, [transactions]);

  const currentMonthIncome = useMemo(() => {
    return currentMonthTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  }, [currentMonthTransactions]);

  const currentMonthExpenses = useMemo(() => {
    return currentMonthTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  }, [currentMonthTransactions]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
    importTransactions,
    currentMonthTransactions,
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
  };
}
