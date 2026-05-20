export const mockShop = {
  name: 'মেসার্স রহিম হার্ডওয়্যার',
  address: '৫৬ মিরপুর রোড, ঢাকা-১২১৬',
  phone: '০১৭১১-৪৫৬৭৮৯',
  email: 'rahim.hardware@gmail.com',
};

export const mockCategories = [
  { id: 1, name: 'রড ও লোহা' },
  { id: 2, name: 'সিমেন্ট ও বালি' },
  { id: 3, name: 'রং ও থিনার' },
  { id: 4, name: 'পেরেক ও স্ক্রু' },
  { id: 5, name: 'পাইপ ও ফিটিংস' },
  { id: 6, name: 'টাইলস ও মোজাইক' },
];

export const mockProducts = [
  { id: 1, name: 'সিমেন্ট (৫০কেজি)', sku: 'CEM-001', category: 'সিমেন্ট ও বালি', purchase_price: 420, selling_price: 480, current_stock: 150, min_stock_alert: 20, unit: 'বস্তা' },
  { id: 2, name: 'রড ১২mm', sku: 'ROD-012', category: 'রড ও লোহা', purchase_price: 680, selling_price: 720, current_stock: 80, min_stock_alert: 15, unit: 'পিস' },
  { id: 3, name: 'রড ১০mm', sku: 'ROD-010', category: 'রড ও লোহা', purchase_price: 550, selling_price: 590, current_stock: 60, min_stock_alert: 10, unit: 'পিস' },
  { id: 4, name: 'পেরেক ১" (১কেজি)', sku: 'NL-100', category: 'পেরেক ও স্ক্রু', purchase_price: 120, selling_price: 150, current_stock: 8, min_stock_alert: 10, unit: 'প্যাকেট' },
  { id: 5, name: 'রং সাদা (২০লি)', sku: 'PT-WHT', category: 'রং ও থিনার', purchase_price: 1800, selling_price: 2100, current_stock: 25, min_stock_alert: 5, unit: 'বালতি' },
  { id: 6, name: 'PVC পাইপ ১"', sku: 'PVC-100', category: 'পাইপ ও ফিটিংস', purchase_price: 85, selling_price: 110, current_stock: 120, min_stock_alert: 20, unit: 'পিস' },
  { id: 7, name: 'বালি (সিএফটি)', sku: 'SND-001', category: 'সিমেন্ট ও বালি', purchase_price: 30, selling_price: 45, current_stock: 500, min_stock_alert: 50, unit: 'সিএফটি' },
  { id: 8, name: 'গ্রিল কাটার', sku: 'GCT-001', category: 'রড ও লোহা', purchase_price: 250, selling_price: 320, current_stock: 3, min_stock_alert: 5, unit: 'পিস' },
];

export const mockCustomers = [
  { id: 1, name: 'করিম সাহেব', phone: '০১৮১১-২৩৪৫৬৭', address: 'মিরপুর-১০, ঢাকা', total_due: 15500 },
  { id: 2, name: 'রহিম মিয়া', phone: '০১৭২২-৩৪৫৬৭৮', address: 'উত্তরা, ঢাকা', total_due: 0 },
  { id: 3, name: 'নুর ইসলাম', phone: '০১৯৩৩-৪৫৬৭৮৯', address: 'মোহাম্মদপুর, ঢাকা', total_due: 8200 },
  { id: 4, name: 'জাহাঙ্গীর আলম', phone: '০১৬৪৪-৫৬৭৮৯০', address: 'বাড্ডা, ঢাকা', total_due: 3400 },
];

export const mockSales = [
  {
    id: 1, invoice_no: 'INV-2026-001', customer: 'করিম সাহেব',
    total: 8700, paid_amount: 5000, due_amount: 3700,
    payment_type: 'PARTIAL', sale_date: '2026-05-21',
    items: [
      { product: 'সিমেন্ট (৫০কেজি)', qty: 10, price: 480, total: 4800 },
      { product: 'রড ১২mm', qty: 5, price: 720, total: 3600 },
      { product: 'পেরেক ১"', qty: 2, price: 150, total: 300 },
    ],
  },
  {
    id: 2, invoice_no: 'INV-2026-002', customer: 'রহিম মিয়া',
    total: 4200, paid_amount: 4200, due_amount: 0,
    payment_type: 'CASH', sale_date: '2026-05-21',
    items: [
      { product: 'রং সাদা (২০লি)', qty: 2, price: 2100, total: 4200 },
    ],
  },
  {
    id: 3, invoice_no: 'INV-2026-003', customer: 'নুর ইসলাম',
    total: 5500, paid_amount: 0, due_amount: 5500,
    payment_type: 'CREDIT', sale_date: '2026-05-20',
    items: [
      { product: 'রড ১০mm', qty: 8, price: 590, total: 4720 },
      { product: 'PVC পাইপ ১"', qty: 7, price: 110, total: 770 },
    ],
  },
];

export const mockDashboardStats = {
  today_sales: 45200,
  today_sales_count: 12,
  total_due: 87450,
  low_stock_count: 3,
  monthly_profit: 125000,
};

export const mockTopProducts = [
  { name: 'সিমেন্ট', total_sold: 480, revenue: 230400 },
  { name: 'রড ১২mm', total_sold: 320, revenue: 230400 },
  { name: 'বালি', total_sold: 280, revenue: 12600 },
  { name: 'পেরেক ১"', total_sold: 190, revenue: 28500 },
  { name: 'রং সাদা', total_sold: 150, revenue: 315000 },
];

export const mockSlowProducts = [
  { name: 'গ্রিল কাটার', total_sold: 2, current_stock: 3 },
  { name: 'টাইলস কাটার', total_sold: 5, current_stock: 8 },
  { name: 'PVC ৩"', total_sold: 8, current_stock: 25 },
];

export const mockSalesChart = [
  { date: 'রবি', sales: 32000 },
  { date: 'সোম', sales: 45000 },
  { date: 'মঙ্গল', sales: 38000 },
  { date: 'বুধ', sales: 52000 },
  { date: 'বৃহস্পতি', sales: 48000 },
  { date: 'শুক্র', sales: 61000 },
  { date: 'শনি', sales: 55000 },
];

// Customer transactions — SALE = বিক্রয় (বাকি বাড়ে), PAYMENT = পরিশোধ (বাকি কমে)
export const mockTransactions = [
  // করিম সাহেব (id:1)
  { id: 1,  customer_id: 1, date: '2026-01-05', type: 'SALE',    invoice: 'INV-2026-001', description: 'সিমেন্ট ১০ বস্তা, রড ৫ পিস', debit: 8700,  credit: 0,    balance: 8700  },
  { id: 2,  customer_id: 1, date: '2026-01-10', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 5000, balance: 3700  },
  { id: 3,  customer_id: 1, date: '2026-02-03', type: 'SALE',    invoice: 'INV-2026-015', description: 'রড ১২mm ১০ পিস',             debit: 7200,  credit: 0,    balance: 10900 },
  { id: 4,  customer_id: 1, date: '2026-02-15', type: 'PAYMENT', invoice: '',              description: 'বিকাশে পরিশোধ',              debit: 0,     credit: 3000, balance: 7900  },
  { id: 5,  customer_id: 1, date: '2026-03-08', type: 'SALE',    invoice: 'INV-2026-031', description: 'সিমেন্ট ১৫ বস্তা, বালি',      debit: 9450,  credit: 0,    balance: 17350 },
  { id: 6,  customer_id: 1, date: '2026-03-20', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 8000, balance: 9350  },
  { id: 7,  customer_id: 1, date: '2026-04-12', type: 'SALE',    invoice: 'INV-2026-048', description: 'রং সাদা ২ বালতি',             debit: 4200,  credit: 0,    balance: 13550 },
  { id: 8,  customer_id: 1, date: '2026-04-25', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 5000, balance: 8550  },
  { id: 9,  customer_id: 1, date: '2026-05-10', type: 'SALE',    invoice: 'INV-2026-062', description: 'পেরেক ৫ কেজি, PVC পাইপ',     debit: 4200,  credit: 0,    balance: 12750 },
  { id: 10, customer_id: 1, date: '2026-05-21', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 2750, balance: 10000 },
  { id: 11, customer_id: 1, date: '2026-05-21', type: 'SALE',    invoice: 'INV-2026-078', description: 'সিমেন্ট ১০ বস্তা, রড ৫ পিস', debit: 8700,  credit: 5000, balance: 13700 },

  // নুর ইসলাম (id:3)
  { id: 20, customer_id: 3, date: '2026-03-15', type: 'SALE',    invoice: 'INV-2026-022', description: 'সিমেন্ট ২০ বস্তা',            debit: 9600,  credit: 0,    balance: 9600  },
  { id: 21, customer_id: 3, date: '2026-03-28', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 5000, balance: 4600  },
  { id: 22, customer_id: 3, date: '2026-04-18', type: 'SALE',    invoice: 'INV-2026-041', description: 'রড ১০mm ৮ পিস',              debit: 4720,  credit: 0,    balance: 9320  },
  { id: 23, customer_id: 3, date: '2026-05-05', type: 'PAYMENT', invoice: '',              description: 'বিকাশে পরিশোধ',              debit: 0,     credit: 3000, balance: 6320  },
  { id: 24, customer_id: 3, date: '2026-05-20', type: 'SALE',    invoice: 'INV-2026-003', description: 'রড ১০mm ৮ পিস, PVC পাইপ',   debit: 5500,  credit: 0,    balance: 11820 },
  { id: 25, customer_id: 3, date: '2026-05-21', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 3620, balance: 8200  },

  // জাহাঙ্গীর আলম (id:4)
  { id: 30, customer_id: 4, date: '2026-04-10', type: 'SALE',    invoice: 'INV-2026-035', description: 'রং সাদা ৩ বালতি',             debit: 6300,  credit: 0,    balance: 6300  },
  { id: 31, customer_id: 4, date: '2026-04-20', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 4000, balance: 2300  },
  { id: 32, customer_id: 4, date: '2026-05-15', type: 'SALE',    invoice: 'INV-2026-059', description: 'সিমেন্ট ৫ বস্তা',             debit: 2400,  credit: 0,    balance: 4700  },
  { id: 33, customer_id: 4, date: '2026-05-20', type: 'PAYMENT', invoice: '',              description: 'নগদ পরিশোধ',                 debit: 0,     credit: 1300, balance: 3400  },
];
