"use client";

import { useEffect, useState, useCallback } from "react";
import { Expense, Settlement, InitialBalance } from "@/types";
import {
  getExpenses,
  getSettlements,
  getInitialBalance,
  computeBalance,
} from "@/lib/firestore";
import BalanceSummary from "@/components/BalanceSummary";
import ExpenseList from "@/components/ExpenseList";

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [initialBalance, setInitialBalance] = useState<InitialBalance>({
    mattia: 0,
    updatedAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [exp, set, initial] = await Promise.all([
        getExpenses(),
        getSettlements(),
        getInitialBalance(),
      ]);
      setExpenses(exp);
      setSettlements(set);
      setInitialBalance(initial);
    } catch (err) {
      console.error("[load error]", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Errore: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const balance = computeBalance(expenses, settlements, initialBalance);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 h-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="flex-1 h-24 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : (
        <>
          <BalanceSummary balance={balance} />
          <ExpenseList
            expenses={expenses}
            settlements={settlements}
            onDelete={load}
          />
        </>
      )}
    </div>
  );
}
