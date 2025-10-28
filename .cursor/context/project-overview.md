# Claw Step Serve - 项目概览

## 项目描述

基于 NestJS 的"爪步"电子宠物陪伴旅游应用后端服务。该应用通过AI虚拟宠物，将用户的日常步数转化为沉浸式全球旅行体验的情感疗愈应用。

## 技术栈

- **框架**: NestJS (Node.js)
- **数据库**: PostgreSQL (在 docker-compose.yaml 中配置)
- **ORM**: Prisma
- **认证**: JWT with Passport
- **WebSocket**: 实时通信支持
- **文档**: Swagger/OpenAPI
- **容器化**: Docker

## 项目结构

```
claw_step_serve/
├── libs/core/                 # 核心共享模块
│   └── src/
│       ├── common/           # 通用工具、守卫、拦截器
│       ├── constants/        # 应用常量
│       └── modules/          # 核心模块 (配置, ORM)
├── src/
│   ├── modules/              # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── user/            # 用户管理
│   │   ├── pet/             # 宠物系统
│   │   ├── city/            # 城市管理
│   │   ├── travel/          # 旅行系统
│   │   ├── message/         # 消息系统
│   │   └── notification/    # 通知系统
│   └── main.ts              # 应用入口点
├── docker-compose.yaml      # 数据库和 Redis 配置
└── package.json             # 依赖和脚本
```

## 核心功能

1. **用户认证**: 多种登录方式（Google、Apple、邮箱、手机号）
2. **宠物系统**: 4个电子宠物选择和互动
3. **旅行系统**: 步数转化为旅行体验，城市解锁
4. **消息系统**: 宠物来信、AI对话、语音聊天
5. **双人旅行**: 邀请好友、旅伴管理
6. **用户管理**: 个人资料、Pro订阅、设置中心

## 数据库配置

- **主机**: PostgreSQL 15 (Alpine)
- **端口**: 5432
- **数据库**: claw_step
- **用户**: root
- **密码**: /bipwqhso2aH

## 当前状态

- ✅ 已成功迁移到 Prisma ORM
- ✅ 数据库模式已重新设计
- ✅ 服务层已更新
- ✅ 类型系统已更新
- ✅ 项目上下文已同步Flutter应用需求
