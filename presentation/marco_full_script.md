# MARCO — FULL PRESENTATION SCRIPT (Slides 1–14)

**Para 'to sa leader.** Dahil **walang tanong si Sir**, kailangang kompleto ang paliwanag —
i-pre-empt na lahat. Defense-style: bawisang bagay may **"ano" + "bakit" + "ano ang meron."**
Taglish. I-expand ang acronym sa unang banggit. **Huwag basahin — kwentuhin.**

> Tip: i-practice mo ito nang malakas 2–3 beses. Markahan mo kung saan ka huhinto (⏸).

---

## SLIDE 1 — TITLE

> "Magandang [hapon] po, Sir. Kami po ang grupong **M.G.A.B. Co.** Ang proyekto namin ay
> **Fitness Synergy** — isang **web application** na ginawa namin para sa isang totoong gym sa
> Lipa City. Dahil ang subject po natin ay Database Management, ang focus ng presentation namin
> ay kung paano namin dinisenyo at pinamahalaan ang **database** sa likod ng app na ito.
> Ako po si Marco, ang team lead, at ako ang mag-uumpisa sa pundasyon — ang **architecture** at
> ang **disenyo ng database**." ⏸

---

## SLIDE 2 — AGENDA (Sino-sino)

> "Hinati namin ang presentation sa apat, sumusunod sa **buhay ng data**: kung paano namin ito
> **dinisenyo**, kung paano ito **ipinapasok**, paano ito **ginagamit araw-araw**, at paano ito
> ginagawang **report** at **pinoprotektahan**. Ako po ang Foundation; si **Ariz** ang pagpasok ng
> data; si **Brix** ang daily operations; at si **Gabriel** ang reporting at security." ⏸

---

## SLIDE 3 — OVERVIEW (Ano ang sistema)

> "Ang Fitness Synergy po ay pumapalit sa lumang **pen-and-paper logbook** ng gym. Dito nirerehistro
> ang mga member at walk-in, tinatanggap ang bayad — kasama ang hulugan o **installment**,
> nita-track ang **attendance**, pinamamahalaan ang mga plan, promo, at gastos, at nakikita ang
> kita sa pamamagitan ng mga **report**. Lahat po ng ito, nakasalalay sa isang maayos na disenyong
> database — na siyang ipapakita ko ngayon." ⏸

---

## SLIDE 4 — THREE-TIER ARCHITECTURE ⭐ (isa sa pinaka-importante)

> "Pinili namin ang **three-tier architecture** — tatlong magkakahiwalay na layer — dahil sa
> prinsipyong **separation of concerns**: hiwalay ang presentation, ang logic, at ang data. Ang
> benepisyo: kaya naming baguhin ang isang layer nang hindi nasisira ang iba, at mas madaling
> i-secure dahil **iisang pinto** lang ang papasok sa data."

**(Ituro ang Frontend)**

> "Una, ang **Frontend** — ang nakikita ng user — gawa sa **React** at **Vite**. Pinili namin ang
> **React** dahil **component-based** ito: paulit-ulit naming nagagamit ang mga UI component tulad
> ng modals at tables, at mabilis ang update dahil sa **virtual DOM**, kaya hindi nire-reload ang
> buong page. Ginamit naming kasama ang **Vite** bilang build tool dahil mabilis ang development at
> may **code-splitting** sa production — ang mabibigat na bahagi tulad ng reports ay naka-**lazy
> load**, kaya mas mabilis mag-load ang app."

**(Ituro ang Backend)**

> "Pangalawa, ang **Backend** — gawa sa **PHP**, at ito ang aming **REST API**, ang
> **Application Programming Interface** o ang istruktura ng pag-uusap ng frontend at database.
> Sinadya naming **stateless** ito at **isang endpoint, isang responsibilidad** — humigit-kumulang
> 55 files, na nag-cha-check ng login at rules bago magpatakbo ng **SQL**, ang **Structured Query
> Language**. Pinili namin ang PHP dahil gumagana ito sa murang **shared hosting** na ginamit namin,
> at lahat ng query ay dumadaan sa **PDO** — **PHP Data Objects** — na may prepared statements, kaya
> protektado sa **SQL injection**."

**(Ituro ang Database)**

> "Pangatlo, ang **Database** — **MySQL**, partikular na **MariaDB** sa host. Pinili namin ang
> **relational database** dahil structured at magkaka-ugnay ang data namin — members, payments,
> plans, attendance. At gamit ang **InnoDB** engine, mayroon kaming **transactions** at **foreign
> keys** para sa integridad ng data."

**(Ituro ang navy box — TUMINDIG dito)** ⏸

> "At ito po ang pinakamahalaga: **walang direktang linya ang browser papunta sa database.**
> Pinipilit na dumaan ang lahat sa backend na nagva-validate at nag-cha-check ng login muna. Kahit
> i-bypass pa ng user ang interface, may pader pa rin sa server. **Ito ang pundasyon ng security
> namin.**" ⏸

> _(Transition)_ "Para konkreto, ipapakita ko kung paano talaga dumadaloy ang isang click."

---

## SLIDE 5 — ONE CLICK, END TO END

> "Ito po ang aktwal na nangyayari kapag pinindot ng staff ang **Time-In** — anim na hakbang.
> **Step 1**, pinindot sa browser. **Step 2**, ipinapadala ng **api.js** ang request, may kasamang
> **token** — ang patunay na naka-login — gamit ang **HTTP** at **JSON**, ang magaang text format
> ng data. **Step 3**, tinatanggap ng `time_in.php` at chini-check ang rules. **Step 4**, nagpapa-
> takbo ng **SQL**: `INSERT INTO attendance`. **Step 5**, ini-save ng MySQL ang isang row.
> **Step 6**, nagbabalik ng JSON na `{success: true}`, at nag-a-update ang screen."

**(Notable na desisyon — pang-pro)**

> "Isang totoong desisyon dito: sa halip na cookie, **`X-Auth-Token` header** ang ginamit namin —
> dahil natuklasan naming sinasala ng **LiteSpeed proxy** ng host ang standard na `Authorization`
> header. In-adapt namin sa constraint ng hosting." ⏸

**(Punchline — bagalan)**

> "Kaya sa kabuuan: **isang click, isang endpoint, isang SQL statement, isang row** — at pareho ang
> pattern na 'to sa lahat ng feature. Ito ang ibig sabihin ng **REST API**: predictable at consistent
> ang bawisang operasyon." ⏸

> _(Transition)_ "Ngayong alam na natin ang daloy, pumasok na tayo sa puso nito — ang database."

---

## SLIDE 6 — DIVIDER: PART 1

> "Magsisimula tayo sa pundasyon — ang disenyo ng aming database."

---

## SLIDE 7 — 13 TABLES

> "May **13 tables** ang database namin, hinati namin ayon sa silbi para mas malinaw. Ang **Core**
> ang pang-araw-araw na data — members, payments, attendance. Ang **Reference** ang lookup data na
> inaasahan ng sistema — plans, promos, expenses. Ang **Reporting** — monthly targets at bank
> deposits. At ang **Security at System** — admins, sessions, login attempts, activity log, at ang
> contract counter. Hindi po lahat ay babanggitin ko isa-isa; ang importante, **maayos ang pagkaka-
> grupo** ayon sa function." ⏸

---

## SLIDE 8 — ERD (Entity Relationship Diagram)

> "Ito ang aming **ERD** — **Entity Relationship Diagram** — nagpapakita kung paano magkaka-ugnay
> ang mga table. Ang koneksyon ay sa pamamagitan ng **foreign keys**. Halimbawa: **isang plan ay
> maraming members**; **isang member ay maraming payments at maraming attendance**. Ito ang tinatawag
> na **one-to-many** na relasyon."

**(Highlight — design decision)**

> "May isang matalinong desisyon dito: ang **walk-in** ay hindi gumagawa ng bagong member record —
> ini-store namin ito bilang **payment na may `member_id` na NULL**. Kaya **isang table lang ang
> nagsisilbi sa member at sa bisita** — isang source of truth para sa lahat ng pumapasok na pera." ⏸

---

## SLIDE 9 — ENGINEERING DECISIONS

> "Eto ang mga sinadyang desisyon sa disenyo na nagpapaiba sa system namin sa ordinaryong app:"
> "Una, **Third Normal Form** o **3NF** — naka-ayos ang tables para **walang duplicate na data**.
> Pangalawa, **InnoDB** sa halip na MyISAM, para may **transactions** at **foreign keys**. Pangatlo,
> **foreign keys na may delete rules**. Pang-apat, **indexes** para mabilis ang reports. Panlima,
> **snapshot** ng presyo sa payments para 'di mabago ang lumang resibo. At panghuli, **utf8mb4**
> charset para tama ang peso sign. Ipapakita ko po ngayon ang **aktwal na code** sa likod ng mga
> desisyong ito." ⏸

---

## SLIDE 10 — db.php (CONNECTION)

> "Ito po ang `db.php` — ang pundasyon, dahil **lahat ng PHP file ay dumadaan dito** para makakuha
> ng database connection. Pansinin: ang mga **credentials** — host, database name, username, password
> — ay galing sa hiwalay na **`.env` file**, hindi naka-sulat sa code mismo. Ito ay security
> practice — hindi naka-expose ang password sa source code."

> "Binubuksan namin ang **isang connection** gamit ang **PDO** — PHP Data Objects. Ang
> `charset=utf8mb4` ang dahilan kung bakit tama ang peso sign at dash. Ang `ERRMODE_EXCEPTION` ay
> para ang anumang database error ay **maipasa at ma-handle**, hindi tahimik na mabigo. At sinet
> namin ang time zone sa **+08:00** para tugma sa oras ng Pilipinas ang lahat ng petsa." ⏸

---

## SLIDE 11 — SCHEMA: members TABLE

> "Ito ang aktwal na **schema** ng `members` table — ang tinatawag na **DDL**, o **Data Definition
> Language**. Pansinin ang ilang desisyon: ang `member_id` ay **PRIMARY KEY** na **AUTO_INCREMENT**,
> kaya awtomatikong may natatanging ID ang bawisang member. Bawisang column ay may **tamang data
> type** — VARCHAR para sa text, TINYINT at INT para sa numero, DATE para sa petsa, at DECIMAL para
> sa pera."

> "Dalawang importanteng constraint dito: ang `gender` ay **ENUM** — `'Male','Female','Other'` lang
> ang tinatanggap, kaya walang maling data na makakapasok. At ang `contract_id` ay **UNIQUE** — ang
> database mismo ang humaharang na magkapareho ng FS number ang dalawang member." ⏸

---

## SLIDE 12 — KEYS & CONSTRAINTS (DATA INTEGRITY)

> "Ito ang nagpapatibay sa **integridad** ng data — mga **foreign key**. Ang foreign key ay
> column na tumutukoy sa ibang table, at **ang database mismo ang nag-e-enforce nito**, hindi ang
> app."

> "Halimbawa: ang `members.plan_id` ay tumutukoy sa `plans` — kaya **hindi mo maitatalaga ang isang
> member sa plan na wala**. At sa attendance at payments, ginamit namin ang **`ON DELETE CASCADE`** —
> kapag binura ang isang member, **awtomatikong nabubura rin** ang attendance at payments niya, kaya
> walang naiiwang orphan na record. Ito po ang **integridad sa antas ng database** — hindi ito kayang
> lusutan ng interface." ⏸

---

## SLIDE 13 — INDEXES (PERFORMANCE)

> "Para naman sa bilis, gumamit kami ng **indexes**. Ang index ay parang **index ng libro** — sa
> halip na basahin ng database ang buong table, dumiretso ito sa tamang rows. Kung walang index,
> bawisang query ay gumagawa ng **full table scan** — babasahin lahat ng rows, na bumabagal habang
> dumadami ang data."

> "Kaya in-index namin ang mga column na madalas pag-filter-an ng reports — `payment_date`,
> `member_id`, at `expiration_date`. At ang **UNIQUE index** sa `contract_id` ay may dobleng silbi:
> bukod sa bilis, ipinapatupad din nito na **walang duplicate na contract number**." ⏸

> _(Transition)_ "Para makita natin lahat ng 'to sa aksyon, ipakita ko ang isang totoong operasyon."

---

## SLIDE 14 — time_in.php (LOGIC IN ACTION)

> "Ito ang `time_in.php` — ang code kapag nag-time-in ang member. Pansinin ang **logic**: bago kami
> mag-insert, may **guard check** muna — isang `SELECT` na tumitingin kung **may attendance record
> na ba ang member na ito ngayong araw**. Kung mayroon na — `rowCount() > 0` — nagbabalik kami ng
> error at **hindi na nag-iinsert**, para walang dobleng time-in. Kung wala pa, saka lang kami
> nag-**`INSERT`** ng bagong row gamit ang `NOW()`, ang kasalukuyang petsa at oras."

> "At pansinin ang **security**: ang `:id` ay **bound parameter** — hiwalay ang halaga sa SQL text,
> kaya protektado sa **SQL injection**. Ito ang pattern na sinusunod sa lahat ng query namin." ⏸

> _(Hand-off)_ "Iyan po ang pundasyon — ang architecture at disenyo ng database. Ngayon, ipapakita
> ni **Ariz** kung paano talaga pumapasok ang isang totoong member sa database na ito."

---

## ⏱️ PACING GUIDE

- Slides 1–3: mabilis (~30 sec bawisa) — intro lang.
- Slide 4 at 5: dahan-dahan (~1.5 min bawisa) — pinaka-importante.
- Slides 7–9: katamtaman (~45 sec bawisa).
- Slides 10–14 (code): ~1 min bawisa — ituro mo ang code habang nagsasalita.
- **Kabuuan: ~10–12 minuto** para sa part mo.

## 🔑 3 TANDAAN

1. **"Ginamit namin ang X dahil Y, at ang meron dito ay Z."** — ito ang formula ng bawisang slide.
2. **Huminto (⏸) pagkatapos ng punchline.** Bigyan ng oras na lumubog.
3. **Tingnan si Sir, hindi ang screen.** Sulyap lang sa slide, balik agad sa kanya.
