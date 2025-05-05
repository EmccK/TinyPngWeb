# 构建阶段
FROM node:18-alpine as build

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建前端应用
RUN npm run build
RUN echo "Frontend build completed successfully"

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
COPY package*.json ./
RUN npm ci --production

# 创建保存压缩图片的目录
RUN mkdir -p /app/uploads

# 复制构建产物和服务器代码
COPY --from=build /app/dist ./dist
COPY proxy-server.js ./
COPY proxy-server.package.json ./
COPY entrypoint.sh ./

# 验证dist目录是否存在
RUN ls -la ./dist || echo "Warning: dist directory not found"
RUN ls -la ./dist/index.html || echo "Warning: index.html not found"

# 确保entrypoint.sh可执行
RUN chmod +x ./entrypoint.sh

# 暴露端口
EXPOSE 3001

# 启动命令 - 使用entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
