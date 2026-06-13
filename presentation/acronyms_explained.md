# Acronyms & Terms — Spelled Out (Taglish)

Bawat abbreviation: **ano ang buong salita (bawat letra)** + **ano talaga ibig sabihin.**

---

## Mga ABBREVIATION (may tig-isang letra na kahulugan)

| Abbr. | Buong salita (bawat letra) | Kahulugan sa simpleng Taglish |
|-------|----------------------------|-------------------------------|
| **API** | **A**pplication **P**rogramming **I**nterface | Ang "pinto" o paraan kung paano nag-uusap ang dalawang programa. Parang **waiter** sa restaurant — siya ang tagapag-ugnay mo sa kusina. |
| **REST** | **RE**presentational **S**tate **T**ransfer | Isang istilo ng pag-design ng API: bawat URL = isang aksyon, JSON ang sagot. (Hindi mo na kailangang isaulo ang ibig sabihin ng letra — tandaan na lang: "malinis na istilo ng API.") |
| **HTTP** | **H**yper**T**ext **T**ransfer **P**rotocol | Ang "wika" o patakaran kung paano nag-uusap ang browser at server sa internet. |
| **JSON** | **J**ava**S**cript **O**bject **N**otation | Format ng data bilang text. Hal: `{"success": true}`. Madaling basahin ng tao at ng makina. |
| **SQL** | **S**tructured **Q**uery **L**anguage | Ang **wika** na ginagamit para makipag-usap sa database (hal. `SELECT`, `INSERT`). Binibigkas na "sequel" o "es-kyu-el". |
| **PHP** | **P**HP: **H**ypertext **P**reprocessor | Programming language ng backend. (Recursive ang pangalan — paikot, normal lang 'yan.) |
| **PDO** | **P**HP **D**ata **O**bjects | Ang feature ng PHP na ginagamit para **ligtas** na makausap ang database. |
| **DBMS** | **D**ata**B**ase **M**anagement **S**ystem | Ang software na namamahala ng database (hal. MySQL, MariaDB). |
| **CRUD** | **C**reate, **R**ead, **U**pdate, **D**elete | Ang 4 na basic na operasyon sa data: gumawa, magbasa, mag-edit, magbura. |
| **ERD** | **E**ntity **R**elationship **D**iagram | Larawan na nagpapakita ng tables at kung paano sila magkaugnay. |
| **PK** | **P**rimary **K**ey | Natatanging ID kada row (hal. `member_id`). Walang dalawang magkapareho. |
| **FK** | **F**oreign **K**ey | Column na tumuturo sa PK ng ibang table (hal. `members.plan_id` → `plans`). |
| **1NF / 2NF / 3NF** | **F**irst / **S**econd / **T**hird **N**ormal **F**orm | Mga antas ng "normalization" (pag-aayos ng database). **3NF** = pangatlong antas, pinaka-karaniwang target — "maayos, walang duplicate." |
| **UI** | **U**ser **I**nterface | Ang nakikita at pinipindot ng user (screens, buttons). |
| **SPA** | **S**ingle-**P**age **A**pplication | Web app na hindi nire-reload ang buong page kada click — mabilis ang dating. |
| **DB** | **D**ata**b**ase | Database (dinaglat lang). |
| **IDOR** | **I**nsecure **D**irect **O**bject **R**eference | Isang uri ng security bug: nakikita mo ang data ng iba sa pamamagitan ng paghula ng ID. |
| **IP** (address) | **I**nternet **P**rotocol | Ang "address" ng isang device sa internet (hal. `103.36.18.114`). |
| **CORS** | **C**ross-**O**rigin **R**esource **S**haring | Patakaran kung aling website ang pwedeng tumawag sa backend mo. |
| **ENV / .env** | **ENV**ironment file | File na may laman ng mga lihim na setting (hal. database password). |

---

## Mga TERMINO na HINDI abbreviation (pero madalas malito)

| Salita | Hindi ito abbreviation — ito ay… | Kahulugan |
|--------|----------------------------------|-----------|
| **fetch** | Isang **built-in na function** ng JavaScript | Ito ang utos na **"kumuha"** — nagpapadala ng request sa isang URL at naghihintay ng sagot. Sa `api.js`, may `apiFetch()` na bersyon na may dagdag na token. (Hindi ito daglat — English word lang na "kunin/kuhanin.") |
| **React** | Pangalan ng isang **library** | JavaScript library para sa frontend. Tinawag na "React" dahil "nag-re-react" / nag-a-update ang screen kapag nagbago ang data. |
| **Vite** | Pangalan ng isang **tool** | French word na "vite" = "mabilis." Build tool para sa frontend. Binibigkas na "veet." |
| **MySQL** | Pangalan ng **database system** | "My" + "SQL." (Ang "My" ay pangalan ng anak ng gumawa.) |
| **MariaDB** | Pangalan ng **database system** | Bersyon/fork ng MySQL. (Pinangalanan sa "Maria," anak din ng gumawa.) |
| **bcrypt** | Pangalan ng **hashing algorithm** | "b" + "crypt" (galing sa "encrypt"). Paraan ng pag-scramble ng password para 'di mabasa. |
| **InnoDB** | Pangalan ng **storage engine** | "Inno" (gal“innovation”) + "DB" (database). Ang makina ng MySQL na may transactions + FK. |
| **MyISAM** | Pangalan ng lumang **storage engine** | "My" + "ISAM" (Indexed Sequential Access Method). Walang transactions/FK. |
| **token** | English word | Random na string na patunay na naka-login ka. Parang digital wristband. |
| **NULL** | English/computing word | "Walang laman" / walang value. Hindi zero, hindi blangko — talagang wala. |
| **schema** | English/Greek word | Ang kabuuang disenyo/balangkas ng database (lahat ng tables + relasyon). |
| **query** | English word | Isang "tanong" o utos sa database (hal. isang `SELECT`). |
| **index** | English word | Parang index ng libro — pampabilis ng paghahanap sa table. |

---

## Halimbawa: paano gamitin sa pag-explain

Sa halip na sabihin lang "tumatawag ang frontend sa **API**," sabihin mo:
> "Tumatawag ang frontend sa **API** — ang **Application Programming Interface**, na parang
> waiter na nag-uugnay sa frontend at backend — gamit ang **fetch**, isang JavaScript
> function na ang ibig sabihin ay 'kumuha ng data sa server.'"

Ganyan — **buong salita + simpleng kahulugan**, para alam ng prof na talagang gets mo.
