#!/bin/bash

# 服务器初始化脚本
# 用于在阿里云服务器上快速设置部署环境
# 使用方法: bash scripts/server-setup.sh

set -e

echo "🚀 开始服务器环境初始化..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "❌ 请使用 root 用户运行此脚本"
    exit 1
fi

# 1. 安装 Docker
echo "📦 检查 Docker 安装..."
if ! command -v docker &> /dev/null; then
    echo "安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 2. 安装 Docker Compose
echo "📦 检查 Docker Compose 安装..."
if ! command -v docker-compose &> /dev/null; then
    echo "安装 Docker Compose..."
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# 3. 创建项目目录
PROJECT_DIR="/opt/claw_step_serve"
echo "📁 创建项目目录: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 4. 创建必要的目录结构
echo "📁 创建目录结构..."
mkdir -p nginx/conf.d
mkdir -p nginx/ssl
mkdir -p nginx/logs

# 5. 设置 SSH 密钥（如果需要）
echo "🔑 检查 SSH 配置..."
if [ ! -f ~/.ssh/authorized_keys ]; then
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    touch ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "✅ SSH 目录已创建"
fi

# 6. 提示配置环境变量
echo ""
echo "📝 下一步操作："
echo "1. 将项目文件上传到 $PROJECT_DIR"
echo "2. 复制 .env.production.example 为 .env.production"
echo "3. 编辑 .env.production 填入实际配置："
echo "   - DATABASE_URL (阿里云云数据库连接字符串)"
echo "   - REDIS_URL (Redis 连接字符串)"
echo "   - JWT_SECRET_KEY (随机密钥)"
echo "   - ALIYUN_DOCKER_REGISTRY 和 ALIYUN_DOCKER_NAMESPACE"
echo ""
echo "4. 配置 GitHub Secrets（参考 .github/workflows/README.md）"
echo ""
echo "✅ 服务器环境初始化完成！"

