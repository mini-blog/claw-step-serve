# CI/CD 快速开始指南

## 一、准备工作清单

### ✅ 1. 资源准备

- [ ] **Docker Hub 账号**
  - 注册/登录 [Docker Hub](https://hub.docker.com/)
  - 创建 Access Token（推荐）或使用密码
  - 记录用户名和仓库名称（如：`your-username/claw_step_serve`）

- [ ] **阿里云服务器（ECS）**
  - 获取公网 IP 或域名
  - 配置安全组（开放 22、80、443、3000 端口）
  - 准备 SSH 密钥对

- [ ] **阿里云云数据库（RDS PostgreSQL）**
  - 创建数据库实例
  - 获取连接地址和端口
  - 创建数据库和用户
  - 配置白名单（添加服务器 IP）

- [ ] **阿里云 Redis（可选）**
  - 创建 Redis 实例
  - 获取连接地址和端口
  - 配置白名单

### ✅ 2. 服务器初始化

在阿里云服务器上执行：

```bash
# 1. 运行初始化脚本
bash <(curl -s https://raw.githubusercontent.com/your-repo/claw_step_serve/main/scripts/server-setup.sh)

# 或者手动执行
cd /opt
git clone your-repo-url claw_step_serve
cd claw_step_serve
bash scripts/server-setup.sh
```

### ✅ 3. 配置服务器环境变量

```bash
cd /opt/claw_step_serve
cp .env.production.example .env.production
nano .env.production  # 或使用 vim
```

填入以下关键配置：

```env
# 数据库（阿里云 RDS）
DATABASE_URL=postgresql://user:pass@rm-xxxxx.pg.rds.aliyuncs.com:5432/clawstep?schema=public&sslmode=require

# Redis（可选）
REDIS_URL=redis://:password@r-xxxxx.redis.rds.aliyuncs.com:6379

# JWT 密钥（生成随机字符串）
JWT_SECRET_KEY=$(openssl rand -base64 32)

# Docker Hub 镜像仓库配置
DOCKER_HUB_REPOSITORY=your-username/claw_step_serve
IMAGE_TAG=latest
```

### ✅ 4. 配置 GitHub Secrets

在 GitHub 仓库中：**Settings > Secrets and variables > Actions > New repository secret**

添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `DOCKER_HUB_USERNAME` | `your-username` | Docker Hub 用户名 |
| `DOCKER_HUB_PASSWORD` | `your-token` | Docker Hub Access Token（推荐）或密码 |
| `DOCKER_HUB_REPOSITORY` | `your-username/claw_step_serve` | Docker Hub 仓库完整路径 |
| `SERVER_HOST` | `123.456.789.0` | 服务器 IP |
| `SERVER_USER` | `root` | SSH 用户名 |
| `SERVER_SSH_KEY` | `-----BEGIN RSA...` | SSH 私钥 |
| `SERVER_DEPLOY_PATH` | `/opt/claw_step_serve` | 部署路径（可选） |

### ✅ 5. 生成 SSH 密钥对

```bash
# 在本地生成
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_deploy

# 查看私钥（复制到 GitHub Secrets）
cat ~/.ssh/github_actions_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@your-server-ip
```

## 二、首次部署

### 方法 1：自动部署（推荐）

1. 推送代码到 `main` 分支
2. GitHub Actions 会自动触发部署
3. 在 **Actions** 标签页查看部署进度

### 方法 2：手动部署

1. 在 GitHub 仓库中进入 **Actions** 标签页
2. 选择 **Deploy to Aliyun** workflow
3. 点击 **Run workflow** 按钮
4. 选择分支并运行

## 三、验证部署

部署完成后，检查服务状态：

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 检查容器状态
cd /opt/claw_step_serve
docker-compose -f docker-compose.prod.yml ps

# 查看应用日志
docker-compose -f docker-compose.prod.yml logs -f app

# 健康检查
curl http://localhost/health
```

## 四、常见问题

### Q: 部署失败，提示 "项目目录不存在"
**A:** 检查 `SERVER_DEPLOY_PATH` Secret 是否正确，或确保服务器上已创建项目目录。

### Q: 无法连接到数据库
**A:** 
- 检查数据库白名单是否包含服务器 IP
- 验证连接字符串格式
- 确认数据库用户权限

### Q: 镜像拉取失败
**A:**
- 检查 ACR 凭证是否正确
- 确认服务器能访问阿里云容器镜像服务
- 检查网络连接

### Q: SSH 连接失败
**A:**
- 检查服务器安全组是否开放 22 端口
- 验证 SSH 密钥是否正确
- 确认公钥已添加到服务器的 `~/.ssh/authorized_keys`

## 五、后续维护

### 查看部署日志
在 GitHub **Actions** 标签页查看每次部署的详细日志。

### 回滚到之前的版本
```bash
# SSH 到服务器
ssh root@your-server-ip
cd /opt/claw_step_serve

# 查看可用镜像
docker images | grep claw_step_serve

# 使用指定标签的镜像
export IMAGE_TAG=previous-commit-sha
docker-compose -f docker-compose.prod.yml up -d
```

### 手动重启服务
```bash
cd /opt/claw_step_serve
docker-compose -f docker-compose.prod.yml restart app
```

## 六、安全建议

1. ✅ 使用子账号而非主账号访问 ACR
2. ✅ 定期轮换 SSH 密钥和 ACR 密码
3. ✅ 限制数据库和 Redis 的白名单 IP
4. ✅ 使用强随机字符串作为 JWT_SECRET_KEY
5. ✅ 启用服务器防火墙
6. ✅ 定期更新系统和 Docker

## 七、获取帮助

- 查看详细文档：`.github/workflows/README.md`
- 检查服务器日志：`docker-compose -f docker-compose.prod.yml logs app`
- 查看 GitHub Actions 日志：仓库 **Actions** 标签页

