const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const productSchema = z.object({
  name: z.string().min(1, 'Name required'),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  currentStock: z.number().int().min(0).optional().default(0),
  minStockAlert: z.number().int().min(0).optional().default(5),
  unit: z.string().optional().default('পিস'),
  imageUrl: z.string().optional().nullable(),
});

// GET /api/products
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, categoryId, lowStock, page = 1, limit = 100 } = req.query;
    const shopId = req.user.shopId;

    const where = {
      shopId,
      isActive: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { name: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.product.count({ where }),
    ]);

    const result = lowStock === 'true'
      ? products.filter(p => p.currentStock <= p.minStockAlert)
      : products;

    res.json({ success: true, data: result, total, page: Number(page), limit: Number(limit) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/products/categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { shopId: req.user.shopId, isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/products
router.post('/', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const data = productSchema.parse(req.body);
    const shopId = req.user.shopId;

    const product = await prisma.product.create({
      data: { ...data, shopId },
      include: { category: { select: { id: true, name: true } } },
    });

    if (data.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          shopId,
          productId: product.id,
          type: 'OPENING',
          quantityBefore: 0,
          quantityChange: data.currentStock,
          quantityAfter: data.currentStock,
          reason: 'Initial stock entry',
          userId: req.user.userId,
        },
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'SKU already exists for this shop' });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const shopId = req.user.shopId;

    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, shopId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found' });

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    if (err.code === 'P2002') return res.status(409).json({ success: false, error: 'SKU already exists for this shop' });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/products/:id  (soft delete)
router.delete('/:id', authenticate, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, shopId: req.user.shopId, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ success: false, error: 'Product not found' });

    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    res.json({ success: true, message: 'Product deleted' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/products/:id/stock-history
router.get('/:id/stock-history', authenticate, async (req, res) => {
  try {
    const shopId = req.user.shopId;

    const product = await prisma.product.findFirst({
      where: { id: req.params.id, shopId },
    });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const history = await prisma.stockMovement.findMany({
      where: { productId: req.params.id, shopId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, product, data: history });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
