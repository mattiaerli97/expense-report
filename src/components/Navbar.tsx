import Link from "next/link";

export default function Navbar() {

  return (
    <header className="hidden sm:block bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-end">
        <nav className="flex gap-2">
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
        </nav>
      </div>
    </header>
  );
}
