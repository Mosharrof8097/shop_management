const router = require('express').Router();
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).optional().default(0),
});

const saleSchema = z.object({
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  saleDate: z.string().optional(),
  discount: z.number().min(0).optional().default(0),
  tax: z.number().min(0).optional().default(0),
  paidAmount: z.number().min(0),
  paymentType: z.enum(['CASH', 'CREDIT', 'PARTIAL']),
  paymentMethod: z.enum(['CASH', 'BKASH', 'NAGAD', 'ROCKET', 'CHECK', 'BANK_TRANSFER']).optional().default('CASH'),
  notes: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, 'At least one item required'),
});

// Helper: generate next invoice number — pg_advisory_xact_lock prevents concurrent duplicates
async function generateInvoiceNo(tx, shopId) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  // Row-level advisory lock per shop: concurrent requests for the same shop queue up
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${shopId}::text))`;

  const result = await tx.$queryRaw`
    SELECT COALESCE(
      MAX(CAST(SPLIT_PART("invoiceNo", '-', 3) AS INTEGER)),
      0
    ) + 1 AS next_num
    FROM "Sale"
    WHERE "shopId" = ${shopId}::uuid
    AND "invoiceNo" LIKE ${prefix + '%'}
  `;

  const nextNum = Number(result[0]?.next_num || 1);
  return `${prefix}${String(nextNum).padStart(5, '0')}`;
}

// GET /api/sales
router.get('/', authenticate, async (req, res) => {
  try {
    const { from, to, customerId, status, page = 1, limit = 20 } = req.query;
    const shopId = req.user.shopId;

    const where = {
      shopId,
      ...(status && { status }),
      ...(customerId && { customerId }),
      ...((from || to) && {
        saleDate: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(`${to}T23:59:59`) }),
        },
      }),
    };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { name: true } },
          items: true,
        },
        orderBy: { saleDate: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.sale.count({ where }),
    ]);

    res.json({ success: true, data: sales, total, page: Number(page), limit: Number(limit) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/sales/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sale = await prisma.sale.findFirst({
      where: { id: req.params.id, shopId: req.user.shopId },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true, address: true } },
        user: { select: { name: true } },
      },
    });
    if (!sale) return res.status(404).json({ success: false, error: 'Sale not found' });
    res.json({ success: true, data: sale });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/sales  ⭐ Core: stock deduction + ledger + invoice generation
router.post('/', authenticate, async (req, res) => {
  try {
    const body = saleSchema.parse(req.body);
    const shopId = req.user.shopId;

    // Pre-validate: products exist and have enough stock
    const productMap = {};
    for (const item of body.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, shopId, isActive: true, deletedAt: null },
      });
      if (!product) {
        return res.status(400).json({ success: false, error: `Product not found: ${item.productId}` });
      }
      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`,
        });
      }
      productMap[item.productId] = product;
    }

    // Calculate totals
    const itemTotals = body.items.map(item => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice - (item.discount || 0),
    }));
    const subtotal = itemTotals.reduce((sum, i) => sum + i.lineTotal, 0);
    const total = subtotal - (body.discount || 0) + (body.tax || 0);
    const dueAmount = Math.max(0, total - body.paidAmount);

    if (body.paidAmount > total) {
      return res.status(400).json({ success: false, error: 'Paid amount cannot exceed total' });
    }

    const sale = await prisma.$transaction(async (tx) => {
      const invoiceNo = await generateInvoiceNo(tx, shopId);

      // 1. Create sale + line items
      const newSale = await tx.sale.create({
        data: {
          shopId,
          invoiceNo,
          customerId: body.customerId || null,
          customerName: body.customerName || null,
          saleDate: body.saleDate ? new Date(body.saleDate) : new Date(),
          subtotal,
          discount: body.discount || 0,
          tax: body.tax || 0,
          total,
          paidAmount: body.paidAmount,
          dueAmount,
          paymentType: body.paymentType,
          paymentMethod: body.paymentMethod || 'CASH',
          notes: body.notes || null,
          status: 'COMPLETED',
          userId: req.user.userId,
          items: {
            create: itemTotals.map(item => ({
              productId: item.productId,
              productName: productMap[item.productId].name,
              productSku: productMap[item.productId].sku,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              total: item.lineTotal,
            })),
          },
        },
      });

      // 2. Deduct stock + record movement per item (atomic check inside transaction)
      for (const item of body.items) {
        const product = productMap[item.productId];
        // Conditional update: only succeeds if currentStock >= quantity (prevents overselling)
        const updatedProduct = await tx.product.updateMany({
          where: { id: item.productId, shopId, currentStock: { gte: item.quantity } },
          data: { currentStock: { decrement: item.quantity } },
        });
        if (updatedProduct.count === 0) {
          throw new Error(`STOCK_INSUFFICIENT:${product.name}`);
        }
        await tx.stockMovement.create({
          data: {
            shopId,
            productId: item.productId,
            type: 'SALE',
            referenceId: newSale.id,
            referenceType: 'SALE',
            quantityBefore: product.currentStock,
            quantityChange: -item.quantity,
            quantityAfter: product.currentStock - item.quantity,
            reason: `Sale ${invoiceNo}`,
            userId: req.user.userId,
          },
        });
      }

      // 3. Customer ledger — only when there is a due amount with a named customer
      if (dueAmount > 0 && body.customerId) {
        // Use update return value — avoids stale balance read race condition
        const updatedCustomer = await tx.customer.update({
          where: { id: body.customerId },
          data: { totalDue: { increment: dueAmount } },
        });
        const newBalance = Number(updatedCustomer.totalDue);

        await tx.customerTransaction.create({
          data: {
            shopId,
            customerId: body.customerId,
            date: body.saleDate ? new Date(body.saleDate) : new Date(),
            type: 'SALE',
            invoiceNo,
            description: `বিক্রয় — ${invoiceNo}`,
            debit: dueAmount,
            credit: 0,
            runningBalance: newBalance,
            paymentMethod: body.paymentMethod || 'CASH',
          },
        });
      }

      return newSale;
    });

    const result = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: true,
        customer: { select: { id: true, name: true, phone: true } },
        user: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    if (err.message?.startsWith('STOCK_INSUFFICIENT:')) {
      const name = err.message.split(':')[1];
      return res.status(409).json({ success: false, error: `"${name}" পণ্যের পর্যাপ্ত stock নেই।` });
    }
    console.error('Sale create error:', err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/sales/:id/payment  — record a payment against a credit/partial sale
router.post('/:id/payment', authenticate, async (req, res) => {
  try {
    const { amount, paymentMethod = 'CASH' } = req.body;
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    const shopId = req.user.shopId;
    const sale = await prisma.sale.findFirst({
      where: { id: req.params.id, shopId },
      include: { customer: true },
    });
    if (!sale) return res.status(404).json({ success: false, error: 'Sale not found' });
    if (Number(sale.dueAmount) <= 0) {
      return res.status(400).json({ success: false, error: 'No outstanding due on this sale' });
    }
    if (parsedAmount > Number(sale.dueAmount)) {
      return res.status(400).json({ success: false, error: 'Amount exceeds due amount' });
    }

    await prisma.$transaction(async (tx) => {
      const remaining = Number(sale.dueAmount) - parsedAmount;

      await tx.sale.update({
        where: { id: sale.id },
        data: {
          paidAmount: { increment: parsedAmount },
          dueAmount: remaining,
          paymentType: remaining <= 0 ? 'CASH' : 'PARTIAL',
        },
      });

      if (sale.customerId) {
        // Use { decrement } + update return value — avoids stale balance race condition
        const updatedCustomer = await tx.customer.update({
          where: { id: sale.customerId },
          data: { totalDue: { decrement: parsedAmount } },
        });
        const newBalance = Math.max(0, Number(updatedCustomer.totalDue));

        // Clamp to zero if decrement made it negative
        if (Number(updatedCustomer.totalDue) < 0) {
          await tx.customer.update({ where: { id: sale.customerId }, data: { totalDue: 0 } });
        }

        await tx.customerTransaction.create({
          data: {
            shopId,
            customerId: sale.customerId,
            date: new Date(),
            type: 'PAYMENT',
            invoiceNo: sale.invoiceNo,
            description: `পরিশোধ — ${sale.invoiceNo}`,
            debit: 0,
            credit: parsedAmount,
            runningBalance: newBalance,
            paymentMethod,
          },
        });
      }
    });

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
