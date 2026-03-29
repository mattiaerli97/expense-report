import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Expense, Settlement, Balance, InitialBalance } from "@/types";

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function addExpense(
  data: Omit<Expense, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "expenses"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getExpenses(): Promise<Expense[]> {
  const q = query(collection(db, "expenses"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, "expenses", id));
}

// ─── Settlements ─────────────────────────────────────────────────────────────

export async function addSettlement(
  data: Omit<Settlement, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "settlements"), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getSettlements(): Promise<Settlement[]> {
  const q = query(collection(db, "settlements"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Settlement));
}

export async function deleteSettlement(id: string): Promise<void> {
  await deleteDoc(doc(db, "settlements", id));
}

// ─── Initial balance (read-only) ─────────────────────────────────────────────

const SETTINGS_DOC = doc(db, "settings", "balance");

/**
 * Legge il saldo iniziale da Firestore.
 * Se il documento non esiste restituisce 0 (nessun saldo pregresso).
 */
export async function getInitialBalance(): Promise<InitialBalance> {
  const snap = await getDoc(SETTINGS_DOC);
  if (!snap.exists()) return { mattia: 0, updatedAt: "" };
  return snap.data() as InitialBalance;
}

// ─── Balance calculation ──────────────────────────────────────────────────────

export function computeBalance(
  expenses: Expense[],
  settlements: Settlement[],
  initialBalance: InitialBalance = { mattia: 0, updatedAt: "" }
): Balance {
  // Parte dal saldo pregresso
  let mattia = initialBalance.mattia;

  for (const e of expenses) {
    const half = e.amount / 2;
    if (e.paidBy === "mattia") {
      // Mattia ha anticipato: va a credito di metà
      mattia += half;
    } else {
      // Nicole ha anticipato: Mattia va a debito di metà
      mattia -= half;
    }
  }

  for (const s of settlements) {
    if (s.from === "mattia") {
      // Mattia paga un debito: il suo saldo migliora
      mattia += s.amount;
    } else {
      // Nicole paga: il saldo di Mattia peggiora
      mattia -= s.amount;
    }
  }

  return {
    mattia,
    nicole: -mattia, // saldi sempre opposti
  };
}
