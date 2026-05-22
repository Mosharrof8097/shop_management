const router = require('express').Router();
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Helper: start/end of a day
const dayRange = (d) => ({
  gte: new Date(new Date(d).setHours(0, 0, 0, 0)),
  lte: new Date(new Date(d).setHours(23, 59, 59, 999)),
});

// Helper: start/end of a month
function monthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { gte: start, lte: end };
}

// GET /api/reports/dashboard  — today's summary
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const today = new Date();

    const [todaySales, totalDue, monthSales, monthExpenses, monthPurchases] = await Promise.all([
      // Today's completed sales
      prisma.sale.aggregate({
        where: { shopId, status: 'COMPLETED', saleDate: dayRange(today) },
        _sum: { total: true },
        _count: true,
      }),
      // Total customer outstanding
      prisma.customer.aggregate({
        where: { shopId, deletedAt: null },
        _sum: { totalDue: true },
      }),
      // This month's sales
      prisma.sale.aggregate({
        where: {
          shopId, status: 'COMPLETED',
          saleDate: monthRange(today.getFullYear(), today.getMonth() + 1),
        },
        _sum: { total: true },
      }),
      // This month's expenses
      prisma.expense.aggregate({
        where: {
          shopId,
          date: monthRange(today.getFullYear(), today.getMonth() + 1),
        },
        _sum: { amount: true },
      }),
      // This month's purchases (cost)
      prisma.purchase.aggregate({
        where: {
          shopId,
          purchaseDate: monthRange(today.getFullYear(), today.getMonth() + 1),
        },
        _sum: { total: true },
      }),
    ]);

    // Low-stock: raw query because Prisma can't compare two columns
    const lowStockProducts = await prisma.$queryRaw`
      SELECT id, name, sku, "currentStock", "minStockAlert", unit
      FROM "Product"
      WHERE "shopId" = ${shopId}
        AND "isActive" = true
        AND "deletedAt" IS NULL
        AND "currentStock" <= "minStockAlert"
      ORDER BY "currentStock" ASC
      LIMIT 10
    `;

    const monthlySales = Number(monthSales._sum.total || 0);
    const monthlyExpenses = Number(monthExpenses._sum.amount || 0);
    const monthlyPurchases = Number(monthPurchases._sum.total || 0);
    const monthlyProfit = monthlySales - monthlyExpenses - monthlyPurchases;

    res.json({
      success: true,
      data: {
        today: {
          salesTotal: Number(todaySales._sum.total || 0),
          salesCount: todaySales._count,
        },
        totalCustomerDue: Number(totalDue._sum.totalDue || 0),
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        monthly: {
          sales: monthlySales,
          expenses: monthlyExpenses,
          purchaseCost: monthlyPurchases,
          profit: monthlyProfit,
        },
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/reports/sales?from=&to=&groupBy=day|month
router.get('/sales', authenticate, async (req, res) => {
  try {
    const { from, to, groupBy = 'day' } = req.query;
    const shopId = req.user.shopId;

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(`${to}T23:59:59`) : new Date();

    const sales = await prisma.sale.findMany({
      where: { shopId, status: 'COMPLETED', saleDate: { gte: fromDate, lte: toDate } },
      select: {
        id: true, invoiceNo: true, saleDate: true, total: true,
        paidAmount: true, dueAmount: true, paymentType: true, customerName: true,
        customer: { select: { id: true, name: true } },
      },
      orderBy: { saleDate: 'desc' },
    });

    // Group by day or month for chart data
    const grouped = {};
    for (const s of sales) {
      const key = groupBy === 'month'
        ? `${s.saleDate.getFullYear()}-${String(s.saleDate.getMonth() + 1).padStart(2, '0')}`
        : s.saleDate.toISOString().split('T')[0];

      if (!grouped[key]) grouped[key] = { period: key, total: 0, count: 0 };
      grouped[key].total += Number(s.total);
      grouped[key].count += 1;
    }

    const totals = await prisma.sale.aggregate({
      where: { shopId, status: 'COMPLETED', saleDate: { gte: fromDate, lte: toDate } },
      _sum: { total: true, paidAmount: true, dueAmount: true, discount: true },
      _count: true,
    });

    res.json({
      success: true,
      data: sales,
      chart: Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period)),
      totals: {
        totalSales: Number(totals._sum.total || 0),
        totalPaid: Number(totals._sum.paidAmount || 0),
        totalDue: Number(totals._sum.dueAmount || 0),
        totalDiscount: Number(totals._sum.discount || 0),
        count: totals._count,
      },
    });
  } catch (err) {
    console.error('Sales report error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/reports/top-products?from=&to=&limit=10&sort=quantity|revenue
router.get('/top-products', authenticate, async (req, res) => {
  try {
    const { from, to, limit = 10, sort = 'quantity' } = req.query;
    const shopId = req.user.shopId;

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(`${to}T23:59:59`) : new Date();
    const limitInt = parseInt(limit);

    // Two separate queries so ORDER BY column is not dynamic (avoids SQL injection risk)
    const byQty = await prisma.$queryRaw`
      SELECT
        si."productId",
        si."productName",
        si."productSku",
        SUM(si.quantity)::int   AS "totalSold",
        SUM(si.total)::float    AS "totalRevenue"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s."shopId" = ${shopId}
        AND s."saleDate" BETWEEN ${fromDate} AND ${toDate}
        AND s.status = 'COMPLETED'
      GROUP BY si."productId", si."productName", si."productSku"
      ORDER BY "totalSold" DESC
      LIMIT ${limitInt}
    `;

    const byRev = await prisma.$queryRaw`
      SELECT
        si."productId",
        si."productName",
        si."productSku",
        SUM(si.quantity)::int   AS "totalSold",
        SUM(si.total)::float    AS "totalRevenue"
      FROM "SaleItem" si
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE s."shopId" = ${shopId}
        AND s."saleDate" BETWEEN ${fromDate} AND ${toDate}
        AND s.status = 'COMPLETED'
      GROUP BY si."productId", si."productName", si."productSku"
      ORDER BY "totalRevenue" DESC
      LIMIT ${limitInt}
    `;

    res.json({ success: true, data: sort === 'revenue' ? byRev : byQty });
  } catch (err) {
    console.error('Top products error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/reports/slow-products?from=&to=&limit=10
router.get('/slow-products', authenticate, async (req, res) => {
  try {
    const { from, to, limit = 10 } = req.query;
    const shopId = req.user.shopId;

    const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
    const toDate = to ? new Date(`${to}T23:59:59`) : new Date();

    const results = await prisma.$queryRaw`
      SELECT
        p.id,
        p.name,
        p.sku,
        p.unit,
        p."currentStock",
        p."minStockAlert",
        COALESCE(SUM(si.quantity), 0)::int   AS "totalSold",
        COALESCE(SUM(si.total), 0)::float    AS "totalRevenue"
      FROM "Product" p
      LEFT JOIN "SaleItem" si ON p.id = si."productId"
      LEFT JOIN "Sale" s ON si."saleId" = s.id
        AND s."saleDate" BETWEEN ${fromDate} AND ${toDate}
        AND s.status = 'COMPLETED'
      WHERE p."shopId" = ${shopId}
        AND p."isActive" = true
        AND p."deletedAt" IS NULL
      GROUP BY p.id, p.name, p.sku, p.unit, p."currentStock", p."minStockAlert"
      ORDER BY "totalSold" ASC
      LIMIT ${parseInt(limit)}
    `;

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Slow products error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/reports/profit-loss?month=5&year=2026
router.get('/profit-loss', authenticate, async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const now = new Date();
    const month = parseInt(req.query.month || now.getMonth() + 1);
    const year = parseInt(req.query.year || now.getFullYear());
    const range = monthRange(year, month);

    const [sales, purchases, expenses] = await Promise.all([
      prisma.sale.aggregate({
        where: { shopId, status: 'COMPLETED', saleDate: range },
        _sum: { total: true, discount: true },
        _count: true,
      }),
      prisma.purchase.aggregate({
        where: { shopId, purchaseDate: range },
        _sum: { total: true },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['category'],
        where: { shopId, date: range },
        _sum: { amount: true },
      }),
    ]);

    const totalSales = Number(sales._sum.total || 0);
    const totalPurchases = Number(purchases._sum.total || 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e._sum.amount || 0), 0);
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;

    res.json({
      success: true,
      data: {
        period: { month, year },
        income: {
          totalSales,
          salesCount: sales._count,
          totalDiscount: Number(sales._sum.discount || 0),
        },
        costs: {
          totalPurchases,
          purchasesCount: purchases._count,
          expensesByCategory: expenses.map(e => ({
            category: e.category,
            amount: Number(e._sum.amount || 0),
          })),
          totalExpenses,
        },
        profit: {
          grossProfit,
          netProfit,
        },
      },
    });
  } catch (err) {
    console.error('P&L error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/reports/low-stock
router.get('/low-stock', authenticate, async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const products = await prisma.$queryRaw`
      SELECT
        p.id, p.name, p.sku, p.unit,
        p."currentStock", p."minStockAlert",
        c.name AS "categoryName"
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE p."shopId" = ${shopId}
        AND p."isActive" = true
        AND p."deletedAt" IS NULL
        AND p."currentStock" <= p."minStockAlert"
      ORDER BY p."currentStock" ASC
    `;

    res.json({ success: true, data: products, count: products.length });
  } catch (err) {
    console.error('Low stock error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
