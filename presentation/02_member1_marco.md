# Member 1 — Marco (Leader): Foundation — Architecture & Database Design

**Your job:** set the frame everyone builds on. Explain *what the system is*, *how the 3 tiers
talk*, and *the database design* (the heart of a DB-subject grade). End by handing off to Member 2.

**Time:** ~5 min talk + you also lead the 1-min team intro.

---

## 1. Opening — say this WORD FOR WORD (your first ~90 seconds)

You open the whole presentation. Take a breath, smile, then say:

> **"Good [morning/afternoon], ma'am/sir. We're group M.G.A.B. Co., and our project is
> *Fitness Synergy* — a gym management system we built for a real gym in Lipa City."**

> **"Our subject is Database Management, so instead of just showing screens, the four of us will
> each walk you through a part of the *database* and the app built on top of it. I'll go first with
> the overall design, then my groupmates will take you through how data goes in, how it's used
> daily, and how we turn it into reports and keep it secure."**

> **"So to start — at its core, this system has three layers."**  *(now move to section 2, the architecture)*

**Tips for the opening:**
- Introduce your groupmates by name if your prof expects it: *"With me are [names]."*
- Don't rush these lines — they buy you time to calm down before the technical part.
- The last sentence ("three layers") is your bridge into the architecture diagram. Land on it and click to your next slide.

### If you blank out, the ONE sentence to remember:
> "We're M.G.A.B. Co., this is Fitness Synergy — a gym management system — and I'll start with how the database and the app are designed."
Everything else you can recover from there.

## 2. The 3-tier architecture (draw this or show a slide)
```
   React + Vite SPA   --HTTP/JSON-->   PHP REST endpoints   --SQL/PDO-->   MySQL (MariaDB)
   (the browser UI)                    (~55 .php files)                    (13 tables)
        Frontend/                       Backend/                           InfinityFree host
```
**Say:**
> "It's a classic 3-tier design. The **frontend** is a React single-page app — what the gym staff
> click. It never touches the database directly. Instead it calls our **backend**, which is a set
> of PHP endpoints, one per action. The backend is the only thing that talks to **MySQL**, using
> prepared statements through PDO. Data comes back as JSON. This separation is what keeps the
> database safe — the browser can't run SQL."

## 3. LIVE: trace one click through all 3 tiers (your demo)
Open these files side by side and follow the path:
1. [Frontend/src/api.js](../Frontend/src/api.js) — `apiFetch()` adds the auth token and calls the endpoint.
2. [Frontend/src/App.jsx](../Frontend/src/App.jsx) line ~205 `handleTimeIn` — a click sends `member_id` to `time_in.php`.
3. [Backend/time_in.php](../Backend/time_in.php) — checks for a duplicate, then `INSERT INTO attendance ...`.
4. Result: one new row in the `attendance` table → JSON `{success:true}` → UI updates.

> "So a button click becomes one JavaScript call, becomes one PHP file, becomes one SQL statement,
> becomes one row. That's the whole system in miniature."

## 4. The database design (your main content — show [01_ERD.md](01_ERD.md))
Walk the ERD. Hit these points:

**Tables (13):** `members`, `payments`, `attendance`, `plans`, `promos`, `expenses`,
`bank_deposits`, `monthly_targets`, `admins`, `sessions`, `login_attempts`, `activity_log`,
plus the helper `contract_counter`.

**Key relationships (say each out loud):**
- One **plan** → many **members**, and one **member** → many **payments** and many **attendance** rows.
- A **walk-in** is just a payment with `member_id = NULL` — no member record needed. (Nice design point: we reuse the `payments` table for both members and guests via a `customer_type` column.)

**Normalization (expect this question — answer proactively):**
> "The schema is in **Third Normal Form**. Plan price and duration live **only** in the `plans`
> table — `members` just stores a `plan_id` foreign key, so there's no duplicated plan data and no
> update anomaly. When a payment is made we **snapshot** the amount into `payments.amount` on
> purpose, so changing a plan's price later never rewrites historical receipts."

**Engineering decisions to brag about (from [Backend/database_patch.sql](../Backend/database_patch.sql)):**
- **InnoDB, not MyISAM** → gives us transactions + foreign keys. We explicitly converted `promos` and `expenses`.
- **Foreign keys with delete rules** → `members.plan_id` is `ON DELETE RESTRICT` (can't delete a plan in use); member deletes `CASCADE` to their payments/attendance.
- **Indexes** on hot columns: `payment_date`, `expiration_date`, `member_id` — so reports don't full-scan.
- **utf8mb4** charset so the peso sign ₱ and em-dash — store correctly.

## 5. Hand-off
> "That's the foundation — the design and how the tiers connect. Now [Member 2] will show how a
> real member gets **into** this database."

---

## Q&A you should be ready for
- **"Why InnoDB over MyISAM?"** → Transactions (all-or-nothing writes) and foreign keys for integrity; MyISAM has neither and only does table-level locking.
- **"Is this normalized?"** → Yes, 3NF; explain the `plans` FK + the deliberate payment snapshot exception.
- **"How do you prevent SQL injection?"** → Every query uses PDO **prepared statements** with bound parameters; we never concatenate user input into SQL. (Open any endpoint to prove it.)
- **"What's `contract_counter`?"** → A one-row table we increment inside a transaction to hand out `FS-000001`-style IDs with no race condition (instead of `MAX(id)+1`).
- **"Where is it hosted?"** → InfinityFree (free PHP + MySQL host); the DB is managed via phpMyAdmin.
