# HardwareHub — হার্ডওয়্যার দোকান ম্যানেজমেন্ট সিস্টেম

> একটি সম্পূর্ণ হার্ডওয়্যার দোকান পরিচালনার ডিজিটাল সমাধান — Mobile PWA + Desktop

[![Status](https://img.shields.io/badge/Status-Planning%20Phase-yellow)](https://github.com)
[![Tech](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20PostgreSQL-blue)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## সমস্যা কী? (Problem Statement)

একটি হার্ডওয়্যার দোকানে প্রতিদিনের সমস্যা:

- কোন প্রোডাক্ট কতটুকু স্টকে আছে বোঝা যায় না
- কার কাছে কত বাকি (credit) আছে হিসাব নেই
- মাসে কত আয় হলো সহজে বের করা যায় না
- Invoice হাতে লিখতে হয়
- কোন পণ্য বেশি বিক্রি হচ্ছে, কোনটা কম — জানার উপায় নেই
- একটা জায়গায় সব দেখার সুবিধা নেই

---

## সমাধান (Solution)

**HardwareHub** — একটি Responsive Progressive Web App (PWA) যা:

- Mobile browser-এ চলবে (app install ছাড়াই)
- Laptop/Desktop-এও একই সাইট কাজ করবে
- Internet ছাড়াও basic কাজ করবে (offline support)
- PDF invoice generate করবে
- **কোন পণ্য বেশি/কম বিক্রি হচ্ছে তা chart-সহ দেখাবে**
- সব data এক জায়গায় থাকবে

---

## Features (বৈশিষ্ট্য)

### ✅ Product & Stock Management
- প্রোডাক্ট যোগ/সম্পাদনা/মুছে ফেলা (নাম, SKU, ক্যাটাগরি, দাম, ছবি)
- স্টক পরিমাণ সেট করা এবং ট্র্যাক করা
- **Auto Stock Deduct** — বিক্রি হলে স্বয়ংক্রিয়ভাবে স্টক কমবে
- Low Stock Alert — নির্দিষ্ট পরিমাণের নিচে গেলে সতর্কতা
- Barcode/QR scan (mobile camera)
- Category management (রড, সিমেন্ট, রং, পেরেক, ইত্যাদি)

### ✅ Sales / POS (বিক্রি)
- POS-style বিক্রির স্ক্রিন
- একাধিক প্রোডাক্ট একসাথে বিক্রি
- Discount সুবিধা
- Cash / বাকি (credit) — পেমেন্ট ধরন
- Auto Invoice number generate

### ✅ Invoice & PDF
- প্রতিটি বিক্রিতে PDF Invoice তৈরি
- দোকানের নাম, ঠিকানা, ফোন সহamar readme file ki ready project overview and add the implement tation p,an on readme  and aro akta plan kon product kom bikrri hocce kon product besi bikri hoocce ?
- PDF Download / Print / WhatsApp-এ শেয়ার

### ✅ Customer & বাকি (Credit) Management
- Customer list (নাম, ফোন, ঠিকানা)
- প্রতি customer-এর বাকির হিসাব
- বাকির statement PDF

### ✅ Purchase / Supplier Management
- Supplier list এবং ক্রয়ের রেকর্ড
- Supplier-এর কাছে কত বাকি আছে
- Purchase করলে স্বয়ংক্রিয়ভাবে স্টক বাড়বে

### ✅ Income & Expense Reports
- Daily / Monthly আয়ের summary
- Expense entry (দোকান ভাড়া, বিদ্যুৎ, বেতন)
- Net profit calculation

### 📊 Product Sales Analytics (বিক্রির বিশ্লেষণ)
- **Top 10 best-selling products** — কোন পণ্য সবচেয়ে বেশি বিক্রি হচ্ছে
- **Bottom 10 slow-moving products** — কোন পণ্য কম বিক্রি হচ্ছে
- Date range filter (এই সপ্তাহ / এই মাস / কাস্টম তারিখ)
- Bar chart visualization
- Revenue vs Quantity analysis

---

## Tech Stack

| Layer | Technology | কারণ |
|-------|-----------|------|
| **Frontend** | React.js + Vite | Fast, PWA support |
| **Styling** | Tailwind CSS | Mobile-first, responsive |
| **State** | Zustand + React Query | Simple, powerful |
| **Charts** | Recharts | Product sales visualization |
| **PDF** | jsPDF + html2canvas | Client-side PDF, বিনামূল্যে |
| **Backend** | Node.js + Express | Fast API development |
| **Auth** | JWT + bcrypt | Secure, stateless |
| **Database** | PostgreSQL | Reliable, ACID transactions |
| **ORM** | Prisma | Type-safe DB queries |
| **Cache** | Redis | Fast dashboard data |
| **Hosting** | Vercel (Frontend) + Railway (Backend) | ~$5-10/মাস |

---

## Implementation Plan (বাস্তবায়ন পরিকল্পনা)

### Phase 1 — MVP (৪-৬ সপ্তাহ) ⭐ প্রথমে করতে হবে

**লক্ষ্য:** দোকান চালু রাখার জন্য minimum যা দরকার

- [ ] Project setup (React + Node.js + PostgreSQL + Docker)
- [ ] Authentication — Login/Logout (JWT)
- [ ] Product CRUD — প্রোডাক্ট যোগ, সম্পাদনা, মুছে ফেলা
- [ ] Stock management — স্টক সেট এবং ট্র্যাক
- [ ] Basic Sales (POS screen) — বিক্রির স্ক্রিন
- [ ] Auto stock deduction — বিক্রিতে স্টক কমা
- [ ] PDF Invoice generation — PDF তৈরি
- [ ] Customer + বাকি tracking — বাকির হিসাব
- [ ] Simple Dashboard — আজকের summary

**Deliverable:** দোকান চালু করার জন্য প্রস্তুত একটি কার্যকর সিস্টেম

---

### Phase 2 — Core Features (৩-৪ সপ্তাহ)

**লক্ষ্য:** ব্যবসার সম্পূর্ণ হিসাব রাখা

- [ ] Purchase management — supplier থেকে কেনাকাটার রেকর্ড
- [ ] Stock-in entry — নতুন মাল আসলে স্টক বাড়ানো
- [ ] Expense tracking — দোকানের খরচের হিসাব
- [ ] Monthly income/profit report — মাসিক আয়-ব্যয়
- [ ] Low stock alerts — স্টক কম হলে সতর্কতা
- [ ] Stock history — কখন কত স্টক আসল/গেল

---

### Phase 3 — Advanced Features (৩-৪ সপ্তাহ)

**লক্ষ্য:** আধুনিক ও স্বয়ংক্রিয় সুবিধা

- [ ] **Product Sales Analytics** — কোন পণ্য বেশি/কম বিক্রি (chart সহ)
- [ ] Barcode/QR scan (mobile camera দিয়ে)
- [ ] Multi-user with roles (Admin, Manager, Cashier)
- [ ] Advanced reports + charts
- [ ] PDF monthly summary reports
- [ ] WhatsApp invoice share integration
- [ ] Offline mode (PWA)

---

### Phase 4 — Polish & Scale

**লক্ষ্য:** দীর্ঘমেয়াদী ব্যবহারের জন্য প্রস্তুত

- [ ] Backup & restore
- [ ] Multi-branch support (একাধিক দোকান)
- [ ] Bulk import/export (Excel)
- [ ] SMS/WhatsApp auto reminder for বাকি
- [ ] Performance optimization

---

## Timeline (সময়সীমা)

| Phase | কাজ | সময় |
|-------|-----|------|
| Setup | Project init, DB, Auth | ১ সপ্তাহ |
| Phase 1 | MVP — Product, Sale, Invoice | ৩-৪ সপ্তাহ |
| Phase 2 | Purchase, Expense, Reports | ২-৩ সপ্তাহ |
| Phase 3 | Analytics, Barcode, Multi-user, Offline | ৩-৪ সপ্তাহ |
| Phase 4 | Polish & Scale | ২ সপ্তাহ |
| **মোট** | | **১১-১৪ সপ্তাহ** |

---

## Quick Start (কীভাবে চালাবো)

### Prerequisites

- Node.js v18+
- Docker (PostgreSQL + Redis চালাতে)
- Git

### Installation

```bash
# 1. Repository clone করুন
git clone https://github.com/your-username/hardwaremanagement.git
cd hardwaremanagement

# 2. Database চালু করুন (Docker)
docker-compose up -d

# 3. Backend setup
cd server
npm install
cp .env.example .env        # .env ফাইল তৈরি করুন
npx prisma migrate dev      # Database migrate করুন
npx prisma db seed          # Initial data
npm run dev                 # Server চালু (port 5000)

# 4. Frontend setup (নতুন terminal-এ)
cd client
npm install
npm run dev                 # Frontend চালু (port 5173)
```

### Environment Variables (server/.env)

```env
DATABASE_URL="postgresql://postgres:secret@localhost:5432/hardwaredb"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=5000
```

---

## Project Structure (ফোল্ডার কাঠামো)

```
hardwaremanagement/
├── client/                          # React PWA Frontend
│   └── src/
│       ├── components/
│       │   ├── ui/                  # Button, Input, Modal, Table
│       │   ├── layout/              # Sidebar, Navbar, MobileMenu
│       │   ├── invoice/             # InvoicePDF, InvoicePreview
│       │   └── charts/              # SalesChart, ProductAnalyticsChart
│       ├── pages/
│       │   ├── Dashboard.jsx        # আজকের summary + top products widget
│       │   ├── Products/            # List, Add, Edit
│       │   ├── Sales/               # POS, History, InvoiceView
│       │   ├── Customers/           # List, Ledger
│       │   ├── Purchases/           # List, Add
│       │   ├── Reports/
│       │   │   ├── SalesReport.jsx
│       │   │   ├── ProfitLoss.jsx
│       │   │   └── ProductSales.jsx # বেশি/কম বিক্রির analytics
│       │   └── Settings/
│       ├── hooks/
│       ├── services/                # API call functions
│       ├── store/                   # Zustand state
│       └── utils/
│
├── server/                          # Node.js + Express Backend
│   └── src/
│       ├── routes/
│       ├── controllers/
│       ├── middleware/              # auth, rbac, validation
│       ├── services/
│       ├── prisma/
│       │   └── schema.prisma        # Database schema
│       └── utils/
│
├── docker-compose.yml               # PostgreSQL + Redis
├── PLAN.md                          # বিস্তারিত architecture plan
└── README.md                        # এই ফাইল
```

---

## API Endpoints (প্রধান)

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
POST   /api/sales                 (create → auto stock deduct)
GET    /api/sales/:id             (detail + invoice data)
GET    /api/sales/:id/pdf         (PDF invoice generate)

CUSTOMERS
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id/ledger  (বাকির হিসাব)
POST   /api/payments              (বাকি পরিশোধ)

PURCHASES
GET    /api/purchases
POST   /api/purchases             (create → auto stock add)

REPORTS & ANALYTICS
GET    /api/reports/dashboard            (আজকের summary)
GET    /api/reports/sales                (?from=&to=&group_by=day|month)
GET    /api/reports/profit-loss          (?month=&year=)
GET    /api/reports/low-stock
GET    /api/reports/top-products         (বেশি বিক্রি — top sellers)
GET    /api/reports/slow-products        (কম বিক্রি — slow movers)
GET    /api/reports/product-trend/:id    (নির্দিষ্ট পণ্যের বিক্রির trend)
```

---

## Product Sales Analytics (পণ্য বিক্রির বিশ্লেষণ)

### কোন পণ্য বেশি বিক্রি হচ্ছে (Top Sellers)

Dashboard-এ এবং Reports পেজে দেখা যাবে:

```
📊 সেরা বিক্রেতা (এই মাসে)
┌────────────────────────────────────────┐
│ #1  সিমেন্ট         ▓▓▓▓▓▓▓▓  ৪৮০ বস্তা │
│ #2  রড ১২mm         ▓▓▓▓▓▓    ৩২০ পিস  │
│ #3  বালি            ▓▓▓▓▓     ২৮০ ব্যাগ │
│ #4  পেরেক ১"        ▓▓▓▓      ১৯০ কেজি │
│ #5  রঙ সাদা         ▓▓▓       ১৫০ লিটার│
└────────────────────────────────────────┘
```

### কোন পণ্য কম বিক্রি হচ্ছে (Slow Movers)

```
⚠️ কম বিক্রি হচ্ছে (এই মাসে)
┌────────────────────────────────────────┐
│ গ্রিল কাটার       ░░░░░░░░  ২ পিস     │ ← stock বেশি আছে?
│ সিলিং ফ্যান ব্র্যাকেট ░░░░░  ৫ পিস    │ ← দাম বেশি?
│ PVC পাইপ ৩"       ░░░░      ৮ পিস     │
└────────────────────────────────────────┘
```

### Filter Options
- **এই সপ্তাহ** / **এই মাস** / **এই বছর** / **কাস্টম তারিখ**
- Sort by: **পরিমাণ (quantity)** অথবা **আয় (revenue)**

### API Query Example

```http
GET /api/reports/top-products?from=2026-05-01&to=2026-05-31&limit=10&sort=quantity
```

```json
{
  "data": [
    {
      "product_id": "uuid",
      "name": "সিমেন্ট",
      "sku": "CEM-001",
      "category": "Building Materials",
      "total_sold": 480,
      "total_revenue": 230400,
      "unit": "বস্তা"
    }
  ],
  "period": { "from": "2026-05-01", "to": "2026-05-31" }
}
```

---

## Invoice Template

```
┌────────────────────────────────────────────┐
│          মেসার্স রহিম হার্ডওয়্যার          │
│     ৫৬ মিরপুর রোড, ঢাকা | ০১৭XX-XXXXXX   │
├────────────────────────────────────────────┤
│  Invoice No: INV-2026-00423                │
│  Date: 21/05/2026   Customer: করিম সাহেব  │
├──────────┬──────┬──────────┬──────────────┤
│ পণ্যের নাম│পরিমাণ│ একক মূল্য│    মোট      │
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

## Hosting Plan (কোথায় রাখবো)

### Option A — সস্তায় শুরু (Recommended)

| Service | Provider | খরচ |
|---------|----------|-----|
| Frontend | Vercel | বিনামূল্যে |
| Backend + DB | Railway.app | ~$5/মাস |
| **মোট** | | **~৳ ৫৫০/মাস** |

### Option B — নিজের VPS

| Service | Provider | খরচ |
|---------|----------|-----|
| VPS + DB | Hostinger/DigitalOcean | ~$5-6/মাস |
| SSL | Let's Encrypt | বিনামূল্যে |
| **মোট** | | **~৳ ৫৫০-৬৫০/মাস** |

---

## Security Checklist

- [ ] JWT token expiry + refresh token
- [ ] Password hashing (bcrypt, cost factor 12)
- [ ] SQL injection prevention (Prisma ORM)
- [ ] Rate limiting on API endpoints
- [ ] HTTPS only (production)
- [ ] Input sanitization (Zod validation)
- [ ] Role-based access — মালিক ≠ Cashier
- [ ] Daily database backup

---

## License

MIT License — বিস্তারিত দেখুন [LICENSE](LICENSE) ফাইলে।

---

*README created: 2026-05-21 | Project: HardwareHub v1.0*
