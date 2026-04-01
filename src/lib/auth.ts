import { getUserDoc, saveToken, clearToken } from "./firestore";

const SESSION_KEY = "et_session"; // localStorage key
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 giorni

const SHARED_USER = "shared" as const;

interface SessionData {
  token: string;
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function verifyPin(
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const userDoc = await getUserDoc(SHARED_USER);
  if (!userDoc) {
    return { success: false, error: "Configurazione non trovata." };
  }

  const pinHash = await hashPin(pin);
  if (pinHash !== userDoc.pin) {
    return { success: false, error: "PIN non corretto." };
  }

  // Genera token univoco e salva
  const token = crypto.randomUUID();
  const tokenExpiry = Date.now() + SESSION_DURATION_MS;
  await saveToken(SHARED_USER, token, tokenExpiry);

  // Persisti in localStorage
  const session: SessionData = { token };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return { success: true };
}

// ─── Check sessione ───────────────────────────────────────────────────────────

export async function checkSession(): Promise<boolean> {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return false;

  let session: SessionData;
  try {
    session = JSON.parse(raw) as SessionData;
  } catch {
    return false;
  }

  const userDoc = await getUserDoc(SHARED_USER);
  if (!userDoc) return false;
  if (userDoc.token !== session.token) return false;
  if (!userDoc.tokenExpiry || Date.now() > userDoc.tokenExpiry) {
    localStorage.removeItem(SESSION_KEY);
    return false;
  }

  return true;
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  await clearToken(SHARED_USER);
  localStorage.removeItem(SESSION_KEY);
}
