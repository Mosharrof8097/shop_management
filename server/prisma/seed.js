const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ── 0. SUPER ADMIN ────────────────────────────────────────────────────────
  const superHash = await bcrypt.hash('superadmin2026', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@hardwarehub.com' },
    update: {},
    create: {
      id: 'super-admin-001',
      shopId: null,
      name: 'Mosharrof (Super Admin)',
      email: 'superadmin@hardwarehub.com',
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin created: superadmin@hardwarehub.com / superadmin2026');

  // ── 1. SHOP ──────────────────────────────────────────────────────────────
  const shop = await prisma.shop.upsert({
    where: { id: 'seed-shop-001' },
    update: {},
    create: {
      id: 'seed-shop-001',
      name: 'মেসার্স রহিম হার্ডওয়্যার',
      address: '৫৬ মিরপুর রোড, মিরপুর-১০, ঢাকা-১২১৬',
      phone: '০১৭১১-৪৫৬৭৮৯',
      email: 'rahim.hardware@gmail.com',
      currency: 'BDT',
      subscriptionPlan: 'STARTER',
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });
  console.log('✅ Shop created:', shop.name);

  // ── 2. USERS ─────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const cashierHash = await bcrypt.hash('cashier123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hardwarehub.com' },
    update: {},
    create: {
      shopId: shop.id,
      name: 'রহিম সাহেব (মালিক)',
      email: 'admin@hardwarehub.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@hardwarehub.com' },
    update: {},
    create: {
      shopId: shop.id,
      name: 'করিম সাহেব (ম্যানেজার)',
      email: 'manager@hardwarehub.com',
      passwordHash: managerHash,
      role: 'MANAGER',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@hardwarehub.com' },
    update: {},
    create: {
      shopId: shop.id,
      name: 'জামাল (ক্যাশিয়ার)',
      email: 'cashier@hardwarehub.com',
      passwordHash: cashierHash,
      role: 'CASHIER',
    },
  });
  console.log('✅ Users created: Admin, Manager, Cashier');

  // ── 3. CATEGORIES ────────────────────────────────────────────────────────
  const categoryData = [
    { id: 'cat-001', name: 'রড ও লোহা', description: 'Iron rods, angles, sheets' },
    { id: 'cat-002', name: 'সিমেন্ট ও বালি', description: 'Cement bags, coarse sand, fine sand' },
    { id: 'cat-003', name: 'রং ও থিনার', description: 'Wall paint, primer, thinner' },
    { id: 'cat-004', name: 'পেরেক ও স্ক্রু', description: 'Nails, screws, bolts, nuts' },
    { id: 'cat-005', name: 'পাইপ ও ফিটিংস', description: 'PVC pipes, fittings, couplers' },
    { id: 'cat-006', name: 'টাইলস ও মোজাইক', description: 'Floor tiles, wall tiles, mosaic' },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const c = await prisma.category.upsert({
      where: { shopId_name: { shopId: shop.id, name: cat.name } },
      update: {},
      create: { id: cat.id, shopId: shop.id, name: cat.name, description: cat.description },
    });
    categories[cat.id] = c;
  }
  console.log('✅ 6 Categories created');

  // ── 4. PRODUCTS (20) ─────────────────────────────────────────────────────
  const productData = [
    // রড ও লোহা
    { id: 'prod-001', name: 'রড ১২mm', sku: 'ROD-12', categoryId: 'cat-001', purchasePrice: 680, sellingPrice: 720, currentStock: 200, minStockAlert: 20, unit: 'পিস' },
    { id: 'prod-002', name: 'রড ১০mm', sku: 'ROD-10', categoryId: 'cat-001', purchasePrice: 540, sellingPrice: 590, currentStock: 150, minStockAlert: 20, unit: 'পিস' },
    { id: 'prod-003', name: 'রড ৮mm', sku: 'ROD-08', categoryId: 'cat-001', purchasePrice: 430, sellingPrice: 470, currentStock: 180, minStockAlert: 20, unit: 'পিস' },
    { id: 'prod-004', name: 'অ্যাঙ্গেল ১.৫"', sku: 'ANG-15', categoryId: 'cat-001', purchasePrice: 850, sellingPrice: 920, currentStock: 80, minStockAlert: 10, unit: 'পিস' },
    // সিমেন্ট ও বালি
    { id: 'prod-005', name: 'সিমেন্ট (৫০কেজি)', sku: 'CEM-001', categoryId: 'cat-002', purchasePrice: 420, sellingPrice: 480, currentStock: 300, minStockAlert: 30, unit: 'বস্তা' },
    { id: 'prod-006', name: 'মোটা বালি', sku: 'SAND-C', categoryId: 'cat-002', purchasePrice: 38, sellingPrice: 45, currentStock: 500, minStockAlert: 50, unit: 'সিএফটি' },
    { id: 'prod-007', name: 'সরু বালি', sku: 'SAND-F', categoryId: 'cat-002', purchasePrice: 42, sellingPrice: 50, currentStock: 400, minStockAlert: 50, unit: 'সিএফটি' },
    // রং ও থিনার
    { id: 'prod-008', name: 'রং সাদা (৫লি)', sku: 'PAINT-W5', categoryId: 'cat-003', purchasePrice: 1800, sellingPrice: 2100, currentStock: 40, minStockAlert: 5, unit: 'বালতি' },
    { id: 'prod-009', name: 'রং আকাশি (৫লি)', sku: 'PAINT-B5', categoryId: 'cat-003', purchasePrice: 1850, sellingPrice: 2150, currentStock: 25, minStockAlert: 5, unit: 'বালতি' },
    { id: 'prod-010', name: 'প্রাইমার (৫লি)', sku: 'PRIMER-5', categoryId: 'cat-003', purchasePrice: 950, sellingPrice: 1100, currentStock: 30, minStockAlert: 5, unit: 'বালতি' },
    { id: 'prod-011', name: 'থিনার (১লি)', sku: 'THIN-1', categoryId: 'cat-003', purchasePrice: 110, sellingPrice: 140, currentStock: 60, minStockAlert: 10, unit: 'বোতল' },
    // পেরেক ও স্ক্রু
    { id: 'prod-012', name: 'পেরেক ১"', sku: 'NAIL-1', categoryId: 'cat-004', purchasePrice: 120, sellingPrice: 150, currentStock: 100, minStockAlert: 15, unit: 'প্যাকেট' },
    { id: 'prod-013', name: 'পেরেক ২"', sku: 'NAIL-2', categoryId: 'cat-004', purchasePrice: 130, sellingPrice: 160, currentStock: 90, minStockAlert: 15, unit: 'প্যাকেট' },
    { id: 'prod-014', name: 'স্ক্রু সেট (১০০পিস)', sku: 'SCREW-100', categoryId: 'cat-004', purchasePrice: 80, sellingPrice: 100, currentStock: 3, minStockAlert: 10, unit: 'সেট' },
    { id: 'prod-015', name: 'বোল্ট নাট (M10)', sku: 'BOLT-M10', categoryId: 'cat-004', purchasePrice: 18, sellingPrice: 25, currentStock: 200, minStockAlert: 30, unit: 'পিস' },
    // পাইপ ও ফিটিংস
    { id: 'prod-016', name: 'PVC পাইপ ১"', sku: 'PVC-1', categoryId: 'cat-005', purchasePrice: 90, sellingPrice: 110, currentStock: 120, minStockAlert: 20, unit: 'পিস' },
    { id: 'prod-017', name: 'PVC পাইপ ৩/৪"', sku: 'PVC-075', categoryId: 'cat-005', purchasePrice: 70, sellingPrice: 88, currentStock: 4, minStockAlert: 20, unit: 'পিস' },
    { id: 'prod-018', name: 'পাইপ কাপলার ১"', sku: 'COUPLER-1', categoryId: 'cat-005', purchasePrice: 12, sellingPrice: 18, currentStock: 80, minStockAlert: 20, unit: 'পিস' },
    // টাইলস ও মোজাইক
    { id: 'prod-019', name: 'ফ্লোর টাইলস ১২"×১২"', sku: 'TILE-F12', categoryId: 'cat-006', purchasePrice: 55, sellingPrice: 70, currentStock: 500, minStockAlert: 50, unit: 'পিস' },
    { id: 'prod-020', name: 'ওয়াল টাইলস ৮"×১২"', sku: 'TILE-W812', categoryId: 'cat-006', purchasePrice: 48, sellingPrice: 62, currentStock: 2, minStockAlert: 50, unit: 'পিস' },
  ];

  const products = {};
  for (const p of productData) {
    const product = await prisma.product.upsert({
      where: { shopId_sku: { shopId: shop.id, sku: p.sku } },
      update: {},
      create: {
        id: p.id,
        shopId: shop.id,
        categoryId: p.categoryId,
        name: p.name,
        sku: p.sku,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        currentStock: p.currentStock,
        minStockAlert: p.minStockAlert,
        unit: p.unit,
      },
    });
    products[p.id] = product;
  }
  console.log('✅ 20 Products created');

  // Record opening stock movements for all products
  for (const p of productData) {
    await prisma.stockMovement.create({
      data: {
        shopId: shop.id,
        productId: p.id,
        type: 'OPENING',
        quantityBefore: 0,
        quantityChange: p.currentStock,
        quantityAfter: p.currentStock,
        reason: 'Opening stock entry',
        userId: admin.id,
      },
    });
  }
  console.log('✅ Opening stock movements recorded');

  // ── 5. CUSTOMERS ─────────────────────────────────────────────────────────
  const customerData = [
    { id: 'cust-001', name: 'করিম সাহেব', phone: '০১৮১১-২৩৪৫৬৭', address: 'মিরপুর-১০, ঢাকা' },
    { id: 'cust-002', name: 'রহিম মিয়া', phone: '০১৭২২-৩৪৫৬৭৮', address: 'পল্লবী, ঢাকা' },
    { id: 'cust-003', name: 'নুর ইসলাম', phone: '০১৯৩৩-৪৫৬৭৮৯', address: 'শেওড়াপাড়া, ঢাকা' },
    { id: 'cust-004', name: 'জাহাঙ্গীর আলম', phone: '০১৬৪৪-৫৬৭৮৯০', address: 'কাফরুল, ঢাকা' },
  ];

  const customers = {};
  for (const c of customerData) {
    const customer = await prisma.customer.upsert({
      where: { id: c.id },
      update: {},
      create: { id: c.id, shopId: shop.id, name: c.name, phone: c.phone, address: c.address },
    });
    customers[c.id] = customer;
  }
  console.log('✅ 4 Customers created');

  // ── 6. SUPPLIERS ─────────────────────────────────────────────────────────
  const supplierData = [
    { id: 'supp-001', name: 'ABC ট্রেডিং কোং', contactPerson: 'আবুল সাহেব', phone: '০১৫১১-১২৩৪৫৬', address: 'বাড্ডা, ঢাকা' },
    { id: 'supp-002', name: 'XYZ হার্ডওয়্যার সাপ্লায়ার', contactPerson: 'খালেক মিয়া', phone: '০১৮৮৮-২৩৪৫৬৭', address: 'গুলশান, ঢাকা' },
    { id: 'supp-003', name: 'DEF সিমেন্ট কোং', contactPerson: 'ফারুক সাহেব', phone: '০১৭৫৫-৩৪৫৬৭৮', address: 'নারায়ণগঞ্জ' },
  ];

  const suppliers = {};
  for (const s of supplierData) {
    const supplier = await prisma.supplier.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, shopId: shop.id, name: s.name, contactPerson: s.contactPerson, phone: s.phone, address: s.address },
    });
    suppliers[s.id] = supplier;
  }
  console.log('✅ 3 Suppliers created');

  // ── 7. SAMPLE SALES ───────────────────────────────────────────────────────
  const existingSales = await prisma.sale.count({ where: { shopId: shop.id } });
  if (existingSales > 0) {
    console.log('⏭️  Sample sales already exist — skipping');
  } else {

  // Sale 1 — Cash sale (করিম সাহেব)
  const sale1 = await prisma.sale.create({
    data: {
      shopId: shop.id,
      invoiceNo: 'INV-2026-00001',
      customerId: customers['cust-001'].id,
      customerName: 'করিম সাহেব',
      saleDate: new Date('2026-05-20T10:30:00'),
      subtotal: 9540,
      discount: 200,
      tax: 0,
      total: 9340,
      paidAmount: 9340,
      dueAmount: 0,
      paymentType: 'CASH',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      userId: cashier.id,
      items: {
        create: [
          { productId: 'prod-005', productName: 'সিমেন্ট (৫০কেজি)', productSku: 'CEM-001', quantity: 10, unitPrice: 480, discount: 0, total: 4800 },
          { productId: 'prod-001', productName: 'রড ১২mm', productSku: 'ROD-12', quantity: 5, unitPrice: 720, discount: 0, total: 3600 },
          { productId: 'prod-012', productName: 'পেরেক ১"', productSku: 'NAIL-1', quantity: 3, unitPrice: 150, discount: 0, total: 450 },
          { productId: 'prod-016', productName: 'PVC পাইপ ১"', productSku: 'PVC-1', quantity: 6, unitPrice: 110, discount: 0, total: 660 },
        ],
      },
    },
  });

  // Deduct stock for sale 1
  const sale1Items = [
    { productId: 'prod-005', qty: 10 },
    { productId: 'prod-001', qty: 5 },
    { productId: 'prod-012', qty: 3 },
    { productId: 'prod-016', qty: 6 },
  ];
  for (const item of sale1Items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    await prisma.product.update({ where: { id: item.productId }, data: { currentStock: { decrement: item.qty } } });
    await prisma.stockMovement.create({
      data: {
        shopId: shop.id, productId: item.productId, type: 'SALE',
        referenceId: sale1.id, referenceType: 'SALE',
        quantityBefore: product.currentStock,
        quantityChange: -item.qty,
        quantityAfter: product.currentStock - item.qty,
        reason: `Sale ${sale1.invoiceNo}`,
        userId: cashier.id,
      },
    });
  }

  // Sale 2 — Credit sale (নুর ইসলাম — partial payment)
  const sale2 = await prisma.sale.create({
    data: {
      shopId: shop.id,
      invoiceNo: 'INV-2026-00002',
      customerId: customers['cust-003'].id,
      customerName: 'নুর ইসলাম',
      saleDate: new Date('2026-05-21T14:00:00'),
      subtotal: 12600,
      discount: 0,
      tax: 0,
      total: 12600,
      paidAmount: 5000,
      dueAmount: 7600,
      paymentType: 'PARTIAL',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      userId: cashier.id,
      items: {
        create: [
          { productId: 'prod-008', productName: 'রং সাদা (৫লি)', productSku: 'PAINT-W5', quantity: 4, unitPrice: 2100, discount: 0, total: 8400 },
          { productId: 'prod-010', productName: 'প্রাইমার (৫লি)', productSku: 'PRIMER-5', quantity: 2, unitPrice: 1100, discount: 0, total: 2200 },
          { productId: 'prod-011', productName: 'থিনার (১লি)', productSku: 'THIN-1', quantity: 2, unitPrice: 140, discount: 0, total: 280 },
          { productId: 'prod-005', productName: 'সিমেন্ট (৫০কেজি)', productSku: 'CEM-001', quantity: 5, unitPrice: 480, discount: 0, total: 2400 },
        ],
      },
    },
  });

  const sale2Items = [
    { productId: 'prod-008', qty: 4 },
    { productId: 'prod-010', qty: 2 },
    { productId: 'prod-011', qty: 2 },
    { productId: 'prod-005', qty: 5 },
  ];
  for (const item of sale2Items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    await prisma.product.update({ where: { id: item.productId }, data: { currentStock: { decrement: item.qty } } });
    await prisma.stockMovement.create({
      data: {
        shopId: shop.id, productId: item.productId, type: 'SALE',
        referenceId: sale2.id, referenceType: 'SALE',
        quantityBefore: product.currentStock,
        quantityChange: -item.qty,
        quantityAfter: product.currentStock - item.qty,
        reason: `Sale ${sale2.invoiceNo}`,
        userId: cashier.id,
      },
    });
  }

  // Update customer totalDue and create ledger entry for sale2
  await prisma.customer.update({
    where: { id: customers['cust-003'].id },
    data: { totalDue: { increment: 7600 } },
  });
  await prisma.customerTransaction.create({
    data: {
      shopId: shop.id,
      customerId: customers['cust-003'].id,
      date: new Date('2026-05-21T14:00:00'),
      type: 'SALE',
      invoiceNo: 'INV-2026-00002',
      description: 'রং ৪ বালতি, প্রাইমার ২টি, থিনার ২টি, সিমেন্ট ৫ বস্তা',
      debit: 7600,
      credit: 0,
      runningBalance: 7600,
      paymentMethod: 'CASH',
    },
  });

  // Sale 3 — Credit sale (জাহাঙ্গীর আলম)
  const sale3 = await prisma.sale.create({
    data: {
      shopId: shop.id,
      invoiceNo: 'INV-2026-00003',
      customerId: customers['cust-004'].id,
      customerName: 'জাহাঙ্গীর আলম',
      saleDate: new Date('2026-05-22T09:15:00'),
      subtotal: 4800,
      discount: 0,
      tax: 0,
      total: 4800,
      paidAmount: 0,
      dueAmount: 4800,
      paymentType: 'CREDIT',
      paymentMethod: 'CASH',
      status: 'COMPLETED',
      userId: cashier.id,
      items: {
        create: [
          { productId: 'prod-019', productName: 'ফ্লোর টাইলস ১২"×১২"', productSku: 'TILE-F12', quantity: 50, unitPrice: 70, discount: 0, total: 3500 },
          { productId: 'prod-005', productName: 'সিমেন্ট (৫০কেজি)', productSku: 'CEM-001', quantity: 2, unitPrice: 480, discount: 0, total: 960 },
          { productId: 'prod-015', productName: 'বোল্ট নাট (M10)', productSku: 'BOLT-M10', quantity: 15, unitPrice: 25, discount: 0, total: 375 },
        ],
      },
    },
  });

  const sale3Items = [
    { productId: 'prod-019', qty: 50 },
    { productId: 'prod-005', qty: 2 },
    { productId: 'prod-015', qty: 15 },
  ];
  for (const item of sale3Items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    await prisma.product.update({ where: { id: item.productId }, data: { currentStock: { decrement: item.qty } } });
    await prisma.stockMovement.create({
      data: {
        shopId: shop.id, productId: item.productId, type: 'SALE',
        referenceId: sale3.id, referenceType: 'SALE',
        quantityBefore: product.currentStock,
        quantityChange: -item.qty,
        quantityAfter: product.currentStock - item.qty,
        reason: `Sale ${sale3.invoiceNo}`,
        userId: cashier.id,
      },
    });
  }

  await prisma.customer.update({
    where: { id: customers['cust-004'].id },
    data: { totalDue: { increment: 4800 } },
  });
  await prisma.customerTransaction.create({
    data: {
      shopId: shop.id,
      customerId: customers['cust-004'].id,
      date: new Date('2026-05-22T09:15:00'),
      type: 'SALE',
      invoiceNo: 'INV-2026-00003',
      description: 'ফ্লোর টাইলস ৫০পিস, সিমেন্ট ২ বস্তা, বোল্ট ১৫পিস',
      debit: 4800,
      credit: 0,
      runningBalance: 4800,
    },
  });

  console.log('✅ 3 Sample sales created with stock deductions');
  } // end if (existingSales === 0)

  // ── 8. SAMPLE PURCHASES ──────────────────────────────────────────────────
  const existingPurchases = await prisma.purchase.count({ where: { shopId: shop.id } });
  if (existingPurchases === 0) {

  // Purchase 1 — Cement restock from DEF
  const purchase1 = await prisma.purchase.create({
    data: {
      shopId: shop.id,
      supplierId: suppliers['supp-003'].id,
      invoiceNo: 'PUR-2026-00001',
      purchaseDate: new Date('2026-05-18T11:00:00'),
      subtotal: 63000,
      total: 63000,
      paidAmount: 50000,
      dueAmount: 13000,
      status: 'PARTIAL',
      userId: admin.id,
      items: {
        create: [
          { productId: 'prod-005', productName: 'সিমেন্ট (৫০কেজি)', quantity: 150, unitCost: 420, total: 63000 },
        ],
      },
    },
  });

  // Increase stock for purchase 1 (this is the opening stock, so we just record the movement)
  await prisma.stockMovement.create({
    data: {
      shopId: shop.id, productId: 'prod-005', type: 'PURCHASE',
      referenceId: purchase1.id, referenceType: 'PURCHASE',
      quantityBefore: 285,
      quantityChange: 150,
      quantityAfter: 435,
      reason: `Purchase ${purchase1.invoiceNo}`,
      userId: admin.id,
    },
  });

  await prisma.supplier.update({
    where: { id: suppliers['supp-003'].id },
    data: { totalDue: { increment: 13000 } },
  });

  // Purchase 2 — Rods from ABC Trading
  const purchase2 = await prisma.purchase.create({
    data: {
      shopId: shop.id,
      supplierId: suppliers['supp-001'].id,
      invoiceNo: 'PUR-2026-00002',
      purchaseDate: new Date('2026-05-19T09:30:00'),
      subtotal: 136000,
      total: 136000,
      paidAmount: 136000,
      dueAmount: 0,
      status: 'COMPLETED',
      userId: admin.id,
      items: {
        create: [
          { productId: 'prod-001', productName: 'রড ১২mm', quantity: 100, unitCost: 680, total: 68000 },
          { productId: 'prod-002', productName: 'রড ১০mm', quantity: 100, unitCost: 540, total: 54000 },
          { productId: 'prod-003', productName: 'রড ৮mm', quantity: 20, unitCost: 430, total: 8600 },
        ],
      },
    },
  });

  console.log('✅ 2 Sample purchases created');
  } // end if (existingPurchases === 0)

  // ── 9. SAMPLE EXPENSES ────────────────────────────────────────────────────
  const existingExpenses = await prisma.expense.count({ where: { shopId: shop.id } });
  if (existingExpenses === 0) {
    await prisma.expense.createMany({
      data: [
        { shopId: shop.id, date: new Date('2026-05-01'), category: 'RENT', description: 'মে মাসের দোকান ভাড়া', amount: 18000, paymentMethod: 'CASH', userId: admin.id },
        { shopId: shop.id, date: new Date('2026-05-01'), category: 'SALARY_WAGES', description: 'কর্মচারী বেতন — মে', amount: 25000, paymentMethod: 'BANK_TRANSFER', userId: admin.id },
        { shopId: shop.id, date: new Date('2026-05-05'), category: 'UTILITIES', description: 'বিদ্যুৎ বিল — এপ্রিল', amount: 3200, paymentMethod: 'BKASH', userId: admin.id },
        { shopId: shop.id, date: new Date('2026-05-15'), category: 'TRANSPORT', description: 'মাল আনার ভাড়া', amount: 2500, paymentMethod: 'CASH', userId: admin.id },
      ],
    });
    console.log('✅ 4 Sample expenses created');
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────────────');
  console.log('👤 Login credentials:');
  console.log('   Admin:   admin@hardwarehub.com   / admin123');
  console.log('   Manager: manager@hardwarehub.com / manager123');
  console.log('   Cashier: cashier@hardwarehub.com / cashier123');
  console.log('─────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
