const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/database');
const { superAdminOnly } = require('../middleware/superAdmin');

// All routes require SUPER_ADMIN
router.use(superAdminOnly);

// ── GET /api/superadmin/dashboard ─────────────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalShops,
      activeShops,
      expiredShops,
      blockedShops,
      trialShops,
      newThisMonth,
      expiringSoon,
      planBreakdown,
      recentShops,
      monthlyGrowth,
    ] = await Promise.all([
      // Total shops
      prisma.shop.count(),

      // Active (subscriptionEndsAt > now && isActive)
      prisma.shop.count({
        where: { isActive: true, subscriptionEndsAt: { gt: now } },
      }),

      // Expired (subscriptionEndsAt < now && isActive)
      prisma.shop.count({
        where: { isActive: true, subscriptionEndsAt: { lt: now } },
      }),

      // Blocked
      prisma.shop.count({ where: { isActive: false } }),

      // Trial (FREE plan)
      prisma.shop.count({ where: { subscriptionPlan: 'FREE', isActive: true } }),

      // New this month
      prisma.shop.count({ where: { createdAt: { gte: startOfMonth } } }),

      // Expiring in next 7 days
      prisma.shop.findMany({
        where: {
          isActive: true,
          subscriptionEndsAt: { gt: now, lt: in7Days },
        },
        select: { id: true, name: true, subscriptionEndsAt: true, subscriptionPlan: true },
        orderBy: { subscriptionEndsAt: 'asc' },
      }),

      // Plan breakdown
      prisma.shop.groupBy({
        by: ['subscriptionPlan'],
        _count: true,
      }),

      // Recent 5 shops
      prisma.shop.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, name: true, phone: true,
          subscriptionPlan: true, isActive: true,
          subscriptionEndsAt: true, createdAt: true,
        },
      }),

      // Monthly growth (last 6 months)
      prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') AS month,
          COUNT(*)::int AS count
        FROM "Shop"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    // Revenue estimate (STARTER=499, PROFESSIONAL=999 per active shop)
    const planRevenue = { FREE: 0, STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 2999 };
    const monthlyRevenue = await prisma.shop.findMany({
      where: { isActive: true, subscriptionEndsAt: { gt: now } },
      select: { subscriptionPlan: true },
    });
    const estimatedRevenue = monthlyRevenue.reduce(
      (sum, s) => sum + (planRevenue[s.subscriptionPlan] || 0), 0
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalShops,
          activeShops,
          expiredShops,
          blockedShops,
          trialShops,
          newThisMonth,
          estimatedMonthlyRevenue: estimatedRevenue,
        },
        expiringSoon,
        planBreakdown: planBreakdown.map(p => ({
          plan: p.subscriptionPlan,
          count: p._count,
        })),
        recentShops,
        monthlyGrowth,
      },
    });
  } catch (err) {
    console.error('SA dashboard error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── GET /api/superadmin/shops ─────────────────────────────────────────────
router.get('/shops', async (req, res) => {
  try {
    const { search, status, plan, page = 1, limit = 20 } = req.query;
    const now = new Date();

    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (plan) where.subscriptionPlan = plan;
    if (status === 'active')   where = { ...where, isActive: true, subscriptionEndsAt: { gt: now } };
    if (status === 'expired')  where = { ...where, isActive: true, subscriptionEndsAt: { lt: now } };
    if (status === 'blocked')  where = { ...where, isActive: false };
    if (status === 'trial')    where = { ...where, subscriptionPlan: 'FREE', isActive: true };

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          _count: {
            select: { products: true, customers: true, sales: true, users: true },
          },
          users: {
            where: { role: 'ADMIN' },
            select: { name: true, email: true, phone: true },
            take: 1,
          },
        },
      }),
      prisma.shop.count({ where }),
    ]);

    // Add computed status
    const shopsWithStatus = shops.map(s => ({
      ...s,
      computedStatus: !s.isActive ? 'BLOCKED'
        : s.subscriptionPlan === 'FREE' ? 'TRIAL'
        : s.subscriptionEndsAt && s.subscriptionEndsAt < now ? 'EXPIRED'
        : 'ACTIVE',
    }));

    res.json({ success: true, data: shopsWithStatus, total });
  } catch (err) {
    console.error('SA shops error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── GET /api/superadmin/shops/:id ─────────────────────────────────────────
router.get('/shops/:id', async (req, res) => {
  try {
    const now = new Date();
    const shop = await prisma.shop.findUnique({
      where: { id: req.params.id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true },
        },
        _count: {
          select: { products: true, customers: true, sales: true, purchases: true },
        },
      },
    });
    if (!shop) return res.status(404).json({ success: false, error: 'Shop not found' });

    // Sales this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlySales = await prisma.sale.aggregate({
      where: { shopId: req.params.id, saleDate: { gte: startOfMonth } },
      _sum: { total: true },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        ...shop,
        computedStatus: !shop.isActive ? 'BLOCKED'
          : shop.subscriptionPlan === 'FREE' ? 'TRIAL'
          : shop.subscriptionEndsAt && shop.subscriptionEndsAt < now ? 'EXPIRED'
          : 'ACTIVE',
        monthlySales: {
          total: Number(monthlySales._sum.total || 0),
          count: monthlySales._count,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── PATCH /api/superadmin/shops/:id/block ─────────────────────────────────
router.patch('/shops/:id/block', async (req, res) => {
  try {
    await prisma.shop.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Shop blocked successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── PATCH /api/superadmin/shops/:id/unblock ───────────────────────────────
router.patch('/shops/:id/unblock', async (req, res) => {
  try {
    await prisma.shop.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });
    res.json({ success: true, message: 'Shop unblocked successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── PATCH /api/superadmin/shops/:id/subscription ──────────────────────────
const subSchema = z.object({
  plan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  months: z.number().int().min(1).max(12).optional().default(1),
  note: z.string().optional(),
});

router.patch('/shops/:id/subscription', async (req, res) => {
  try {
    const { plan, months } = subSchema.parse(req.body);

    const shop = await prisma.shop.findUnique({ where: { id: req.params.id } });
    if (!shop) return res.status(404).json({ success: false, error: 'Shop not found' });

    // Extend from today OR from current expiry (whichever is later)
    const base = shop.subscriptionEndsAt && shop.subscriptionEndsAt > new Date()
      ? shop.subscriptionEndsAt
      : new Date();

    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    await prisma.shop.update({
      where: { id: req.params.id },
      data: {
        subscriptionPlan: plan,
        subscriptionEndsAt: newExpiry,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: `Subscription updated: ${plan} until ${newExpiry.toLocaleDateString('en-GB')}`,
      newExpiry,
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── GET /api/superadmin/stats/revenue ─────────────────────────────────────
router.get('/stats/revenue', async (req, res) => {
  try {
    const planRevenue = { FREE: 0, STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 2999 };
    const now = new Date();

    const activeShops = await prisma.shop.findMany({
      where: { isActive: true, subscriptionEndsAt: { gt: now } },
      select: { subscriptionPlan: true },
    });

    const monthly = activeShops.reduce((sum, s) => sum + (planRevenue[s.subscriptionPlan] || 0), 0);
    const yearly = monthly * 12;

    res.json({ success: true, data: { monthly, yearly, activeCount: activeShops.length } });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── GET /api/superadmin/payment-requests ─────────────────────────────────
router.get('/payment-requests', async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;
    const where = status !== 'all' ? { status } : {};

    const requests = await prisma.paymentRequest.findMany({
      where,
      include: {
        shop: { select: { id: true, name: true, phone: true, subscriptionPlan: true, subscriptionEndsAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: requests });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── PATCH /api/superadmin/payment-requests/:id/approve ───────────────────
router.patch('/payment-requests/:id/approve', async (req, res) => {
  try {
    const request = await prisma.paymentRequest.findUnique({
      where: { id: req.params.id },
      include: { shop: true },
    });

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, error: 'Already processed' });

    const base = request.shop.subscriptionEndsAt && request.shop.subscriptionEndsAt > new Date()
      ? request.shop.subscriptionEndsAt
      : new Date();

    const newExpiry = new Date(base);
    newExpiry.setMonth(newExpiry.getMonth() + request.months);

    await prisma.$transaction([
      prisma.paymentRequest.update({ where: { id: request.id }, data: { status: 'APPROVED' } }),
      prisma.shop.update({
        where: { id: request.shopId },
        data: { subscriptionPlan: request.plan, subscriptionEndsAt: newExpiry, isActive: true },
      }),
    ]);

    res.json({ success: true, message: 'Payment approved. Subscription activated.' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ── PATCH /api/superadmin/payment-requests/:id/reject ────────────────────
router.patch('/payment-requests/:id/reject', async (req, res) => {
  try {
    const { note } = req.body;
    const request = await prisma.paymentRequest.findUnique({ where: { id: req.params.id } });

    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    if (request.status !== 'PENDING') return res.status(400).json({ success: false, error: 'Already processed' });

    await prisma.paymentRequest.update({
      where: { id: request.id },
      data: { status: 'REJECTED', note: note || null },
    });

    res.json({ success: true, message: 'Payment rejected.' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
