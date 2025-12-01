# 来信功能系统设计

## 业务逻辑分析

### 核心流程
1. **后端主动推送来信** → 基于预设模板生成来信实例
2. **用户查看来信列表** → 显示未读/已读状态
3. **用户查看来信详情** → 显示完整内容（文本+媒体）
4. **用户选择交互方式**：
   - "好啊，我试一下" → 用户主动回复（上传图片/输入歌词/输入信息）
   - "谢谢，我先保存这份心意" → 用户保存回复
5. **后端生成AI回复** → 根据用户回复生成AI回复内容
6. **完成交互** → 标记为已交互

### 来信类型
- `aiDrawing` - AI绘画：用户上传照片，AI生成绘画
- `aiSong` - AI歌曲：用户输入歌词，AI生成歌曲
- `aiHoroscope` - AI看星盘：用户输入信息，AI生成星盘

---

## 数据库设计

### 方案一：独立回复表（推荐）

#### 1. LetterTemplate (来信模板表)
**用途**: 存储预设的来信模板

```prisma
model LetterTemplate {
  id          String   @id @default(uuid())
  petId       String   // 哪个宠物发送
  type        String   // 'aiDrawing' | 'aiSong' | 'aiHoroscope'
  title       String   // 来信标题
  content     String   // 来信内容（长文本）
  mediaUrls   String[] // 媒体文件URLs（JSON数组，支持多张图片或视频）
  mediaType   String   // 'none' | 'singleImage' | 'fourImages' | 'video'
  
  // 触发条件
  triggerType String?  // 'city' | 'stepCount' | 'day' | 'manual'
  triggerValue String? // 触发值（城市ID、步数阈值、天数等）
  
  // 排序和状态
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  pet         Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
  letters     Letter[] // 基于此模板生成的来信实例
  
  @@map("letter_templates")
}
```

#### 2. Letter (用户来信表 - 扩展)
**用途**: 存储用户收到的来信实例

```prisma
model Letter {
  id              String   @id @default(uuid())
  userId          String
  petId           String
  templateId      String? // 关联的模板ID（可选，支持手动创建）
  
  title           String
  content         String
  type            String   // 'aiDrawing' | 'aiSong' | 'aiHoroscope'
  mediaUrls       String[] // 媒体文件URLs（JSON数组）
  mediaType       String   // 'none' | 'singleImage' | 'fourImages' | 'video'
  
  // 状态
  isRead          Boolean  @default(false)
  hasInteracted   Boolean  @default(false) // 是否已交互
  interactionType String?  // 'try' | 'save' | null - 用户选择的交互方式
  
  // 时间
  createdAt       DateTime @default(now())
  readAt          DateTime?
  interactedAt   DateTime?
  
  // 关联
  pet             Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  template        LetterTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  replies         LetterReply[] // 回复列表
  
  @@map("letters")
}
```

#### 3. LetterReply (来信回复表)
**用途**: 存储用户回复和AI回复

```prisma
model LetterReply {
  id          String   @id @default(uuid())
  letterId    String   // 关联的来信ID
  userId      String
  petId       String
  
  // 回复内容
  content     String   // 文本内容
  mediaUrls   String[] // 媒体文件URLs（用户上传的图片、AI生成的图片/视频等）
  mediaType   String   // 'none' | 'singleImage' | 'video'
  
  // 回复者
  isFromUser  Boolean  @default(true) // true=用户回复，false=AI回复
  
  // AI生成相关
  aiStatus    String?  // 'pending' | 'processing' | 'completed' | 'failed'
  aiResultUrl String?  // AI生成的结果URL（图片、音频等）
  
  createdAt   DateTime @default(now())
  
  letter      Letter   @relation(fields: [letterId], references: [id], onDelete: Cascade)
  pet         Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("letter_replies")
}
```

---

### 方案二：使用现有ChatMessage表（不推荐）
**问题**: ChatMessage是通用聊天表，来信回复有特殊业务逻辑（AI生成、状态跟踪），建议独立管理。

---

## 接口设计

### 1. 来信列表
**接口**: `GET /api/letter`

**功能**: 获取用户的来信列表

**查询参数**:
- `type`: 来信类型筛选（可选）
- `isRead`: 是否已读筛选（可选）

**响应**:
```json
{
  "letters": [
    {
      "id": "uuid-string",
      "title": "排队三小时就为了吃这个？人类的钱真是太...",
      "author": "艾迪", // pet name
      "date": "2025-09-12",
      "isUnread": true,
      "letterType": "aiDrawing",
      "imageUrl": "https://example.com/image.jpg", // 第一张图片或宠物头像
      "hasInteracted": false
    }
  ],
  "unreadCount": 2
}
```

---

### 2. 来信详情
**接口**: `GET /api/letter/:id`

**功能**: 获取来信的完整内容和回复历史

**响应**:
```json
{
  "id": "uuid-string",
  "title": "猜一猜，我这是在哪里？",
  "author": "艾迪",
  "type": "aiDrawing",
  "content": "这里是东门城楼，有一部分是可以上去走的...",
  "mediaUrls": [
    "https://example.com/img1.jpg",
    "https://example.com/img2.jpg",
    "https://example.com/img3.jpg",
    "https://example.com/img4.jpg"
  ],
  "mediaType": "fourImages",
  "isRead": true,
  "hasInteracted": false,
  "createdAt": "2025-09-12T10:00:00.000Z",
  "replies": [] // 回复列表
}
```

---

### 3. 标记已读
**接口**: `PUT /api/letter/:id/read`

**功能**: 标记来信为已读

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "isRead": true,
    "readAt": "2025-09-12T10:30:00.000Z"
  }
}
```

---

### 4. 用户回复来信
**接口**: `POST /api/letter/:id/reply`

**功能**: 用户回复来信（试一下或保存）

**请求体**:
```json
{
  "action": "try", // "try" 或 "save"
  "content": "好啊，给我画一张", // 用户回复文本（可选）
  "mediaUrls": ["https://example.com/user-image.jpg"], // 用户上传的图片（可选）
  "extraData": {
    // 根据type不同有不同字段
    // aiSong: { "songName": "xxx", "lyrics": "xxx" }
    // aiHoroscope: { "info": "xxx" }
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "replyId": "uuid-string",
    "letterId": "uuid-string",
    "userReply": {
      "id": "uuid-string",
      "content": "好啊，给我画一张",
      "mediaUrls": ["https://example.com/user-image.jpg"],
      "createdAt": "2025-09-12T10:35:00.000Z"
    },
    "aiReply": {
      "id": "uuid-string",
      "content": "好的，我正在为你生成绘画...",
      "aiStatus": "processing",
      "estimatedTime": 30 // 预计处理时间（秒）
    }
  }
}
```

---

### 5. 获取AI生成结果
**接口**: `GET /api/letter/:id/reply/:replyId`

**功能**: 获取AI回复的生成状态和结果

**响应**:
```json
{
  "id": "uuid-string",
  "aiStatus": "completed", // 'pending' | 'processing' | 'completed' | 'failed'
  "content": "这是为你生成的绘画作品！",
  "aiResultUrl": "https://example.com/ai-generated-image.jpg",
  "mediaUrls": ["https://example.com/ai-generated-image.jpg"],
  "createdAt": "2025-09-12T10:36:00.000Z"
}
```

---

### 6. 获取未读数量
**接口**: `GET /api/letter/unread-count`

**功能**: 获取未读来信数量

**响应**:
```json
{
  "count": 2
}
```

---

### 7. 推送来信（后端定时任务/手动触发）
**接口**: `POST /api/letter/push` (内部接口，可选)

**功能**: 根据触发条件自动推送来信给用户

**业务逻辑**:
1. 检查触发条件（城市、步数、天数等）
2. 查找匹配的模板
3. 为每个符合条件的用户创建来信实例
4. 发送推送通知

---

## 业务逻辑设计

### 触发来信的场景
1. **到达新城市**: 用户切换到新城市时
2. **完成步数目标**: 达到某个步数阈值
3. **旅行天数**: 旅行达到第X天
4. **手动推送**: 运营后台手动推送

### AI回复生成逻辑

#### aiDrawing (AI绘画)
1. 用户上传照片
2. 调用AI绘画API
3. 生成绘画结果
4. 返回结果URL

#### aiSong (AI歌曲)
1. 用户输入歌词
2. 调用AI歌曲生成API
3. 生成音频文件
4. 返回音频URL

#### aiHoroscope (AI看星盘)
1. 用户输入信息
2. 调用AI星盘生成API
3. 生成星盘图片
4. 返回图片URL

### 状态流转

```
来信创建 (hasInteracted=false)
    ↓
用户查看 (isRead=true)
    ↓
用户选择交互方式
    ├─→ "试一下" → 用户回复 → AI处理中 → AI完成
    └─→ "保存" → hasInteracted=true (直接完成)
```

---

## 数据库设计建议

### 推荐方案：方案一（独立回复表）

**优势**:
1. 清晰的业务边界（来信 vs 普通聊天）
2. 便于管理AI生成状态
3. 便于查询和统计
4. 扩展性好

### 需要扩展的字段

**Letter表扩展**:
- `mediaUrls`: String[] - 支持多个媒体文件
- `mediaType`: String - 媒体类型
- `hasInteracted`: Boolean - 是否已交互
- `interactionType`: String? - 交互类型
- `templateId`: String? - 关联模板
- `readAt`: DateTime? - 阅读时间
- `interactedAt`: DateTime? - 交互时间

**新增表**:
- `LetterTemplate` - 来信模板表
- `LetterReply` - 来信回复表

---

## 接口总结

### 需要实现的接口（7个）

1. ✅ `GET /api/letter` - 获取来信列表
2. ✅ `GET /api/letter/:id` - 获取来信详情
3. ✅ `PUT /api/letter/:id/read` - 标记已读
4. ✅ `POST /api/letter/:id/reply` - 用户回复来信
5. ✅ `GET /api/letter/:id/reply/:replyId` - 获取AI回复结果
6. ✅ `GET /api/letter/unread-count` - 获取未读数量
7. ⚠️ `POST /api/letter/push` - 推送来信（可选，可放在定时任务中）

---

## 技术考虑

### 1. 多媒体存储
- 使用云存储（OSS/S3）存储图片和视频
- mediaUrls字段存储JSON数组

### 2. AI集成
- 需要集成AI服务API
- 异步处理AI生成任务
- 使用队列或WebSocket推送结果

### 3. 推送机制
- 可以基于事件驱动（到达城市、完成步数等）
- 或使用定时任务检查触发条件

### 4. 性能优化
- 来信列表支持分页
- 媒体文件使用CDN加速
- 缓存未读数量

---

## 后续优化

1. **分享功能**: 来信可以分享到社交平台
2. **收藏功能**: 用户可以收藏喜欢的来信
3. **批量操作**: 标记全部已读、删除等
4. **个性化**: 根据用户行为推荐来信模板

