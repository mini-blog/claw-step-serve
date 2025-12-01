-- 手动迁移脚本：添加来信系统表结构
-- 注意：此脚本需要根据现有数据库结构进行调整
-- 如果已有 letters 表，需要先处理现有数据

-- 1. 创建 LetterTemplate 表
CREATE TABLE IF NOT EXISTS "letter_templates" (
    "id" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaType" TEXT NOT NULL,
    "triggerType" TEXT,
    "triggerValue" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letter_templates_pkey" PRIMARY KEY ("id")
);

-- 2. 创建 LetterReply 表
CREATE TABLE IF NOT EXISTS "letter_replies" (
    "id" TEXT NOT NULL,
    "letterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaType" TEXT NOT NULL,
    "isFromUser" BOOLEAN NOT NULL DEFAULT true,
    "aiStatus" TEXT,
    "aiResultUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "letter_replies_pkey" PRIMARY KEY ("id")
);

-- 3. 更新 letters 表（如果表已存在）
-- 注意：如果 letters 表已存在，需要先备份数据
DO $$
BEGIN
    -- 添加新字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='templateId') THEN
        ALTER TABLE "letters" ADD COLUMN "templateId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='mediaUrls') THEN
        ALTER TABLE "letters" ADD COLUMN "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='mediaType') THEN
        ALTER TABLE "letters" ADD COLUMN "mediaType" TEXT DEFAULT 'none';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='hasInteracted') THEN
        ALTER TABLE "letters" ADD COLUMN "hasInteracted" BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='interactionType') THEN
        ALTER TABLE "letters" ADD COLUMN "interactionType" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='readAt') THEN
        ALTER TABLE "letters" ADD COLUMN "readAt" TIMESTAMP(3);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='letters' AND column_name='interactedAt') THEN
        ALTER TABLE "letters" ADD COLUMN "interactedAt" TIMESTAMP(3);
    END IF;
    
    -- 迁移现有数据：将 mediaUrl 转换为 mediaUrls
    -- 注意：这需要根据实际数据结构调整
    UPDATE "letters" 
    SET "mediaUrls" = CASE 
        WHEN "mediaUrl" IS NOT NULL THEN ARRAY["mediaUrl"]
        ELSE ARRAY[]::TEXT[]
    END,
    "mediaType" = CASE 
        WHEN "mediaUrl" IS NOT NULL THEN 'singleImage'
        ELSE 'none'
    END
    WHERE "mediaUrls" IS NULL OR array_length("mediaUrls", 1) IS NULL;
END $$;

-- 4. 添加外键约束
-- LetterTemplate 表的外键
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'letter_templates_petId_fkey'
    ) THEN
        ALTER TABLE "letter_templates" ADD CONSTRAINT "letter_templates_petId_fkey" 
        FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- LetterReply 表的外键
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'letter_replies_letterId_fkey'
    ) THEN
        ALTER TABLE "letter_replies" ADD CONSTRAINT "letter_replies_letterId_fkey" 
        FOREIGN KEY ("letterId") REFERENCES "letters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'letter_replies_userId_fkey'
    ) THEN
        ALTER TABLE "letter_replies" ADD CONSTRAINT "letter_replies_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'letter_replies_petId_fkey'
    ) THEN
        ALTER TABLE "letter_replies" ADD CONSTRAINT "letter_replies_petId_fkey" 
        FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- letters 表的外键（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'letters_templateId_fkey'
    ) THEN
        ALTER TABLE "letters" ADD CONSTRAINT "letters_templateId_fkey" 
        FOREIGN KEY ("templateId") REFERENCES "letter_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. 创建索引（可选，用于提高查询性能）
CREATE INDEX IF NOT EXISTS "letter_templates_petId_idx" ON "letter_templates"("petId");
CREATE INDEX IF NOT EXISTS "letter_templates_type_idx" ON "letter_templates"("type");
CREATE INDEX IF NOT EXISTS "letter_templates_isActive_idx" ON "letter_templates"("isActive");

CREATE INDEX IF NOT EXISTS "letters_userId_idx" ON "letters"("userId");
CREATE INDEX IF NOT EXISTS "letters_petId_idx" ON "letters"("petId");
CREATE INDEX IF NOT EXISTS "letters_type_idx" ON "letters"("type");
CREATE INDEX IF NOT EXISTS "letters_isRead_idx" ON "letters"("isRead");
CREATE INDEX IF NOT EXISTS "letters_templateId_idx" ON "letters"("templateId");

CREATE INDEX IF NOT EXISTS "letter_replies_letterId_idx" ON "letter_replies"("letterId");
CREATE INDEX IF NOT EXISTS "letter_replies_userId_idx" ON "letter_replies"("userId");
CREATE INDEX IF NOT EXISTS "letter_replies_petId_idx" ON "letter_replies"("petId");

-- 完成
-- 注意：如果 letters 表不存在，Prisma migrate 会自动创建
-- 如果 letters 表已存在，请确保数据迁移正确执行
