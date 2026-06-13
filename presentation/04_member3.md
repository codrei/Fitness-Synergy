# Member 3 — Daily Operations: Attendance & Reference Data

**Your job:** the day-to-day running of the gym — checking members in, spotting expiring
memberships, and managing the "lookup" tables (plans, promos, expenses). This is the most
**demo-friendly** part: lots to click, easy to follow.

**Tables you own:** `attendance`, `plans`, `promos`, `expenses`.

**Time:** ~5 min.

---

## 1. Intro
> "Once members are in the system, staff use it every day — checking people in, seeing whose
> membership is about to expire, and managing plans and promos. I'll cover those operations and
> the tables behind them."

## 2. Attendance / Time-in (your live demo — use the member from Member 2)
Open [Backend/time_in.php](../Backend/time_in.php).
> "When a member arrives, staff click Time-In. We first run a **guard query** —
> `SELECT ... WHERE member_id = ? AND DATE(time_in) = CURRENT_DATE()` — so nobody can be checked in
> twice in one day. If they're clear, we `INSERT INTO attendance (member_id, time_in) VALUES (?, NOW())`."

**LIVE:** time-in the member Member 2 just registered. Show the **Live Feed** update, then show the
new row in the `attendance` table in phpMyAdmin.

**DB point to make:** `attendance.member_id` is a **foreign key** to `members` with
`ON DELETE CASCADE` — delete a member and their whole visit history goes with them automatically.
It's also **indexed** (`idx_attendance_member`, `idx_time_in`) so the daily-attendance query is fast.

## 3. Expiring members & renewal reminders (a real query highlight)
Open [Backend/get_expiring_members.php](../Backend/get_expiring_members.php) and the view
[Frontend/src/views/ExpiringMembersView.jsx](../Frontend/src/views/ExpiringMembersView.jsx).
> "The system finds members whose `expiration_date` falls within the next N days using a **date-range
> query** — `WHERE expiration_date BETWEEN CURRENT_DATE() AND DATE_ADD(...)`. Staff get a banner so
> they can call members before they lapse, and they can **mark a member as contacted**."

This is a great place to show off the `idx_expiration_date` index from the patch file.

## 4. Reference / configuration data — full CRUD
These are the "lookup" tables the rest of the system depends on.

- **Plans** — [Frontend/src/components/PlansManager.jsx](../Frontend/src/components/PlansManager.jsx)
  → [Backend/add_plan.php](../Backend/add_plan.php). Columns: `plan_name`, `price`, `duration_days`.
  > "Plans are referenced by both `members` and `payments`. Because of the
  > `ON DELETE RESTRICT` foreign key, the database **physically refuses** to delete a plan that
  > still has members on it — integrity enforced at the database level, not just the UI."
- **Promos** — [Backend/add_promo.php](../Backend/add_promo.php): `bonus_days`, `discount_amount`,
  `is_free`, `is_active`. Promos add free days or discounts at registration/renewal.
- **Expenses** — [Backend/add_expense.php](../Backend/add_expense.php): `category`, `amount`,
  `expense_date`. These feed the profit side of Member 4's reports.

**LIVE (optional, if time):** add a plan, then try to delete a plan that has members → show the
database rejecting it. That's a strong, concrete integrity demo.

## 5. Hand-off
> "So that's the daily operation and the reference data. Now [Member 4] takes all this raw data —
> payments, attendance, expenses — and turns it into reports, and shows how we keep it all secure."

---

## Q&A you should be ready for
- **"How do you stop double check-ins?"** → A guard `SELECT` on `(member_id, today)` before the INSERT.
- **"What happens to attendance when a member is deleted?"** → CASCADE delete via the foreign key — it's removed automatically.
- **"Why can't I just delete a plan?"** → `ON DELETE RESTRICT` foreign key; members still reference it. You'd reassign them first.
- **"How does 'expiring soon' work?"** → A `BETWEEN` date-range query on the indexed `expiration_date` column.
- **"Is a promo stored on the member?"** → Promos apply bonus days/discount at the time of the transaction; the effect lands in `expiration_date` / `payments.amount`.
