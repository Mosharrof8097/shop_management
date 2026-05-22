const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

module.exports = async (req, res, next) => {
  // Skip auth, superadmin, and subscription routes — they handle their own checks
  if (req.path.startsWith('/auth') || req.path.startsWith('/superadmin') || req.path.startsWith('/subscription') || req.path.startsWith('/shops')) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return next(); // Invalid/expired token — authenticate middleware will handle it
  }

  // Super admins and users without a shop are not subject to subscription checks
  if (!decoded.shopId || decoded.role === 'SUPER_ADMIN') return next();

  try {
    const shop = await prisma.shop.findUnique({
      where: { id: decoded.shopId },
      select: { isActive: true, subscriptionEndsAt: true },
    });

    if (!shop || !shop.isActive) {
      return res.status(403).json({
        success: false,
        shopBlocked: true,
        error: 'দোকানটি বর্তমানে বন্ধ করা হয়েছে। সাপোর্টে যোগাযোগ করুন।',
      });
    }

    if (shop.subscriptionEndsAt && new Date(shop.subscriptionEndsAt) < new Date()) {
      return res.status(403).json({
        success: false,
        subscriptionExpired: true,
        error: 'Subscription মেয়াদ শেষ হয়েছে। নবায়ন করুন।',
      });
    }
  } catch {
    // DB error — pass through; individual routes will fail gracefully
  }

  next();
};
