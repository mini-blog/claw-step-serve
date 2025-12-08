# 使用官方Node.js镜像，指定版本
FROM node:18

# 设置工作目录
WORKDIR /app

# 设置npm镜像源（使用国内镜像）
RUN npm config set registry https://registry.npmmirror.com

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（使用npm而不是pnpm）
RUN npm install --legacy-peer-deps

# 复制源代码
COPY . .

# 生成Prisma客户端
RUN npx prisma generate

# 构建应用
# RUN pnpm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:dev"]