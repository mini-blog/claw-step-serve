# API 端点文档

## 认证端点

- **POST** `/api/auth/google` - Google OAuth登录
- **POST** `/api/auth/apple` - Apple ID登录
- **POST** `/api/auth/email` - 邮箱登录
- **POST** `/api/auth/phone` - 手机号登录
- **POST** `/api/auth/refresh` - 令牌刷新

## 用户端点

- **GET** `/api/user/profile` - 获取用户资料
- **PUT** `/api/user/profile` - 更新用户资料
- **POST** `/api/user/avatar` - 上传头像
- **GET** `/api/user/settings` - 获取用户设置
- **PUT** `/api/user/settings` - 更新用户设置

## 宠物端点

- **GET** `/api/pets` - 获取所有宠物
- **GET** `/api/pets/:id` - 获取宠物详情
- **POST** `/api/user/pet/select` - 选择宠物
- **GET** `/api/user/pet/profile` - 获取用户宠物档案

## 城市端点

- **GET** `/api/cities` - 获取城市列表
- **GET** `/api/cities/:id` - 获取城市详情
- **POST** `/api/cities/:id/unlock` - 解锁城市

## 旅行端点

- **POST** `/api/travel/start` - 开始旅行
- **GET** `/api/travel/records` - 获取旅行记录
- **POST** `/api/travel/step` - 记录步数
- **GET** `/api/travel/statistics` - 获取步数统计

## 消息端点

- **GET** `/api/letters` - 获取来信列表
- **GET** `/api/letters/:id` - 获取信件详情
- **POST** `/api/chat/send` - 发送消息
- **GET** `/api/chat/history` - 获取聊天记录

## 双人旅行端点

- **POST** `/api/travel/invite` - 生成邀请码
- **POST** `/api/travel/accept` - 接受邀请
- **GET** `/api/travel/partnerships` - 获取旅伴关系
- **DELETE** `/api/travel/partnerships/:id` - 解除旅伴关系

## 通知端点

- **GET** `/api/notifications` - 获取通知列表
- **PUT** `/api/notifications/:id/read` - 标记已读
- **GET** `/api/notifications/unread-count` - 获取未读数量

## Pro订阅端点

- **GET** `/api/pro/subscription` - 获取订阅信息
- **POST** `/api/pro/subscribe` - 订阅Pro版本
- **PUT** `/api/pro/cancel` - 取消订阅

## 反馈端点

- **POST** `/api/feedback` - 提交意见反馈
- **GET** `/api/feedback` - 获取反馈列表

## WebSocket 事件

- **连接**: 用户认证
- **实时消息**: 聊天消息推送
- **步数更新**: 步数数据同步
- **通知推送**: 系统通知推送

## 认证

- **Bearer Token**: 需要 JWT 认证
- **公共路由**: 登录、注册、健康检查
- **受保护路由**: 所有其他端点

## 响应格式

```json
{
  "code": 200,
  "message": "成功",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 错误处理

- **400**: 错误请求
- **401**: 未授权
- **403**: 禁止访问
- **404**: 未找到
- **500**: 内部服务器错误
