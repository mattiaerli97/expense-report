"use client";

import { useEffect, useState } from "react";
import { Expense, Settlement, InitialBalance } from "@/types";
import {
  subscribeExpenses,
  subscribeSettlements,
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
  const [loadingExp, setLoadingExp] = useState(true);
  const [loadingSet, setLoadingSet] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initial balance: one-shot fetch, retried on error
    let cancelled = false;
    async function fetchInitial(attempt = 0) {
      try {
        const initial = await getInitialBalance();
        if (!cancelled) setInitialBalance(initial);
      } catch {
        if (!cancelled && attempt < 3) {
          setTimeout(() => fetchInitial(attempt + 1), 1500 * (attempt + 1));
        }
      }
    }
    fetchInitial();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const unsub = subscribeExpenses(
      (data) => { setExpenses(data); setLoadingExp(false); },
      (err) => { setError(err.message); setLoadingExp(false); }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeSettlements(
      (data) => { setSettlements(data); setLoadingSet(false); },
      (err) => { setError(err.message); setLoadingSet(false); }
    );
    return unsub;
  }, []);

  const loading = loadingExp || loadingSet;
  const balance = computeBalance(expenses, settlements, initialBalance);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Riepilogo spese</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {expenses.length} spese &middot; {settlements.length} pagamenti
        </p>
      </div>

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
            onDelete={() => {}}
          />
        </>
      )}
    </div>
  );
}
