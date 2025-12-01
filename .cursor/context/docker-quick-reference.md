# Docker 操作快速参考

## 🔄 修改类型与对应操作

### 1. 修改 Dockerfile → 重新构建应用镜像

```bash
# 重新构建应用镜像
docker-compose build app --no-cache

# 重新创建应用容器
docker-compose up -d --force-recreate app

# 验证应用启动
docker-compose logs app --tail=20
```

### 2. 修改 docker-compose.yaml → 重新创建服务

```bash
# 重新创建所有服务
docker-compose down
docker-compose up -d

# 或者只重新创建特定服务
docker-compose up -d --force-recreate <service_name>
```

### 3. 修改应用代码 → 无需操作（热重载）

```bash
# 代码修改后自动生效，直接测试即可
curl http://localhost/api/health
```

### 4. 修改 .env → 重新创建服务

```bash
# 环境变量修改后需要重启服务
docker-compose down
docker-compose up -d
```

## 🚀 常用命令

### 基础操作
```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs <service_name> --tail=20
```

### 应用相关
```bash
# 重新构建应用
docker-compose build app --no-cache

# 重启应用
docker-compose restart app

# 进入应用容器
docker-compose exec app /bin/sh

# 在应用容器中运行命令
docker-compose exec app npm install
docker-compose exec app npx prisma generate
```

### 数据库相关
```bash
# 进入 PostgreSQL
docker-compose exec postgres psql -U root -d clawstep

# 备份数据库
docker-compose exec postgres pg_dump -U root clawstep > backup.sql

# 进入 Redis
docker-compose exec redis redis-cli -a bipwqhso2aH
```

## 🔍 故障排除

### 服务启动失败
```bash
# 查看详细日志
docker-compose logs <service_name>

# 检查配置语法
docker-compose config

# 重新创建服务
docker-compose up -d --force-recreate <service_name>
```

### 完全重置环境
```bash
# 停止并删除所有容器和卷
docker-compose down --volumes --remove-orphans

# 重新创建所有服务
docker-compose up -d
```

## 📊 检查清单

- [ ] 修改 Dockerfile → 使用 `docker-compose build app --no-cache`
- [ ] 修改 docker-compose.yaml → 使用 `docker-compose down && docker-compose up -d`
- [ ] 修改应用代码 → 无需操作（热重载）
- [ ] 修改 .env → 使用 `docker-compose down && docker-compose up -d`
- [ ] 检查服务状态 → 使用 `docker-compose ps`
- [ ] 查看日志 → 使用 `docker-compose logs <service_name>`
