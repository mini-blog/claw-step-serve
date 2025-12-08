# GitHub Actions CI/CD 配置说明

## 概述

此 CI/CD 配置用于将 `claw_step_serve` 项目自动部署到阿里云服务器。

## 工作流程

1. **触发条件**：推送到 `main` 分支或手动触发
2. **构建阶段**：使用 Dockerfile.prod 构建生产镜像
3. **推送阶段**：将镜像推送到 Docker Hub（公共镜像仓库）
4. **部署阶段**：通过 SSH 连接到服务器，拉取镜像并重启服务

## 需要配置的 GitHub Secrets

在 GitHub 仓库的 **Settings > Secrets and variables > Actions** 中添加以下 Secrets：

### Docker Hub 配置（公共镜像仓库）

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `DOCKER_HUB_USERNAME` | Docker Hub 用户名 | `your-username` |
| `DOCKER_HUB_PASSWORD` | Docker Hub 密码或访问令牌（推荐使用 Access Token） | 在 Docker Hub 设置中获取 |
| `DOCKER_HUB_REPOSITORY` | Docker Hub 仓库名称（可选，默认格式为 `username/claw_step_serve`） | `your-username/claw_step_serve` |

**获取 Docker Hub 凭证步骤**：
1. 注册/登录 [Docker Hub](https://hub.docker.com/)
2. 进入 **Account Settings > Security**
3. 创建 **New Access Token**（推荐使用 Token 而非密码，更安全）
4. 复制 Token 到 `DOCKER_HUB_PASSWORD` Secret

**注意**：
- 如果使用私有仓库，需要登录才能拉取
- 如果使用公共仓库，服务器端可以不登录（但 GitHub Actions 需要登录才能推送）
- 镜像地址格式：`username/repository:tag`，例如：`myusername/claw_step_serve:latest`

### 阿里云服务器 SSH 配置

| Secret 名称 | 说明 | 示例值 |
|------------|------|--------|
| `SERVER_HOST` | 服务器公网 IP 或域名 | `123.456.789.0` 或 `api.example.com` |
| `SERVER_USER` | SSH 登录用户名 | `root` |
| `SERVER_SSH_KEY` | SSH 私钥（完整内容） | `-----BEGIN RSA PRIVATE KEY-----...-----END RSA PRIVATE KEY-----` |

**生成 SSH 密钥对步骤**：
```bash
# 在本地生成密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_deploy

# 将公钥添加到服务器
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@your-server-ip

# 将私钥内容复制到 GitHub Secrets
cat ~/.ssh/github_actions_deploy
```

### 服务器环境变量配置

在服务器的 `.env.production` 文件中需要配置以下环境变量：

```env
# Docker Hub 镜像仓库配置
DOCKER_HUB_REPOSITORY=your-username/claw_step_serve
IMAGE_TAG=latest

# 阿里云云数据库 PostgreSQL 连接字符串
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name?schema=public&sslmode=require

# 其他环境变量
REDIS_URL=redis://your-redis-host:6379
JWT_SECRET_KEY=your-secret-key
# ... 其他配置
```

**阿里云云数据库连接信息获取**：
1. 登录 [阿里云 RDS 控制台](https://rds.console.aliyun.com/)
2. 选择你的数据库实例
3. 在 **数据库连接** 页面获取连接地址和端口
4. 确保数据库白名单已添加服务器 IP

## 服务器准备

### 1. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. 创建项目目录

```bash
mkdir -p /path/to/claw_step_serve
cd /path/to/claw_step_serve
```

### 3. 创建 docker-compose.prod.yml 和 .env.production

将项目文件上传到服务器，或使用 git clone：

```bash
git clone your-repo-url /path/to/claw_step_serve
```

创建 `.env.production` 文件：

```bash
cat > .env.production << 'EOF'
# 数据库配置（阿里云云数据库）
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name?schema=public&sslmode=require

# Redis 配置
REDIS_URL=redis://your-redis-host:6379

# JWT 配置
JWT_SECRET_KEY=your-secret-key-here

# 阿里云容器镜像服务配置
ALIYUN_DOCKER_REGISTRY=registry.cn-hangzhou.aliyuncs.com
ALIYUN_DOCKER_NAMESPACE=your-namespace

# 镜像标签（CI/CD 会自动设置）
IMAGE_TAG=latest

# 其他配置...
EOF
```

### 4. 修改 workflow 中的服务器路径

在 `.github/workflows/deploy.yml` 中找到以下行并修改为实际路径：

```yaml
cd /path/to/claw_step_serve || {
```

改为你的实际项目路径，例如：

```yaml
cd /opt/claw_step_serve || {
```

## 首次部署

1. 确保所有 GitHub Secrets 已配置
2. 确保服务器已准备好（Docker、项目目录、.env.production）
3. 推送代码到 `main` 分支或手动触发 workflow

## 故障排查

### 镜像推送失败
- 检查 ACR 凭证是否正确
- 确认命名空间是否存在
- 检查网络连接

### SSH 连接失败
- 检查服务器 IP 和用户名
- 确认 SSH 密钥是否正确添加到 GitHub Secrets
- 检查服务器防火墙是否开放 22 端口
- 确认公钥已添加到服务器的 `~/.ssh/authorized_keys`

### 部署失败
- 检查服务器上的项目路径是否正确
- 确认 `.env.production` 文件存在且配置正确
- 查看服务器日志：`docker-compose -f docker-compose.prod.yml logs app`

### 数据库连接失败
- 检查数据库连接字符串格式
- 确认数据库白名单已添加服务器 IP
- 检查数据库用户名和密码是否正确
- 确认 SSL 模式配置（云数据库通常需要 `sslmode=require`）

## 安全建议

1. **使用子账号**：为 CI/CD 创建专门的阿里云子账号，只授予必要的权限
2. **定期轮换密钥**：定期更换 SSH 密钥和 ACR 访问凭证
3. **限制 IP 访问**：在数据库和 Redis 白名单中只添加服务器 IP
4. **使用密钥管理**：考虑使用阿里云密钥管理服务（KMS）管理敏感信息
5. **启用日志审计**：启用阿里云操作审计，监控部署活动

## 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)
- [阿里云 RDS 文档](https://help.aliyun.com/product/26090.html)
- [Docker Compose 文档](https://docs.docker.com/compose/)

