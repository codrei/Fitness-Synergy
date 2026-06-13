# Phase 1 — Foundation: Internal Technical Scope Spec

**Project:** Centralized Multi-Branch Gym Management System (Deal B, Phase 1)
**Team:** M.G.A.B. Co. — Lead: Marco Andrei R. Belen
**Status:** Internal planning document (NOT for client)
**Goal of Phase 1:** Convert the current single-branch app into a secure multi-branch, multi-user foundation. Phase 1 does **not** include the HQ consolidated dashboard or verification workflow — those are Phase 2.

---

## 1. What "done" looks like for Phase 1

- Multiple branches exist in one database, fully data-isolated.
- Each user logs in with their own account, has a **role** and a **branch**.
- A branch staff member can only ever see/touch their own branch's data — enforced **server-side**, not just hidden in the UI.
- A head-office (HQ) user can access all branches.
- The existing Lipa data is migrated cleanly into branch #1.
- Everything that worked before still works, now scoped to a branch.

---

## 2. Database changes (provide as SQL for the user to run — never auto-apply)

### 2.1 New `branches` table
```sql
CREATE TABLE branches (
    branch_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255) NULL,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO branches (branch_id, name, address) VALUES (1, 'Lipa City', 'Lipa City, Batangas');
```

### 2.2 Replace single-admin with `users` table (roles + branch)
```sql
CREATE TABLE users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NULL,
    role        ENUM('hq','branch_manager','branch_staff') NOT NULL DEFAULT 'branch_staff',
    branch_id   INT NULL,              -- NULL for hq (all branches); required for branch roles
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```
- Migrate the existing `admins` row → a `users` row with role `hq` (or `branch_manager` for Lipa — decide).
- `sessions.admin_id` → `sessions.user_id` (rename + repoint FK).

### 2.3 Add `branch_id` to every tenant table
Tables that hold branch-specific data:
```sql
ALTER TABLE members          ADD COLUMN branch_id INT NOT NULL DEFAULT 1, ADD INDEX idx_members_branch (branch_id);
ALTER TABLE payments         ADD COLUMN branch_id INT NOT NULL DEFAULT 1, ADD INDEX idx_payments_branch (branch_id);
ALTER TABLE attendance       ADD COLUMN branch_id INT NOT NULL DEFAULT 1, ADD INDEX idx_attendance_branch (branch_id);
ALTER TABLE expenses         ADD COLUMN branch_id INT NOT NULL DEFAULT 1, ADD INDEX idx_expenses_branch (branch_id);
ALTER TABLE bank_deposits    ADD COLUMN branch_id INT NOT NULL DEFAULT 1, ADD INDEX idx_deposits_branch (branch_id);
ALTER TABLE monthly_targets  ADD COLUMN branch_id INT NOT NULL DEFAULT 1;   -- target is now per-branch
ALTER TABLE activity_log     ADD COLUMN branch_id INT NULL,                 ADD INDEX idx_log_branch (branch_id);
```
All existing rows default to `branch_id = 1` (Lipa) — that IS the migration.

### 2.4 Decision needed: global vs per-branch reference data
- **`plans`** — likely GLOBAL (same plans across branches) → leave as-is, no branch_id. Confirm with client.
- **`promos`** — could be per-branch (each branch runs own promos) OR global. The interview suggests promos vary per manager → consider adding `branch_id` (NULL = company-wide). **Decision required.**
- **`contract_id`** — currently company-wide unique (FS-XXXXXX). Decide: keep one global sequence, or prefix per branch (e.g., FSL-000001 for Lipa). Recommend keeping global `contract_counter` for simplicity in Phase 1.

---

## 3. Backend changes

### 3.1 `auth_check.php` — return role + branch, add scoping helpers
`requireAuth()` must now return `['user_id', 'username', 'role', 'branch_id']` (join users table).

Add helpers in a new `access.php`:
```php
// Returns the branch_id the current user is allowed to act on, or null if HQ (all).
function currentBranchScope($session) {
    return $session['role'] === 'hq' ? null : (int)$session['branch_id'];
}

// Enforce a minimum role; 403 if not met.
function requireRole($session, array $allowedRoles) {
    if (!in_array($session['role'], $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Not permitted.']);
        exit;
    }
}

// For write endpoints: the branch a new record belongs to.
// HQ must pass an explicit branch_id; branch users are forced to their own.
function resolveWriteBranch($session, $requestedBranchId) {
    if ($session['role'] === 'hq') {
        return (int)$requestedBranchId;   // HQ chooses
    }
    return (int)$session['branch_id'];     // others locked to their branch
}
```

### 3.2 Every query must be branch-scoped (the core work)
Pattern for **reads** (e.g. `get_members.php`):
```php
$scope = currentBranchScope($session);
if ($scope === null) {
    // HQ: all branches (Phase 1 can default to a selected branch; full rollup is Phase 2)
    $stmt = $conn->query("SELECT ... FROM members");
} else {
    $stmt = $conn->prepare("SELECT ... FROM members WHERE branch_id = :b");
    $stmt->execute([':b' => $scope]);
}
```

Pattern for **writes** (e.g. `add_member.php`): insert `branch_id = resolveWriteBranch(...)`.

Pattern for **single-record access** (e.g. `get_member_payments.php?id=`, delete, renew, update): **must verify the target row belongs to the user's branch before acting** — this closes the IDOR hole:
```php
// Before operating on member $id:
if ($scope !== null) {
    $chk = $conn->prepare("SELECT branch_id FROM members WHERE member_id = :id");
    $chk->execute([':id' => $id]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);
    if (!$row || (int)$row['branch_id'] !== $scope) {
        http_response_code(404);   // 404 not 403 — don't reveal existence
        echo json_encode(['success' => false, 'error' => 'Not found.']);
        exit;
    }
}
```

### 3.3 Endpoints to touch (every data endpoint)
Reads: `get_members`, `get_stats`, `get_attendance`, `get_member_payments`, `get_member_attendance`, `get_expenses`, `get_revenue`, `get_weekly_sales`, `get_branch_report`, `get_attendance_report`, `get_bank_deposits`, `get_installments`, `get_expiring_members`, `get_monthly_target`, `get_activity_log`.

Writes: `add_member`, `update_member`, `update_member_info`, `delete_member`, `renew_member`, `add_walkin`, `time_in`, `add_installment_payment`, `upload_member_photo`, `delete_member_photo`, `add_expense`/`update`/`delete`, `add_bank_deposit`/`update`/`delete`, `set_monthly_target`, `mark_renewal_contacted`, `add_promo`/`update`/`delete` (if per-branch).

New: `get_branches`, `add_branch`, `update_branch`; `get_users`, `add_user`, `update_user`, `deactivate_user` (HQ-only via `requireRole`).

### 3.4 Audit log
Already has admin snapshot — add `branch_id` so HQ can filter the log by branch. Stamp it from the acting user's branch (or the target record's branch for HQ actions).

---

## 4. Frontend changes

- **Login** → stores role + branch in app state (decode from a new `get_me.php` or include in login response).
- **App shell** → expose `role` and `branchId` via context (extend the existing pattern, e.g. a `useAuthContext`).
- **Branch switcher** (HQ only) → a dropdown in the sidebar header; switching sets an active-branch filter sent with requests. Branch users don't see it (locked to their branch).
- **Role-gated UI** → hide User Management + Branch Management behind `role === 'hq'`. Hide nothing security-critical *only* in the UI — the server already enforces it; UI hiding is just UX.
- **New admin screens** (HQ): Branch list/CRUD, User list/CRUD (create staff, assign role + branch, reset password).
- Everything else (dashboard, members, reports) works as-is but now shows only the active branch's data.

---

## 5. Security checklist (do NOT skip — this is the new attack surface)

- [ ] Every read scoped by branch server-side (not just hidden in UI).
- [ ] Every single-record write/read verifies row.branch_id == user.branch (IDOR prevention).
- [ ] HQ-only endpoints gated by `requireRole($session, ['hq'])`.
- [ ] A branch_staff cannot escalate to manager/hq by tampering with the request (role comes from session/DB, never from the request body).
- [ ] New user creation: only HQ; password hashed with `password_hash`; cannot create an `hq` user unless you are `hq`.
- [ ] `branch_id` on writes resolved server-side via `resolveWriteBranch` — never trust a client-supplied branch_id for non-HQ users.
- [ ] Rate-limit applies per the existing `login_attempts` (still keyed by IP).
- [ ] Existing protections preserved: parameterized queries, error redaction, installment-balance guards, phone/age validation, path-traversal guards.

---

## 6. Explicitly OUT of scope for Phase 1 (set expectations)

- HQ consolidated cross-branch dashboard / rollup reporting → **Phase 2**
- Branch-record verification/approval workflow → **Phase 2**
- SMS/email notifications → separate
- Anything not in section 1–4 above

---

## 7. Suggested build order (de-risk early)

1. DB migration scripts + `branches`/`users` tables, seed Lipa as branch 1.
2. `auth_check` rework + `access.php` helpers + `get_me.php`. **Verify login still works.**
3. Branch + User management endpoints (HQ).
4. Scope all READ endpoints; test as a branch_staff user (should see only branch 1).
5. Scope all WRITE endpoints + IDOR checks on single-record ops.
6. Frontend: auth context, role gating, branch switcher, admin screens.
7. Full regression pass against the Phase-1 security checklist.

---

## 8. Risks / honest notes

- **IDOR is the #1 risk.** The whole value of multi-tenancy collapses if branch A can read branch B by guessing an ID. Section 3.2's single-record check is mandatory on *every* by-id endpoint.
- **Effort:** realistically a multi-week build for one developer alongside studies. Pad the timeline; don't promise a tight deadline.
- **Team:** assign the other members concrete pieces (e.g. frontend admin screens, testing the security checklist, migration testing) so it isn't solo.
- **Data migration is one-way-ish** — back up the production DB before running ALTERs. Test the migration on a copy first.
- **Decide the `plans`/`promos`/`contract_id` global-vs-per-branch questions (section 2.4) BEFORE writing code** — they change the schema.
