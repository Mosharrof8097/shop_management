# Hardware Store Management System — Full Architecture Plan

**Project:** HardwareHub — দোকান ম্যানেজমেন্ট সিস্টেম  
**Target:** Mobile + Laptop (Responsive PWA)  
**Date:** 2026-05-21  

---

## 1. সমস্যা (Problem Statement)

একটি হার্ডওয়্যার দোকানে ম্যানুয়ালি সব কিছু ট্র্যাক করা কঠিন:
- কোন প্রোডাক্ট কতটুকু স্টকে আছে বোঝা যায় না
- বাকি (credit) কার কাছে কত আছে হিসাব নেই
- মাসে কত আয় হলো সহজে বের করা যায় না
- Invoice হাতে লিখতে হয়
- একটা জায়গায় সব দেখার উপায় নেই

---

## 2. সমাধান (Solution Overview)

একটি **Single Web Application (PWA)** যেটা:
- Mobile-এ browser দিয়ে চলবে (app install ছাড়াই)
- Laptop/Desktop-এও একই সাইট কাজ করবে
- Internet ছাড়াও basic কাজ করবে (offline support)
- PDF invoice generate করবে
- সব data এক জায়গায় থাকবে

---

## 3. Core Features (কী কী থাকবে)

### 3.1 Product & Stock Management
- [ ] প্রোডাক্ট যোগ করা (নাম, SKU, ক্যাটাগরি, দাম, ছবি)
- [ ] স্টক পরিমাণ সেট করা
- [ ] **Auto Stock Deduct** — বিক্রি হলে স্বয়ংক্রিয়ভাবে স্টক কমবে
- [ ] Low Stock Alert — নির্দিষ্ট পরিমাণের নিচে গেলে সতর্কতা
- [ ] Stock-in entry (নতুন মাল আসলে)
- [ ] Stock history (কখন কত আসল / গেল)
- [ ] Barcode/QR scan support (mobile camera দিয়ে)
- [ ] Category management (রড, সিমেন্ট, রং, পেরেক, ইত্যাদি)

### 3.2 Sales (বিক্রি)
- [ ] POS-style বিক্রির পর্দা (product খুঁজে cart-এ add)
- [ ] একাধিক প্রোডাক্ট একসাথে বিক্রি
- [ ] বিক্রির সময় discount দেওয়ার সুবিধা
- [ ] Cash / বাকি (credit) — পেমেন্ট ধরন
- [ ] Customer assign করা (কার কাছে বাকি)
- [ ] Auto Invoice number generate
- [ ] Sale সম্পন্ন হলে স্টক auto কমবে

### 3.3 Invoice & PDF
- [ ] প্রতিটি বিক্রিতে Invoice তৈরি হবে
- [ ] Invoice-এ দোকানের নাম, ঠিকানা, ফোন থাকবে
- [ ] Product list, quantity, rate, total থাকবে
- [ ] **PDF Download / Print** বাটন
- [ ] WhatsApp-এ PDF শেয়ার করার সুবিধা (mobile)
- [ ] Invoice template customize করা যাবে

### 3.4 Customer & বাকি (Credit) Management
- [ ] Customer list (নাম, ফোন, ঠিকানা)
- [ ] প্রতি customer-এর বাকির হিসাব
- [ ] বাকি পরিশোধ করলে update হবে
- [ ] বাকির statement PDF
- [ ] SMS/WhatsApp reminder (future feature)
- [ ] Customer-wise purchase history

### 3.5 Purchase / Supplier Management
- [ ] Supplier (সরবরাহকারী) list
- [ ] কোন supplier থেকে কী কিনলাম — entry
- [ ] Purchase invoice record
- [ ] Supplier-এর কাছে কত বাকি আছে
- [ ] Purchase history

### 3.6 Income & Expense (আয়-ব্যয়)
- [ ] Daily income summary
- [ ] Monthly income summary
- [ ] Expense entry (দোকান ভাড়া, বিদ্যুৎ, কর্মচারী বেতন)
- [ ] Net profit calculation (income - expense - purchase cost)
- [ ] Cash drawer tracking

### 3.7 Reports & Dashboard
- [ ] Dashboard: আজকের বিক্রি, মোট স্টক, মোট বাকি
- [ ] Sales report (daily / weekly / monthly / custom date)
- [ ] Best selling products
- [ ] Low stock report
- [ ] Profit & Loss report
- [ ] Customer ledger report
- [ ] **সব report PDF export করা যাবে**

### 3.8 Settings & Multi-user
- [ ] দোকানের নাম, ঠিকানা, logo সেট করা
- [ ] User roles: Admin (মালিক), Manager, Cashier
- [ ] প্রতিটি user-এর আলাদা access
- [ ] Activity log (কে কী করল)

---

## 4. Technical Architecture (প্রযুক্তি কাঠামো)

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                      │
│  React.js PWA (Mobile + Desktop Responsive)         │
│  - Tailwind CSS (mobile-first design)               │
│  - React Query (data fetching + caching)            │
│  - Zustand (state management)                       │
│  - React-to-PDF / jsPDF (PDF generation)            │
│  - Workbox (offline support)                        │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS / REST API
┌─────────────────▼───────────────────────────────────┐
│                  API LAYER                          │
│  Node.js + Express.js (or FastAPI/Python)           │
│  - JWT Authentication                               │
│  - Role-based Access Control (RBAC)                 │
│  - Input validation (Zod / Joi)                     │
│  - Rate limiting                                    │
│  - File upload (product images)                     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               DATABASE LAYER                        │
│  PostgreSQL (Primary Database)                      │
│  - Structured data, transactions                    │
│  Redis (Cache + Sessions)                           │
│  - Fast dashboard queries                           │
│  - Session storage                                  │
│  Cloudinary / Local Storage                         │
│  - Product images                                   │
└─────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology | কারণ |
|-------|-----------|------|
| Frontend | React.js + Vite | Fast, component-based, PWA support |
| Styling | Tailwind CSS | Mobile-first, responsive সহজে |
| State | Zustand + React Query | Simple, powerful |
| PDF | jsPDF + html2canvas | Client-side PDF, free |
| Backend | Node.js + Express | Fast API development |
| Auth | JWT + bcrypt | Secure, stateless |
| Database | PostgreSQL | Reliable, ACID transactions |
| ORM | Prisma | Type-safe DB queries |
| Cache | Redis | Fast dashboard data |
| Hosting | VPS (DigitalOcean/Hostinger) বা Railway | Affordable |

---

## 5. Database Schema (ডেটাবেজ কাঠামো)

```sql
-- দোকানের তথ্য
Shop { id, name, address, phone, logo, currency }

-- ব্যবহারকারী
User { id, shop_id, name, email, password_hash, role, is_active }

-- ক্যাটাগরি
Category { id, shop_id, name, description }

-- প্রোডাক্ট
Product {
  id, shop_id, category_id,
  name, sku, barcode,
  purchase_price, selling_price,
  current_stock, min_stock_alert,
  unit, image_url, is_active
}

-- স্টক মুভমেন্ট (history)
StockMovement {
  id, product_id, type (IN/OUT/ADJUST),
  quantity, previous_stock, new_stock,
  reference_id, note, created_by, created_at
}

-- কাস্টমার
Customer { id, shop_id, name, phone, address, total_due }

-- সাপ্লায়ার
Supplier { id, shop_id, name, phone, address, total_due }

-- বিক্রির হেডার
Sale {
  id, shop_id, invoice_no, customer_id,
  subtotal, discount, tax, total,
  paid_amount, due_amount,
  payment_type (CASH/CREDIT/PARTIAL),
  sale_date, created_by, notes
}

-- বিক্রির আইটেম
SaleItem {
  id, sale_id, product_id,
  quantity, unit_price, discount, total
}

-- পেমেন্ট (বাকি পরিশোধ)
Payment {
  id, sale_id, customer_id,
  amount, payment_date, method, note
}

-- ক্রয় (purchase)
Purchase {
  id, shop_id, supplier_id,
  invoice_no, total, paid, due,
  purchase_date, created_by
}

-- ক্রয়ের আইটেম
PurchaseItem { id, purchase_id, product_id, quantity, unit_cost, total }

-- খরচ
Expense {
  id, shop_id, category, amount,
  description, expense_date, created_by
}
```

---

## 6. API Endpoints (প্রধান)

```
AUTH
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

PRODUCTS
GET    /api/products              (list, search, filter)
POST   /api/products              (create)
PUT    /api/products/:id          (update)
DELETE /api/products/:id
GET    /api/products/:id/stock-history

SALES
GET    /api/sales                 (list with filters)
POST   /api/sales                 (create sale → auto stock deduct)
GET    /api/sales/:id             (detail + invoice data)
GET    /api/sales/:id/pdf         (generate PDF invoice)

CUSTOMERS
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id/ledger  (বাকির হিসাব)
POST   /api/payments              (বাকি পরিশোধ)

PURCHASES
GET    /api/purchases
POST   /api/purchases             (create → auto stock add)

REPORTS
GET    /api/reports/dashboard     (today's summary)
GET    /api/reports/sales         (?from=&to=&group_by=day|month)
GET    /api/reports/profit-loss   (?month=&year=)
GET    /api/reports/low-stock
GET    /api/reports/top-products
```

---

## 7. Folder Structure (প্রজেক্ট কাঠামো)

```
hardwaremanagement/
├── client/                          # Frontend (React PWA)
│   ├── public/
│   │   └── manifest.json            # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Modal, Table
│   │   │   ├── layout/              # Sidebar, Navbar, MobileMenu
│   │   │   ├── invoice/             # InvoicePDF, InvoicePreview
│   │   │   └── charts/              # SalesChart, StockChart
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products/            # List, Add, Edit
│   │   │   ├── Sales/               # POS, History, InvoiceView
│   │   │   ├── Customers/           # List, Ledger
│   │   │   ├── Purchases/           # List, Add
│   │   │   ├── Reports/             # Sales, Stock, Profit
│   │   │   └── Settings/            # Shop, Users
│   │   ├── hooks/                   # useProducts, useSales, etc.
│   │   ├── services/                # API call functions
│   │   ├── store/                   # Zustand stores
│   │   └── utils/                   # pdf.js, format.js, barcode.js
│   └── package.json
│
├── server/                          # Backend (Node.js)
│   ├── src/
│   │   ├── routes/                  # auth, products, sales, etc.
│   │   ├── controllers/
│   │   ├── middleware/              # auth, rbac, validation
│   │   ├── services/                # business logic
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Database schema
│   │   └── utils/                   # pdf-generator, helpers
│   ├── .env
│   └── package.json
│
├── docker-compose.yml               # PostgreSQL + Redis local setup
├── PLAN.md                          # এই ফাইল
└── README.md
```

---

## 8. Mobile Experience (মোবাইল UX)

```
মোবাইল স্ক্রিনে:
┌──────────────────┐
│ HardwareHub   ☰  │  ← hamburger menu
├──────────────────┤
│  আজকের বিক্রি   │
│   ৳ ৪৫,২০০     │
├──────────────────┤
│ 🛒 নতুন বিক্রি  │  ← বড় বাটন
│ 📦 স্টক দেখুন  │
│ 👤 কাস্টমার    │
│ 📊 রিপোর্ট     │
└──────────────────┘

Bottom Navigation Bar (mobile):
[🏠 Home] [🛒 Sale] [📦 Stock] [📊 Report]
```

---

## 9. Development Phases (ধাপে ধাপে বানানো)

### Phase 1 — MVP (4-6 সপ্তাহ) ★ এটা আগে করো
**লক্ষ্য:** দোকান চালু রাখার জন্য মিনিমাম যা দরকার

- [x] Project setup (React + Node + PostgreSQL)
- [ ] Authentication (login/logout)
- [ ] Product CRUD + Stock management
- [ ] Basic Sales (POS screen)
- [ ] Auto stock deduction on sale
- [ ] PDF Invoice generation
- [ ] Customer + বাকি tracking
- [ ] Simple Dashboard

### Phase 2 — Core Features (3-4 সপ্তাহ)
- [ ] Purchase management (supplier + stock-in)
- [ ] Expense tracking
- [ ] Monthly income/profit report
- [ ] Low stock alerts
- [ ] Stock history

### Phase 3 — Advanced (3-4 সপ্তাহ)
- [ ] Barcode/QR scan (mobile camera)
- [ ] Multi-user with roles
- [ ] Advanced reports + charts
- [ ] PDF reports (monthly summary)
- [ ] WhatsApp share integration
- [ ] Offline mode (PWA)

### Phase 4 — Polish & Scale
- [ ] Backup & restore
- [ ] Multi-branch support (একাধিক দোকান)
- [ ] Bulk import/export (Excel)
- [ ] SMS/WhatsApp auto reminder for বাকি

---

## 10. Hosting Plan (কোথায় রাখবো)

### Option A — সস্তা শুরু (Recommended)
```
Frontend:  Vercel (Free)
Backend:   Railway.app (~$5/month)
Database:  Railway PostgreSQL (included)
Total:     ~$5-10/month
```

### Option B — নিজের VPS
```
VPS:       Hostinger VPS ($5/month) বা DigitalOcean ($6/month)
Setup:     Docker + Nginx + SSL (Let's Encrypt)
Total:     ~$5-6/month
সুবিধা:   সব control নিজের কাছে
```

---

## 11. Security Checklist

- [ ] JWT token expiry + refresh token
- [ ] Password hashing (bcrypt)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] Rate limiting on API
- [ ] HTTPS only
- [ ] Input sanitization
- [ ] Role-based access (মালিক ≠ cashier)
- [ ] Daily database backup

---

## 12. Quick Start — প্রথমে কী করবো?

```bash
# Step 1: Project initialize
mkdir hardwaremanagement && cd hardwaremanagement
git init

# Step 2: Backend setup
mkdir server && cd server
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken
npm install -D nodemon

# Step 3: Frontend setup
cd ..
npm create vite@latest client -- --template react
cd client
npm install axios react-router-dom @tanstack/react-query zustand
npm install -D tailwindcss

# Step 4: Database (Docker দিয়ে local)
docker run --name hw-postgres -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres
```

---

## 13. Invoice PDF Template (কেমন দেখাবে)

```
┌────────────────────────────────────────────┐
│          মেসার্স রহিম হার্ডওয়্যার          │
│     ৫৬ মিরপুর রোড, ঢাকা | ০১৭XX-XXXXXX   │
├────────────────────────────────────────────┤
│  Invoice No: INV-2026-00423                │
│  Date: 21/05/2026   Customer: করিম সাহেব  │
├──────────┬──────┬──────────┬──────────────┤
│ পণ্যের নাম│ পরিমাণ│ একক মূল্য│    মোট      │
├──────────┼──────┼──────────┼──────────────┤
│ সিমেন্ট  │  10  │  ৳ 480  │   ৳ 4,800   │
│ রড ১২mm  │   5  │  ৳ 720  │   ৳ 3,600   │
│ পেরেক ১" │   2  │  ৳ 150  │   ৳ 300     │
├──────────┴──────┴──────────┼──────────────┤
│                   মোট      │   ৳ 8,700   │
│                  ছাড়       │   ৳ 200     │
│               পরিশোধ       │   ৳ 5,000   │
│                  বাকি       │   ৳ 3,500   │
└────────────────────────────────────────────┘
         ধন্যবাদ, আবার আসবেন!
```

---

## 14. Estimated Timeline

| Phase | কাজ | সময় |
|-------|-----|------|
| Setup | Project init, DB, Auth | ১ সপ্তাহ |
| Phase 1 | MVP — Product, Sale, Invoice | ৩-৪ সপ্তাহ |
| Phase 2 | Purchase, Expense, Reports | ২-৩ সপ্তাহ |
| Phase 3 | Barcode, Multi-user, Offline | ৩ সপ্তাহ |
| **মোট** | | **৯-১১ সপ্তাহ** |

---

## 15. সারসংক্ষেপ (Summary)

**যা বানাবো:** একটি Responsive PWA (React + Node + PostgreSQL)  
**কোথায় চলবে:** Mobile browser + Laptop browser — একই app  
**মূল সুবিধা:**
1. স্টক auto update হবে বিক্রির সাথে সাথে
2. PDF invoice তৈরি হবে, WhatsApp-এ পাঠানো যাবে
3. বাকির হিসাব সহজে দেখা যাবে
4. মাসিক আয়-ব্যয় report PDF-এ পাওয়া যাবে
5. Mobile-এ barcode scan করে product খোঁজা যাবে
6. মালিক, ম্যানেজার, ক্যাশিয়ার — আলাদা access

**খরচ:** মাসে ৳ ৪৫০-৮৫০ (hosting)

---

*Plan created: 2026-05-21 | Version: 1.0*

---

## 16. Product Sales Analytics — কোন পণ্য বেশি/কম বিক্রি হচ্ছে

### সমস্যা
দোকান মালিক জানতে পারেন না কোন পণ্য বেশি চলছে এবং কোনটা স্টকে পড়ে আছে। এর ফলে:
- বেশি চলা পণ্যের stock শেষ হয়ে যায়
- কম চলা পণ্য মূলধন আটকে রাখে
- কোন পণ্যে বেশি invest করবেন বুঝতে পারেন না

### সমাধান
`SaleItem` table থেকে aggregate করে product-wise বিক্রির তথ্য বের করা।

---

### Database Query Logic

```sql
-- Top selling products (বেশি বিক্রি হচ্ছে)
SELECT
  p.id, p.name, p.sku, p.unit,
  c.name AS category,
  SUM(si.quantity)    AS total_sold,
  SUM(si.total)       AS total_revenue
FROM SaleItem si
JOIN Product  p ON si.product_id = p.id
JOIN Category c ON p.category_id = c.id
JOIN Sale     s ON si.sale_id    = s.id
WHERE s.sale_date BETWEEN :from_date AND :to_date
GROUP BY p.id, c.name
ORDER BY total_sold DESC
LIMIT :limit;   -- default 10

-- Slow moving products (কম বিক্রি হচ্ছে)
SELECT
  p.id, p.name, p.sku, p.unit,
  p.current_stock,
  COALESCE(SUM(si.quantity), 0) AS total_sold,
  COALESCE(SUM(si.total),    0) AS total_revenue
FROM Product p
LEFT JOIN SaleItem si ON p.id = si.product_id
LEFT JOIN Sale     s  ON si.sale_id = s.id
  AND s.sale_date BETWEEN :from_date AND :to_date
WHERE p.is_active = true
GROUP BY p.id
ORDER BY total_sold ASC
LIMIT :limit;   -- default 10

-- নির্দিষ্ট পণ্যের বিক্রির trend (দিন/সপ্তাহ/মাস ভিত্তিক)
SELECT
  DATE_TRUNC(:group_by, s.sale_date) AS period,
  SUM(si.quantity)                   AS total_sold,
  SUM(si.total)                      AS total_revenue
FROM SaleItem si
JOIN Sale s ON si.sale_id = s.id
WHERE si.product_id = :product_id
  AND s.sale_date BETWEEN :from_date AND :to_date
GROUP BY period
ORDER BY period ASC;
```

---

### নতুন API Endpoints

```
GET /api/reports/top-products
    ?from=2026-05-01&to=2026-05-31&limit=10&sort=quantity|revenue

GET /api/reports/slow-products
    ?from=2026-05-01&to=2026-05-31&limit=10

GET /api/reports/product-trend/:product_id
    ?from=2026-05-01&to=2026-05-31&group_by=day|week|month
```

**Response Example (`/api/reports/top-products`):**
```json
{
  "period": { "from": "2026-05-01", "to": "2026-05-31" },
  "sort_by": "quantity",
  "data": [
    {
      "rank": 1,
      "product_id": "uuid-xxx",
      "name": "সিমেন্ট",
      "sku": "CEM-001",
      "category": "Building Materials",
      "unit": "বস্তা",
      "total_sold": 480,
      "total_revenue": 230400
    }
  ]
}
```

---

### Prisma Query (Controller-এ)

```typescript
// Top selling products
const topProducts = await prisma.$queryRaw`
  SELECT p.id, p.name, p.sku, p.unit,
         SUM(si.quantity)::int  AS total_sold,
         SUM(si.total)::float   AS total_revenue
  FROM "SaleItem" si
  JOIN "Product"  p ON si.product_id = p.id
  JOIN "Sale"     s ON si.sale_id    = s.id
  WHERE s.sale_date BETWEEN ${from}::date AND ${to}::date
  GROUP BY p.id
  ORDER BY total_sold DESC
  LIMIT ${limit}
`;
```

---

### Dashboard Widget (Phase 1-এ add করবো)

Dashboard-এ একটি ছোট widget থাকবে:

```
📊 এই মাসের সেরা পণ্য
┌─────────────────────────────────┐
│ 🥇 সিমেন্ট     ৪৮০ বস্তা  ৳২.৩L│
│ 🥈 রড ১২mm     ৩২০ পিস    ৳১.১L│
│ 🥉 বালি        ২৮০ ব্যাগ  ৳০.৮L│
│ ──────────────────────────────  │
│ ⚠️ কম চলছে: গ্রিল কাটার (২ পিস)│
└─────────────────────────────────┘
       [সব রিপোর্ট দেখুন →]
```

---

### Frontend Files

```
client/src/pages/Reports/
└── ProductSales.jsx          # Full analytics page

client/src/components/charts/
└── ProductAnalyticsChart.jsx # Bar chart (Recharts)

client/src/hooks/
└── useProductAnalytics.js    # React Query hooks

client/src/services/
└── reports.js                # API calls
```

---

### Implementation Phase

এই feature **Phase 3**-এ implement হবে (Advanced Features section)।

তবে Dashboard widget (top 5 summary) **Phase 1 MVP**-তেই যোগ করা যাবে
কারণ API `/api/reports/top-products` Phase 2-তেই তৈরি হবে।

| Task | Phase |
|------|-------|
| API endpoint তৈরি | Phase 2 |
| Dashboard widget (top 5) | Phase 2 |
| Full analytics page + charts | Phase 3 |
| PDF export of analytics | Phase 3 |

---

## 17. সম্পূর্ণ Implementation Checkpoint Plan

> **প্রতিবার কাজ শুরু করার আগে এই section দেখুন। কোন checkpoint-এ আছেন চেক করুন।**

### 6টি বড় ধাপ (Master Steps)

```
STEP 0 → Project Foundation (git, docker, npm setup)
STEP 1 → Frontend UI/UX (Design only, mock data)
STEP 2 → Backend Database (PostgreSQL + Prisma)
STEP 3 → Backend API Endpoints (Express routes)
STEP 4 → Full Connection (Frontend ↔ API ↔ Database)
STEP 5 → Localhost Testing (সব কিছু একসাথে চালানো)
STEP 6 → Industry Deployment (Production live করা)
```

---

### STEP 0 — Project Foundation Setup
> একবারই করতে হবে। পুরো প্রজেক্টের ভিত্তি।

- [ ] **CP-0.1** — Git repository initialize
  ```bash
  git init
  echo "node_modules/\n.env\ndist/" > .gitignore
  ```
- [ ] **CP-0.2** — Folder structure তৈরি (`client/` এবং `server/`)
- [ ] **CP-0.3** — `docker-compose.yml` তৈরি (PostgreSQL + Redis local)
- [ ] **CP-0.4** — Server dependencies install
  ```bash
  cd server && npm init -y
  npm install express prisma @prisma/client bcryptjs jsonwebtoken cors helmet zod
  ```
- [ ] **CP-0.5** — Client scaffold with Vite
  ```bash
  npm create vite@latest client -- --template react
  cd client && npm install
  npm install -D tailwindcss postcss autoprefixer
  npm install axios react-router-dom @tanstack/react-query zustand recharts jspdf html2canvas
  ```

**✅ Verify:** `docker-compose up -d` → PostgreSQL + Redis চলছে

---

### STEP 1 — Frontend UI/UX (Mock Data দিয়ে)
> API ছাড়াই শুধু design। Mobile-first, Tailwind, Responsive।

- [ ] **CP-1.1** — Layout Shell (Sidebar, Navbar, MobileBottomNav, AppLayout, React Router)
- [ ] **CP-1.2** — Reusable UI Components (Button, Input, Modal, Table, Card, Badge, Spinner)
- [ ] **CP-1.3** — Dashboard Page (stat cards + bar chart + recent sales — mock data)
- [ ] **CP-1.4** — Products Pages (List, Add/Edit form, Stock history)
- [ ] **CP-1.5** — Sales / POS Page (product search, cart, payment, complete sale)
- [ ] **CP-1.6** — Invoice PDF Component (template + jsPDF generate + download/print)
- [ ] **CP-1.7** — Customer Pages (List, Add/Edit, Ledger/বাকির হিসাব)
- [ ] **CP-1.8** — Purchase Pages (List, Add form)
- [ ] **CP-1.9** — Reports Pages (SalesReport, ProductSales top/slow, ProfitLoss)
- [ ] **CP-1.10** — Auth Page (Login form + protected route wrapper)
- [ ] **CP-1.11** — Responsive Check (Mobile 375px, Tablet 768px, Desktop 1280px)

**✅ Verify:** `npm run dev` → সব page browser-এ দেখা যাচ্ছে, mobile-এও ঠিকঠাক

---

### STEP 2 — Backend Database Setup
> PostgreSQL + Prisma ORM। কোনো API নেই এখনো।

- [ ] **CP-2.1** — Express server base (`server/src/index.js` → port 5000 চলছে)
- [ ] **CP-2.2** — Prisma schema তৈরি (সব 13টি model: Shop, User, Category, Product, StockMovement, Customer, Supplier, Sale, SaleItem, Payment, Purchase, PurchaseItem, Expense)
- [ ] **CP-2.3** — Migration run (`npx prisma migrate dev --name init` → 13 table তৈরি)
- [ ] **CP-2.4** — Seed data (1 Shop, 1 Admin, 5 Category, 20 Product, 3 Customer)
- [ ] **CP-2.5** — Redis connection setup (`redis.ping()` → "PONG")

**✅ Verify:** `npx prisma studio` → সব table + data দেখা যাচ্ছে

---

### STEP 3 — Backend API Endpoints
> প্রতিটি route group আলাদা। Postman দিয়ে test করা।

- [ ] **CP-3.1** — Auth routes (`POST /api/auth/login`, `GET /api/auth/me`) + JWT middleware + RBAC middleware
- [ ] **CP-3.2** — Product routes (CRUD + stock-history)
- [ ] **CP-3.3** — Sales routes ⭐ (`POST /api/sales` → SaleItem save + **stock auto কমবে** + invoice number generate)
- [ ] **CP-3.4** — Customer routes (CRUD + ledger + `POST /api/payments` → due কমবে)
- [ ] **CP-3.5** — Purchase routes (`POST /api/purchases` → **stock auto বাড়বে**)
- [ ] **CP-3.6** — Report routes (dashboard summary, sales, top-products, slow-products, profit-loss, low-stock)
- [ ] **CP-3.7** — Zod validation সব POST/PUT route-এ

**✅ Verify:** Postman-এ সব endpoint 200 response দিচ্ছে

---

### STEP 4 — Frontend ↔ Backend Connection
> STEP 1-এর mock data সরিয়ে real API connect করা।

- [ ] **CP-4.1** — API service layer (`services/api.js` Axios instance + JWT header, `services/auth.js`, products.js, sales.js, customers.js, reports.js)
- [ ] **CP-4.2** — Auth flow (Login → JWT localStorage → protected routes → logout)
- [ ] **CP-4.3** — Products real data (useQuery + useMutation → list auto refresh)
- [ ] **CP-4.4** — POS Sales live (product search → sale submit → stock কমছে → invoice number আসছে)
- [ ] **CP-4.5** — PDF Invoice real data (sale complete → InvoiceView → jsPDF → download)
- [ ] **CP-4.6** — Dashboard live charts (real API data → stat cards + charts)
- [ ] **CP-4.7** — Reports live (top/slow products → Recharts bar chart)

**✅ Verify:** Browser-এ login → sale → stock কমেছে → invoice download — full flow কাজ করছে

---

### STEP 5 — Localhost Full Testing

- [ ] **CP-5.1** — Basic flow (login, product add, POS sale, invoice download, customer credit, payment)
- [ ] **CP-5.2** — Reports test (dashboard today's sale, top/slow products chart, date filter)
- [ ] **CP-5.3** — Mobile responsive test (Chrome DevTools iPhone size)
- [ ] **CP-5.4** — Edge cases (stock 0 → sale block, invalid login, empty form validation)
- [ ] **CP-5.5** — Performance (100+ product list smooth, dashboard < 2s load)

**✅ Verify:** সব feature localhost-এ কাজ করছে, কোনো bug নেই

---

### STEP 6 — Industry-Level Deployment

- [ ] **CP-6.1** — Production env prep (strong JWT_SECRET, `.env.production` files, `.gitignore` check)
- [ ] **CP-6.2** — Database production (Railway.app PostgreSQL + Redis + `prisma migrate deploy` + seed)
- [ ] **CP-6.3** — Backend deploy Railway (`https://hardwarehub-api.railway.app` live)
- [ ] **CP-6.4** — Frontend deploy Vercel (`npm run build` → Vercel import → `https://hardwarehub.vercel.app` live)
- [ ] **CP-6.5** — Custom domain + SSL (optional)
- [ ] **CP-6.6** — Production safety check (HTTPS, login, sale, PDF, mobile)
- [ ] **CP-6.7** — Monitoring (Railway logs + UptimeRobot + daily DB backup)

**✅ Verify:** Production URL-এ login → sale → invoice → সব কাজ করছে

---

### Master Checkpoint Summary (Quick Reference)

```
STEP 0 — Foundation   [ ] 0.1  [ ] 0.2  [ ] 0.3  [ ] 0.4  [ ] 0.5
STEP 1 — Frontend UI  [ ] 1.1  [ ] 1.2  [ ] 1.3  [ ] 1.4  [ ] 1.5
                      [ ] 1.6  [ ] 1.7  [ ] 1.8  [ ] 1.9  [ ] 1.10  [ ] 1.11
STEP 2 — Database     [ ] 2.1  [ ] 2.2  [ ] 2.3  [ ] 2.4  [ ] 2.5
STEP 3 — API Routes   [ ] 3.1  [ ] 3.2  [ ] 3.3  [ ] 3.4  [ ] 3.5  [ ] 3.6  [ ] 3.7
STEP 4 — Connection   [ ] 4.1  [ ] 4.2  [ ] 4.3  [ ] 4.4  [ ] 4.5  [ ] 4.6  [ ] 4.7
STEP 5 — Testing      [ ] 5.1  [ ] 5.2  [ ] 5.3  [ ] 5.4  [ ] 5.5
STEP 6 — Deployment   [ ] 6.1  [ ] 6.2  [ ] 6.3  [ ] 6.4  [ ] 6.5  [ ] 6.6  [ ] 6.7
```

**Total: 6 Steps | 38 Checkpoints**

*Checkpoint Plan added: 2026-05-21*
