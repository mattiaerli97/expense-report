"use client";

import { useState } from "react";
import { Expense, Settlement, PEOPLE } from "@/types";
import { deleteExpense, deleteSettlement } from "@/lib/firestore";

interface Props {
  expenses: Expense[];
  settlements: Settlement[];
  onDelete: () => void;
}

type TabType = "expenses" | "settlements";

function formatEur(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  // Aggiunge T00:00:00 per evitare che date YYYY-MM-DD vengano
  // interpretate come UTC e restituiscano il giorno sbagliato
  const date = new Date(
    dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`
  );
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

type Row =
  | { type: "expense"; data: Expense }
  | { type: "settlement"; data: Settlement };

export default function ExpenseList({ expenses, settlements, onDelete }: Props) {
  const [tab, setTab] = useState<TabType>("expenses");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rows: Row[] = [
    ...expenses.map((e) => ({ type: "expense" as const, data: e })),
    ...settlements.map((s) => ({ type: "settlement" as const, data: s })),
  ].sort((a, b) => {
    const dateA = a.data.date;
    const dateB = b.data.date;
    return dateB.localeCompare(dateA);
  });

  const filtered = rows.filter((r) => {
    if (tab === "expenses") return r.type === "expense";
    return r.type === "settlement";
  });

  async function handleDelete(row: Row) {
    if (!confirm("Eliminare questo elemento?")) return;
    setDeletingId(row.data.id);
    try {
      if (row.type === "expense") {
        await deleteExpense(row.data.id, { amount: row.data.amount, paidBy: row.data.paidBy });
      } else {
        await deleteSettlement(row.data.id, { amount: row.data.amount, from: row.data.from });
      }
      onDelete();
    } finally {
      setDeletingId(null);
    }
  }

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: "expenses", label: "Spese", count: expenses.length },
    { id: "settlements", label: "Pagamenti", count: settlements.length },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10 text-sm">
          Nessun elemento da mostrare
        </p>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="sm:hidden flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
            {filtered.map((row) => {
              if (row.type === "expense") {
                const e = row.data;
                const personLabel =
                  PEOPLE.find((p) => p.id === e.paidBy)?.label ?? e.paidBy;
                return (
                  <li key={`e-${e.id}`} className="flex items-center gap-3 px-4 py-3 bg-white">
                    {/* Left: date + description + category */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(e.date)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            e.paidBy === "mattia"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {personLabel}
                        </span>
                        <span className="text-xs text-gray-400">{e.category}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-gray-900 truncate">
                        {e.description}
                      </p>
                    </div>
                    {/* Right: amount + delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatEur(e.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deletingId === e.id}
                        className="text-gray-300 hover:text-red-500 transition-colors text-xs p-1"
                        title="Elimina"
                      >
                        {deletingId === e.id ? "..." : "✕"}
                      </button>
                    </div>
                  </li>
                );
              } else {
                const s = row.data;
                const fromLabel =
                  PEOPLE.find((p) => p.id === s.from)?.label ?? s.from;
                const toLabel =
                  PEOPLE.find((p) => p.id === s.to)?.label ?? s.to;
                return (
                  <li
                    key={`s-${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 bg-amber-50/40"
                  >
                    {/* Left: date + direction + badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatDate(s.date)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          Saldo
                        </span>
                        <span className="text-xs text-gray-500">
                          {fromLabel} → {toLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600 italic truncate">
                        {s.note || "Pagamento"}
                      </p>
                    </div>
                    {/* Right: amount + delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-amber-700">
                        {formatEur(s.amount)}
                      </span>
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deletingId === s.id}
                        className="text-gray-300 hover:text-red-500 transition-colors text-xs p-1"
                        title="Elimina"
                      >
                        {deletingId === s.id ? "..." : "✕"}
                      </button>
                    </div>
                  </li>
                );
              }
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden sm:block rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Descrizione</th>
                  <th className="px-4 py-3 text-left">Chi</th>
                  <th className="px-4 py-3 text-left">Categoria</th>
                  <th className="px-4 py-3 text-right">Importo</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((row) => {
                  if (row.type === "expense") {
                    const e = row.data;
                    const personLabel =
                      PEOPLE.find((p) => p.id === e.paidBy)?.label ?? e.paidBy;
                    return (
                      <tr key={`e-${e.id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(e.date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {e.description}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              e.paidBy === "mattia"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {personLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{e.category}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatEur(e.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === e.id}
                            className="text-gray-300 hover:text-red-500 transition-colors text-xs"
                            title="Elimina"
                          >
                            {deletingId === e.id ? "..." : "✕"}
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    const s = row.data;
                    const fromLabel =
                      PEOPLE.find((p) => p.id === s.from)?.label ?? s.from;
                    const toLabel =
                      PEOPLE.find((p) => p.id === s.to)?.label ?? s.to;
                    return (
                      <tr key={`s-${s.id}`} className="hover:bg-gray-50 bg-amber-50/40">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatDate(s.date)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 italic">
                          {s.note || "Pagamento"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {fromLabel} → {toLabel}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Saldo
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-700">
                          {formatEur(s.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === s.id}
                            className="text-gray-300 hover:text-red-500 transition-colors text-xs"
                            title="Elimina"
                          >
                            {deletingId === s.id ? "..." : "✕"}
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
