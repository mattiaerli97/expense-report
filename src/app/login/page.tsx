"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;

    setLoading(true);
    setError(null);

    const result = await verifyPin(pin);

    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error ?? "Errore durante il login.");
      setPin("");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Spese condivise</h1>
          <p className="mt-1 text-sm text-gray-500">Inserisci il PIN per accedere</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-900 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!pin || loading}
              className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
