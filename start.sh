#!/bin/bash

# 显示当前目录
echo "Current directory: $(pwd)"

# 构建前端
echo "Building frontend..."
npm run build

# 检查构建是否成功
if [ -d "./dist" ] && [ -f "./dist/index.html" ]; then
  echo "Frontend build successful!"
  echo "dist directory contents:"
  ls -la ./dist
else
  echo "Warning: Frontend build failed or dist directory not found!"
  echo "Contents of current directory:"
  ls -la
fi

# 检查环境变量
if [ -n "$API_KEY" ]; then
  echo "API_KEY environment variable is set"
else
  echo "API_KEY environment variable is not set (will use UI input if needed)"
fi

# 启动服务器
echo "Starting server..."
node proxy-server.js
