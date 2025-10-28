# Claw Step Backend Service - 项目上下文文档

## 项目概述
这是"爪步"(Claw Step)电子宠物陪伴旅游应用的NestJS后端服务。该应用通过AI虚拟宠物，将用户的日常步数转化为沉浸式全球旅行体验的情感疗愈应用。

## 技术栈
- **框架**: NestJS
- **语言**: TypeScript
- **数据库**: PostgreSQL (主数据库)
- **ORM**: Prisma
- **认证**: JWT + Passport
- **缓存**: Redis (计划中)
- **部署**: Docker + Docker Compose

## 核心功能模块

### 1. 用户认证系统
- **多种登录方式**:
  - Google OAuth登录
  - Apple ID登录
  - 邮箱密码登录
  - 手机号验证码登录
  - 海外邮箱登录
- **用户信息管理**:
  - 用户资料（昵称、头像、性别等）
  - 个人设置（语言、通知偏好等）
  - 隐私设置

### 2. 宠物系统
- **宠物选择**: 4个不同的电子宠物
  - 艾迪 (Eddie) - 爱薅羊毛，毒舌点评
  - 皮克 (Pik) - 恶作剧爱好者
  - 乌迪斯 (Udis) - 肌肉发达，热爱文学
  - 巴布 (Babu) - 内心摇滚歌手
- **宠物档案**: 简介、旅行统计、梦想进度、成就系统
- **宠物互动**: AI对话、语音聊天、图片识别

### 3. 旅行系统
- **步数转化**: 将日常步数转化为旅行体验
- **城市解锁**: 全球各大洲城市解锁系统
- **旅行方式**:
  - 单人旅行
  - 双人旅行（Pro功能）
- **旅行记录**: 旅行天数、步数统计、里程记录

### 4. 消息系统
- **来信功能**: 宠物发送的AI生成信件
  - AI绘画信件
  - AI歌曲信件
  - AI看星盘信件
- **对话功能**: 与宠物的多模态聊天
  - 文字对话
  - 图片分享
  - 语音聊天
- **通知系统**: 消息通知、系统通知

### 5. 双人旅行系统
- **邀请系统**: 生成邀请码，邀请好友
- **旅伴管理**: 好友关系、解除旅伴
- **合作功能**: 双人剧情、互动玩法、更多礼物

### 6. 用户管理
- **个人主页**: 用户信息展示、功能入口
- **Pro订阅**: 会员功能、特权管理
- **设置中心**: 各种功能设置
- **意见反馈**: 用户反馈收集

## Flutter应用分析结果

### 应用架构
- **主入口**: `main.dart` - 应用启动和路由配置
- **页面结构**: 登录 → 宠物选择 → 主页
- **国际化**: 支持中英文切换
- **状态管理**: 使用setState进行状态管理

### 核心页面分析

#### 1. 登录系统
- **主登录页面**: 4种登录方式选择
- **邮箱登录**: 邮箱密码登录/注册
- **国内登录**: 一键登录 + 第三方登录
- **手机号登录**: 验证码登录
- **忘记密码流程**: 邮箱 → 验证码 → 新密码

#### 2. 宠物选择系统
- **4个宠物轮播**: 每个宠物有独特的性格和描述
- **多屏流程**: 选择宠物 → 输入昵称 → 选择目的地 → 步数权限
- **个性化设置**: 用户昵称、旅行目的地选择

#### 3. 主页面系统
- **3个Tab页面**: 旅行、来信、对话
- **步数显示**: 实时步数进度条
- **Tab导航**: PNG图标，选中放大效果

#### 4. 来信系统
- **信件列表**: 宠物发来的AI生成信件
- **信件类型**: AI绘画、AI歌曲、AI看星盘
- **信件详情**: 聊天式消息布局，支持媒体展示

#### 5. 对话系统
- **多模态聊天**: 文字、图片、语音
- **输入模式**: 文本模式、语音模式、录音中
- **AI回复**: 根据用户输入类型智能回复

#### 6. 双人旅行系统
- **邀请功能**: 生成8位邀请码，7天有效期
- **接受邀请**: 输入邀请码验证
- **旅伴管理**: 解绑/取消解绑功能
- **24小时倒计时**: 解绑后24小时内可取消

#### 7. 用户管理系统
- **个人主页**: 用户信息、功能入口
- **Pro订阅**: 年费/月费选择，特权展示
- **旅伴档案**: 宠物详细信息、统计数据
- **步数统计**: 各城市步数统计
- **优惠券管理**: 优惠券列表和使用
- **语言切换**: 10种语言支持
- **设置中心**: 各种功能设置
- **意见反馈**: 文本输入、图片上传

### API服务分析

#### TwoPersonTravelService
- **generateInvitationCode()**: 生成邀请码
- **validateInvitationCode()**: 验证邀请码
- **acceptInvitation()**: 接受邀请
- **getInvitationRecords()**: 获取邀请记录
- **unbindPartner()**: 解除旅伴关系
- **cancelUnbind()**: 取消解除旅伴关系

#### HealthService
- **checkHealthPermission()**: 检查健康权限
- **requestHealthPermission()**: 请求健康权限
- **getCurrentSteps()**: 获取当前步数

### 国际化支持
- **支持语言**: 中文、英文
- **文本键值**: 150+个国际化键值
- **动态切换**: 支持运行时语言切换

## 数据库设计

### 核心表结构

#### 用户表 (users)
```sql
- id: 用户唯一标识
- openid: 第三方登录标识
- username: 用户名
- nickname: 昵称
- avatar: 头像URL
- email: 邮箱
- phone: 手机号
- language: 语言偏好
- isPro: 是否Pro用户
- createdAt: 创建时间
- updatedAt: 更新时间
```

#### 宠物表 (pets)
```sql
- id: 宠物唯一标识
- name: 宠物名称
- englishName: 英文名称
- description: 宠物描述
- imageUrl: 宠物图片
- personality: 性格特点
- createdAt: 创建时间
```

#### 用户宠物关系表 (user_pets)
```sql
- id: 关系唯一标识
- userId: 用户ID
- petId: 宠物ID
- isActive: 是否当前宠物
- selectedAt: 选择时间
```

#### 城市表 (cities)
```sql
- id: 城市唯一标识
- name: 城市名称
- englishName: 英文名称
- continent: 所属大洲
- country: 所属国家
- imageUrl: 城市图片
- isUnlocked: 是否已解锁
- unlockCondition: 解锁条件
```

#### 用户城市关系表 (user_cities)
```sql
- id: 关系唯一标识
- userId: 用户ID
- cityId: 城市ID
- visitCount: 访问次数
- totalSteps: 总步数
- totalCalories: 总卡路里
- firstVisitAt: 首次访问时间
- lastVisitAt: 最后访问时间
```

#### 步数记录表 (step_records)
```sql
- id: 记录唯一标识
- userId: 用户ID
- cityId: 城市ID
- steps: 步数
- calories: 卡路里
- date: 记录日期
- createdAt: 创建时间
```

#### 信件表 (letters)
```sql
- id: 信件唯一标识
- userId: 用户ID
- petId: 宠物ID
- title: 信件标题
- content: 信件内容
- type: 信件类型 (painting/song/astrology)
- mediaUrl: 媒体文件URL
- isRead: 是否已读
- createdAt: 创建时间
```

#### 聊天记录表 (chat_messages)
```sql
- id: 消息唯一标识
- userId: 用户ID
- petId: 宠物ID
- type: 消息类型 (text/image/voice)
- content: 消息内容
- mediaUrl: 媒体文件URL
- isFromUser: 是否来自用户
- createdAt: 创建时间
```

#### 双人旅行表 (travel_partnerships)
```sql
- id: 关系唯一标识
- inviterId: 邀请者ID
- inviteeId: 被邀请者ID
- invitationCode: 邀请码
- status: 状态 (pending/accepted/expired)
- createdAt: 创建时间
- acceptedAt: 接受时间
```

#### 通知表 (notifications)
```sql
- id: 通知唯一标识
- userId: 用户ID
- title: 通知标题
- content: 通知内容
- type: 通知类型
- isRead: 是否已读
- createdAt: 创建时间
```

#### Pro订阅表 (pro_subscriptions)
```sql
- id: 订阅唯一标识
- userId: 用户ID
- planType: 订阅类型 (monthly/yearly)
- status: 状态 (active/expired/cancelled)
- startDate: 开始时间
- endDate: 结束时间
- createdAt: 创建时间
```

## API设计规范

### 认证相关
- `POST /auth/google` - Google登录
- `POST /auth/apple` - Apple登录
- `POST /auth/email` - 邮箱登录
- `POST /auth/phone` - 手机号登录
- `POST /auth/refresh` - 刷新Token

### 用户相关
- `GET /user/profile` - 获取用户信息
- `PUT /user/profile` - 更新用户信息
- `POST /user/avatar` - 上传头像
- `GET /user/settings` - 获取用户设置
- `PUT /user/settings` - 更新用户设置

### 宠物相关
- `GET /pets` - 获取所有宠物
- `GET /pets/:id` - 获取宠物详情
- `POST /user/pet/select` - 选择宠物
- `GET /user/pet/profile` - 获取用户宠物档案

### 旅行相关
- `GET /cities` - 获取城市列表
- `GET /cities/:id` - 获取城市详情
- `POST /travel/start` - 开始旅行
- `GET /travel/records` - 获取旅行记录
- `POST /travel/step` - 记录步数

### 消息相关
- `GET /letters` - 获取来信列表
- `GET /letters/:id` - 获取信件详情
- `POST /chat/send` - 发送消息
- `GET /chat/history` - 获取聊天记录

### 双人旅行相关
- `POST /travel/invite` - 生成邀请码
- `POST /travel/accept` - 接受邀请
- `GET /travel/partnerships` - 获取旅伴关系
- `DELETE /travel/partnerships/:id` - 解除旅伴关系

### 通知相关
- `GET /notifications` - 获取通知列表
- `PUT /notifications/:id/read` - 标记已读
- `GET /notifications/unread-count` - 获取未读数量

## 开发规范

### 代码组织
- 按功能模块组织代码
- 使用DTO进行数据传输
- 统一的错误处理
- 完整的API文档

### 数据库规范
- 使用UUID作为主键
- 统一的时间戳字段
- 软删除机制
- 适当的索引优化

### 安全规范
- JWT Token认证
- 输入验证和过滤
- SQL注入防护
- 敏感信息加密

## 部署说明

### 开发环境
- 使用Docker Compose启动服务
- PostgreSQL数据库
- Redis缓存（可选）

### 生产环境
- 云服务数据库
- 云Redis缓存
- 容器化部署

## 待开发功能

### 短期目标
- [ ] 完成基础用户认证系统
- [ ] 实现宠物选择和管理
- [ ] 开发步数记录和转化
- [ ] 实现基础消息系统

### 中期目标
- [ ] AI对话功能集成
- [ ] 语音聊天功能
- [ ] 图片识别和处理
- [ ] 双人旅行系统

### 长期目标
- [ ] 高级AI功能
- [ ] 社交功能扩展
- [ ] 数据分析系统
- [ ] 国际化支持

## 注意事项

1. **数据安全**: 用户隐私数据需要加密存储
2. **性能优化**: 步数数据量大，需要分页和缓存
3. **AI集成**: 需要集成AI服务进行内容生成
4. **国际化**: 支持多语言和时区
5. **扩展性**: 设计需要考虑未来功能扩展
