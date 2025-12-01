# 旅行功能接口文档

## 概述
本文档描述旅行功能相关的所有后端接口，包括旅行状态、步数同步、旅伴管理等功能。

## 数据库变更

### Travel模型
新增 `Travel` 模型用于记录用户的旅行信息：

```prisma
model Travel {
  id            String    @id @default(uuid())
  userId        String
  cityId        String
  
  // 旅行类型：'single' 或 'dual'
  type          String
  
  // 双人旅行的旅伴信息
  partnerId     String?
  partnershipId String?
  
  // 旅行状态：'active', 'completed', 'paused'
  status        String    @default("active")
  
  // 时间相关
  startDate     DateTime  @default(now())
  endDate       DateTime?
  completedAt   DateTime?
  
  // 旅行统计
  totalSteps    Int       @default(0)
  totalCalories Int       @default(0)
  days          Int       @default(0)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  user          User      @relation(...)
  city          City      @relation(...)
  partnership   TravelPartnership? @relation(...)
  
  @@map("travels")
}
```

## 接口列表

### 1. 旅行状态

#### GET /api/travel/current
获取当前旅行

**认证**: 需要JWT Token

**响应**:
```json
{
  "id": "uuid-string",
  "userId": "uuid-string",
  "cityId": "uuid-string",
  "type": "single",
  "partnerId": null,
  "partnershipId": null,
  "status": "active",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-08T00:00:00.000Z",
  "completedAt": null,
  "totalSteps": 5000,
  "totalCalories": 200,
  "days": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "city": {
    "id": "uuid-string",
    "name": "成都",
    "englishName": "Chengdu",
    "imageUrl": "https://example.com/chengdu.jpg"
  },
  "partner": null
}
```

**说明**:
- 如果用户没有active的旅行，返回 `404`
- 自动检查并完成超过7天的旅行

---

### 2. 开始旅行

#### POST /api/travel/start
开始旅行（单人/双人）

**认证**: 需要JWT Token

**请求体**:
```json
{
  "cityId": "uuid-string",
  "type": "single",
  "partnerId": null,
  "partnershipId": null
}
```

**响应**: 同 GET /api/travel/current

**说明**:
- `type` 必须为 `"single"` 或 `"dual"`
- 双人旅行时，`partnerId` 和 `partnershipId` 必填
- 如果用户已有active的旅行，返回 `400` 错误
- 自动设置 `endDate` 为7天后
- 自动检查并完成过期的旅行

---

### 3. 旅伴管理

#### GET /api/travel/companions
获取当前旅伴列表

**认证**: 需要JWT Token

**响应**:
```json
{
  "companions": [
    {
      "id": "uuid-string",
      "nickname": "旅伴昵称",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}
```

**说明**:
- 单人旅行时返回空数组
- 只有双人旅行才有旅伴

---

#### POST /api/travel/switch-to-dual
单人切双人

**认证**: 需要JWT Token

**请求体**:
```json
{
  "partnerId": "uuid-string",
  "partnershipId": "uuid-string"
}
```

**响应**: 同 GET /api/travel/current

**说明**:
- 当前旅行必须是单人旅行，否则返回 `400` 错误
- 验证旅伴关系有效性
- 更新旅行类型为 `"dual"`

---

### 4. 统计

#### GET /api/travel/statistics
旅行统计

**认证**: 需要JWT Token

**响应**:
```json
{
  "totalDays": 10,
  "totalSteps": 50000,
  "totalCalories": 2000,
  "citiesCount": 5
}
```

**说明**:
- 统计所有 `completed` 状态的旅行
- `totalDays`: 累计旅行天数
- `totalSteps`: 累计步数
- `totalCalories`: 累计卡路里
- `citiesCount`: 访问过的城市数量

---

### 5. 步数同步

#### POST /api/travel/sync
同步步数

**认证**: 需要JWT Token

**请求体**:
```json
{
  "steps": 3500,
  "calories": 120,
  "date": "2024-01-01T00:00:00.000Z"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "userId": "uuid-string",
    "cityId": "uuid-string",
    "steps": 3500,
    "calories": 120,
    "date": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**说明**:
- 必须要有active的旅行，否则返回 `400` 错误
- `date` 可选，默认为今天
- `calories` 可选，默认为 `steps * 0.034`
- 使用 `upsert` 确保同日期的记录不重复
- 如果同步的是今日数据，会自动更新旅行统计和UserCity统计

---

### 6. 主页聚合信息

#### GET /api/home/summary
获取主页聚合信息

**认证**: 需要JWT Token

**响应**:
```json
{
  "currentCity": {
    "id": "uuid-string",
    "name": "成都",
    "englishName": "Chengdu"
  },
  "currentPet": {
    "id": "uuid-string",
    "name": "小狐狸"
  },
  "todaySteps": {
    "steps": 3500,
    "goal": 4000,
    "calories": 120
  },
  "companions": [],
  "user": {
    "id": "uuid-string",
    "nickname": "用户名",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

**说明**:
- 聚合显示主页所需的所有信息
- 并行查询多个数据源以提高性能
- 如果没有相应数据，字段可能为 `null` 或空数组

---

## 自动逻辑

### 定时检查过期旅行
系统在每次调用相关接口时自动检查：
1. 查找所有 `active` 状态的旅行
2. 判断 `startDate` 是否超过7天
3. 如果超过，自动更新为 `completed` 状态
4. 设置 `endDate` 和 `completedAt` 为当前时间

**实现位置**: `TravelService.checkAndCompleteExpiredTravels()`

**触发时机**:
- 获取当前旅行
- 开始新旅行
- 切换为双人旅行
- 获取旅伴列表

---

## 业务逻辑

### 旅行生命周期
1. **开始**: 用户选择城市，调用 `POST /api/travel/start`
   - 设置 `status = "active"`
   - 记录 `startDate`
   - 设置 `endDate` 为7天后
2. **进行中**: 用户同步步数，调用 `POST /api/travel/sync`
   - 更新步数记录
   - 更新旅行统计
3. **切换类型**: 单人切双人，调用 `POST /api/travel/switch-to-dual`
   - 更新 `type` 为 `"dual"`
   - 添加旅伴信息
4. **自动完成**: 超过7天自动完成
   - 系统自动检查
   - 设置 `status = "completed"`
   - 记录完成时间

### 旅伴关系验证
1. 验证 `TravelPartnership` 存在
2. 验证 `status` 为 `"accepted"`
3. 验证当前用户是否在关系中（inviter或invitee）
4. 验证 `partnerId` 匹配实际旅伴

### 步数统计
1. **今日步数**: 从 `StepRecord` 表中查询当天记录
2. **旅行统计**: 计算旅行期间所有步数记录的总和
3. **用户城市统计**: 更新 `UserCity` 的总步数和总卡路里
4. **自动同步**: 今天的数据会同步到多个统计维度

---

## 错误处理

| 错误码 | 说明 | 可能原因 |
|--------|------|----------|
| 400 | Bad Request | 参数错误、已有active旅行、验证失败 |
| 401 | Unauthorized | 未提供JWT Token或Token无效 |
| 404 | Not Found | 没有正在进行的旅行、城市不存在 |

---

## 数据流

```
开始旅行
  ↓
POST /api/travel/start
  ↓
创建Travel记录
  ↓
同步步数
  ↓
POST /api/travel/sync
  ↓
创建/更新StepRecord
  ↓
更新Travel统计
  ↓
更新UserCity统计
  ↓
7天后自动完成
  ↓
Travel.status = "completed"
```

---

## 待优化

1. **定时任务**: 考虑使用定时任务定期检查过期旅行，而不是在每次API调用时检查
2. **缓存**: 对频繁查询的主页数据进行缓存
3. **分页**: 统计数据较多时分页显示
4. **批量同步**: 支持一次性同步多天的步数数据
5. **通知**: 旅行即将结束时发送提醒通知

