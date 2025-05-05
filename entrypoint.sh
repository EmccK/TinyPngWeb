#!/bin/sh

# 显示当前目录和内容
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# 检查dist目录
if [ -d "./dist" ]; then
  echo "dist directory exists"
  echo "dist directory contents:"
  ls -la ./dist
else
  echo "WARNING: dist directory does not exist!"
fi

# 检查proxy-server.js
if [ -f "./proxy-server.js" ]; then
  echo "proxy-server.js exists"
else
  echo "ERROR: proxy-server.js does not exist!"
  exit 1
fi

# 启动服务器
echo "Starting server..."
exec node proxy-server.js
