#!/bin/bash

# 数据库同步脚本（开发环境）
# 进入 Docker 容器并执行 Prisma db push

echo "🚀 开始同步数据库..."

# 进入 Docker 容器并执行 Prisma db push
docker-compose exec app npx prisma db push

# 检查执行结果
if [ $? -eq 0 ]; then
  echo "✅ 数据库同步成功！"
  echo "📝 正在生成 Prisma Client..."
  docker-compose exec app npx prisma generate
  
  if [ $? -eq 0 ]; then
    echo "✅ Prisma Client 生成成功！"
  else
    echo "❌ Prisma Client 生成失败"
    exit 1
  fi
else
  echo "❌ 数据库同步失败"
  exit 1
fi

echo "🎉 完成！"
