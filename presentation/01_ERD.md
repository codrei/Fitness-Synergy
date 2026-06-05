# Fitness Synergy — Entity Relationship Diagram

> Reconstructed from the live backend (`add_member.php`, `add_walkin.php`, `add_plan.php`,
> `add_promo.php`, `add_expense.php`, `time_in.php`, `audit.php`, `database_patch.sql`).
> PK = Primary Key, FK = Foreign Key.

## Mermaid ERD (renders on GitHub / VS Code Mermaid preview)

```mermaid
erDiagram
    admins ||--o{ sessions      : "owns"
    admins ||--o{ activity_log  : "performs"
    plans  ||--o{ members       : "subscribed by"
    plans  ||--o{ payments      : "billed on"
    members ||--o{ payments     : "makes"
    members ||--o{ attendance   : "checks in"

    admins {
        int      admin_id PK
        varchar  username
        varchar  password "bcrypt hash"
    }
    sessions {
        varchar   session_token PK
        int       admin_id FK
        datetime  expires_at
    }
    login_attempts {
        int       id PK
        varchar   ip_address
        tinyint   success
        datetime  attempted_at
    }
    plans {
        int      plan_id PK
        varchar  plan_name
        decimal  price
        int      duration_days
    }
    promos {
        int      promo_id PK
        varchar  promo_name
        int      bonus_days
        decimal  discount_amount
        tinyint  is_free
        varchar  description
        tinyint  is_active
    }
    members {
        int      member_id PK
        varchar  full_name
        varchar  contract_id "FS-000001"
        int      plan_id FK
        date     start_date
        date     expiration_date
        varchar  contact_number
        int      age
        varchar  gender
        tinyint  is_installment
        decimal  installment_total
        varchar  photo_url
        varchar  discount_type
    }
    payments {
        int      payment_id PK
        int      member_id FK "NULL for walk-ins"
        int      plan_id FK
        varchar  customer_type "Member / Walk-in"
        decimal  amount
        date     payment_date
        varchar  payment_method
        varchar  reference_number
        int      bonus_days
        varchar  guest_name "walk-in only"
        varchar  walkin_key "generated, indexed"
    }
    attendance {
        int      log_id PK
        int      member_id FK
        datetime time_in
    }
    expenses {
        int      expense_id PK
        varchar  category
        varchar  description
        decimal  amount
        date     expense_date
    }
    bank_deposits {
        int      id PK
        date     deposit_date
        decimal  amount
        decimal  variance
        varchar  remarks
    }
    monthly_targets {
        int      id PK
        tinyint  month
        smallint year
        decimal  target_amount
    }
    activity_log {
        int      log_id PK
        int      admin_id FK
        varchar  admin_username "snapshot"
        varchar  action "member.create ..."
        varchar  entity_type
        varchar  entity_id
        varchar  summary
        json     payload
        varchar  ip_address
    }
    contract_counter {
        int      id PK
        int      last_seq
    }
```

## Plain-text version (if Mermaid won't render on the projector)

```
                 +-----------+
                 |  admins   |
                 +-----------+
                  | 1     | 1
        owns      |       |   performs
       (1..*)     |       |   (1..*)
        +---------+       +-----------+
        v                             v
   +----------+                 +--------------+
   | sessions |                 | activity_log |
   +----------+                 +--------------+

   +----------+    1      *   +-----------+   *      1   +---------+
   |  plans   |---------------|  members  |-------------|  plans  |  (same plans table)
   +----------+ subscribed by +-----------+  billed on  +---------+
        |                       | 1     | 1
        | billed on (1..*)      |       | checks in (1..*)
        v                       v       v
   +----------+           +----------+  +------------+
   | payments |<----------| payments |  | attendance |
   +----------+  member   +----------+  +------------+
   (member_id may be NULL = a Walk-in payment)

   Standalone (no FK, operational/reference): expenses, bank_deposits,
   monthly_targets, promos, login_attempts, contract_counter, settings
```

## Relationships in one sentence each (say these out loud in the defense)
- **One plan → many members** (a plan is subscribed to by many members; a member has exactly one current plan).
- **One member → many payments** (registration, every renewal, every installment is a payment row).
- **One member → many attendance rows** (one per gym visit).
- **A walk-in is a payment with `member_id = NULL`** and `customer_type = 'Walk-in'` — no member record needed.
- **One admin → many sessions / many audit-log entries.**

## Foreign keys & delete behavior (from `database_patch.sql`)
| Child | Parent | ON DELETE | Why |
|-------|--------|-----------|-----|
| `sessions.admin_id` | `admins` | CASCADE | delete an admin → kill their sessions |
| `attendance.member_id` | `members` | CASCADE | delete a member → their visit history goes too |
| `payments.member_id` | `members` | CASCADE | delete a member → their payments go too (walk-ins unaffected, member_id NULL) |
| `members.plan_id` | `plans` | RESTRICT | you **cannot delete a plan** that still has members on it |
