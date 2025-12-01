-- 手动迁移脚本：添加聊天系统表结构
-- 注意：此脚本需要根据现有数据库结构进行调整
-- 如果已有 chat_messages 表，需要先处理现有数据

-- 1. 创建 ChatSession 表
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    
    -- 会话信息
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 0,
    
    -- 统计
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessageCount" INTEGER NOT NULL DEFAULT 0,
    "petMessageCount" INTEGER NOT NULL DEFAULT 0,
    
    -- 状态
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- 2. 更新 chat_messages 表（如果表已存在）
DO $$
BEGIN
    -- 添加新字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='sessionId') THEN
        ALTER TABLE "chat_messages" ADD COLUMN "sessionId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='mediaUrls') THEN
        ALTER TABLE "chat_messages" ADD COLUMN "mediaUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='mediaType') THEN
        ALTER TABLE "chat_messages" ADD COLUMN "mediaType" TEXT DEFAULT 'none';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chat_messages' AND column_name='duration') THEN
        ALTER TABLE "chat_messages" ADD COLUMN "duration" INTEGER;
    END IF;
    
    -- 迁移现有数据：将 mediaUrl 转换为 mediaUrls
    UPDATE "chat_messages" 
    SET "mediaUrls" = CASE 
        WHEN "mediaUrl" IS NOT NULL THEN ARRAY["mediaUrl"]
        ELSE ARRAY[]::TEXT[]
    END,
    "mediaType" = CASE 
        WHEN "mediaUrl" IS NOT NULL THEN 'image'
        ELSE 'none'
    END
    WHERE "mediaUrls" IS NULL OR array_length("mediaUrls", 1) IS NULL;
    
    -- 更新 type 字段的值（如果使用的是旧值）
    -- 注意：根据实际数据调整
    UPDATE "chat_messages" 
    SET "type" = CASE 
        WHEN "type" = 'text' AND "isFromUser" = true THEN 'userText'
        WHEN "type" = 'text' AND "isFromUser" = false THEN 'petText'
        WHEN "type" = 'image' AND "isFromUser" = true THEN 'userImage'
        ELSE "type"
    END
    WHERE "type" IN ('text', 'image');
END $$;

-- 3. 添加外键约束
-- ChatSession 表的外键
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_sessions_userId_fkey'
    ) THEN
        ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_sessions_petId_fkey'
    ) THEN
        ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_petId_fkey" 
        FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ChatMessage 表的外键（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_sessionId_fkey'
    ) THEN
        ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" 
        FOREIGN KEY ("sessionId") REFERENCES "chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 4. 创建唯一约束（确保每个用户和宠物只有一个会话）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_sessions_userId_petId_key'
    ) THEN
        ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_petId_key" 
        UNIQUE ("userId", "petId");
    END IF;
END $$;

-- 5. 创建索引（可选，用于提高查询性能）
CREATE INDEX IF NOT EXISTS "chat_sessions_userId_idx" ON "chat_sessions"("userId");
CREATE INDEX IF NOT EXISTS "chat_sessions_petId_idx" ON "chat_sessions"("petId");
CREATE INDEX IF NOT EXISTS "chat_sessions_isActive_idx" ON "chat_sessions"("isActive");
CREATE INDEX IF NOT EXISTS "chat_sessions_userId_petId_idx" ON "chat_sessions"("userId", "petId");

CREATE INDEX IF NOT EXISTS "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");
CREATE INDEX IF NOT EXISTS "chat_messages_userId_idx" ON "chat_messages"("userId");
CREATE INDEX IF NOT EXISTS "chat_messages_petId_idx" ON "chat_messages"("petId");
CREATE INDEX IF NOT EXISTS "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

-- 完成
-- 注意：如果 chat_messages 表不存在，Prisma migrate 会自动创建
-- 如果 chat_messages 表已存在，请确保数据迁移正确执行
