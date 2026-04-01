/**
 * Genera l'hash SHA-256 di un PIN da inserire su Firestore Console.
 *
 * Utilizzo:
 *   node scripts/hash-pin.mjs <pin>
 *
 * Esempio:
 *   node scripts/hash-pin.mjs 1234
 *
 * Poi su Firestore Console crea il documento:
 *   Collection: users  |  Document ID: shared  |  pin: <hash>
 */

import { createHash } from "node:crypto";

const pin = process.argv[2];

if (!pin) {
  console.error("Errore: fornisci il PIN come argomento.");
  console.error("  Utilizzo: node scripts/hash-pin.mjs <pin>");
  process.exit(1);
}

const hash = createHash("sha256").update(pin).digest("hex");

console.log(`\nPIN:  ${pin}`);
console.log(`Hash: ${hash}`);
console.log(
  "\nCopia l'hash nel campo 'pin' del documento corrispondente su Firestore Console."
);
