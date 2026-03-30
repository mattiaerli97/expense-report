import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const basePath =
  process.env.NODE_ENV === "production" ? "/expense-report" : "";

export const viewport: Viewport = {
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Mattia & Nicole — Spese condivise",
  description: "Traccia e dividi le spese in coppia",
  manifest: `${basePath}/manifest.json`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <Navbar />
        <ServiceWorkerRegistrar />
        <main
          className="max-w-4xl mx-auto px-4 py-6 main-bottom-safe sm:pb-6"
        >{children}</main>

        {/* Bottom bar — solo mobile */}
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 px-4 pt-3 flex gap-3 bottom-bar-safe"
        >
          <Link
            href="/expenses/new"
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold text-center hover:bg-indigo-700 transition-colors"
          >
            + Spesa
          </Link>
          <Link
            href="/settlements/new"
            className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold text-center hover:bg-gray-50 transition-colors"
          >
            ↔ Pagamento
          </Link>
        </div>
      </body>
    </html>
  );
}
