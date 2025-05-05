# TinyCompress - 图片压缩工具

TinyCompress 是一个使用 TinyPNG API 的网页应用，提供简单直观的界面用于上传、压缩和下载图片。

## 功能特点

- 一次上传并压缩多张图片
- 查看压缩统计和历史记录
- 下载压缩后的图片
- 自动在服务器上保存压缩后的图片
- 支持 Docker 部署，便于安装

## 前提条件

- Node.js 18 或更高版本
- TinyPNG API 密钥（可在 [https://tinypng.com/developers](https://tinypng.com/developers) 免费获取）

## 安装和设置

### 本地开发环境

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/image-compressor.git
   cd image-compressor
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

4. 打开浏览器访问 `http://localhost:5173`

### 本地生产环境

1. 构建并启动生产服务器（选择以下方法之一）：

   **方法一 - 使用 npm 脚本：**
   ```bash
   npm run start
   ```

   **方法二 - 使用 shell 脚本（推荐）：**
   ```bash
   chmod +x start.sh  # 仅首次运行时需要执行
   ./start.sh
   ```

   **方法三 - 手动步骤：**
   ```bash
   npm run build      # 构建前端
   node proxy-server.js  # 启动服务器
   ```

2. 打开浏览器访问 `http://localhost:3001`

### Docker 部署

1. 使用 Docker Compose 构建并运行：
   ```bash
   docker-compose up -d --build
   ```

2. 查看日志确保一切正常：
   ```bash
   docker-compose logs -f
   ```

3. 打开浏览器访问 `http://localhost:3001`

4. 如果遇到问题，可以重新构建并重启容器：
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

## 环境变量

- `PORT` - 服务器端口（默认：3001）

## 项目结构

- `/src` - 前端 React 应用
- `/uploads` - 存储压缩图片的目录
- `/proxy-server.js` - 处理 API 请求和提供文件服务的后端服务器

## GitHub Actions

本项目包含 GitHub Actions 工作流，用于：

- 构建并推送 Docker 镜像到 GitHub Container Registry
- 自动测试和代码检查

有关设置 GitHub 仓库权限以发布 Docker 镜像的详细说明，请参阅 [GitHub 设置指南](GITHUB_SETUP.md)。

## 使用方法

1. 打开应用后，如果有之前压缩过的图片，它们会显示在页面顶部的历史记录面板中
2. 点击"选择图片"按钮或将图片拖放到上传区域
3. 点击"压缩图片"按钮开始压缩
4. 压缩完成后，可以单独下载每张图片，或者查看压缩统计信息
5. 所有压缩过的图片都会保存在服务器上，可以随时重新下载

## 技术栈

- 前端：React、Vite、TailwindCSS
- 后端：Node.js、Express
- 容器化：Docker、Docker Compose
- CI/CD：GitHub Actions

## 许可证

本项目采用 MIT 许可证 - 详情请查看 LICENSE 文件

## 致谢

- [TinyPNG](https://tinypng.com/) 提供压缩 API
- [React](https://reactjs.org/) 前端框架
- [Express](https://expressjs.com/) 后端服务器
