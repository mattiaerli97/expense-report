import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "./firebase";
import { Expense, Settlement, Balance } from "@/types";

// ─── Auth (users collection) ──────────────────────────────────────────────────

interface UserDoc {
  pin: string;
  token?: string;
  tokenExpiry?: number;
}

export async function getUserDoc(docId: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", docId));
  if (!snap.exists()) return null;
  return snap.data() as UserDoc;
}

export async function saveToken(
  docId: string,
  token: string,
  tokenExpiry: number
): Promise<void> {
  await setDoc(
    doc(db, "users", docId),
    { token, tokenExpiry },
    { merge: true }
  );
}

export async function clearToken(docId: string): Promise<void> {
  await setDoc(
    doc(db, "users", docId),
    { token: null, tokenExpiry: null },
    { merge: true }
  );
}

// ─── Balance (settings/balance) ───────────────────────────────────────────────

const BALANCE_DOC = doc(db, "settings", "balance");

export async function getBalance(): Promise<Balance> {
  const snap = await getDoc(BALANCE_DOC);
  if (!snap.exists()) return { mattia: 0, nicole: 0 };
  const raw = (snap.data().mattia as number) ?? 0;
  const mattia = Math.round(raw * 1000) / 1000;
  return { mattia, nicole: -mattia };
}

/**
 * Aggiorna il saldo in modo incrementale e atomico.
 * delta > 0 → Mattia guadagna credito (es. ha pagato lui)
 * delta < 0 → Mattia perde credito (es. ha pagato Nicole, o Mattia ha saldato)
 */
async function updateBalance(delta: number): Promise<void> {
  const rounded = Math.round(delta * 1000) / 1000;
  await updateDoc(BALANCE_DOC, { mattia: increment(rounded) });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

/** Calcola il delta sul saldo Mattia per una spesa. */
function expenseDelta(expense: Pick<Expense, "amount" | "paidBy">): number {
  // Metà importo: se ha pagato Mattia va a suo credito (+), altrimenti a debito (-)
  const half = expense.amount / 2;
  return expense.paidBy === "mattia" ? half : -half;
}

/** Calcola il delta sul saldo Mattia per un pagamento. */
function settlementDelta(settlement: Pick<Settlement, "amount" | "from">): number {
  // Se Mattia paga Nicole, sta saldando un suo debito → credito aumenta (+)
  // Se Nicole paga Mattia, sta saldando un suo debito → credito di Mattia diminuisce (-)
  return settlement.from === "mattia" ? settlement.amount : -settlement.amount;
}

// ─── Expenses ────────────────────────────────────────────────────────────────

export async function addExpense(
  data: Omit<Expense, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "expenses"), stripUndefined({
    ...data,
    createdAt: new Date().toISOString(),
  }));
  await updateBalance(expenseDelta(data));
  return ref.id;
}

export async function getExpenses(): Promise<Expense[]> {
  const snapshot = await getDocs(collection(db, "expenses"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Expense))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteExpense(id: string, expense: Pick<Expense, "amount" | "paidBy">): Promise<void> {
  await deleteDoc(doc(db, "expenses", id));
  // Inverte il delta applicato all'aggiunta
  await updateBalance(-expenseDelta(expense));
}

// ─── Settlements ─────────────────────────────────────────────────────────────

export async function addSettlement(
  data: Omit<Settlement, "id" | "createdAt">
): Promise<string> {
  const ref = await addDoc(collection(db, "settlements"), stripUndefined({
    ...data,
    createdAt: new Date().toISOString(),
  }));
  await updateBalance(settlementDelta(data));
  return ref.id;
}

export async function getSettlements(): Promise<Settlement[]> {
  const snapshot = await getDocs(collection(db, "settlements"));
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() } as Settlement))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteSettlement(id: string, settlement: Pick<Settlement, "amount" | "from">): Promise<void> {
  await deleteDoc(doc(db, "settlements", id));
  await updateBalance(-settlementDelta(settlement));
}
