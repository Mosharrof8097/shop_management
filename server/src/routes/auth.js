const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/database');
const { authenticate } = require('../middleware/auth');

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

const registerSchema = z.object({
  shopName:  z.string().min(2, 'দোকানের নাম দিন'),
  ownerName: z.string().min(2, 'মালিকের নাম দিন'),
  phone:     z.string().min(11, 'সঠিক মোবাইল নম্বর দিন'),
  email:     z.string().email('সঠিক ইমেইল দিন'),
  password:  z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর'),
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase(), isActive: true },
      include: {
        shop: { select: { id: true, name: true, address: true, phone: true, currency: true, logoUrl: true, subscriptionPlan: true, subscriptionEndsAt: true, isActive: true } },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Block check for shop users (not super admin)
    if (user.role !== 'SUPER_ADMIN' && user.shop) {
      if (!user.shop.isActive) {
        return res.status(403).json({ success: false, shopBlocked: true, error: 'আপনার দোকানটি বর্তমানে বন্ধ করা হয়েছে। সাপোর্টে যোগাযোগ করুন।' });
      }
      // B.3 — Hard block on subscription expiry
      if (user.shop.subscriptionEndsAt && new Date(user.shop.subscriptionEndsAt) < new Date()) {
        return res.status(403).json({ success: false, subscriptionExpired: true, error: 'আপনার subscription মেয়াদ শেষ হয়েছে। নবায়ন করুন।' });
      }
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const token = jwt.sign(
      { userId: user.id, shopId: user.shopId || null, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Check subscription expiry for shop users
    let subscriptionWarning = null;
    if (user.shop?.subscriptionEndsAt) {
      const daysLeft = Math.ceil((new Date(user.shop.subscriptionEndsAt) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 7 && daysLeft > 0) subscriptionWarning = `আপনার subscription ${daysLeft} দিন পরে শেষ হবে।`;
      if (daysLeft <= 0) subscriptionWarning = 'আপনার subscription মেয়াদ শেষ হয়েছে। নবায়ন করুন।';
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shop: user.shop,
        subscriptionWarning,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { shopName, ownerName, phone, email, password } = registerSchema.parse(req.body);

    const existing = await prisma.user.findFirst({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(409).json({ success: false, error: 'এই ইমেইলে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।' });

    const passwordHash = await bcrypt.hash(password, 10);
    const trialEndsAt  = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { shop, user } = await prisma.$transaction(async tx => {
      const shop = await tx.shop.create({
        data: { name: shopName, phone, currency: 'BDT', subscriptionPlan: 'FREE', subscriptionEndsAt: trialEndsAt, isActive: true },
      });
      const user = await tx.user.create({
        data: { shopId: shop.id, name: ownerName, email: email.toLowerCase(), passwordHash, role: 'ADMIN', isActive: true },
      });
      return { shop, user };
    });

    const token = jwt.sign(
      { userId: user.id, shopId: shop.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        shop: { id: shop.id, name: shop.name, subscriptionPlan: shop.subscriptionPlan, subscriptionEndsAt: shop.subscriptionEndsAt, isActive: shop.isActive },
        subscriptionWarning: `আপনার ১৪ দিনের ফ্রি ট্রায়াল শুরু হয়েছে।`,
      },
    });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ success: false, error: err.errors[0].message });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, name: true, email: true, role: true, isActive: true,
        shop: { select: { id: true, name: true, address: true, phone: true, currency: true, logoUrl: true, subscriptionPlan: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
