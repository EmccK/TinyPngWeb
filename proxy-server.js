import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建上传目录
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;
const DEFAULT_API_KEY = process.env.API_KEY || '';

// 配置multer用于处理文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'original-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(bodyParser.json());

// 提供静态文件服务
app.use('/uploads', express.static(UPLOADS_DIR));

// 检查当前工作目录
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// 尝试多个可能的dist路径
const possibleDistPaths = [
  path.join(__dirname, 'dist'),                // 相对于脚本的路径
  path.join(process.cwd(), 'dist'),            // 相对于当前工作目录的路径
  path.resolve(__dirname, '..', 'dist'),       // 上一级目录
  path.resolve(process.cwd(), '..', 'dist')    // 当前工作目录的上一级
];

// 查找第一个存在的dist路径
let distPath = null;
for (const testPath of possibleDistPaths) {
  console.log('Checking for frontend build at:', testPath);
  if (fs.existsSync(testPath)) {
    distPath = testPath;
    console.log('Frontend build found at:', distPath);
    break;
  }
}

// 如果找到了dist目录
if (distPath) {
  // 检查index.html是否存在
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('index.html found at:', indexPath);

    // 提供静态文件
    app.use(express.static(distPath));

    // 添加一个路由处理所有前端路由
    app.get('*', (req, res, next) => {
      // 如果请求的是API路由，跳过这个处理器
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(indexPath);
    });
  } else {
    console.warn('Warning: index.html not found in dist directory');
    console.warn('Only API endpoints will be available.');
  }
} else {
  console.warn('Warning: Frontend build not found in any of the checked paths');
  console.warn('Only API endpoints will be available.');
  console.warn('To serve the frontend, run: npm run build');
}

// 代理TinyPNG压缩请求 - 直接上传文件
app.post('/api/tinypng/shrink/file', upload.single('image'), async (req, res) => {
  try {
    // Use API key from request or fall back to environment variable
    const apiKey = req.body.apiKey || DEFAULT_API_KEY;

    if (!apiKey || !req.file) {
      return res.status(400).json({
        error: !apiKey ? 'API key is required' : 'Image file is required'
      });
    }

    // 创建Basic认证头
    const auth = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

    // 读取上传的文件
    const fileBuffer = fs.readFileSync(req.file.path);

    // 调用TinyPNG API
    const response = await axios.post('https://api.tinify.com/shrink', fileBuffer, {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'json',
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    // 获取压缩后的图片URL
    const outputUrl = response.headers.location;

    if (!outputUrl) {
      throw new Error('No output URL received from TinyPNG');
    }

    // 下载压缩后的图片
    const outputResponse = await axios.get(outputUrl, {
      headers: { 'Authorization': auth },
      responseType: 'arraybuffer'
    });

    // 生成压缩后的文件名
    const originalName = req.file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const compressedFileName = `compressed-${baseName}-${Date.now()}${ext}`;
    const compressedFilePath = path.join(UPLOADS_DIR, compressedFileName);

    // 保存压缩后的图片到本地
    fs.writeFileSync(compressedFilePath, Buffer.from(outputResponse.data));

    // 返回TinyPNG的响应和本地文件路径
    res.json({
      output: response.data.output,
      location: outputUrl,
      originalFile: req.file.filename,
      compressedFile: compressedFileName,
      compressedUrl: `/uploads/${compressedFileName}`,
      originalUrl: `/uploads/${req.file.filename}`,
      originalName: originalName
    });
  } catch (error) {
    console.error('Error proxying to TinyPNG:', error.response?.data || error.message);

    // 返回错误信息
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 代理TinyPNG压缩请求 - 通过URL
app.post('/api/tinypng/shrink/url', async (req, res) => {
  try {
    // Use API key from request or fall back to environment variable
    const apiKey = req.body.apiKey || DEFAULT_API_KEY;
    const { imageUrl } = req.body;

    if (!apiKey || !imageUrl) {
      return res.status(400).json({
        error: !apiKey ? 'API key is required' : 'Image URL is required'
      });
    }

    // 创建Basic认证头
    const auth = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

    // 调用TinyPNG API
    const response = await axios.post('https://api.tinify.com/shrink', {
      source: { url: imageUrl }
    }, {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      responseType: 'json'
    });

    // 返回TinyPNG的响应
    res.json({
      output: response.data.output,
      location: response.headers.location
    });
  } catch (error) {
    console.error('Error proxying to TinyPNG:', error.response?.data || error.message);

    // 返回错误信息
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 代理下载压缩后的图片
app.get('/api/tinypng/output', async (req, res) => {
  try {
    const url = req.query.url;
    // Use API key from request or fall back to environment variable
    const apiKey = req.query.apiKey || DEFAULT_API_KEY;

    if (!url || !apiKey) {
      return res.status(400).json({ error: 'URL and API key are required' });
    }

    // 创建Basic认证头
    const auth = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

    // 获取压缩后的图片
    const response = await axios.get(url, {
      headers: {
        'Authorization': auth
      },
      responseType: 'arraybuffer'
    });

    // 设置适当的内容类型
    res.set('Content-Type', response.headers['content-type']);

    // 返回图片数据
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Error downloading from TinyPNG:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 添加一个API端点来获取所有保存的图片
app.get('/api/images', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR);

    // 过滤并组织文件
    const images = [];
    const originalFiles = {};
    const compressedFiles = {};

    // 首先找出所有文件
    files.forEach(file => {
      if (file.startsWith('original-')) {
        originalFiles[file] = { filename: file, path: `/uploads/${file}` };
      } else if (file.startsWith('compressed-')) {
        compressedFiles[file] = { filename: file, path: `/uploads/${file}` };
      }
    });

    // 返回所有图片信息
    res.json({
      success: true,
      images: files.map(file => ({
        filename: file,
        path: `/uploads/${file}`,
        url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
        isCompressed: file.startsWith('compressed-'),
        isOriginal: file.startsWith('original-'),
        createdAt: fs.statSync(path.join(UPLOADS_DIR, file)).birthtime
      }))
    });
  } catch (error) {
    console.error('Error getting images:', error);
    res.status(500).json({ error: error.message });
  }
});

// 添加一个API端点来删除图片
app.delete('/api/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: `File ${filename} deleted successfully` });
    } else {
      res.status(404).json({ error: `File ${filename} not found` });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: error.message });
  }
});

// 这个路由处理器已经被上面的条件块替代

// 添加一个简单的健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 添加一个API端点来检查API_KEY状态
app.get('/api/status/apikey', (req, res) => {
  // 检查是否设置了环境变量API_KEY
  const hasEnvApiKey = !!DEFAULT_API_KEY;
  res.json({
    hasApiKey: hasEnvApiKey,
    source: hasEnvApiKey ? 'environment' : null
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Frontend and API available at http://localhost:${PORT}`);
  console.log(`Uploads directory: ${UPLOADS_DIR}`);

  // 显示环境信息
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Node version:', process.version);
  console.log('Platform:', process.platform);

  // 显示内存使用情况
  const memoryUsage = process.memoryUsage();
  console.log('Memory usage:', {
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
  });
});
