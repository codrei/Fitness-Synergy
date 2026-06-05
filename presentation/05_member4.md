# Member 4 — Insight & Trust: Reporting + Security & Integrity

**Your job:** the impressive finish — the **advanced SQL** (aggregations, JOINs, GROUP BY) that
turns rows into reports, plus the **database security** story (auth, sessions, audit, integrity).
This part draws the toughest questions, so own the SQL confidently.

**Tables you own:** `payments` (read/aggregate side), `monthly_targets`, `bank_deposits`,
`admins`, `sessions`, `login_attempts`, `activity_log`.

**Time:** ~5 min. You close the demo loop and the presentation.

---

## 1. Intro
> "All that data — payments, attendance, expenses — is only useful if we can turn it into insight,
> and only trustworthy if it's secure. I'll cover both: the reporting queries, then how we protect
> the database."

## 2. Reporting & analytics — the advanced SQL (your highlight)
Open [Backend/get_revenue.php](../Backend/get_revenue.php) and
[Backend/get_weekly_sales.php](../Backend/get_weekly_sales.php).
> "Reports are **aggregation queries**. To get revenue we `SUM(amount)` from `payments`,
> `GROUP BY` time period and `customer_type`, and **JOIN** to `plans` and `members` to label the
> rows. This is exactly what a relational database is built for — the heavy lifting happens in SQL,
> not in PHP."

Concretely, name-drop these as you scroll:
- **`SUM()` + `GROUP BY`** for revenue per day/week/month.
- **`JOIN`** `payments → plans` / `payments → members` to attach plan names and member info.
- **`COUNT()`** of members / visits for the dashboard cards ([Backend/get_stats.php](../Backend/get_stats.php)).
- **Branch sales report** ([Backend/get_branch_report.php](../Backend/get_branch_report.php)):
  compares actual revenue against `monthly_targets` and reconciles with `bank_deposits` (variance).

**LIVE:** open the Revenue report and show the **payment from the member Member 2 registered**
now showing up in the totals. That closes the demo loop the whole team has been building.

> "The numbers you see were a single button-click 4 minutes ago — that's the full lifecycle, from
> one INSERT to an aggregated report."

## 3. Security & data integrity (very strong for a DB course)
Open [Backend/login.php](../Backend/login.php) and [Backend/auth_check.php](../Backend/auth_check.php).

**Authentication & sessions — say:**
> "Passwords are never stored in plain text — we use **bcrypt** hashing (`password_hash` /
> `password_verify`). On login we generate a random **session token**, store it in the `sessions`
> table with a 24-hour `expires_at`, and the browser sends that token on every request. Every
> protected endpoint calls `requireAuth()`, which validates the token against the `sessions`
> table — so an expired or fake token gets a 401."

**Three extra hardening points to brag about (all in `login.php`):**
1. **Rate limiting** — 5 failed attempts per IP in 15 min is blocked, tracked in the
   `login_attempts` table.
2. **Timing-attack mitigation** — we run a dummy bcrypt verify when the username doesn't exist, so
   attackers can't tell valid usernames apart by response time.
3. **Session cleanup** — expired sessions are deleted on each login and by the patch script.

**Audit trail —** open [Backend/audit.php](../Backend/audit.php):
> "Every write action (`member.create`, `expense.create`, deletes…) is logged to `activity_log`
> with **who** did it, **when**, their **IP**, and a JSON snapshot of the change. So we have full
> accountability — you can see exactly who changed what."

**LIVE:** open the Activity Log view and show the `member.create` entry from Member 2's
registration. Optionally, type a wrong password 5× to trigger the lockout.

**Integrity (tie back to the ERD):**
> "Integrity is enforced by the database itself: **foreign keys** (you can't orphan a payment or
> delete an in-use plan), **NOT NULL** and **DEFAULT** constraints, and **transactions** so multi-table
> writes are all-or-nothing."

## 4. Closing (you close for the team)
> "So that's Fitness Synergy end to end: a normalized relational database, a clean 3-tier app on
> top of it, real transactions and constraints keeping the data consistent, and security from login
> to audit log. Thank you — we're happy to take questions."

---

## Q&A you should be ready for
- **"Are passwords encrypted?"** → **Hashed** (one-way) with bcrypt, not encrypted; even we can't read them.
- **"What's the difference between a session and a login?"** → Login verifies the password once; the session token then proves identity on later requests until it expires (24h).
- **"How do reports stay fast?"** → Indexes on `payment_date`, `member_id`, `plan_id`; aggregation done in SQL, not PHP.
- **"What if someone deletes a member — do their payments break the totals?"** → CASCADE removes their payments too; or you keep them — design choice. Walk-in payments (`member_id NULL`) are never affected.
- **"Can a regular user see the audit log / others' data?"** → Auth is required on every endpoint; the audit log records IP + user for accountability.
- **"Is the audit log able to break a real operation?"** → No — `audit.php` swallows its own errors on purpose, so logging can never roll back a real write.
