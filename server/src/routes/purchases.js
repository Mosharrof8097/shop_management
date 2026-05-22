const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const purchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitCost: z.number().positive(),
});

const purchaseSchema = z.object({
  supplierId: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  purchaseDate: z.string().optional(),
  paidAmount: z.number().min(0),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item required'),
});

// GET /api/purchases
router.get('/', authenticate, async (req, res) => {
  try {
    const { from, to, supplierId, status, page = 1, limit = 20 } = req.query;
    const shopId = req.user.shopId;

    const where = {
      shopId,
      ...(status && { status }),
      ...(supplierId && { supplierId }),
      ...((from || to) && {
        purchaseDate: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(`${to}T23:59:59`) }),
        },
      }),
    };

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, phone: true } },
          user: { select: { name: true } },
          items: true,
        },
        orderBy: { purchaseDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.purchase.count({ where }),
    ]);

    res.json({ success: true, data: purchases, total });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/purchases/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const purchase = await prisma.purchase.findFirst({
      where: { id: req.params.id, shopId: req.user.shopId },
      include: {
        supplier: true,
        items: true,
        user: { select: { name: true } },
      },
    });
    if (!purchase) return res.status(404).json({ success: false, error: 'Purchase not found' });
    res.json({ success: true, data: purchase });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/purchases  — creates purchase + auto-increments stock
router.post('/', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const body = purchaseSchema.parse(req.body);
    const shopId = req.user.shopId;

    // Pre-validate products
    const productMap = {};
    for (const item of body.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, shopId, deletedAt: null },
      });
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.productId}` });
      }
      productMap[item.productId] = product;
    }

    const subtotal = body.items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0);
    const total = subtotal;
    const dueAmount = Math.max(0, total - body.paidAmount);

    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Create purchase + line items
      const newPurchase = await tx.purchase.create({
        data: {
          shopId,
          supplierId: body.supplierId || null,
          invoiceNo: body.invoiceNo || null,
          purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
          subtotal,
          total,
          paidAmount: body.paidAmount,
          dueAmount,
          status: dueAmount > 0 ? 'PARTIAL' : 'COMPLETED',
          notes: body.notes || null,
          userId: req.user.userId,
          items: {
            create: body.items.map(item => ({
              productId: item.productId,
              productName: productMap[item.productId].name,
              quantity: item.quantity,
              unitCost: item.unitCost,
              total: item.quantity * item.unitCost,
            })),
          },
        },
      });

      // 2. Increment stock + record movement per item
      for (const item of body.items) {
        const product = productMap[item.productId];
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: item.productId,
            type: 'PURCHASE',
            referenceId: newPurchase.id,
            referenceType: 'PURCHASE',
            quantityBefore: product.currentStock,
            quantityChange: item.quantity,
            quantityAfter: product.currentStock + item.quantity,
            reason: `Purchase ${body.invoiceNo || newPurchase.id}`,
            userId: req.user.userId,
          },
        });
      }

      // 3. Update supplier due if applicable
      if (dueAmount > 0 && body.supplierId) {
        await tx.supplier.update({
          where: { id: body.supplierId },
          data: { totalDue: { increment: dueAmount } },
        });
      }

      return newPurchase;
    });

    const result = await prisma.purchase.findUnique({
      where: { id: purchase.id },
      include: { supplier: true, items: true, user: { select: { name: true } } },
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    console.error('Purchase create error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/purchases/suppliers  — list suppliers
router.get('/suppliers/list', authenticate, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { shopId: req.user.shopId, status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: suppliers });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
