"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();

  async function handleLogout() {
    await clearSession();
    router.replace("/login");
  }

  return (
    <header className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          Mattia &amp; Nicole
        </span>
        <nav className="flex gap-2 items-center">
          <Link
            href="/expenses/new"
            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Spesa
          </Link>
          <Link
            href="/settlements/new"
            className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ↔ Pagamento
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md text-gray-500 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Esci
          </button>
        </nav>
      </div>
    </header>
  );
}
