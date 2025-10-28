#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./deploy-prod.sh

set -e  # 遇到错误立即退出

echo "🚀 开始生产环境部署..."

# 检查环境变量文件
if [ ! -f ".env.production" ]; then
    echo "❌ 错误: .env.production 文件不存在"
    echo "请复制 env.production.example 为 .env.production 并填入实际配置"
    exit 1
fi

# 检查必要的环境变量
source .env.production
if [ -z "$DATABASE_URL" ] || [ -z "$REDIS_URL" ] || [ -z "$JWT_SECRET_KEY" ]; then
    echo "❌ 错误: 缺少必要的环境变量"
    echo "请确保 .env.production 中包含 DATABASE_URL, REDIS_URL, JWT_SECRET_KEY"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose -f docker-compose.prod.yml down

# 清理旧镜像（可选）
echo "🧹 清理旧镜像..."
docker image prune -f

# 构建新镜像
echo "🔨 构建应用镜像..."
docker-compose -f docker-compose.prod.yml build --no-cache app

# 启动服务
echo "🚀 启动生产服务..."
docker-compose -f docker-compose.prod.yml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

# 检查应用健康状态
echo "🏥 检查应用健康状态..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ 应用健康检查通过"
else
    echo "❌ 应用健康检查失败"
    echo "查看应用日志:"
    docker-compose -f docker-compose.prod.yml logs app
    exit 1
fi

# 显示服务信息
echo ""
echo "🎉 部署完成!"
echo "📱 应用地址: http://localhost"
echo "📚 API文档: http://localhost/api-docs"
echo "🏥 健康检查: http://localhost/health"
echo ""
echo "📋 服务状态:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "📝 查看日志命令:"
echo "docker-compose -f docker-compose.prod.yml logs -f app"
echo "docker-compose -f docker-compose.prod.yml logs -f nginx"
