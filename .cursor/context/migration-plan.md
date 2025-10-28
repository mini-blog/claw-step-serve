# TypeORM 到 Prisma 迁移计划

## 第一阶段：Prisma 设置 ✅

1. ✅ 安装 Prisma 依赖
2. ✅ 初始化 Prisma 配置
3. ✅ 基于现有实体引用创建 Prisma 模式
4. ✅ 生成 Prisma 客户端

## 第二阶段：数据库模式创建 ✅

1. ✅ 在 Prisma 模式中定义所有实体
2. ⏳ 创建数据库迁移
3. ⏳ 更新数据库连接配置

## 第三阶段：服务层更新 ✅

1. ✅ 用 Prisma 客户端替换 TypeORM 存储库
2. ✅ 更新服务方法以使用 Prisma 语法
3. ✅ 处理事务管理
4. ✅ 更新错误处理

## 第四阶段：模块更新 ✅

1. ✅ 移除 TypeORM 模块导入
2. ✅ 添加 Prisma 服务提供者
3. ✅ 更新依赖注入
4. ✅ 清理未使用的导入

## 第五阶段：测试和验证 ⏳

1. ⏳ 测试所有端点
2. ⏳ 验证数据库操作
3. ⏳ 检查认证流程
4. ⏳ 验证 WebSocket 功能

## 实体映射策略

### UserEntity → User 模型

```prisma
model User {
  id          String   @id @default(uuid())
  openid      String   @unique
  sessionKey  String?
  userName    String?
  userIcon    String?
  sex         Int?
  telephone   String?
  userType    Int?
  editSex     Boolean?
  appUserId   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 其他需要的模型

- Bottle: 漂流瓶功能
- Chat: 直接消息
- ChatRoom: 群聊室
- UserBlackList: 用户屏蔽
- UserBottleConfig: 用户偏好
- UserReport: 举报系统

## 配置更改

1. ✅ 从 OrmConnectModule 移除 TypeORM
2. ✅ 将 PrismaService 添加到核心模块
3. ⏳ 更新数据库连接字符串
4. ⏳ 在 main.ts 中配置 Prisma 客户端
