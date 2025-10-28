# 当前架构分析

## 核心模块

### 1. 核心模块 (`libs/core/src/modules/`)

- **MixConfigModule**: 配置管理
- **PrismaModule**: 数据库连接 (Prisma)
- **通用工具**: 守卫、拦截器、过滤器、管道

### 2. 业务模块

#### 认证模块 (`src/modules/auth/`)

- **AuthService**: 处理多种登录方式（Google、Apple、邮箱、手机号）
- **JWT 策略**: 基于令牌的认证
- **DTOs**: 请求/响应验证

#### 用户模块 (`src/modules/user/`)

- **UserService**: 用户 CRUD 操作
- **UserController**: REST 端点
- **用户 DTOs**: 数据传输对象

#### 宠物模块 (`src/modules/pet/`)

- **PetService**: 宠物信息管理
- **PetController**: 宠物相关端点
- **宠物档案**: 简介、旅行统计、梦想进度、成就系统

#### 城市模块 (`src/modules/city/`)

- **CityService**: 城市信息管理
- **CityController**: 城市相关端点
- **城市解锁**: 全球各大洲城市解锁系统

#### 旅行模块 (`src/modules/travel/`)

- **TravelService**: 旅行记录管理
- **TravelController**: 旅行相关端点
- **步数记录**: 步数统计和转化

#### 消息模块 (`src/modules/message/`)

- **MessageService**: 消息处理
- **MessageController**: 消息端点
- **来信系统**: 宠物发送的AI生成信件
- **对话系统**: 与宠物的多模态聊天

#### 通知模块 (`src/modules/notification/`)

- **NotificationService**: 通知管理
- **NotificationController**: 通知端点
- **系统通知**: 消息通知、系统通知

## 数据库模型 (已重新设计)

基于Flutter应用需求，已重新设计以下模型：

1. **User**: 用户信息
   - 字段: id, openid, email, phone, username, nickname, avatar, language, isPro

2. **Pet**: 电子宠物信息
   - 字段: id, name, englishName, description, imageUrl, personality

3. **UserPet**: 用户宠物关系
   - 字段: id, userId, petId, isActive, selectedAt

4. **City**: 城市信息
   - 字段: id, name, englishName, continent, country, imageUrl, isUnlocked, unlockCondition

5. **UserCity**: 用户城市关系
   - 字段: id, userId, cityId, visitCount, totalSteps, totalCalories, firstVisitAt, lastVisitAt

6. **StepRecord**: 步数记录
   - 字段: id, userId, cityId, steps, calories, date

7. **Letter**: 宠物来信
   - 字段: id, userId, petId, title, content, type, mediaUrl, isRead

8. **ChatMessage**: 聊天记录
   - 字段: id, userId, petId, type, content, mediaUrl, isFromUser

9. **TravelPartnership**: 双人旅行关系
   - 字段: id, inviterId, inviteeId, invitationCode, status, createdAt, acceptedAt

10. **Notification**: 通知
    - 字段: id, userId, title, content, type, isRead

11. **ProSubscription**: Pro订阅
    - 字段: id, userId, planType, status, startDate, endDate

12. **Feedback**: 意见反馈
    - 字段: id, userId, content, contact, imageUrl, status

## 当前 ORM 设置

- **Prisma** 与 PostgreSQL
- **自动连接** 已启用
- **服务模式** 在服务中使用
- **完整的模型定义** 已重新设计

## 认证流程

1. 多种登录方式支持
2. JWT 令牌生成和验证
3. 用户信息管理
4. 受保护路由使用 JWT 守卫

## WebSocket 集成

- **WsAdapter** 配置用于实时通信
- **WsStartGateway** 用于 WebSocket 处理
- **端口 3001** 用于 WebSocket 连接
