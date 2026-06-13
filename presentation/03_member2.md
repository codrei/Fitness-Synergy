# Member 2 — Getting Data In: Membership Lifecycle (Writes & Transactions)

**Your job:** show how data gets **written** into the database — the busiest, most important part.
This is the INSERT / UPDATE / DELETE story, and where the database's **transactions** shine.

**Tables you own:** `members`, `payments` (the write side), helper `contract_counter`.

**Time:** ~5 min. You do the **live registration** that Member 3 and 4 build on — so don't skip it.

---

## 1. Intro
> "I'll show how a real person becomes a row in our database — registering a member, walk-ins,
> renewals, and installment payments. This is where most of the writing to the database happens."

## 2. Registering a member — the transaction (your highlight)
Open [Backend/add_member.php](../Backend/add_member.php) and show lines ~113–174.

**Say:**
> "When staff register a member, two things must happen together: a row in `members` and a first
> payment row in `payments`. We wrap both in a **database transaction** — `beginTransaction()` …
> `commit()`. If anything fails halfway, `rollBack()` undoes everything, so we never end up with a
> member who has no payment, or a payment with no member. It's all-or-nothing."

**Three database concepts to point at in this one file:**
1. **Transaction** (line ~114 `beginTransaction`, line ~174 `commit`, line ~198 `rollBack`).
2. **Safe ID generation** (line ~117): we `UPDATE contract_counter SET last_seq = last_seq + 1`
   inside the transaction, then read it back — a **row lock** that prevents two staff from grabbing
   the same `FS-000001` contract number at the same time. (Better than `MAX(id)+1`, which races.)
3. **Prepared statements** (the `:name`, `:contact_number` placeholders): user input is **bound**,
   never glued into the SQL string → SQL-injection proof.

**Also mention validation (defense-in-depth):**
- Contact must match `09xxxxxxxxx` (line ~46), age 1–120, DOB not in the future.
- **Duplicate check** (line ~74): same name + same number → we warn before inserting.

## 3. LIVE DEMO — register a new member (the team's shared thread)
1. Click **Add Member**, fill the form (give them a memorable name like "Prof Demo").
2. Submit. Then open **phpMyAdmin** and show the **new row in `members`** and the matching
   **row in `payments`** — both appeared from one click, in one transaction.
3. Point out the auto-generated `contract_id` (e.g. `FS-000042`).

> "Member 3 will now time this exact person in, and Member 4 will show their payment in the
> revenue report — so watch this name follow through the rest of the demo."

## 4. Walk-ins (reusing the payments table — a design highlight)
Open [Backend/add_walkin.php](../Backend/add_walkin.php).
> "A walk-in guest doesn't need a member record. We insert a `payments` row with
> `member_id = NULL` and `customer_type = 'Walk-in'`, storing the guest's name on the payment
> itself. One table serves both members and guests. We also do a **same-day duplicate guard**, and
> after 7 visits the system **recommends converting** them to a member."

## 5. Renewals & installments (UPDATE story)
- [Backend/renew_member.php](../Backend/renew_member.php): extends `expiration_date` by the plan's
  duration (+ any bonus days) and inserts another `payments` row. **Guard:** can't renew if there's
  an unpaid installment balance.
- [Backend/add_installment_payment.php](../Backend/add_installment_payment.php): records a partial
  payment and tracks the remaining balance against `installment_total`.

## 6. Hand-off
> "So that's how data gets written and kept consistent. Now [Member 3] takes the member I just
> created and shows the day-to-day operations."

---

## Q&A you should be ready for
- **"What if the payment insert fails after the member insert?"** → `rollBack()` undoes the member too; transactions make it atomic.
- **"Why a counter table instead of `MAX(id)+1`?"** → Two staff registering at the same instant could both read the same MAX and collide. The counter row-lock serializes it.
- **"What stops SQL injection here?"** → Bound parameters in prepared statements; open the file and show the `:placeholders`.
- **"Why is `member_id` nullable in payments?"** → So one table can store both member payments and anonymous walk-in payments.
- **"Where does the photo go?"** → `upload_member_photo.php` saves the file under `Backend/uploads/` and stores the path in `members.photo_url` (we store the path, not the image bytes, in the DB).
