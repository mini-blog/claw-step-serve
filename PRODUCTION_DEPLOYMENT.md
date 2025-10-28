# 生产环境配置指南

## 📋 配置文件说明

### 1. 环境变量配置
- `env.production.example` - 生产环境配置模板
- `.env.production` - 实际生产环境配置（需要手动创建）

### 2. Docker配置
- `docker-compose.prod.yml` - 生产环境Docker Compose配置
- `deploy-prod.sh` - 生产环境部署脚本

## 🚀 部署步骤

### 第一步：配置环境变量
```bash
# 1. 复制配置模板
cp env.production.example .env.production

# 2. 编辑生产环境配置
vim .env.production
```

### 第二步：配置云服务

#### 数据库配置（以阿里云RDS为例）
```env
DATABASE_URL="postgresql://username:password@rm-xxxxx.pg.rds.aliyuncs.com:5432/clawstep_prod?schema=public"
POSTGRES_USER=clawstep_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=clawstep_prod
```

#### Redis配置（以阿里云Redis为例）
```env
REDIS_URL=redis://:password@r-xxxxx.redis.rds.aliyuncs.com:6379
REDIS_PASSWORD=your_redis_password
```

#### 短信服务配置（以阿里云短信为例）
```env
SMS_ACCESS_KEY=LTAI5txxxxxxxxxxxxxxx
SMS_SECRET_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
SMS_SIGN_NAME=爪步旅行
SMS_TEMPLATE_CODE=SMS_123456789
```

### 第三步：执行部署
```bash
# 执行部署脚本
./deploy-prod.sh
```

## 🔧 云服务配置指南

### 阿里云RDS PostgreSQL
1. 创建RDS实例
2. 配置安全组，开放5432端口
3. 创建数据库和用户
4. 获取连接信息

### 阿里云Redis
1. 创建Redis实例
2. 配置安全组，开放6379端口
3. 设置密码
4. 获取连接信息

### 阿里云短信服务
1. 开通短信服务
2. 申请签名和模板
3. 获取AccessKey和SecretKey
4. 配置短信模板

## 📊 监控和日志

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看应用日志
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### 查看Nginx日志
```bash
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### 健康检查
```bash
curl http://localhost/health
```

## 🔒 安全配置

### SSL证书配置
1. 将SSL证书放入 `nginx/ssl/` 目录
2. 修改 `nginx/conf.d/default.conf` 启用HTTPS
3. 重启Nginx服务

### 防火墙配置
```bash
# 只开放必要端口
ufw allow 80
ufw allow 443
ufw deny 5432  # 数据库端口不对外开放
ufw deny 6379  # Redis端口不对外开放
```

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查DATABASE_URL格式
   - 确认安全组配置
   - 验证用户名密码

2. **Redis连接失败**
   - 检查REDIS_URL格式
   - 确认安全组配置
   - 验证密码

3. **短信发送失败**
   - 检查AccessKey和SecretKey
   - 确认签名和模板已审核通过
   - 验证模板参数格式

### 日志查看
```bash
# 查看详细错误日志
docker-compose -f docker-compose.prod.yml logs --tail=100 app

# 查看Nginx错误日志
docker-compose -f docker-compose.prod.yml exec nginx tail -f /var/log/nginx/error.log
```

## 📈 性能优化

### 数据库优化
- 配置连接池
- 添加索引
- 定期备份

### Redis优化
- 配置内存策略
- 设置过期时间
- 监控内存使用

### 应用优化
- 启用Gzip压缩
- 配置缓存策略
- 监控性能指标
