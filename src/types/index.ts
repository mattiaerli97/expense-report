export type Person = "mattia" | "nicole";

export type Category =
  | "Casa"
  | "Spesa alimentare"
  | "Ristorante/Bar"
  | "Trasporti"
  | "Svago"
  | "Salute"
  | "Abbigliamento"
  | "Altro";

export const CATEGORIES: Category[] = [
  "Casa",
  "Spesa alimentare",
  "Ristorante/Bar",
  "Trasporti",
  "Svago",
  "Salute",
  "Abbigliamento",
  "Altro",
];

export const PEOPLE: { id: Person; label: string }[] = [
  { id: "mattia", label: "Mattia" },
  { id: "nicole", label: "Nicole" },
];

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  paidBy: Person;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO timestamp
}

export interface Settlement {
  id: string;
  amount: number;
  from: Person; // chi paga il debito
  to: Person; // chi riceve
  date: string;
  note?: string;
  createdAt: string;
}

export interface Balance {
  mattia: number; // positivo = credito (gli devono), negativo = debito (deve lui)
  nicole: number;
}

/**
 * Saldo iniziale salvato su Firestore (collection "settings", doc "balance").
 * mattia: quanto Mattia è a credito/debito PRIMA di iniziare a tracciare le spese.
 * Positivo = Mattia in credito, negativo = Mattia in debito.
 */
export interface InitialBalance {
  mattia: number;
  updatedAt: string;
}
