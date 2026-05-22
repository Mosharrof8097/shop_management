const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const customerSchema = z.object({
  name: z.string().min(1, 'Name required'),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  creditLimit: z.number().min(0).optional().nullable(),
});

const paymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'CHECK', 'BANK_TRANSFER']).optional().default('CASH'),
  description: z.string().optional(),
});

// GET /api/customers
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const shopId = req.user.shopId;

    const where = {
      shopId,
      deletedAt: null,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ success: true, data: customers, total });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user.shopId, deletedAt: null },
    });
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/customers/:id/ledger
router.get('/:id/ledger', authenticate, async (req, res) => {
  try {
    const { from, to, type, page = 1, limit = 50 } = req.query;
    const shopId = req.user.shopId;

    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId, deletedAt: null },
    });
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });

    const where = {
      customerId: req.params.id,
      shopId,
      ...(type && { type }),
      ...((from || to) && {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(`${to}T23:59:59`) }),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.customerTransaction.findMany({
        where,
        orderBy: { date: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.customerTransaction.count({ where }),
    ]);

    // Aggregates for the statement footer
    const agg = await prisma.customerTransaction.aggregate({
      where: { customerId: req.params.id, shopId },
      _sum: { debit: true, credit: true },
    });

    res.json({
      success: true,
      customer,
      data: transactions,
      total,
      summary: {
        totalDebit: Number(agg._sum.debit || 0),
        totalCredit: Number(agg._sum.credit || 0),
        closingBalance: Number(customer.totalDue),
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/customers
router.post('/', authenticate, async (req, res) => {
  try {
    const data = customerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: { ...data, shopId: req.user.shopId },
    });
    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const data = customerSchema.partial().parse(req.body);
    const shopId = req.user.shopId;

    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Customer not found' });

    const updated = await prisma.customer.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/customers/:id (soft delete)
router.delete('/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.user.shopId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Customer not found' });

    await prisma.customer.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
    res.json({ success: true, message: 'Customer deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/customers/payment  — standalone payment (not tied to a specific sale)
router.post('/payment', authenticate, async (req, res) => {
  try {
    const { customerId, amount, paymentMethod = 'CASH', description } = paymentSchema.parse(req.body);
    const shopId = req.user.shopId;

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, shopId, deletedAt: null },
    });
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    if (Number(customer.totalDue) <= 0) {
      return res.status(400).json({ success: false, error: 'Customer has no outstanding due' });
    }
    if (amount > Number(customer.totalDue)) {
      return res.status(400).json({ success: false, error: 'Amount exceeds customer total due' });
    }

    await prisma.$transaction(async (tx) => {
      const newBalance = Math.max(0, Number(customer.totalDue) - amount);

      await tx.customer.update({
        where: { id: customerId },
        data: { totalDue: newBalance },
      });

      await tx.customerTransaction.create({
        data: {
          shopId,
          customerId,
          date: new Date(),
          type: 'PAYMENT',
          description: description || 'বাকি পরিশোধ',
          debit: 0,
          credit: amount,
          runningBalance: newBalance,
          paymentMethod,
        },
      });
    });

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
