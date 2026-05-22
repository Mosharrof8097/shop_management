const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const { z }  = require('zod');
const prisma = require('../config/database');

const PLAN_AMOUNT = { STARTER: 499, PROFESSIONAL: 999, ENTERPRISE: 2999 };

const requestSchema = z.object({
  trxId:  z.string().min(5, 'Transaction ID দিন (কমপক্ষে ৫ অক্ষর)'),
  method: z.enum(['BKASH', 'NAGAD']),
  plan:   z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  months: z.number().int().min(1).max(12).default(1),
});

// POST /api/subscription/request
// Works even for expired subscriptions (subscription middleware skips /subscription)
router.post('/request', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Login করুন' });
    }

    let decoded;
    try {
      decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Session expired। আবার login করুন।' });
    }

    if (!decoded.shopId) {
      return res.status(403).json({ success: false, error: 'Shop account প্রয়োজন' });
    }

    const { trxId, method, plan, months } = requestSchema.parse(req.body);

    // Prevent duplicate TrxID submission
    const duplicate = await prisma.paymentRequest.findFirst({
      where: { trxId, status: 'PENDING' },
    });
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'এই Transaction ID আগেই submit করা হয়েছে।' });
    }

    const amount = (PLAN_AMOUNT[plan] || 499) * months;

    await prisma.paymentRequest.create({
      data: { shopId: decoded.shopId, trxId, method, plan, months, amount },
    });

    res.status(201).json({
      success: true,
      message: 'Payment request submit হয়েছে। Admin verify করবেন এবং ২৪ ঘণ্টার মধ্যে activate করবেন।',
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
