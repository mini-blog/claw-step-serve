-- 插入月度订阅方案（连续每月）
-- 左框显示，有限时优惠标签
INSERT INTO subscription_plans (
  id,
  "planType",
  name,
  description,
  price,
  "originalPrice",
  discount,
  duration,
  currency,
  "isActive",
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'monthly',
  '连续每月',
  '一顿午餐',
  36.00,
  48.00,
  25,
  30,
  'CNY',
  true,
  1,
  NOW(),
  NOW()
);

-- 插入年度订阅方案（连续每年）
-- 右框显示，节省40%标签
INSERT INTO subscription_plans (
  id,
  "planType",
  name,
  description,
  price,
  "originalPrice",
  discount,
  duration,
  currency,
  "isActive",
  "order",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'yearly',
  '连续每年',
  '一次周末出游',
  288.00,
  480.00,
  40,
  365,
  'CNY',
  true,
  2,
  NOW(),
  NOW()
);

