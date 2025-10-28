# Nginx 配置说明

## 目录结构
```
nginx/
├── nginx.conf          # 主配置文件
├── conf.d/
│   └── default.conf     # 站点配置
├── ssl/                 # SSL证书目录
│   ├── cert.pem        # SSL证书
│   └── key.pem         # SSL私钥
└── logs/               # 日志目录
    ├── access.log      # 访问日志
    └── error.log       # 错误日志
```

## 功能特性

### 1. 反向代理
- 将HTTP/HTTPS请求代理到后端NestJS应用
- 支持WebSocket连接升级
- 负载均衡配置

### 2. SSL/TLS支持
- 支持HTTPS加密传输
- 现代SSL/TLS协议 (TLSv1.2, TLSv1.3)
- HSTS安全头设置

### 3. 性能优化
- Gzip压缩
- 连接保持
- 缓存配置
- 静态文件优化

### 4. 安全配置
- 安全头设置
- XSS防护
- 内容类型保护
- CSP策略

## 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| NGINX_PORT | 80 | HTTP端口 |
| NGINX_SSL_PORT | 443 | HTTPS端口 |
| NGINX_DOMAIN | api.clawstep.com | 域名 |

## SSL证书配置

### 开发环境
使用自签名证书：
```bash
# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=ClawStep/CN=api.clawstep.com"
```

### 生产环境
使用Let's Encrypt或商业证书：
```bash
# Let's Encrypt证书
certbot certonly --nginx -d api.clawstep.com
```

## 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f nginx

# 重新加载nginx配置
docker-compose exec nginx nginx -s reload
```

## 访问地址

- HTTP: http://localhost
- HTTPS: https://localhost
- API文档: http://localhost/api-docs
- 健康检查: http://localhost/health
