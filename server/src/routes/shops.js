const router = require('express').Router();
const { z }  = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const updateSchema = z.object({
  name:    z.string().min(2, 'দোকানের নাম দিন').optional(),
  address: z.string().optional().nullable(),
  phone:   z.string().optional().nullable(),
  email:   z.string().email('সঠিক ইমেইল দিন').optional().nullable().or(z.literal('')),
});

// GET /api/shops/me — current shop info
router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user.shopId) return res.status(403).json({ success: false, error: 'Shop account প্রয়োজন' });

    const shop = await prisma.shop.findUnique({
      where: { id: req.user.shopId },
      select: { id: true, name: true, address: true, phone: true, email: true, currency: true, logoUrl: true, subscriptionPlan: true, subscriptionEndsAt: true },
    });

    if (!shop) return res.status(404).json({ success: false, error: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PATCH /api/shops/me — update shop settings
router.patch('/me', authenticate, async (req, res) => {
  try {
    if (!req.user.shopId) return res.status(403).json({ success: false, error: 'Shop account প্রয়োজন' });
    if (!['ADMIN'].includes(req.user.role)) return res.status(403).json({ success: false, error: 'Permission নেই' });

    const data = updateSchema.parse(req.body);

    // Clean empty strings to null
    if (data.email === '') data.email = null;

    const shop = await prisma.shop.update({
      where: { id: req.user.shopId },
      data,
      select: { id: true, name: true, address: true, phone: true, email: true, currency: true, logoUrl: true, subscriptionPlan: true },
    });

    res.json({ success: true, data: shop });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
