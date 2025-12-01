# Docker 数据持久化配置

## 🚨 当前问题

当前 `docker-compose.yaml` 配置中缺少数据持久化，容器重建会导致数据丢失：

- **PostgreSQL 数据**：存储在容器内部，重建会丢失
- **Redis 数据**：存储在容器内部，重建会丢失

## 🛠️ 解决方案

### 1. 修改 docker-compose.yaml 添加数据卷

```yaml
services:
  postgres:
    container_name: postgres
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-root}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-bipwqhso2aH}
      POSTGRES_DB: ${POSTGRES_DB:-clawstep}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    networks:
      - my-server
    volumes:
      - postgres_data:/var/lib/postgresql/data  # 添加数据持久化

  redis:
    container_name: redis
    image: redis:7-alpine
    ports:
      - "${REDIS_PORT:-6379}:6379"
    expose:
      - "6379"
    restart: unless-stopped
    environment:
      TZ: Asia/Shanghai
    networks:
      - my-server
    command: redis-server --requirepass ${REDIS_PASSWORD:-bipwqhso2aH} --appendonly yes
    volumes:
      - redis_data:/data  # 添加数据持久化

# 在文件末尾添加 volumes 定义
volumes:
  postgres_data:
  redis_data:
```

### 2. 应用数据持久化配置

```yaml
app:
  container_name: claw_step_serve
  build:
    context: .
    dockerfile: Dockerfile
    args:
      - NODE_ENV=${NODE_ENV:-production}
  expose:
    - "3000"
  restart: unless-stopped
  depends_on:
    - redis
    - postgres
  networks:
    - my-server
  volumes:
    - .:/app                    # 挂载源代码目录
    - /app/node_modules         # 排除 node_modules
    - /app/dist                 # 排除构建目录
    - app_logs:/app/logs        # 应用日志持久化
  env_file:
    - .env

volumes:
  postgres_data:
  redis_data:
  app_logs:
```

## 🔄 迁移步骤

### 1. 备份现有数据

```bash
# 备份 PostgreSQL 数据
docker-compose exec postgres pg_dump -U root clawstep > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份 Redis 数据
docker-compose exec redis redis-cli -a bipwqhso2aH --rdb /data/dump.rdb
```

### 2. 停止现有服务

```bash
docker-compose down
```

### 3. 修改 docker-compose.yaml

按照上面的配置修改 `docker-compose.yaml` 文件。

### 4. 重新创建服务

```bash
docker-compose up -d
```

### 5. 恢复数据（如果需要）

```bash
# 恢复 PostgreSQL 数据
docker-compose exec -T postgres psql -U root -d clawstep < backup_*.sql

# Redis 数据会自动从 AOF 文件恢复
```

## 🔍 验证数据持久化

### 1. 检查数据卷

```bash
# 查看所有数据卷
docker volume ls

# 查看特定数据卷详情
docker volume inspect claw_step_serve_postgres_data
docker volume inspect claw_step_serve_redis_data
```

### 2. 测试数据持久化

```bash
# 在 PostgreSQL 中创建测试数据
docker-compose exec postgres psql -U root -d clawstep -c "CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT);"
docker-compose exec postgres psql -U root -d clawstep -c "INSERT INTO test (name) VALUES ('test data');"

# 在 Redis 中创建测试数据
docker-compose exec redis redis-cli -a bipwqhso2aH SET test_key "test value"

# 重启服务
docker-compose restart postgres redis

# 验证数据是否保留
docker-compose exec postgres psql -U root -d clawstep -c "SELECT * FROM test;"
docker-compose exec redis redis-cli -a bipwqhso2aH GET test_key
```

## 📊 数据卷管理

### 查看数据卷使用情况

```bash
# 查看数据卷大小
docker system df -v

# 查看特定数据卷详情
docker volume inspect <volume_name>
```

### 清理数据卷

```bash
# 删除未使用的数据卷
docker volume prune

# 删除特定数据卷（谨慎操作）
docker volume rm <volume_name>
```

### 备份数据卷

```bash
# 备份 PostgreSQL 数据卷
docker run --rm -v claw_step_serve_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# 备份 Redis 数据卷
docker run --rm -v claw_step_serve_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz -C /data .
```

## ⚠️ 注意事项

1. **数据安全**: 修改前务必备份重要数据
2. **服务顺序**: 先停止服务，再修改配置，最后重新启动
3. **权限问题**: 确保数据卷有正确的读写权限
4. **存储空间**: 监控数据卷使用情况，避免磁盘空间不足
5. **备份策略**: 定期备份重要数据卷

## 🎯 最佳实践

1. **开发环境**: 使用数据卷确保数据持久化
2. **生产环境**: 使用外部存储或云存储
3. **备份策略**: 定期自动备份重要数据
4. **监控**: 监控数据卷使用情况和健康状态
5. **测试**: 定期测试数据恢复流程
