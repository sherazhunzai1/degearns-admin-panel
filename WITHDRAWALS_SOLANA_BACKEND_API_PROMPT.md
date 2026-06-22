# Backend Implementation Prompt — Solana Multi-Sig Owner Withdrawals

> Hand this document to your backend AI / developer. It specifies the
> **Solana** side of the 3-of-3 multi-signature owner withdrawal feature in
> the DeGearns admin panel. It mirrors the XRPL spec
> (`WITHDRAWALS_BACKEND_API_PROMPT.md`) one-to-one, but for Solana: Phantom
> login, Solana owner addresses, **SOL** amounts in **lamports**, and Solana
> source wallets.
>
> The frontend is already built against this contract
> (`src/services/api.js` → `withdrawalsAPI`, `src/store/slices/withdrawalsSlice.js`).
> When the page is used by an owner who logged in with **Phantom**, it calls
> the `/admin/withdrawals/solana/...` endpoints below. Until they exist the
> frontend falls back to browser `localStorage`, so implementing this contract
> turns the feature into real, database-backed, on-chain Solana functionality.

---

## 1. Feature Overview

The platform collects Solana revenue into **three source wallets**:

1. **Platform Minting Wallet** — revenue from NFT minting
2. **Treasury Wallet** — platform treasury revenue
3. **Subscriptions Wallet** — subscription revenue

There are the **same three owners** as the XRPL flow. Each owner has a
`solanaAddress` (Phantom login + SOL payout destination) in addition to their
XRPL `walletAddress`.

A Solana withdrawal works exactly like the XRPL one:

1. An owner specifies a **total amount in SOL** and a reason.
2. The total is **split equally between the three owners** (`total / 3` each).
3. The funds are pulled **equally from the three Solana source wallets**.
4. **All three owners must sign** (3-of-3). The initiator signs on creation.
5. On the **third signature**, the backend executes the on-chain SOL transfers
   and marks the withdrawal `completed`.
6. Any owner may **reject** a pending withdrawal, which cancels it.

> Owner Solana addresses come from the existing owners table
> (`solana_address`). The Phantom login allowlist is already served by
> `GET /admin/withdrawals/owners/solana/public` (see the XRPL prompt).

---

## 2. Conventions

- **Base URL:** `/api/v1`
- **Auth:** All endpoints (except the public login allowlist) require the admin
  bearer token, identical to the rest of the admin API.
- **Amounts:** All values are **lamports** (1 SOL = 1,000,000,000 lamports),
  serialized as **strings** to avoid precision loss. (XRPL uses drops = 10^6;
  Solana uses lamports = 10^9 — do not mix them.)
- **Addresses:** Solana base58, validate with `^[1-9A-HJ-NP-Za-km-z]{32,44}$`.
- **Response envelope:** `{ "success": true, "message": "…", "data": { } }`
- **Errors:** `{ "success": false, "message": "…", "code": "ERROR_CODE" }`

---

## 3. Database Schema (suggested)

Reuse the owners table from the XRPL spec (it already has `solana_address`).
For withdrawals you may either add a `chain` column to the existing tables or
create parallel `solana_withdrawals` / `solana_withdrawal_signatures` /
`solana_withdrawal_splits` tables. Either way, keep XRPL (drops) and Solana
(lamports) ledgers separate — never mix the base units.

### `solana_withdrawals` (or `withdrawals` with `chain = 'solana'`)
| Column             | Type      | Notes                                          |
|--------------------|-----------|------------------------------------------------|
| id                 | uuid / pk |                                                |
| chain              | enum      | `'solana'`                                      |
| total_amount       | string    | lamports                                        |
| per_owner_amount   | string    | lamports (`total_amount / owner_count`)         |
| reason             | text      |                                                 |
| initiated_by       | uuid      | FK → withdrawal_owners.id                        |
| status             | enum      | `pending_signatures` \| `completed` \| `rejected` |
| required_signatures| int       | default 3                                       |
| rejected_by        | uuid      | nullable                                        |
| rejection_reason   | text      | nullable                                        |
| created_at / completed_at / rejected_at | timestamp |                          |

Signatures and splits tables mirror the XRPL spec; store the lamport split
snapshot and the on-chain Solana signature per owner once executed.

---

## 4. Endpoints

All paths are namespaced under `/admin/withdrawals/solana`.

### 4.1 Source Wallets

#### `GET /admin/withdrawals/solana/source-wallets`
Returns the three Solana revenue source wallets with **live balances** (query
the Solana RPC `getBalance` for each address, in lamports). All three `type`
values must be present; if one is not configured, return `configured: false`.

**Response `data`:**
```json
{
  "wallets": [
    {
      "type": "minting",
      "label": "Platform Minting Wallet",
      "description": "Collects revenue from NFT minting",
      "walletAddress": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1",
      "balanceBase": "1200000000000",
      "configured": true
    },
    {
      "type": "treasury",
      "label": "Treasury Wallet",
      "description": "Collects platform treasury revenue",
      "walletAddress": "8FE27ioQh3T7o22QsYVT5Re8NnHFqmFNbdqwiF3ywuZQ",
      "balanceBase": "850000000000",
      "configured": true
    },
    {
      "type": "subscriptions",
      "label": "Subscriptions Wallet",
      "description": "Collects subscription revenue",
      "walletAddress": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
      "balanceBase": "430000000000",
      "configured": true
    }
  ]
}
```

> `type` must be one of `minting`, `treasury`, `subscriptions`.
> `balanceBase` is **lamports** (the frontend also accepts `balanceLamports`).

### 4.2 Withdrawal Requests

#### `GET /admin/withdrawals/solana`
List Solana withdrawal requests, newest first.
**Query:** `page` (1), `limit` (20), `status` (optional).
**Response `data`:** `{ "withdrawals": [ /* §5 */ ], "pagination": { ... } }`

#### `GET /admin/withdrawals/solana/stats`
Optional. `{ "totalWithdrawnLamports": "0", "pending": 0, "completed": 0, "rejected": 0 }`

#### `POST /admin/withdrawals/solana`
Create + auto-sign as the initiator.
**Body:** `{ "totalAmount": "90000000000", "reason": "Q1 distribution", "initiatedBy": "owner1" }`
**Logic:** identical to the XRPL spec but in lamports — validate 3 active owners
(each with a valid `solanaAddress`) and 3 configured Solana source wallets;
`totalAmount` ≤ combined Solana source balance; `perOwnerAmount = floor(total/3)`
(distribute the ≤2 lamport remainder to the first owners so the splits sum
exactly); snapshot `splits` (owner `solanaAddress`) and `sourceBreakdown`;
record the initiator's signature; return the full object (§5).

#### `POST /admin/withdrawals/solana/:id/sign`
**Body:** `{ "ownerId": "owner2" }`
On the 3rd signature, **execute the on-chain SOL transfers** so each owner's
`solanaAddress` nets `perOwnerAmount` lamports, set `status = "completed"`,
`completedAt`, and persist each transaction signature onto the matching split.
Wrap signature insert + execution in a transaction; guard against
double-execution (row lock); never release funds twice.

#### `POST /admin/withdrawals/solana/:id/reject`
**Body:** `{ "ownerId": "owner2", "reason": "…" }` — only while `pending_signatures`.

---

## 5. Withdrawal Object (canonical shape)

Identical to the XRPL object, with `chain: "solana"`, lamport amounts, Solana
addresses in `splits[].walletAddress` / `sourceBreakdown[].walletAddress`, and
base58 Solana signatures in `transactionHashes[].hash`.

```json
{
  "id": "wd-solana-1716200000000",
  "chain": "solana",
  "totalAmount": "90000000000",
  "perOwnerAmount": "30000000000",
  "reason": "Q1 profit distribution",
  "initiatedBy": "owner1",
  "status": "pending_signatures",
  "requiredSignatures": 3,
  "signatures": [ { "ownerId": "owner1", "signedAt": "2026-01-25T10:30:00.000Z" } ],
  "splits": [
    { "ownerId": "owner1", "name": "Constantinos", "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU", "amount": "30000000000" },
    { "ownerId": "owner2", "name": "Aristides",    "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", "amount": "30000000000" },
    { "ownerId": "owner3", "name": "Demetrios",    "walletAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "amount": "30000000000" }
  ],
  "sourceBreakdown": [
    { "type": "minting",       "label": "Platform Minting Wallet", "walletAddress": "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", "amount": "30000000000" },
    { "type": "treasury",      "label": "Treasury Wallet",         "walletAddress": "8FE27ioQh3T7o22QsYVT5Re8NnHFqmFNbdqwiF3ywuZQ", "amount": "30000000000" },
    { "type": "subscriptions", "label": "Subscriptions Wallet",    "walletAddress": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "amount": "30000000000" }
  ],
  "createdAt": "2026-01-25T10:30:00.000Z",
  "completedAt": null,
  "rejectedAt": null,
  "rejectedBy": null,
  "rejectionReason": null,
  "transactionHashes": null
}
```

On completion: `"transactionHashes": [ { "ownerId": "owner1", "hash": "<base58 sig>" }, … ]`

---

## 6. Validation & Security Checklist

- [ ] Exactly **3 active owners**, each with a valid `solanaAddress`, to initiate.
- [ ] All three **Solana source wallets configured** before initiating.
- [ ] `totalAmount` is a positive integer in **lamports** and **≤ combined Solana source balance**.
- [ ] Equal-split math sums **exactly** to `totalAmount` (handle the ≤2 lamport remainder).
- [ ] Signatures unique per (withdrawal, owner); only the 3 owners may sign.
- [ ] **3-of-3** required before any funds move.
- [ ] On-chain execution is **atomic and single-shot**; record Solana signatures; account for rent + network fees.
- [ ] Reject/sign only while `pending_signatures`.
- [ ] Every action written to the admin **audit log**.
- [ ] Keep Solana (lamports) and XRPL (drops) ledgers strictly separate.

---

## 7. Frontend Contract Reference

The admin panel calls these methods with `chain: 'solana'` (see `src/services/api.js`):

| Method | HTTP |
|--------|------|
| `withdrawalsAPI.getSourceWallets('solana')` | `GET /admin/withdrawals/solana/source-wallets` |
| `withdrawalsAPI.getWithdrawals({ chain: 'solana' })` | `GET /admin/withdrawals/solana` |
| `withdrawalsAPI.getStats('solana')` | `GET /admin/withdrawals/solana/stats` |
| `withdrawalsAPI.createWithdrawal({ chain: 'solana', totalAmount, reason, initiatedBy })` | `POST /admin/withdrawals/solana` |
| `withdrawalsAPI.signWithdrawal(id, ownerId, 'solana')` | `POST /admin/withdrawals/solana/:id/sign` |
| `withdrawalsAPI.rejectWithdrawal(id, ownerId, reason, 'solana')` | `POST /admin/withdrawals/solana/:id/reject` |

Owners are shared with the XRPL flow (`/admin/withdrawals/owners`, with the
`solanaAddress` field) and the Phantom login allowlist
(`/admin/withdrawals/owners/solana/public`). Once these endpoints return the
shapes above, the UI uses live Solana data automatically.
