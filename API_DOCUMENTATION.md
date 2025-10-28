# API 文档和 OpenAPI 生成

## 📚 Swagger UI 文档

### 访问方式
- **开发环境**: http://localhost:3000/docs
- **生产环境**: https://your-domain.com/docs

### 功能特性
- ✅ 完整的 API 接口文档
- ✅ 在线测试接口功能
- ✅ JWT 认证支持
- ✅ 请求/响应示例
- ✅ 错误码说明

## 🔧 OpenAPI JSON 生成

### 自动生成（推荐）
```bash
# 生成 OpenAPI JSON 文件
npm run generate:openapi
```

### 手动生成
```bash
# 1. 启动应用
npm run start:dev

# 2. 访问 OpenAPI JSON
curl -o openapi.json http://localhost:3000/docs-json
```

### 生成的文件
- `openapi.json` - OpenAPI 3.0 规范的 JSON 文件

## 🚀 客户端代码生成

### 使用 OpenAPI Generator

#### 1. 安装 OpenAPI Generator
```bash
npm install -g @openapitools/openapi-generator-cli
```

#### 2. 生成 Flutter/Dart 客户端
```bash
# 生成 Flutter 客户端代码
openapi-generator-cli generate \
  -i openapi.json \
  -g dart \
  -o ./clients/flutter \
  --additional-properties=pubName=claw_step_api,pubVersion=1.0.0
```

#### 3. 生成 TypeScript 客户端
```bash
# 生成 TypeScript 客户端代码
openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./clients/typescript \
  --additional-properties=npmName=claw-step-api,npmVersion=1.0.0
```

#### 4. 生成其他语言客户端
```bash
# Java
openapi-generator-cli generate -i openapi.json -g java -o ./clients/java

# Python
openapi-generator-cli generate -i openapi.json -g python -o ./clients/python

# Go
openapi-generator-cli generate -i openapi.json -g go -o ./clients/go
```

## 📋 API 接口概览

### 认证接口 (auth)
- `POST /api/auth/check-phone` - 检查手机号是否已注册
- `POST /api/auth/phone/one-click` - 一键登录（移动商SDK）
- `POST /api/auth/phone/code-login` - 验证码登录
- `POST /api/auth/phone/send-code` - 发送短信验证码
- `GET /api/auth/refresh` - 刷新访问令牌

### 用户接口 (user)
- `GET /api/user` - 获取用户信息
- `POST /api/user` - 创建用户
- `PUT /api/user` - 更新用户信息

## 🔐 认证方式

### JWT Bearer Token
```bash
# 在请求头中添加
Authorization: Bearer <your-jwt-token>
```

### Swagger UI 中设置
1. 点击右上角的 "Authorize" 按钮
2. 输入 JWT token
3. 点击 "Authorize"

## 📝 开发规范

### 添加新接口
1. 在 Controller 中添加 `@ApiOperation` 装饰器
2. 添加 `@ApiResponse` 装饰器描述响应
3. 创建对应的 DTO 类并添加 `@ApiProperty` 装饰器
4. 更新 OpenAPI JSON 文件

### 示例
```typescript
@ApiOperation({ 
  summary: '接口摘要',
  description: '详细描述'
})
@ApiResponse({ status: 200, description: '成功', type: ResponseDto })
@Post('/endpoint')
async endpoint(@Body() dto: RequestDto): Promise<ResponseDto> {
  // 实现逻辑
}
```

## 🔄 更新流程

1. 修改 API 接口
2. 运行 `npm run generate:openapi` 生成新的 OpenAPI JSON
3. 使用新的 JSON 文件重新生成客户端代码
4. 更新客户端项目中的 API 调用

## 📞 支持

如有问题，请联系开发团队或查看项目文档。
