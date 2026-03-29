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
  // loading stays true until both snapshots arrive from the server (not cache)
  const [expReady, setExpReady] = useState(false);
  const [setReady, setSetReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
    return subscribeExpenses(
      (data, fromCache) => {
        setExpenses(data);
        if (!fromCache) setExpReady(true);
      },
      (err) => { setError(err.message); setExpReady(true); }
    );
  }, []);

  useEffect(() => {
    return subscribeSettlements(
      (data, fromCache) => {
        setSettlements(data);
        if (!fromCache) setSetReady(true);
      },
      (err) => { setError(err.message); setSetReady(true); }
    );
  }, []);

  const loading = !expReady || !setReady;
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
