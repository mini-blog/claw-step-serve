-- 清理现有数据 (可选，根据需要取消注释)
-- DELETE FROM "cities";
-- DELETE FROM "continents";

-- 插入洲数据 (Asia & Europe)
INSERT INTO "continents" ("id", "name", "englishName", "imageUrl", "order", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', '亚洲', 'Asia', '', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', '欧洲', 'Europe', '', 2, true, NOW(), NOW());

-- 插入亚洲城市 (Asia Cities)
-- ID: 550e8400-e29b-41d4-a716-446655440001
INSERT INTO "cities" ("id", "name", "englishName", "continentId", "country", "imageUrl", "isUnlocked", "unlockCondition", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440011', '首尔', 'Seoul', '550e8400-e29b-41d4-a716-446655440001', 'South Korea', '', true, NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '成都', 'Chengdu', '550e8400-e29b-41d4-a716-446655440001', 'China', '', false, '30000 steps', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '曼谷', 'Bangkok', '550e8400-e29b-41d4-a716-446655440001', 'Thailand', '', false, '50000 steps', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', '巴厘岛', 'Bali', '550e8400-e29b-41d4-a716-446655440001', 'Indonesia', '', false, '80000 steps', NOW(), NOW());

-- 插入欧洲城市 (Europe Cities)
-- ID: 550e8400-e29b-41d4-a716-446655440002
INSERT INTO "cities" ("id", "name", "englishName", "continentId", "country", "imageUrl", "isUnlocked", "unlockCondition", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440021', '罗马', 'Rome', '550e8400-e29b-41d4-a716-446655440002', 'Italy', '', false, '100000 steps', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '巴黎', 'Paris', '550e8400-e29b-41d4-a716-446655440002', 'France', '', false, '120000 steps', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', '雷克雅未克', 'Reykjavik', '550e8400-e29b-41d4-a716-446655440002', 'Iceland', '', false, '150000 steps', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', '圣托里尼', 'Santorini', '550e8400-e29b-41d4-a716-446655440002', 'Greece', '', false, '180000 steps', NOW(), NOW());

