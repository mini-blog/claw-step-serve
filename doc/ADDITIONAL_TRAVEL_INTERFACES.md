# 旅行相关补充接口文档

## 概述
本文档描述基于UI需求实现的旅行相关补充接口，包括旅伴邀请管理、城市/大洲解锁、旅行券系统等。

## 已实现接口总结

### 一、旅伴邀请管理

#### 1. 生成邀请码
**接口**: `POST /api/travel/invitation/generate`

**认证**: 需要JWT Token

**响应**:
```json
{
  "invitationCode": "ABC12345",
  "expiresAt": "2024-01-08T00:00:00.000Z",
  "qrCodeUrl": "https://example.com/qr/ABC12345"
}
```

**说明**:
- 生成8位字母数字随机邀请码
- 有效期7天
- 如果用户已有有效的pending邀请码，直接返回
- 过期后自动删除旧记录

---

#### 2. 验证邀请码
**接口**: `POST /api/travel/invitation/validate`

**认证**: 需要JWT Token

**请求体**:
```json
{
  "invitationCode": "ABC12345"
}
```

**响应** (成功):
```json
{
  "success": true,
  "data": {
    "invitationId": "uuid-string",
    "inviter": {
      "id": "uuid-string",
      "nickname": "旅伴昵称",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
}
```

**响应** (失败):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE|CODE_USED|CODE_EXPIRED|SELF_INVITATION|ALREADY_PARTNERS",
    "message": "错误描述"
  }
}
```

**错误码说明**:
- `INVALID_CODE`: 邀请码不存在
- `CODE_USED`: 邀请码已使用
- `CODE_EXPIRED`: 邀请码已过期
- `SELF_INVITATION`: 不能接受自己的邀请
- `ALREADY_PARTNERS`: 你们已经是旅伴了

---

#### 3. 接受邀请
**接口**: `POST /api/travel/invitation/accept`

**认证**: 需要JWT Token

**请求体**:
```json
{
  "invitationCode": "ABC12345"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "partnershipId": "uuid-string",
    "partner": {
      "id": "uuid-string",
      "nickname": "旅伴昵称",
      "avatar": "https://example.com/avatar.jpg"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**说明**:
- 先验证邀请码有效性
- 建立旅伴关系
- 更新TravelPartnership状态为accepted

---

#### 4. 获取旅伴关系列表
**接口**: `GET /api/travel/partnerships`

**认证**: 需要JWT Token

**响应**:
```json
{
  "partnerships": [
    {
      "id": "uuid-string",
      "partner": {
        "id": "uuid-string",
        "nickname": "旅伴昵称",
        "avatar": "https://example.com/avatar.jpg"
      },
      "status": "accepted",
      "isActiveTravel": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "acceptedAt": "2024-01-01T00:00:00.000Z",
      "unbindExpiresAt": null
    }
  ]
}
```

**说明**:
- 获取所有accepted状态的旅伴关系
- 判断是否有正在进行的双人旅行
- 按接受时间倒序排列

---

#### 5. 解除旅伴关系
**接口**: `DELETE /api/travel/partnerships/:id`

**认证**: 需要JWT Token

**响应**:
```json
{
  "success": true,
  "data": {
    "partnershipId": "uuid-string",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

**说明**:
- 创建24小时解除请求
- 如果有正在进行的旅行，不能解除
- 24小时后自动解除关系
- 可以通过取消接口撤回解除请求

---

#### 6. 取消解除请求
**接口**: `POST /api/travel/partnerships/cancel-unbind`

**认证**: 需要JWT Token

**请求体**:
```json
{
  "partnershipId": "uuid-string"
}
```

**响应**:
```json
{
  "success": true
}
```

**说明**:
- 取消24小时解除请求
- 恢复旅伴关系

---

### 二、城市管理

#### 7. 获取所有城市
**接口**: `GET /api/city`

**筛选参数**:
- `continent`: 大洲筛选（如：Asia, Europe）
- `isUnlocked`: 是否解锁（true/false）

**响应**:
```json
{
  "cities": [
    {
      "id": "uuid-string",
      "name": "成都",
      "englishName": "Chengdu",
      "continent": "Asia",
      "country": "China",
      "imageUrl": "https://example.com/chengdu.jpg",
      "isUnlocked": true,
      "unlockCondition": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 8. 解锁城市
**接口**: `POST /api/city/:id/unlock`

**认证**: 需要JWT Token

**响应**:
```json
{
  "success": true,
  "data": {
    "cityId": "uuid-string",
    "unlocked": true,
    "unlockedAt": "2024-01-01T00:00:00.000Z",
    "remainingTickets": 2
  }
}
```

**说明**:
- 使用1张旅行券解锁城市
- 使用事务确保数据一致性
- 如果城市已解锁，直接返回成功
- 如果旅行券不足，返回400错误

---

#### 9. 获取大洲列表
**接口**: `GET /api/city/continent/list`

**响应**:
```json
{
  "continents": [
    {
      "name": "亚洲",
      "englishName": "Asia",
      "status": "unlocked",
      "unlockedCitiesCount": 4,
      "totalCitiesCount": 10,
      "imageUrl": "https://example.com/asia.jpg"
    }
  ]
}
```

**大洲状态说明**:
- `unlocked`: 已解锁（至少有1个城市）
- `locked`: 未解锁
- `comingSoon`: 敬请期待（暂无城市）

**支持的大洲**:
- 亚洲 (Asia)
- 欧洲 (Europe)
- 北美洲 (North America)
- 南美洲 (South America)
- 非洲 (Africa)
- 大洋洲 (Oceania)
- 世界之极 (The Poles)

---

### 三、旅行券系统

旅行券信息已集成在User模型中：

**字段**: `travelTickets` (Int，默认值3)

**说明**:
- 旅行券用于解锁城市
- 初始值3张
- 每解锁一个城市消耗1张
- 可通过活动或Pro会员获得更多

---

## 数据库变更

### User模型
新增字段：
- `travelTickets`: Int @default(3) - 旅行券数量

### TravelPartnership模型
更新字段：
- `inviteeId`: String? - 改为可选（生成邀请码时还不知道被邀请者）
- `expiresAt`: DateTime - 邀请码过期时间
- `unbindRequestedAt`: DateTime? - 解除请求时间
- `unbindExpiresAt`: DateTime? - 解除请求过期时间

删除约束：
- 移除 `@@unique([inviterId, inviteeId])`，因为inviteeId可能为null

---

## 业务流程

### 旅伴邀请流程
1. 用户A生成邀请码 → `POST /api/travel/invitation/generate`
2. 用户B验证邀请码 → `POST /api/travel/invitation/validate`
3. 用户B接受邀请 → `POST /api/travel/invitation/accept`
4. 建立旅伴关系 → TravelPartnership.status = "accepted"
5. 可以开始双人旅行 → `POST /api/travel/start` with type="dual"

### 解除旅伴流程
1. 用户发起解除请求 → `DELETE /api/travel/partnerships/:id`
2. 设置24小时倒计时
3. 可以在24小时内取消 → `POST /api/travel/partnerships/cancel-unbind`
4. 24小时后自动解除关系

### 城市解锁流程
1. 浏览城市列表 → `GET /api/city`
2. 查看大洲状态 → `GET /api/city/continent/list`
3. 选择目标城市
4. 使用旅行券解锁 → `POST /api/city/:id/unlock`
5. 扣除旅行券并解锁城市

---

## 错误处理

| 错误码 | 说明 | 可能原因 |
|--------|------|----------|
| 400 | Bad Request | 参数错误、旅行券不足、验证失败 |
| 401 | Unauthorized | 未提供JWT Token或Token无效 |
| 404 | Not Found | 城市不存在、旅伴关系不存在 |

---

## 注意事项

1. **邀请码唯一性**: invitationCode是唯一的，确保不重复
2. **邀请码过期**: 7天后自动过期并设置status为"expired"
3. **解除请求**: 24小时内可以取消，避免误操作
4. **事务处理**: 城市解锁使用事务确保数据一致性
5. **旅行券**: 初始值3，需要在创建用户时设置
6. **定期清理**: 建议使用定时任务定期清理过期的邀请和解除请求

---

## 与前端对接

前端 `TwoPersonTravelService` 期望的接口已全部实现：
- ✅ `POST /api/travel/invitation/generate` (原: `/invitation/generate`)
- ✅ `POST /api/travel/invitation/validate` (原: `/invitation/validate`)
- ✅ `POST /api/travel/invitation/accept` (原: `/invitation/accept`)
- ✅ `GET /api/travel/partnerships` (原: `/invitation/records`)
- ✅ `DELETE /api/travel/partnerships/:id` (原: `/friendship/unbind`)
- ✅ `POST /api/travel/partnerships/cancel-unbind` (原: `/friendship/cancel-unbind`)

所有接口路径已对齐前端需求。

---

## 后续优化建议

1. **定时任务**: 定期清理过期的邀请和解除请求
2. **二维码**: 实现真实的二维码生成逻辑
3. **通知推送**: 邀请、接受、解除时推送通知
4. **缓存**: 城市和大洲列表可以缓存
5. **旅行券来源**: 实现旅行券的获取逻辑（活动、Pro会员等）
6. **批量操作**: 支持批量解锁城市或大洲

