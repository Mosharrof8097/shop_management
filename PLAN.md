# HardwareHub — SaaS দোকান ম্যানেজমেন্ট সিস্টেম

**Project:** HardwareHub  
**Type:** SaaS (Software as a Service) — Subscription Based  
**Target Users:** ছোট হার্ডওয়্যার, কাপড়, মুদি দোকান  
**Last Updated:** 2026-05-22  
**Owner / Super Admin:** Md. Mosharrof Hossain

---

## Vision (এক কথায়)

> একটাই app — হাজারো দোকান use করবে, প্রতি মাসে subscription দেবে।  
> আপনি (Mosharrof) সব control করবেন Super Admin হিসেবে।

---

## দুটি মূল Portal

```
┌──────────────────────────────────────────────────────────┐
│  PORTAL 1 — SUPER ADMIN (আপনি)                          │
│  app.hardwarehub.com/superadmin                         │
│  সব shop দেখা, subscription manage, shop block/unblock  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  PORTAL 2 — SHOP OWNER (দোকানদার)                       │
│  app.hardwarehub.com                                    │
│  POS, Products, Purchase, Reports, Customer Ledger      │
└──────────────────────────────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ STEP 0 — Project Foundation (DONE)
- Git repository, Docker Compose, folder structure
- PostgreSQL + Redis configured
- npm packages installed (React + Node.js)

### ✅ STEP 1 — Frontend UI/UX (DONE)
- সব 9টি page responsive design (Mobile + Desktop)
- Dashboard, POS, Products, Customers, Purchases, Reports, Settings
- Tailwind CSS, React Router, Mobile Bottom Nav

### ✅ STEP 2 — Database Setup (DONE)
- 14টি PostgreSQL table (SaaS-ready)
- Prisma ORM schema with indexes
- Seed data (shop, users, products, customers)
- Redis connection

### ✅ STEP 3 — Backend API (DONE)
- 25+ REST API endpoints
- JWT Authentication
- Role-based middleware
- Business logic: auto stock deduct, customer ledger, invoice generation

### ✅ STEP 4 — Frontend ↔ Backend Connection (DONE)
- Mock data সরিয়ে real API connected
- React Query (useQuery + useMutation)
- All 9 pages live data দেখাচ্ছে

---

## Remaining Steps — Roadmap

---

### ✅ STEP A — Super Admin Panel (DONE)
> **লক্ষ্য:** আপনি সব দোকান একটি panel থেকে control করবেন

#### Checkpoints:
- [x] **A.1** — Super Admin role database-এ যোগ (SUPER_ADMIN enum)
- [x] **A.2** — Super Admin login (আলাদা credentials)
- [x] **A.3** — `/superadmin/dashboard` — overview
- [x] **A.4** — `/superadmin/shops` — সব shop list
- [x] **A.5** — `/superadmin/shops/:id` — একটি shop detail
- [x] **A.6** — Subscription management

**✅ Verify:** Super Admin login → সব shop দেখা যাচ্ছে → shop block করলে সেই দোকান login করতে পারছে না

---

### 🔲 STEP B — Shop Registration System
> **লক্ষ্য:** নতুন দোকানদার নিজেই signup করতে পারবে

#### Checkpoints:
- [ ] **B.1** — Registration page UI
  - Shop name, owner name, email, password, phone
  - "আমি agree করছি" checkbox
- [ ] **B.2** — `POST /api/auth/register` endpoint
  - Shop row তৈরি (FREE plan, 14 days trial)
  - Admin User row তৈরি
  - Welcome email (optional)
- [ ] **B.3** — Trial period logic
  - নতুন shop পাবে 14 দিনের free trial
  - Trial শেষ হলে "Subscription নিন" screen দেখাবে
- [ ] **B.4** — Super Admin panel-এ নতুন signup notification

**✅ Verify:** নতুন email দিয়ে register → login → fresh dashboard দেখা যাচ্ছে → Super Admin panel-এ নতুন shop দেখা যাচ্ছে

---

### 🔲 STEP C — Subscription System
> **লক্ষ্য:** প্রতি মাসে দোকানদার payment করবে, expire হলে access বন্ধ

#### Subscription Plans:

| Plan | মূল্য | সুবিধা |
|------|-------|--------|
| FREE Trial | ৳০ | ১৪ দিন, সব feature |
| STARTER | ৳৪৯৯/মাস | সব feature, ১ user |
| PROFESSIONAL | ৳৯৯৯/মাস | সব feature, ৫ user (future) |

#### Checkpoints:
- [ ] **C.1** — Subscription expiry check middleware
  - প্রতি API request-এ check: shop active + subscription valid?
  - Expired হলে 403 → Frontend "Renew" page দেখাবে
- [ ] **C.2** — `/subscription/renew` page (shop owner)
  - bKash / Nagad payment number দেখাবে
  - "আমি payment করেছি" button → Super Admin-এ notification
- [ ] **C.3** — Super Admin manually subscription activate করবে
  - Shop select → Plan select → Expiry date set → Save
- [ ] **C.4** — Expiry warning (৭ দিন আগে)
  - Dashboard-এ banner: "আপনার subscription ৭ দিন পরে শেষ হবে"

**✅ Verify:** Subscription expire করা → Login blocked → Super Admin extend করা → আবার access

---

### 🔲 STEP D — Production Deployment
> **লক্ষ্য:** Real internet-এ live, যেকেউ use করতে পারবে

#### Checkpoints:
- [ ] **D.1** — Environment variables secure করা
- [ ] **D.2** — Backend deploy (Railway.app)
- [ ] **D.3** — Database deploy (Railway PostgreSQL)
- [ ] **D.4** — Frontend deploy (Vercel)
- [ ] **D.5** — Domain connect (hardwarehub.com.bd)
- [ ] **D.6** — SSL certificate (HTTPS)
- [ ] **D.7** — Production test (login → sale → invoice)

**✅ Verify:** Real URL-এ login → sale → invoice — সব কাজ করছে

---

### 🔲 STEP E — Multi-User Per Shop (Future Phase)
> **লক্ষ্য:** একটি দোকানে Manager + Cashier role যোগ করা  
> **কখন করবো:** STEP D সফল হলে, বেশি দোকান target করলে

#### Planned:
- [ ] **E.1** — Staff Management page (Settings-এ)
  - Staff যোগ করা, role assign করা
- [ ] **E.2** — Role-based sidebar (Cashier শুধু POS দেখবে)
- [ ] **E.3** — PROFESSIONAL plan-এ ৫ user পাবে
- [ ] **E.4** — Activity log (কে কখন কী করলো)

---

## Tech Stack (বর্তমান)

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| State | Zustand + React Query |
| PDF | jsPDF + html2canvas |
| Backend | Node.js + Express |
| Database | PostgreSQL 15 + Prisma ORM |
| Cache | Redis 7 |
| Auth | JWT (7 দিন expiry) |
| Hosting (plan) | Vercel (frontend) + Railway (backend + DB) |

---

## Database Architecture (SaaS-Ready)

```
সব table-এ shopId আছে — data সম্পূর্ণ আলাদা

Shop (tenant root)
 ├── User (shop staff)
 ├── Category
 ├── Product ──→ StockMovement
 ├── Customer ──→ CustomerTransaction
 ├── Sale ──→ SaleItem
 ├── Purchase ──→ PurchaseItem
 └── Expense

SubscriptionPlan: FREE | STARTER | PROFESSIONAL | ENTERPRISE
subscriptionEndsAt: expiry date
isActive: shop block/unblock
```

---

## User Roles (বর্তমান Phase)

```
SUPER_ADMIN (আপনি)
  └── সব shop control
  └── Subscription manage
  └── Shop block/unblock

ADMIN (Shop Owner)
  └── নিজের shop-এর সব access
  └── POS + Products + Purchase + Reports + Settings

---- পরের Phase (STEP E) ----

MANAGER → Report + Purchase দেখতে পারবে
CASHIER → শুধু POS
```

---

## Master Checkpoint (Quick Reference)

```
✅ STEP 0 — Foundation
✅ STEP 1 — Frontend UI
✅ STEP 2 — Database
✅ STEP 3 — API Endpoints
✅ STEP 4 — Frontend ↔ Backend
✅ STEP A — Super Admin Panel

🔲 STEP B — Shop Registration
   [x] B.1  [x] B.2  [x] B.3  [ ] B.4-verify

🔲 STEP C — Subscription System
   [x] C.1  [x] C.2  [ ] C.3-verify  [x] C.4

🔲 STEP D — Production Deploy
   [x] D.1  [ ] D.2  [ ] D.3  [x] D.4  [ ] D.5  [ ] D.6  [ ] D.7

🔲 STEP E — Multi-User (Future)
   [ ] E.1  [ ] E.2  [ ] E.3  [ ] E.4
```

**Total Remaining: 4 Steps | 21 Checkpoints**

---

## Business Model

```
আপনার আয়ের হিসাব:

১০ দোকান  × ৳৪৯৯ = ৳৪,৯৯০/মাস
৫০ দোকান  × ৳৪৯৯ = ৳২৪,৯৫০/মাস
১০০ দোকান × ৳৪৯৯ = ৳৪৯,৯০০/মাস
৫০০ দোকান × ৳৪৯৯ = ৳২,৪৯,৫০০/মাস

একবার বানান — বারবার আয় করুন।
```

---

*Plan updated: 2026-05-22 | Version: 2.0 | Focus: Super Admin + Shop Owner + Subscription*
