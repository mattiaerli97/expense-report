"use client";

import { Balance } from "@/types";

interface Props {
  balance: Balance;
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(Math.abs(amount));
}

function Avatar({
  name,
  color,
  dim = false,
}: {
  name: string;
  color: "blue" | "pink";
  dim?: boolean;
}) {
  const classes = dim
    ? "bg-gray-100 text-gray-400"
    : color === "blue"
    ? "bg-blue-100 text-blue-700"
    : "bg-pink-100 text-pink-700";
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold ${classes}`}
    >
      {name[0].toUpperCase()}
    </div>
  );
}

export default function BalanceSummary({ balance }: Props) {
  const net = balance.mattia;
  const isZero = net === 0;

  // debtor → creditor
  const debtor = net < 0 ? "Mattia" : "Nicole";
  const creditor = net < 0 ? "Nicole" : "Mattia";
  const debtorColor = debtor === "Mattia" ? "blue" : "pink";
  const creditorColor = creditor === "Mattia" ? "blue" : "pink";

  if (isZero) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-5 flex items-center justify-center gap-3">
        <Avatar name="M" color="blue" />
        <p className="text-sm font-semibold text-gray-500">Siete in pari</p>
        <Avatar name="N" color="pink" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-5">
      <div className="flex items-center gap-3">
        {/* Debtor — prominent */}
        <div className="flex flex-col items-center gap-1.5 w-16">
          <Avatar name={debtor[0]} color={debtorColor} />
          <span className="text-xs font-semibold text-gray-700">{debtor}</span>
          <span className="text-[10px] font-medium text-red-500 uppercase tracking-wide">
            deve
          </span>
        </div>

        {/* Arrow + amount */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <p className="text-2xl font-bold text-gray-900">{formatEur(net)}</p>
          <div className="w-full flex items-center">
            <div className="flex-1 h-0.5 bg-indigo-300" />
            <svg
              className="w-6 h-6 text-indigo-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5-5 5M6 12h12"
              />
            </svg>
          </div>
        </div>

        {/* Creditor — dimmed */}
        <div className="flex flex-col items-center gap-1.5 w-16">
          <Avatar name={creditor[0]} color={creditorColor} dim />
          <span className="text-xs font-medium text-gray-400">{creditor}</span>
          <span className="text-[10px] font-medium text-green-500 uppercase tracking-wide">
            riceve
          </span>
        </div>
      </div>
    </div>
  );
}
