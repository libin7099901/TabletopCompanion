# 桌游伴侣部署指南

## 部署概述

桌游伴侣支持多种部署方式，本指南将详细介绍如何将应用部署到生产环境。

## 部署架构

```
[用户浏览器] ↔ [静态文件服务器 (前端)] ↔ [WebSocket信令服务器]
                                        ↕
                                   [WebRTC P2P连接]
```

## 部署选项

### 1. 传统部署

#### 1.1 前端部署

**构建前端应用**
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

**部署到Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/tabletop-companion/dist;
    index index.html;
    
    # 处理React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态资源
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 压缩
    gzip on;
    gzip_types text/plain application/javascript text/css application/json;
}
```

**部署到Apache**
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/tabletop-companion/dist
    ServerName yourdomain.com
    
    # 处理React Router
    RewriteEngine On
    RewriteRule ^(?!.*\.).*$ /index.html [L]
    
    # 缓存静态资源
    <LocationMatch "^/assets/">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

#### 1.2 信令服务器部署

**使用PM2（推荐）**
```bash
# 安装PM2
npm install -g pm2

# 进入服务器目录
cd server

# 安装依赖
npm install

# 启动服务
pm2 start signaling-server.js --name "tabletop-signaling"

# 设置开机启动
pm2 startup
pm2 save
```

**使用systemd**
```bash
# 创建systemd服务文件
sudo nano /etc/systemd/system/tabletop-signaling.service
```

```ini
[Unit]
Description=Tabletop Game Assistant Signaling Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tabletop-companion/server
ExecStart=/usr/bin/node signaling-server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl enable tabletop-signaling
sudo systemctl start tabletop-signaling
```

### 2. Docker部署

#### 2.1 前端Docker部署

**创建Dockerfile**
```dockerfile
# 前端Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

#### 2.2 信令服务器Docker部署

信令服务器已包含Dockerfile，直接构建：
```bash
cd server
docker build -t tabletop-signaling .
docker run -d -p 8080:8080 --name signaling tabletop-signaling
```

#### 2.3 Docker Compose部署

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - signaling

  signaling:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  # 可选：添加反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - signaling
```

### 3. 云平台部署

#### 3.1 Vercel部署（前端）

**vercel.json**
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

部署命令：
```bash
npm install -g vercel
vercel --prod
```

#### 3.2 Heroku部署（信令服务器）

**Procfile**
```
web: node signaling-server.js
```

**package.json（添加）**
```json
{
  "scripts": {
    "start": "node signaling-server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

部署命令：
```bash
# 在server目录下
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name
git push heroku main
```

#### 3.3 AWS部署

**前端部署到S3 + CloudFront**
```bash
# 构建应用
npm run build

# 上传到S3
aws s3 sync dist/ s3://your-bucket-name --delete

# 设置CloudFront分发
# 配置Origin指向S3，设置默认根对象为index.html
# 配置错误页面重定向到index.html（用于SPA路由）
```

**信令服务器部署到EC2**
```bash
# 在EC2实例上
git clone your-repository
cd tabletop-companion/server
npm install
pm2 start signaling-server.js
```

## SSL/HTTPS配置

WebRTC需要HTTPS环境才能正常工作，配置SSL证书：

### 使用Let's Encrypt

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 更新Nginx配置

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    root /path/to/tabletop-companion/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # WebSocket代理（如果需要）
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## 环境变量配置

### 前端环境变量

创建`.env.production`文件：
```env
VITE_SIGNALING_SERVER_URL=wss://yourdomain.com:8080
VITE_STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
VITE_APP_TITLE=桌游伴侣
```

### 信令服务器环境变量

```env
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://yourdomain.com
```

## 性能优化

### 前端优化

1. **代码分割**
```javascript
// 在路由中使用懒加载
const GameInterface = lazy(() => import('./components/room/GameInterface'));
```

2. **资源压缩**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

### 服务器优化

1. **启用压缩**
```javascript
// signaling-server.js
const compression = require('compression');
app.use(compression());
```

2. **连接池管理**
```javascript
// 限制连接数
const maxConnections = process.env.MAX_CONNECTIONS || 1000;
```

## 监控与日志

### 应用监控

```bash
# PM2监控
pm2 monit

# 查看日志
pm2 logs tabletop-signaling
```

### 日志配置

```javascript
// 使用winston进行日志管理
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 安全配置

### CORS配置

```javascript
// signaling-server.js
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];

// 配置CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  next();
});
```

### 率限制

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP最多100个请求
});

app.use(limiter);
```

## 故障排除

### 常见问题

1. **WebRTC连接失败**
   - 检查HTTPS是否正确配置
   - 验证STUN服务器可达性
   - 检查防火墙设置

2. **信令服务器连接问题**
   - 确认WebSocket端口开放
   - 检查CORS配置
   - 验证SSL证书有效性

3. **静态文件404**
   - 检查nginx配置
   - 确认文件路径正确
   - 验证权限设置

### 调试命令

```bash
# 检查端口占用
netstat -tlnp | grep :8080

# 测试WebSocket连接
wscat -c ws://localhost:8080

# 检查SSL证书
openssl s_client -connect yourdomain.com:443

# 查看nginx日志
tail -f /var/log/nginx/access.log
```

## 备份与恢复

### 数据备份

```bash
# 备份配置文件
tar -czf backup-$(date +%Y%m%d).tar.gz \
  /etc/nginx/sites-available/ \
  /path/to/tabletop-companion/ \
  /etc/letsencrypt/
```

### 恢复流程

```bash
# 恢复应用
tar -xzf backup-YYYYMMDD.tar.gz
# 重新安装依赖
npm install
# 重启服务
pm2 restart all
sudo systemctl restart nginx
```

---

**注意**: 
- 确保所有敏感信息都通过环境变量配置
- 定期更新依赖包和安全补丁
- 监控应用性能和错误日志
- 测试备份恢复流程的有效性 