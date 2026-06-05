# MARCO — Study Notes (Slides 1–10) + Jargon Glossary (Taglish)

Para 'to sa leader. Goal: maintindihan mo talaga, hindi memoryahin. Bawat slide may
**"Sabihin mo"** (ano i-eexplain) at **"Jargon"** (kahulugan ng mga technical na salita).

---

## 🔑 QUICK JARGON GLOSSARY (basahin mo muna 'to)

| Salita | Kahulugan (simple) |
|--------|--------------------|
| **Web application** | Programa na ginagamit sa browser (tulad ng Chrome), hindi naka-install na app. |
| **Frontend** | 'Yung nakikita at pinipindot ng user — screens, buttons, forms. |
| **Backend** | 'Yung "utak" sa likod na nagpoproseso — hindi nakikita ng user. |
| **Database** | Organisadong imbakan ng lahat ng data (parang super-Excel na may rules). |
| **React** | JavaScript **library** para gawin ang frontend (mga screen). Gawa ito ng Facebook/Meta. |
| **Vite** | **Build tool** — siya ang nagpapatakbo at nag-pa-package ng React app para mabilis. |
| **JavaScript** | Programming language ng browser — siya ang nagbibigay-buhay sa pindutan/screens. |
| **PHP** | Programming language ng **backend** — tumatakbo sa server, siya ang kausap ng database. |
| **MySQL** | Klase ng **database system** (relational). |
| **MariaDB** | Kambal/bersyon ng MySQL — ito ang ginagamit ng host namin (InfinityFree). |
| **Server** | Computer sa internet kung saan tumatakbo ang backend + database 24/7. |
| **Client** | 'Yung browser/user na humihingi ng data sa server. |
| **API** | "Usapan" o set ng kumakatok-at-sumasagot na rules sa pagitan ng frontend at backend. |
| **REST API** | Istilo ng API kung saan bawat **endpoint** = isang aksyon, JSON ang sagot. |
| **Endpoint** | Isang backend file/URL na may iisang trabaho (hal. `time_in.php`). |
| **HTTP** | Ang "wika"/protocol na ginagamit sa pag-usap ng browser at server. |
| **Request** | Hiling galing sa frontend ("pakitime-in si member 42"). |
| **Response** | Sagot ng backend pabalik (kadalasan JSON). |
| **JSON** | Format ng text para sa data. Hal: `{"success": true}`. |
| **Token** | Random na string na patunay na naka-login ka (parang digital wristband). |
| **Stateless** | Hindi "naaalala" ng server kung sino ka kada request — kaya kasama ang token palagi. |
| **3-tier** | Tatlong layer: frontend, backend, database — magkakahiwalay. |
| **SPA (Single-Page App)** | Isang web app na hindi nire-reload ang buong page kada click — mabilis ang dating. |

---

## SLIDE 1 — TITLE

**Sabihin mo (opening):**
> "Magandang umaga po. Kami po ang grupong M.G.A.B. Co., at ang proyekto namin ay
> *Fitness Synergy* — isang **web application** para sa pamamahala ng gym sa Lipa City.
> Dahil ang subject po namin ay Database Management, isa-isa naming ipapakita kung paano
> gumagana ang **database** at ang app na nakapatong dito. Ako po ang mag-uumpisa."

**Key idea:** Ito ay totoong system para sa totoong gym — hindi lang pang-eksperimento.
Tech stack: **React + Vite (frontend) → PHP (backend) → MySQL/MariaDB (database).**

---

## SLIDE 2 — AGENDA (Sino-sino)

**Sabihin mo:**
> "Hahatiin namin ang presentation sa apat, sumusunod sa 'buhay' ng data:
> **idisenyo → ipasok → gamitin araw-araw → gawing report at protektahan.**
> Ako (Marco) ang Foundation; si Ariz ang pagpasok ng data; si Brix ang daily operations;
> si Gabriel ang reports at security."

**Walang mabigat na jargon dito** — transition slide lang.

---

## SLIDE 3 — OVERVIEW (Ano ang Fitness Synergy)

**Sabihin mo:**
> "Pinapalitan ng system na ito ang lumang pen-and-paper logbook. Dito nire-rehistro ang
> members, tinatanggap ang bayad, nita-track ang attendance, at nakikita ang kita ng gym."

**Ginagawa ng system:** member/walk-in registration, renewals & installments, attendance,
plans/promos/expenses, revenue reports, secure login + audit trail.

**Jargon:**
- **Walk-in** = bisitang nagbayad para sa isang araw lang, hindi member.
- **Installment** = hulugan ang bayad sa membership.
- **Audit trail** = talaan ng lahat ng ginawa (sino, kailan, ano).

---

## SLIDE 4 — 3-TIER ARCHITECTURE (PINAKA-IMPORTANTE)

**Analohiya: Restaurant**
- **Dining area = Frontend (React)** — nakikita ng customer, pero 'di marunong magluto.
- **Kusina = Backend (PHP)** — dito niluluto/pinoproseso ang order, sinusunod ang rules.
- **Bodega = Database (MySQL)** — imbakan; **kusina lang** ang pwedeng kumuha dito.

**Sabihin mo:**
> "Tatlong magkakahiwalay na layer ito. Ang **frontend** (browser) ang nakikita ng staff —
> mga button at form, pero hindi siya direktang humahawak sa database. Tumatawag siya sa
> **backend** (PHP), at ang backend lang ang kausap ng **MySQL** gamit ang **PDO** at
> **prepared statements**. JSON ang balik ng data."

**Bakit importante (idiin mo):**
> "Kung kayang mag-database command ng browser nang diretso, kahit sino pwedeng bumura ng
> lahat ng data sa dev console. Pero dahil pinipilit na dumaan sa backend — na chini-check
> muna kung naka-login ka — protektado ang database."

**Jargon:**
- **Tier / layer** = antas o bahagi ng system na may sariling trabaho.
- **PDO (PHP Data Objects)** = ang feature ng PHP na ginagamit para ligtas na makausap ang database.
- **Prepared statement** = paraan ng pagpapatakbo ng SQL na ligtas sa hacking (detalyado sa Slide 10).

---

## SLIDE 5 — ONE CLICK, END TO END (Request Lifecycle)

**Sabihin mo (6 na hakbang):**
> "Pag pinindot ng staff ang 'Time In':
> (1) Mag-uumpisa ang **request** sa browser →
> (2) Ipapadala ito ng **api.js** kasama ang **token** →
> (3) Tatanggapin ng **time_in.php**, chini-check ang rules →
> (4) Magpapatakbo ng **SQL** →
> (5) Ita-store ng **MySQL** ang row →
> (6) Magbabalik ng **JSON** `{success:true}`, mag-uupdate ang screen."

**One-liner mo:**
> "Isang click → isang JavaScript call → isang PHP file → isang SQL statement → isang row.
> Iyan ang buong system in miniature."

**Jargon:**
- **api.js** = file sa frontend na siyang nagpapadala ng lahat ng request (may kasamang token).
- **Stateless** = bawat request standalone; kaya dala-dala ang token palagi.

---

## SLIDE 6 — DIVIDER: PART 1 (transition lang)

Sabihin mo lang: *"Magsisimula tayo sa pundasyon — ang disenyo ng database."*

---

## SLIDE 7 — 13 TABLES (Database Design)

**Sabihin mo:**
> "May 13 **tables** ang database namin, nakagrupo ayon sa silbi:
> **Core** (members, payments, attendance), **Reference** (plans, promos, expenses),
> **Reporting** (monthly_targets, bank_deposits), at **Security/System**
> (admins, sessions, login_attempts, activity_log, contract_counter)."

Huwag basahin lahat — ituro lang ang grupo.

**Jargon:**
- **Table** = parang isang sheet sa Excel; isang uri ng data (hal. lahat ng members).
- **Row (record)** = isang entry/linya sa table (hal. isang member).
- **Column (field)** = isang katangian (hal. full_name, age).
- **Schema** = ang kabuuang disenyo/balangkas ng database (lahat ng tables + relasyon).

---

## SLIDE 8 — ERD (How tables relate)

**Sabihin mo (basahin nang malakas ang relasyon):**
> "Isang **plan** → maraming **members**. Isang **member** → maraming **payments** at
> maraming **attendance**. At ang **walk-in** ay isang payment na may `member_id = NULL` —
> kaya isang table lang ang silbi sa member at bisita."

**Jargon:**
- **ERD (Entity Relationship Diagram)** = larawan na nagpapakita kung paano magkaugnay ang tables.
- **Primary Key (PK)** = natatanging ID kada row (hal. member_id). Walang dalawang magkapareho.
- **Foreign Key (FK)** = column na tumuturo sa PK ng ibang table (hal. members.plan_id → plans).
- **One-to-many** = isang record sa isang table, maraming kaugnay sa kabila (1 plan, maraming member).
- **NULL** = walang laman / walang value (hal. walk-in, walang member_id).

---

## SLIDE 9 — ENGINEERING DECISIONS (Mga ipinagmamalaki)

**6 na desisyon — pumili ka ng 2 kung minamadali (3NF + InnoDB):**

1. **Third Normal Form (3NF)** — naka-ayos ang tables para walang duplicate na data.
2. **InnoDB (hindi MyISAM)** — para may transactions at foreign keys.
3. **Foreign keys na may delete rules** — RESTRICT at CASCADE.
4. **Indexes** sa hot columns — para mabilis ang reports.
5. **Snapshot** ng presyo sa payments — 'di nababago ang lumang resibo.
6. **utf8mb4 charset** — tama ang ₱ at —.

**Jargon (importante 'to):**
- **Normalization** = pag-aayos ng tables para walang paulit-ulit na data at walang magulong update.
- **3NF (Third Normal Form)** = pinakakaraniwang antas ng normalization; "maayos" ang disenyo.
  - *Halimbawa:* ang presyo ng plan ay nasa `plans` lang; sa `members` may `plan_id` na FK lang —
    hindi inuulit ang presyo sa bawat member.
- **Storage engine** = ang panloob na makina ng MySQL kung paano iniimbak ang table.
- **InnoDB** = storage engine na may **transactions** + **foreign keys** (mas advanced).
- **MyISAM** = lumang storage engine na **walang** transactions/FK (kaya pinalitan namin).
- **Transaction** = grupo ng mga operasyon na **sabay-sabay** — kung mabigo ang isa, ba-back out lahat.
- **Foreign key constraint** = patakaran na pinaiiral ng database para hindi masira ang ugnayan.
- **ON DELETE RESTRICT** = bawal burahin ang plan kung may gumagamit pang member.
- **ON DELETE CASCADE** = pag binura ang member, kasama nang mabubura ang payments/attendance niya.
- **Index** = parang index ng libro — pampabilis ng paghahanap sa table.
- **Full table scan** = pagbabasa ng LAHAT ng rows (mabagal) kapag walang index.
- **Snapshot** = kinopyang halaga sa mismong oras ng bayad, para 'di na magbago kahit baguhin ang plan.
- **Charset / utf8mb4** = paraan ng pag-encode ng letra; kaya ng utf8mb4 ang ₱, —, emoji.

---

## SLIDE 10 — CODE LOGIC: time_in.php (ang hinihingi ng prof)

**Ang code (paliwanag mo line-by-line gamit ang numbered na nasa kanan ng slide):**

```php
// 1. Guard: timed-in na ba ngayong araw?
$check = $conn->prepare(
   "SELECT log_id FROM attendance
    WHERE member_id = :id
      AND DATE(time_in) = CURRENT_DATE()");
$check->execute([':id' => $member_id]);

if ($check->rowCount() > 0) {
    // 2. Meron na -> tanggihan
    echo '{"error":"Already timed in"}';
} else {
    // 3. Wala pa -> ipasok ang record
    $conn->prepare(
      "INSERT INTO attendance (member_id, time_in)
       VALUES (:id, NOW())")
     ->execute([':id' => $member_id]);
    echo '{"success":true}';
}
```

**Sabihin mo (4 na hakbang):**
1. **Guard SELECT muna** — tingnan kung may attendance record na si member ngayong araw,
   para hindi madoble.
2. **Kung meron na** (`rowCount() > 0`) → magbabalik ng error, hindi na magdadagdag.
3. **Kung wala pa** → **INSERT** ng bagong attendance row, gamit ang **`NOW()`** (kasalukuyang oras).
4. Ang **`:id`** ay **bound parameter** — kaya ligtas sa **SQL injection**.

**Jargon (line-by-line):**
- **`$conn`** = variable na may hawak ng **koneksyon** sa database (ang bukas na linya papuntang MySQL).
  - *("con" = connection. Galing sa `db.php` na nag-set up ng PDO connection.)*
- **`->prepare(...)`** = ihanda ang SQL na may placeholder (`:id`), bago patakbuhin.
- **`->execute([':id' => ...])`** = patakbuhin ang inihandang SQL, ipasok ang totoong value sa `:id`.
- **Prepared statement** = ang prepare + execute na pares; ligtas dahil hiwalay ang code sa data.
- **Bound parameter (`:id`)** = placeholder na pinapalitan ng **ligtas** na value — hindi idinidikit
  sa SQL string, kaya 'di mahack.
- **SQL injection** = atake kung saan ang masamang input ay nagiging utos sa database;
  napipigilan ng bound parameters.
- **`SELECT`** = SQL command para **kumuha/maghanap** ng data.
- **`INSERT`** = SQL command para **magdagdag** ng bagong row.
- **`WHERE`** = kondisyon — aling rows ang apektado.
- **`rowCount()`** = ilang rows ang tumugma sa query.
- **`NOW()`** = SQL function — kasalukuyang **petsa AT oras**.
- **`CURRENT_DATE()`** = SQL function — kasalukuyang **petsa** lang (walang oras).
- **`echo`** = utos sa PHP na **ilabas/ipakita** ang output (dito, JSON).
- **`json_encode()`** = PHP function na gagawing **JSON text** ang data (sa ibang files).

---

## ⭐ Kung tatanungin ka ng prof — sagot kaagad
- **"Bakit InnoDB?"** → May transactions at foreign keys; ang MyISAM wala nito.
- **"Normalized ba?"** → Oo, 3NF. Ang plan price nasa `plans` lang, FK lang sa members.
- **"Paano pinipigilan ang SQL injection?"** → Prepared statements na may bound parameters.
- **"Ano ang `$conn`?"** → Ang database connection object galing sa PDO sa `db.php`.
- **"Ano ang Vite/React?"** → React = library para sa screens; Vite = tool na nagpapatakbo nito.
