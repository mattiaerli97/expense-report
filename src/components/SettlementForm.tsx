"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PEOPLE, Person } from "@/types";
import { addSettlement } from "@/lib/firestore";

export default function SettlementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    from: "nicole" as Person,
    to: "mattia" as Person,
    amount: "",
    note: "",
    date: today,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFromChange(value: Person) {
    const to = value === "mattia" ? "nicole" : "mattia";
    setForm((prev) => ({ ...prev, from: value, to }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const amount = parseFloat(form.amount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError("Inserisci un importo valido.");
      return;
    }

    setLoading(true);
    try {
      await addSettlement({
        from: form.from,
        to: form.to,
        amount,
        note: form.note.trim() || undefined,
        date: form.date,
      });
      router.push("/");
    } catch (err) {
      setError("Errore durante il salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  }

  const fromLabel = PEOPLE.find((p) => p.id === form.from)?.label ?? form.from;
  const toLabel = PEOPLE.find((p) => p.id === form.to)?.label ?? form.to;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Chi paga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chi paga?
        </label>
        <div className="flex gap-3">
          {PEOPLE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleFromChange(p.id)}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                form.from === p.id
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

      {/* Riepilogo */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>{fromLabel}</strong> paga a <strong>{toLabel}</strong>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>

      {/* Nota opzionale */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nota (opzionale)
        </label>
        <input
          type="text"
          placeholder="es. Saldo mensile..."
          value={form.note}
          onChange={(e) => set("note", e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
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
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Registra pagamento"}
        </button>
      </div>
    </form>
  );
}
