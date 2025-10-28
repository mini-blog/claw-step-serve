#!/bin/bash

# OpenAPI 生成脚本
# 用于生成 OpenAPI JSON 文件，供客户端代码生成使用

echo "🚀 启动应用并生成 OpenAPI JSON 文件..."

# 设置环境变量
export NODE_ENV=development

# 启动应用（后台运行）
npm run start:dev &
APP_PID=$!

# 等待应用启动
echo "⏳ 等待应用启动..."
sleep 10

# 检查应用是否启动成功
if ! curl -f http://localhost:3000/api > /dev/null 2>&1; then
    echo "❌ 应用启动失败"
    kill $APP_PID
    exit 1
fi

echo "✅ 应用启动成功"

# 生成 OpenAPI JSON
echo "📝 生成 OpenAPI JSON 文件..."
curl -o openapi.json http://localhost:3000/docs-json

if [ $? -eq 0 ]; then
    echo "✅ OpenAPI JSON 文件生成成功: openapi.json"
    echo "📊 文件大小: $(du -h openapi.json | cut -f1)"
else
    echo "❌ OpenAPI JSON 文件生成失败"
fi

# 停止应用
echo "🛑 停止应用..."
kill $APP_PID

echo "🎉 完成！"
