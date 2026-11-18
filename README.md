# Fitness Synergy — Gym Management System

A full-stack web application that runs a fitness gym end to end — members,
memberships, attendance, payments, and financial reporting — built with a
React front-end and a PHP/MySQL REST back-end.

> Architected and built by Marco Andrei R. Belen — system design, relational
> database, REST API, and React UI.

## Overview
Fitness Synergy replaces the disconnected spreadsheets and manual logs most
gyms rely on with a single, login-secured dashboard. Staff can register and
renew members, track attendance, manage plans/promos, record installment
payments and expenses, and pull revenue & attendance reports — all backed by a
normalized relational database with a full audit trail.

## Architecture
```text
[ React SPA (Vite) ]  ⇄  [ PHP REST API ]  ⇄  [ MySQL Database ]
      Frontend/               api/ + lib/       sql/schema.sql
```

- **Frontend** — React SPA (Vite) calling the API via `fetch` (`src/api.js`).
- **API** — PHP REST API in `api/` (one file per action) with shared helpers in `lib/`; token auth stored in the database
  (`login.php` / `auth_check.php`), CORS handling, and an audit log.
- **Database** — relational MySQL schema (`sql/schema.sql`; sample data in `sql/demo_seed.sql`).

## Features
- **Members & Memberships** — CRUD with photo upload/crop, plans, promos,
  walk-ins, renewals, and expiring-member alerts
- **Attendance** — time-in logging, live feed, attendance reports
- **Payments & Finance** — installments, expenses, bank deposits, monthly
  targets, revenue & branch sales reports
- **Admin & Security** — session login, admin profile/settings, activity/audit log
- **Extras** — TDEE calculator, printable receipts, light/dark theme

## Tech Stack
**Frontend:** React · Vite · JavaScript (JSX) · CSS
**Backend:** PHP (REST API) · token auth · file uploads (off on the public demo)
**Database:** MySQL · **Tooling:** ESLint · npm

## Getting Started

### Database
1. Create a MySQL database and import `sql/schema.sql`.
2. For sample data, also import `sql/demo_seed.sql` (login `demo` / `demo1234`). Never import a real backup into a public demo.

### Local (XAMPP)
1. Put the whole repo in `htdocs/` and copy `.env.example` to `.env` at the repo root with your DB credentials.
2. In `Frontend/`, create `.env.local` with `VITE_API_BASE=http://localhost/Fitness-Synergy/api`.
3. `cd Frontend && npm install && npm run dev`.

### Public demo (Vercel + TiDB Cloud)
`vercel.json` builds the React app and runs `api/*.php` with the community `vercel-php` runtime. Set these environment variables in the Vercel project: `DB_HOST`, `DB_PORT` (4000 for TiDB), `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_SSL=true`, `DEMO_MODE=1`, and `VITE_DEMO_LOGIN=demo / demo1234`.

## Author
**Marco Andrei R. Belen** — Computer Science student & Full Stack Web Developer

[Portfolio](https://marcobelen.vercel.app/) · [GitHub](https://github.com/codrei) · [LinkedIn](https://www.linkedin.com/in/marco-andrei-belen/)
