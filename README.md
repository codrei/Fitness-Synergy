# 🏋️ Fitness Synergy — Gym Management System

A full-stack web application that runs a fitness gym end to end — members,
memberships, attendance, payments, and financial reporting — built with a
React front-end and a PHP/MySQL REST back-end.

> Architected and built by Marco Andrei R. Belen — system design, relational
> database, REST API, and React UI.

## 🧭 Overview
Fitness Synergy replaces the disconnected spreadsheets and manual logs most
gyms rely on with a single, login-secured dashboard. Staff can register and
renew members, track attendance, manage plans/promos, record installment
payments and expenses, and pull revenue & attendance reports — all backed by a
normalized relational database with a full audit trail.

## 🏗️ Architecture
```text
[ React SPA (Vite) ]  ⇄  [ PHP REST API ]  ⇄  [ MySQL Database ]
      Frontend/               Backend/          database_patch.sql
```

- **Frontend** — React SPA (Vite) calling the API via `fetch` (`src/api.js`).
- **Backend** — PHP REST API: one endpoint per action, session-based auth
  (`login.php` / `auth_check.php`), CORS handling, and an audit log.
- **Database** — relational MySQL schema (`Backend/database_patch.sql`).

## ✨ Features
- **Members & Memberships** — CRUD with photo upload/crop, plans, promos,
  walk-ins, renewals, and expiring-member alerts
- **Attendance** — time-in logging, live feed, attendance reports
- **Payments & Finance** — installments, expenses, bank deposits, monthly
  targets, revenue & branch sales reports
- **Admin & Security** — session login, admin profile/settings, activity/audit log
- **Extras** — TDEE calculator, printable receipts, light/dark theme

## 🛠️ Tech Stack
**Frontend:** React · Vite · JavaScript (JSX) · CSS
**Backend:** PHP (REST API) · session auth · file uploads
**Database:** MySQL · **Tooling:** ESLint · npm

## 🚀 Getting Started

### Backend
1. Create a MySQL database and import `Backend/database_patch.sql`.
2. Copy `Backend/.env.example` → `.env` and add your DB credentials.
3. Serve `Backend/` with PHP/Apache (e.g. XAMPP `htdocs`).

### Frontend
```bash
cd Frontend
npm install
npm run dev
```
Set the API base URL in `src/config.js` to point at your backend.

## 👤 Author
**Marco Andrei R. Belen** — Computer Science student & Full Stack Web Developer

[Portfolio](https://marcobelen.vercel.app/) · [GitHub](https://github.com/codrei) · [LinkedIn](https://www.linkedin.com/in/marco-andrei-belen/)
