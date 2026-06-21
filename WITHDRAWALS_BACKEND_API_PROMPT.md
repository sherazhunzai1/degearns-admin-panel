# Backend Implementation Prompt — Multi-Sig Owner Withdrawals

> Hand this document to your backend AI / developer. It is a complete
> specification for the APIs that power the **3-of-3 multi-signature owner
> withdrawal** feature in the DeGearns admin panel. The frontend is already
> built against this contract (`src/services/api.js` → `withdrawalsAPI`,
> `src/store/slices/withdrawalsSlice.js`). Until these endpoints exist, the
> frontend gracefully falls back to browser `localStorage`, so implementing
> this contract is what turns the feature into real, database-backed,
> on-chain functionality.

---

## 1. Feature Overview

The platform collects revenue into **three source wallets**:

1. **Platform Minting Wallet** — revenue from NFT minting
2. **Treasury Wallet** — platform treasury revenue
3. **Subscriptions Wallet** — subscription revenue

There are **three owners**. Each owner has a name and an XRPL wallet address
stored in the database.

> **Login allowlist:** these three owner wallets are also the *only* wallets
> allowed to log into the admin panel (via Xaman). The frontend checks the
> connected wallet against the owner list returned by
> `GET /admin/withdrawals/owners`. Keep this endpoint readable by the auth
> layer (or expose a lightweight public `GET /admin/withdrawals/owners/public`
> that returns just `{ id, name, walletAddress }`) so login can be gated
> server-side too. Reject any non-owner wallet at authentication time.

A withdrawal works like this:

1. An owner specifies a **total amount** to withdraw and a reason.
2. The total is **split equally between the three owners** (`total / 3` each).
3. The funds are pulled **equally from the three source wallets**
   (`total / 3` from each source).
4. **All three owners must sign** (3-of-3 multi-signature). The initiator's
   signature is recorded automatically on creation.
5. When the **third signature** is added, the backend executes the on-chain
   transfers and marks the withdrawal `completed`.
6. Any owner may **reject** a pending withdrawal, which cancels it.

> **You decide which stored wallet maps to each source type** (`minting`,
> `treasury`, `subscriptions`). The admin panel exposes a `minting` wallet
> type under Settings → Wallets, and `treasury` / `subscriptions` already
> exist. Map them however your wallet storage is modelled.

---

## 2. Conventions

- **Base URL:** `/api/v1`
- **Auth:** All endpoints require the admin bearer token, identical to the
  rest of the admin API (`Authorization: Bearer <token>`).
- **Amounts:** All monetary values are XRPL **drops** (1 XRP = 1,000,000
  drops), serialized as **strings** to avoid precision loss.
- **Response envelope** (matches the existing admin API):

```json
{ "success": true, "message": "…", "data": { } }
```

- **Errors:**

```json
{ "success": false, "message": "Human readable error", "code": "ERROR_CODE" }
```

---

## 3. Database Schema (suggested)

### `withdrawal_owners`
| Column          | Type        | Notes                                  |
|-----------------|-------------|----------------------------------------|
| id              | uuid / pk   |                                        |
| name            | string      | Display name (e.g. "Constantinos")     |
| wallet_address  | string      | XRPL r-address, validated, unique      |
| position        | int         | 1..3 ordering (optional)               |
| is_active       | boolean     | default true                           |
| created_at      | timestamp   |                                        |
| updated_at      | timestamp   |                                        |

> Enforce a **maximum of 3 active owners**. Reject the 4th with `409`.

### `withdrawals`
| Column             | Type      | Notes                                          |
|--------------------|-----------|------------------------------------------------|
| id                 | uuid / pk |                                                |
| total_amount       | string    | drops                                           |
| per_owner_amount   | string    | drops (`total_amount / owner_count`)           |
| reason             | text      |                                                |
| initiated_by       | uuid      | FK → withdrawal_owners.id                       |
| status             | enum      | `pending_signatures` \| `completed` \| `rejected` |
| required_signatures| int       | default 3                                       |
| rejected_by        | uuid      | nullable FK → withdrawal_owners.id              |
| rejection_reason   | text      | nullable                                        |
| created_at         | timestamp |                                                 |
| completed_at       | timestamp | nullable                                        |
| rejected_at        | timestamp | nullable                                        |

### `withdrawal_signatures`
| Column        | Type      | Notes                              |
|---------------|-----------|------------------------------------|
| id            | uuid / pk |                                    |
| withdrawal_id | uuid      | FK → withdrawals.id                |
| owner_id      | uuid      | FK → withdrawal_owners.id          |
| signed_at     | timestamp |                                    |
| (unique)      |           | UNIQUE(withdrawal_id, owner_id)    |

### `withdrawal_splits` (per-owner destination) and `withdrawal_sources` (per-source breakdown)
Store the equal split snapshot at creation time so historical records remain
accurate even if owners/wallets change later. Include `tx_hash` on the splits
table to record the on-chain transaction per owner once executed.

---

## 4. Endpoints

### 4.1 Owner Management

#### `GET /admin/withdrawals/owners`
Returns all configured owners.

**Response `data`:**
```json
{
  "owners": [
    { "id": "owner1", "name": "Constantinos", "walletAddress": "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe" },
    { "id": "owner2", "name": "Aristides",    "walletAddress": "rN7n3gSFtdKkAzQhS3vvWFx6P7JzSNGiNj" },
    { "id": "owner3", "name": "Demetrios",    "walletAddress": "rsP3mgGb2tcYUrxiLFiHJiQXhsKegYpnQp" }
  ]
}
```

#### `POST /admin/withdrawals/owners`
Create a new owner (reject if 3 already exist).

**Body:** `{ "name": "string", "walletAddress": "rXXX..." }`
**Validation:** `walletAddress` must match `^r[1-9A-HJ-NP-Za-km-z]{24,34}$` and be unique.
**Response `data`:** `{ "owner": { "id", "name", "walletAddress" } }`

#### `PUT /admin/withdrawals/owners/:id`
Update an owner's name and/or wallet address.

**Body:** `{ "name": "string", "walletAddress": "rXXX..." }`
**Response `data`:** `{ "owner": { "id", "name", "walletAddress" } }`

#### `DELETE /admin/withdrawals/owners/:id`
Remove an owner. **Response:** `{ "success": true }`

---

### 4.2 Source Wallets

#### `GET /admin/withdrawals/source-wallets`
Returns the three revenue source wallets with **live balances** (query the
XRPL for each address). The frontend expects all three `type` values to be
present; if one is not configured, return it with `configured: false`.

**Response `data`:**
```json
{
  "wallets": [
    {
      "type": "minting",
      "label": "Platform Minting Wallet",
      "description": "Collects revenue from NFT minting",
      "walletAddress": "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
      "balanceDrops": "1250000000000",
      "configured": true
    },
    {
      "type": "treasury",
      "label": "Treasury Wallet",
      "description": "Collects platform treasury revenue",
      "walletAddress": "rsXw...",
      "balanceDrops": "820000000000",
      "configured": true
    },
    {
      "type": "subscriptions",
      "label": "Subscriptions Wallet",
      "description": "Collects subscription revenue",
      "walletAddress": "rJ4m...",
      "balanceDrops": "380000000000",
      "configured": true
    }
  ]
}
```

> **`type` must be one of `minting`, `treasury`, `subscriptions`.** These are
> the keys the frontend uses to render and icon each source. Map each to the
> appropriate stored wallet in your system.

---

### 4.3 Withdrawal Requests

#### `GET /admin/withdrawals`
List withdrawal requests, newest first.

**Query:** `page` (default 1), `limit` (default 20), `status` (optional).
**Response `data`:**
```json
{
  "withdrawals": [ /* Withdrawal objects, see §5 */ ],
  "pagination": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

#### `GET /admin/withdrawals/stats`
Optional. Aggregate counts used for the stat cards.
**Response `data`:**
```json
{ "totalWithdrawnDrops": "0", "pending": 0, "completed": 0, "rejected": 0 }
```

#### `POST /admin/withdrawals`
Create + auto-sign as the initiator.

**Body:**
```json
{ "totalAmount": "90000000000", "reason": "Q1 profit distribution", "initiatedBy": "owner1" }
```

**Server-side logic:**
1. Validate there are exactly **3 active owners** and **3 configured source wallets**.
2. Validate `totalAmount` (drops, > 0) does not exceed the **combined** source balance.
3. Compute `perOwnerAmount = floor(totalAmount / 3)`; assign any remainder
   (≤ 2 drops) to the first owner(s) so the splits sum exactly to `totalAmount`.
4. Compute per-source contribution = `floor(totalAmount / 3)` (same remainder rule).
5. Create the withdrawal with `status = "pending_signatures"`, snapshot the
   `splits` and `sourceBreakdown`, and record the initiator's signature.
6. Return the full Withdrawal object (§5).

#### `POST /admin/withdrawals/:id/sign`
Add an owner's signature.

**Body:** `{ "ownerId": "owner2" }`
**Logic:**
- Reject if the withdrawal is not `pending_signatures` (`409`).
- Reject if this owner already signed (`409`).
- Reject if `ownerId` is not one of the 3 owners (`403`).
- Append the signature. If signatures now == `requiredSignatures` (3):
  - **Execute the on-chain transfers**: from each source wallet, send its
    `perSource` share, distributing equally so each owner receives
    `perOwnerAmount`. (Recommended: 3 payments, one per owner, each funded
    `perOwner/3` from each source — or whatever routing your treasury logic
    prefers, as long as each owner nets `perOwnerAmount`.)
  - Set `status = "completed"`, `completedAt = now`, and persist each
    transaction hash onto the corresponding split.
- Return the updated Withdrawal object (§5).

> **Idempotency / safety:** wrap signature insertion + execution in a
> transaction and guard against double-execution (e.g. row lock on the
> withdrawal). Never release funds twice.

#### `POST /admin/withdrawals/:id/reject`
**Body:** `{ "ownerId": "owner2", "reason": "Amount too high" }`
**Logic:** Only valid while `pending_signatures`. Set `status = "rejected"`,
`rejectedBy`, `rejectionReason`, `rejectedAt`. Return the updated object.

---

## 5. Withdrawal Object (canonical shape)

This is exactly what the frontend reads. Match field names and types.

```json
{
  "id": "wd-1716200000000",
  "totalAmount": "90000000000",
  "perOwnerAmount": "30000000000",
  "reason": "Q1 profit distribution",
  "initiatedBy": "owner1",
  "status": "pending_signatures",
  "requiredSignatures": 3,
  "signatures": [
    { "ownerId": "owner1", "signedAt": "2026-01-25T10:30:00.000Z" }
  ],
  "splits": [
    { "ownerId": "owner1", "name": "Constantinos", "walletAddress": "rPT1...", "amount": "30000000000" },
    { "ownerId": "owner2", "name": "Aristides",    "walletAddress": "rN7n...", "amount": "30000000000" },
    { "ownerId": "owner3", "name": "Demetrios",    "walletAddress": "rsP3...", "amount": "30000000000" }
  ],
  "sourceBreakdown": [
    { "type": "minting",       "label": "Platform Minting Wallet", "walletAddress": "rHb9...", "amount": "30000000000" },
    { "type": "treasury",      "label": "Treasury Wallet",         "walletAddress": "rsXw...", "amount": "30000000000" },
    { "type": "subscriptions", "label": "Subscriptions Wallet",    "walletAddress": "rJ4m...", "amount": "30000000000" }
  ],
  "createdAt": "2026-01-25T10:30:00.000Z",
  "completedAt": null,
  "rejectedAt": null,
  "rejectedBy": null,
  "rejectionReason": null,
  "transactionHashes": null
}
```

On completion, populate `transactionHashes`:
```json
"transactionHashes": [
  { "ownerId": "owner1", "hash": "E3A7B9..." },
  { "ownerId": "owner2", "hash": "F4B8C0..." },
  { "ownerId": "owner3", "hash": "A1B2C3..." }
]
```

---

## 6. Validation & Security Checklist

- [ ] Exactly **3 active owners** required to initiate; reject otherwise.
- [ ] All three **source wallets configured** before initiating.
- [ ] `totalAmount` must be a positive integer in drops and **≤ combined source balance**.
- [ ] Equal-split math must sum **exactly** to `totalAmount` (handle the ≤2 drop remainder).
- [ ] Signatures are **unique per (withdrawal, owner)**; only the 3 owners may sign.
- [ ] **3-of-3** required before any funds move.
- [ ] On-chain execution is **atomic and single-shot** (no double spend); record tx hashes.
- [ ] Reject/sign only allowed while `pending_signatures`.
- [ ] Every action is written to the admin **audit log** (initiator, signers, rejecter).
- [ ] XRPL address validation: `^r[1-9A-HJ-NP-Za-km-z]{24,34}$`.

---

## 7. Frontend Contract Reference

The admin panel calls these methods (see `src/services/api.js`):

| Method | HTTP |
|--------|------|
| `withdrawalsAPI.getOwners()` | `GET /admin/withdrawals/owners` |
| `withdrawalsAPI.saveOwner({id?, name, walletAddress})` | `POST` (create) / `PUT /:id` (update) |
| `withdrawalsAPI.deleteOwner(id)` | `DELETE /admin/withdrawals/owners/:id` |
| `withdrawalsAPI.getSourceWallets()` | `GET /admin/withdrawals/source-wallets` |
| `withdrawalsAPI.getWithdrawals({page,limit,status})` | `GET /admin/withdrawals` |
| `withdrawalsAPI.getStats()` | `GET /admin/withdrawals/stats` |
| `withdrawalsAPI.createWithdrawal({totalAmount, reason, initiatedBy})` | `POST /admin/withdrawals` |
| `withdrawalsAPI.signWithdrawal(id, ownerId)` | `POST /admin/withdrawals/:id/sign` |
| `withdrawalsAPI.rejectWithdrawal(id, ownerId, reason)` | `POST /admin/withdrawals/:id/reject` |

Once these return the shapes above, remove/ignore the localStorage fallback —
the UI will automatically use live data.
