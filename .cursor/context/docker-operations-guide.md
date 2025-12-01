# Docker 和 Docker Compose 操作指南

## 📋 概述

本文档详细说明了在 Claw Step 项目中如何正确操作 Docker 和 Docker Compose，特别区分了修改 Dockerfile 和 docker-compose.yaml 后的不同重构策略。

## 🐳 基础概念

### Dockerfile vs docker-compose.yaml

- **Dockerfile**: 定义如何构建应用镜像
- **docker-compose.yaml**: 定义如何运行和管理多个容器服务

## 🔧 修改 Dockerfile 后的重构操作

### 当修改了 Dockerfile 时

Dockerfile 的修改影响的是**应用镜像的构建**，需要重新构建镜像。

#### 1. 重新构建应用镜像

```bash
# 进入项目目录
cd /Users/Zhuanz/work/app/claw_step_serve

# 重新构建应用镜像（不使用缓存）
docker-compose build app --no-cache

# 或者构建所有服务
docker-compose build --no-cache
```

#### 2. 重新创建应用容器

docker-compose build 只对使用 build 指令的服务有效，而 Redis 使用的是 image: redis:7-alpine，所以这个命令不会重新构建 Redis 容器。

```bash
# 方法1：重新创建应用容器
docker-compose up -d --force-recreate app
# 重新创建 Redis 服务（推荐）
docker-compose up -d --force-recreate redis

# 方法2：先停止再启动
docker-compose stop app
docker-compose rm app
docker-compose up -d app
```

#### 3. 验证应用更新

```bash
# 查看应用日志
docker-compose logs app --tail=20

# 检查应用状态
docker-compose ps app

# 进入应用容器验证
docker-compose exec app /bin/sh
```

### Dockerfile 修改的常见场景

- 修改 Node.js 版本
- 添加新的系统依赖
- 修改构建步骤
- 更新环境变量
- 修改工作目录

## 🐙 修改 docker-compose.yaml 后的重构操作

### 当修改了 docker-compose.yaml 时

docker-compose.yaml 的修改影响的是**服务配置**，需要重新创建服务。

#### 1. 重新创建特定服务

```bash
# 重新创建特定服务（推荐）
docker-compose up -d --force-recreate <service_name>

# 例如：重新创建 Redis 服务
docker-compose up -d --force-recreate redis

# 例如：重新创建 PostgreSQL 服务
docker-compose up -d --force-recreate postgres
```

#### 2. 重新创建所有服务

```bash
# 停止所有服务
docker-compose down

# 重新创建并启动所有服务
docker-compose up -d
```

#### 3. 验证服务配置

```bash
# 查看所有服务状态
docker-compose ps

# 查看特定服务日志
docker-compose logs <service_name> --tail=20

# 检查服务配置
docker-compose config
```

### docker-compose.yaml 修改的常见场景

- 修改端口映射
- 添加或修改环境变量
- 修改卷挂载
- 添加新的服务
- 修改网络配置
- 修改依赖关系

## 🚀 项目特定操作流程

### 开发环境完整流程

#### 1. 修改应用代码后的操作

```bash
# 代码修改后，应用会自动重新加载（因为使用了卷挂载）
# 无需特殊操作，直接测试即可

# 如果需要重新安装依赖
docker-compose exec app npm install

# 如果需要重新生成 Prisma 客户端
docker-compose exec app npx prisma generate

# 如果需要运行数据库迁移
docker-compose exec app npx prisma migrate dev
```

#### 2. 修改 Dockerfile 后的操作

```bash
# 1. 重新构建应用镜像
# 会构建新的镜像，然后提供给启动新的镜像容器
docker-compose build app --no-cache

# 2. 重新创建应用容器,
# 会使用之前的镜像，只是使用之前的镜像重新启动一个容器
docker-compose up -d --force-recreate app

# 3. 验证应用启动
docker-compose logs app --tail=20
```

#### 3. 修改 docker-compose.yaml 后的操作

```bash
# 1. 停止所有服务
docker-compose down

# 2. 重新创建所有服务
docker-compose up -d

# 3. 验证所有服务状态
docker-compose ps
```

## 🔍 不同修改类型的详细操作

### 类型1：应用代码修改

**影响范围**: 仅应用逻辑
**操作**: 无需特殊操作，热重载自动生效

```bash
# 验证修改
curl http://localhost/api/health
```

### 类型2：Dockerfile 修改

**影响范围**: 应用镜像
**操作**: 重新构建镜像

```bash
# 完整流程
docker-compose build app --no-cache
docker-compose up -d --force-recreate app
docker-compose logs app --tail=20
```

### 类型3：docker-compose.yaml 修改

**影响范围**: 服务配置
**操作**: 重新创建服务

```bash
# 完整流程
docker-compose down
docker-compose up -d
docker-compose ps
```

### 类型4：环境变量修改

**影响范围**: 服务配置
**操作**: 重新创建相关服务

```bash
# 修改 .env 文件后
docker-compose down
docker-compose up -d
```

## 🛠️ 故障排除

### 常见问题及解决方案

#### 1. 容器启动失败

```bash
# 查看详细错误日志
docker-compose logs <service_name>

# 检查配置文件语法
docker-compose config

# 重新创建容器
docker-compose up -d --force-recreate <service_name>
```

#### 2. 端口冲突

```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 修改 docker-compose.yaml 中的端口映射
# 然后重新创建服务
docker-compose up -d --force-recreate
```

#### 3. 数据丢失问题

```bash
# 检查是否有数据卷
docker volume ls

# 备份重要数据
docker-compose exec postgres pg_dump -U root clawstep > backup.sql
```

## 📊 服务状态检查

### 检查所有服务

```bash
# 查看服务状态
docker-compose ps

# 查看服务资源使用
docker stats

# 查看服务日志
docker-compose logs --tail=50
```

### 检查特定服务

```bash
# 检查应用服务
docker-compose ps app
docker-compose logs app --tail=20

# 检查数据库服务
docker-compose ps postgres
docker-compose logs postgres --tail=20

# 检查 Redis 服务
docker-compose ps redis
docker-compose logs redis --tail=20
```

## 🔄 数据持久化配置

### 当前配置问题

当前 `docker-compose.yaml` 中缺少数据持久化配置，容器重建会导致数据丢失。

### 建议的改进配置

```yaml
# 在 docker-compose.yaml 中添加 volumes
postgres:
  # ... 其他配置
  volumes:
    - postgres_data:/var/lib/postgresql/data

redis:
  # ... 其他配置
  volumes:
    - redis_data:/data

# 在文件末尾添加
volumes:
  postgres_data:
  redis_data:
```

### 应用数据持久化

```bash
# 停止服务
docker-compose down

# 添加 volumes 配置到 docker-compose.yaml

# 重新创建服务
docker-compose up -d
```

## 📝 快速参考

### 常用命令速查

```bash
# 重新构建应用（Dockerfile 修改后）
docker-compose build app --no-cache && docker-compose up -d --force-recreate app

# 重新创建服务（docker-compose.yaml 修改后）
docker-compose down && docker-compose up -d

# 查看应用日志
docker-compose logs app -f

# 进入应用容器
docker-compose exec app /bin/sh

# 重启特定服务
docker-compose restart <service_name>

# 完全重置环境
docker-compose down --volumes --remove-orphans && docker-compose up -d
```

### 修改类型判断

| 修改文件 | 影响范围 | 操作命令 |
|---------|---------|---------|
| 应用代码 | 应用逻辑 | 无需操作（热重载） |
| Dockerfile | 应用镜像 | `docker-compose build app --no-cache` |
| docker-compose.yaml | 服务配置 | `docker-compose down && docker-compose up -d` |
| .env | 环境变量 | `docker-compose down && docker-compose up -d` |

## ⚠️ 注意事项

1. **数据安全**: 修改 docker-compose.yaml 前先备份重要数据
2. **服务依赖**: 注意服务间的依赖关系，按正确顺序重启
3. **端口冲突**: 确保修改的端口没有被其他服务占用
4. **环境变量**: 修改 .env 文件后需要重启相关服务
5. **缓存问题**: 构建时使用 `--no-cache` 确保获取最新依赖

## 🎯 最佳实践

1. **开发环境**: 使用卷挂载实现代码热重载
2. **生产环境**: 使用数据卷确保数据持久化
3. **版本控制**: 将 Dockerfile 和 docker-compose.yaml 纳入版本控制
4. **环境隔离**: 使用不同的配置文件管理不同环境
5. **监控日志**: 定期检查服务日志，及时发现问题

我来为你创建一份关于 Docker 和 Docker Compose 命令重构和修改的完整文档。

## 📋 Docker 和 Docker Compose 操作指南

### 🐳 基础 Docker 命令

#### 容器管理
```bash
# 查看所有容器
docker ps -a

# 查看运行中的容器
docker ps

# 停止容器
docker stop <container_name>

# 启动容器
docker start <container_name>

# 重启容器
docker restart <container_name>

# 删除容器
docker rm <container_name>

# 强制删除容器
docker rm -f <container_name>
```

#### 镜像管理
```bash
# 查看所有镜像
docker images

# 删除镜像
docker rmi <image_name>

# 删除所有未使用的镜像
docker image prune

# 删除所有镜像
docker rmi $(docker images -q)
```

### 🐙 Docker Compose 命令

#### 基础操作
```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 启动特定服务
docker-compose up -d <service_name>

# 停止所有服务
docker-compose down

# 停止特定服务
docker-compose stop <service_name>

# 重启特定服务
docker-compose restart <service_name>
```

#### 构建和重建
```bash
# 构建所有服务
docker-compose build

# 构建特定服务
docker-compose build <service_name>

# 强制重新构建（不使用缓存）
docker-compose build --no-cache

# 重新创建并启动服务
docker-compose up -d --force-recreate

# 重新创建特定服务
docker-compose up -d --force-recreate <service_name>
```

#### 日志和调试
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs <service_name>

# 实时查看日志
docker-compose logs -f <service_name>

# 查看最近几行日志
docker-compose logs --tail=20 <service_name>

# 进入容器内部
docker-compose exec <service_name> /bin/sh
```

### 🔧 项目特定操作

#### 开发环境操作
```bash
# 启动开发环境
cd /Users/Zhuanz/work/app/claw_step_serve
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看应用日志
docker-compose logs app --tail=20

# 重新构建应用
docker-compose build app

# 重启应用服务
docker-compose restart app
```

#### 数据库操作
```bash
# 进入 PostgreSQL 容器
docker-compose exec postgres psql -U root -d clawstep

# 备份数据库
docker-compose exec postgres pg_dump -U root clawstep > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U root -d clawstep < backup.sql

# 进入 Redis 容器
docker-compose exec redis redis-cli -a bipwqhso2aH

# 测试 Redis 连接
docker-compose exec redis redis-cli -a bipwqhso2aH ping
```

#### 应用调试
```bash
# 查看应用构建日志
docker-compose build app --no-cache

# 查看应用运行日志
docker-compose logs app -f

# 进入应用容器
docker-compose exec app /bin/sh

# 在应用容器中运行命令
docker-compose exec app npm install
docker-compose exec app npx prisma generate
docker-compose exec app npx prisma migrate dev
```

### 🚀 生产环境操作

#### 生产部署
```bash
# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 构建生产镜像
docker-compose -f docker-compose.prod.yml build

# 查看生产环境状态
docker-compose -f docker-compose.prod.yml ps
```

#### 数据持久化
```bash
# 创建数据卷
docker volume create postgres_data
docker volume create redis_data

# 查看数据卷
docker volume ls

# 删除数据卷
docker volume rm postgres_data redis_data
```

### 🛠️ 故障排除

#### 常见问题解决
```bash
# 清理所有未使用的资源
docker system prune -a

# 清理特定服务的资源
docker-compose down --volumes --remove-orphans

# 重新创建所有服务
docker-compose down
docker-compose up -d

# 查看容器资源使用情况
docker stats

# 查看容器详细信息
docker inspect <container_name>
```

#### 网络问题
```bash
# 查看网络
docker network ls

# 查看网络详情
docker network inspect <network_name>

# 创建自定义网络
docker network create my-network
```

### 📝 配置文件修改

#### 修改 docker-compose.yaml 后
```bash
# 1. 停止服务
docker-compose down

# 2. 重新创建服务
docker-compose up -d

# 3. 验证配置
docker-compose ps
```

#### 修改 Dockerfile 后
```bash
# 1. 重新构建镜像
docker-compose build app --no-cache

# 2. 重新创建容器
docker-compose up -d --force-recreate app
```

### 🔍 监控和维护

#### 健康检查
```bash
# 检查服务健康状态
docker-compose ps

# 查看服务资源使用
docker stats

# 检查日志错误
docker-compose logs | grep -i error
```

#### 备份和恢复
```bash
# 备份数据库
docker-compose exec postgres pg_dump -U root clawstep > backup_$(date +%Y%m%d_%H%M%S).sql

# 备份 Redis 数据
docker-compose exec redis redis-cli -a bipwqhso2aH --rdb /data/dump.rdb
```

### ⚠️ 注意事项

1. **数据持久化**：确保重要数据使用 volumes 持久化
2. **环境变量**：修改 `.env` 文件后需要重启服务
3. **端口冲突**：确保端口没有被其他服务占用
4. **资源限制**：生产环境建议设置内存和 CPU 限制
5. **安全配置**：生产环境使用强密码和 SSL 证书

### 📚 常用命令速查

```bash
# 快速重启应用
docker-compose restart app

# 查看实时日志
docker-compose logs -f app

# 重新构建并启动
docker-compose up -d --build app

# 完全重置环境
docker-compose down --volumes --remove-orphans && docker-compose up -d
```

这份文档涵盖了项目中所有常用的 Docker 和 Docker Compose 操作，可以作为日常开发和维护的参考指南。
