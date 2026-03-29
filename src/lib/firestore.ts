import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Expense, Settlement, Balance, InitialBalance } from "@/types";

async function withRetry<T>(fn: () => Promise<T>, retries = 4, delayMs = 800): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw new Error("unreachable");
}

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
  return withRetry(async () => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
  });
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
  return withRetry(async () => {
    const q = query(collection(db, "settlements"), orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Settlement));
  });
}

export async function deleteSettlement(id: string): Promise<void> {
  await deleteDoc(doc(db, "settlements", id));
}

// ─── Initial balance (read-only) ─────────────────────────────────────────────

const SETTINGS_DOC = doc(db, "settings", "balance");

export async function getInitialBalance(): Promise<InitialBalance> {
  return withRetry(async () => {
    const snap = await getDoc(SETTINGS_DOC);
    if (!snap.exists()) return { mattia: 0, updatedAt: "" };
    return snap.data() as InitialBalance;
  });
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
