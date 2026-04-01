import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Expense, Settlement, Balance, InitialBalance } from "@/types";

// ─── Expenses ────────────────────────────────────────────────────────────────

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export async function addExpense(
  data: Omit<Expense, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "expenses"), stripUndefined({
    ...data,
    createdAt: new Date().toISOString(),
  }));
  return ref.id;
}

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(collection(db, "expenses"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Expense))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(db, "expenses", id));
}

// ─── Settlements ─────────────────────────────────────────────────────────────

export async function addSettlement(
  data: Omit<Settlement, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "settlements"), stripUndefined({
    ...data,
    createdAt: new Date().toISOString(),
  }));
  return ref.id;
}

export async function getSettlements(): Promise<Settlement[]> {
  const snapshot = await getDocs(collection(db, "settlements"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Settlement))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteSettlement(id: string): Promise<void> {
  await deleteDoc(doc(db, "settlements", id));
}

// ─── Initial balance (read-only) ─────────────────────────────────────────────

const SETTINGS_DOC = doc(db, "settings", "balance");

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
  let mattia = initialBalance.mattia;

  for (const e of expenses) {
    const half = e.amount / 2;
    if (e.paidBy === "mattia") {
      mattia += half;
    } else {
      mattia -= half;
    }
  }

  for (const s of settlements) {
    if (s.from === "mattia") {
      mattia += s.amount;
    } else {
      mattia -= s.amount;
    }
  }

  return {
    mattia,
    nicole: -mattia,
  };
}
