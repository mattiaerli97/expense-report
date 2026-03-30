"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, PEOPLE, Category, Person } from "@/types";
import { addExpense } from "@/lib/firestore";

export default function ExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Casa" as Category,
    paidBy: "mattia" as Person,
    date: today,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError("Inserisci un importo valido.");
      return;
    }
    if (!form.description.trim()) {
      setError("Inserisci una descrizione.");
      return;
    }

    setLoading(true);
    try {
      await addExpense({
        description: form.description.trim(),
        amount,
        category: form.category,
        paidBy: form.paidBy,
        date: form.date,
      });
      router.push("/");
    } catch (err) {
      setError("Errore durante il salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Chi ha pagato */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chi ha pagato?
        </label>
        <div className="flex gap-3">
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set("paidBy", p.id)}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                form.paidBy === p.id
                  ? p.id === "mattia"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Importo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Importo (€)
        </label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Descrizione */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrizione
        </label>
        <input
          type="text"
          placeholder="es. Cena da Mario..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          value={form.category}
          onChange={(e) => set("category", e.target.value as Category)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Data
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Salva spesa"}
        </button>
      </div>
    </form>
  );
}
