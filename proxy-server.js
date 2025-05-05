import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import multer from 'multer';
import fs from 'fs';

const app = express();
const PORT = 3001;

// 配置multer用于处理文件上传
const upload = multer({ storage: multer.memoryStorage() });

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(bodyParser.json());

// 代理TinyPNG压缩请求 - 直接上传文件
app.post('/api/tinypng/shrink/file', upload.single('image'), async (req, res) => {
  try {
    const apiKey = req.body.apiKey;

    if (!apiKey || !req.file) {
      return res.status(400).json({
        error: !apiKey ? 'API key is required' : 'Image file is required'
      });
    }

    // 创建Basic认证头
    const auth = `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;

    // 调用TinyPNG API
    const response = await axios.post('https://api.tinify.com/shrink', req.file.buffer, {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/octet-stream',
      },
      responseType: 'json',
      maxBodyLength: Infinity,
      maxContentLength: Infinity
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

// 代理TinyPNG压缩请求 - 通过URL
app.post('/api/tinypng/shrink/url', async (req, res) => {
  try {
    const { apiKey, imageUrl } = req.body;

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
    const { url, apiKey } = req.query;

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
