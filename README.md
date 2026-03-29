# Mattia & Nicole — Spese condivise

App per tracciare e dividere le spese di coppia. Ogni spesa viene automaticamente divisa a metà: chi paga va a credito della metà, l'altro va in debito.

## Setup Firebase (primo avvio)

### 1. Crea il progetto Firebase

1. Vai su [console.firebase.google.com](https://console.firebase.google.com)
2. Clicca **Aggiungi progetto** → dai un nome (es. `mattia-nicole-spese`)
3. Disabilita Google Analytics se non ti serve → **Crea progetto**

### 2. Crea il database Firestore

1. Nel menu laterale: **Crea database** (Firestore Database)
2. Scegli **Avvia in modalità test** (permette lettura/scrittura per 30 giorni)
3. Scegli la regione più vicina (es. `europe-west1`)
4. Clicca **Avanti** → **Fine**

> Per produzione, sostituisci le regole Firestore con quelle nella sezione "Sicurezza" in fondo.

### 3. Registra l'app Web

1. Nella homepage del progetto, clicca sull'icona **`</>`** (Web)
2. Dai un nickname all'app (es. `expense-tracker`)
3. **Non** spuntare Firebase Hosting
4. Clicca **Registra app**
5. Copia la configurazione mostrata — ti serve nella prossima sezione

### 4. Configura le variabili d'ambiente

Crea il file `.env.local` nella root del progetto (già presente come template):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tuo-progetto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuo-progetto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tuo-progetto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Sostituisci i valori con quelli copiati dal passo precedente.

---

## Avvio in sviluppo

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

---

## Struttura del progetto

```
src/
├── app/
│   ├── layout.tsx                   # Layout root con navbar
│   ├── page.tsx                     # Dashboard (saldo + lista spese)
│   ├── expenses/new/page.tsx        # Form nuova spesa
│   └── settlements/new/page.tsx     # Form registra pagamento
├── components/
│   ├── Navbar.tsx
│   ├── BalanceSummary.tsx           # Riquadri saldo Mattia / Nicole
│   ├── ExpenseList.tsx              # Tabella spese + filtri tab
│   ├── ExpenseForm.tsx
│   └── SettlementForm.tsx
├── lib/
│   ├── firebase.ts                  # Inizializzazione Firebase
│   └── firestore.ts                 # CRUD + calcolo saldo
└── types/
    └── index.ts                     # Tipi condivisi (Expense, Settlement, ecc.)
```

---

## Logica del saldo

Per ogni spesa di importo **X** pagata da **P**:
- `P` guadagna `+X/2` (ha anticipato per l'altro)
- L'altro guadagna `-X/2`

I pagamenti di saldo (`settlements`) modificano direttamente il bilancio.

Se `saldo Mattia > 0` → Nicole deve soldi a Mattia  
Se `saldo Mattia < 0` → Mattia deve soldi a Nicole

---

## Categorie disponibili

`Casa` · `Spesa alimentare` · `Ristorante/Bar` · `Trasporti` · `Svago` · `Salute` · `Abbigliamento` · `Altro`

Per aggiungere/modificare le categorie: `src/types/index.ts` → array `CATEGORIES`.

---

## Struttura Firestore

Il database usa due collection:

### Collection `expenses`

Ogni documento rappresenta una spesa.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `amount` | `number` | Importo in euro (es. `45.50`) |
| `description` | `string` | Descrizione libera (es. "Cena da Mario") |
| `category` | `string` | Una delle categorie predefinite |
| `paidBy` | `"mattia" \| "nicole"` | Chi ha pagato |
| `date` | `string` | Data in formato `YYYY-MM-DD` |
| `createdAt` | `string` | Timestamp ISO di inserimento |

Esempio documento:
```json
{
  "amount": 60.00,
  "description": "Spesa al supermercato",
  "category": "Spesa alimentare",
  "paidBy": "nicole",
  "date": "2026-03-28",
  "createdAt": "2026-03-28T10:30:00.000Z"
}
```

### Collection `settlements`

Ogni documento rappresenta un pagamento di saldo tra i due.

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `amount` | `number` | Importo pagato |
| `from` | `"mattia" \| "nicole"` | Chi paga il debito |
| `to` | `"mattia" \| "nicole"` | Chi riceve il pagamento |
| `date` | `string` | Data in formato `YYYY-MM-DD` |
| `note` | `string` (opzionale) | Nota libera |
| `createdAt` | `string` | Timestamp ISO di inserimento |

Esempio documento:
```json
{
  "amount": 30.00,
  "from": "nicole",
  "to": "mattia",
  "date": "2026-03-28",
  "note": "Saldo mensile",
  "createdAt": "2026-03-28T11:00:00.000Z"
}
```

### Collection `settings`

Contiene un unico documento con id fisso `balance`, usato per il saldo pregresso al lancio.

| Documento | Campo | Tipo | Descrizione |
|-----------|-------|------|-------------|
| `balance` | `mattia` | `number` | Saldo di Mattia prima del lancio. Positivo = Mattia in credito, negativo = Mattia in debito |
| `balance` | `updatedAt` | `string` | Timestamp ISO dell'ultimo aggiornamento |

Esempio documento (`settings/balance`):
```json
{
  "mattia": -45.00,
  "updatedAt": "2026-03-28T09:00:00.000Z"
}
```

In questo esempio, al lancio Mattia era in debito di €45 verso Nicole.

> Il saldo iniziale si imposta dalla pagina **Impostazioni** (icona ⚙ in navbar). Viene sommato al saldo calcolato da tutte le spese e i pagamenti successivi.

---

## Regole Firestore per produzione

Una volta che l'app è stabile, aggiorna le regole Firestore dalla console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> Nota: senza autenticazione le regole sono necessariamente permissive. Se in futuro vuoi aggiungere autenticazione, contatta lo sviluppatore.
